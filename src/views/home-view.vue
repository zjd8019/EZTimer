<script setup lang="ts">
import { emptyPlan, useTimerStore } from "@/stores/timer";
import type { Step } from "@/types";
import { computed, nextTick, onBeforeMount, reactive, ref, useTemplateRef } from "vue";
import { Icon } from "@iconify/vue";
import { num2Time } from "@/utils";
import { beep } from "@/utils/sound";
import { useMetaStore } from "@/stores/meta";
import PlanConf from "@/components/PlanConf.vue";
import { watchDebounced } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import PlanList from "@/components/PlanList.vue";

const COLORS = {
  PREP: "oklch(90.5% 0.182 98.111)",
  REST: "oklch(70.4% 0.191 22.216)",
  COOL: "oklch(86.5% 0.127 207.078)",
  ACTION: "oklch(79.2% 0.209 151.711)",
};
const STATE = {
  STOP: 0,
  START: 1,
  PAUSE: 2,
} as const;

const TICK = 250;
const FONT_SIZE_DIFF = 80; // 8rem - 3rem;
const { t } = useI18n();
const meta = useMetaStore();
const timer = useTimerStore();
const plan = computed(() => timer.plans[timer.currentPlanIndex] || emptyPlan());
const title = ref("");
const steps = reactive<Step[]>([]);
const currentStep = ref(0);
const state = ref<(typeof STATE)[keyof typeof STATE]>(STATE.STOP);
let intervalId = 0;

const elMain = useTemplateRef("el-main");
const bottomSpacer = ref(0);

const totalDuration = computed(() => steps.reduce((acc, step) => acc + step.dura, 0));

function makeStep(name: string, dura: number, bg: string, desc?: string) {
  return {
    name,
    dura,
    bg,
    desc,
    init: dura,
  } as Step;
}
function makePrepStep(dura: number) {
  return makeStep(t("plan.prepare"), dura, COLORS.PREP);
}
function makeRestStep(dura: number, intervalName: string) {
  return makeStep(intervalName, dura, COLORS.REST);
}
function makeCoolStep(dura: number) {
  return makeStep(t("plan.cooldown"), dura, COLORS.COOL);
}

function calcSpacerHeight() {
  const hP = elMain.value?.getBoundingClientRect()?.height || 0;
  const children = elMain.value?.children;
  if (children && children.length) {
    const hC = children[children.length - 2]!.getBoundingClientRect().height;
    return hP - hC;
  }
  return hP;
}

function flattenPlan() {
  steps.length = 0;
  if (!plan.value) return;

  title.value = plan.value.name;
  if (plan.value.prepare) {
    steps.push(makePrepStep(plan.value.prepare));
  }

  if (plan.value.phases.length) {
    for (let k_p = 0; k_p < plan.value.phases.length; k_p++) {
      const phase = plan.value.phases[k_p]!;
      if (k_p) {
        // add interval between phases
        steps.push(makeRestStep(phase.interval, t("phase.interval")));
      }
      if (phase.circuits.length) {
        for (let k_p_r = 0; k_p_r < phase.repeat; k_p_r++) {
          if (k_p_r) {
            steps.push(makeRestStep(phase.interval, t("phase.interval")));
          }
          for (let k_c = 0; k_c < phase.circuits.length; k_c++) {
            const circuit = phase.circuits[k_c]!;
            if (k_c) {
              steps.push(makeRestStep(phase.interval, t("phase.interval")));
            }
            if (circuit.actions.length) {
              for (let k_c_r = 0; k_c_r < circuit.rounds; k_c_r++) {
                if (k_c_r) {
                  steps.push(makeRestStep(circuit.interval, t("circuit.interval")));
                }
                for (const action of circuit.actions) {
                  const desc = `${phase.name} ${k_p_r + 1}/${phase.repeat} ${t("circuit.rounds")} ${k_c_r + 1}/${circuit.rounds}`;
                  steps.push(makeStep(action.name, action.duration, COLORS.ACTION, desc));
                }
              }
            }
          }
        }
      }
    }
  }

  if (plan.value.cooldown) {
    steps.push(makeCoolStep(plan.value.cooldown));
  }

  // strech the placeholder so that last step can scroll to the top of view
  nextTick(() => (bottomSpacer.value = calcSpacerHeight()));
}

function start() {
  if (intervalId) return;

  if (state.value === STATE.STOP) {
    beep(900, 900);
  }

  state.value = STATE.START;
  scrollToCurrentStep(0);

  intervalId = setInterval(() => {
    const step = steps[currentStep.value];
    if (!step) {
      stop();
      return;
    }

    step.dura -= TICK / 1000;

    if (
      Math.abs(step.dura - 1) < 0.12 ||
      Math.abs(step.dura - 2) < 0.12 ||
      Math.abs(step.dura - 3) < 0.12
    ) {
      beep(900, 120);
    } else {
      beep(2500, 8);
    }

    if (step.dura <= 0) {
      currentStep.value++;
      beep(900, 900);
      if (currentStep.value >= steps.length) {
        stop();
      } else {
        scrollToCurrentStep(-FONT_SIZE_DIFF);
      }
    }
  }, TICK);
}

function pause() {
  if (intervalId) {
    state.value = STATE.PAUSE;
    clearInterval(intervalId);
    intervalId = 0;
  }
}

function stop() {
  pause();
  state.value = STATE.STOP;
  currentStep.value = 0;
  for (const step of steps) {
    step.dura = step.init;
  }
}

function scrollToCurrentStep(offset: number) {
  const elStep = elMain.value!.children[currentStep.value]! as HTMLElement;
  elMain.value!.scrollTo({
    behavior: "smooth",
    top: elStep.offsetTop + offset,
  });
}

watchDebounced(
  plan,
  () => {
    flattenPlan();
  },
  { debounce: 700, deep: true },
);

onBeforeMount(() => {
  flattenPlan();
});
</script>

<template>
  <header class="flex items-center gap-3 px-3 py-1.5 text-xl text-white">
    <button type="button" class="p-2" @click="meta.slide = 's-conf'">
      <Icon icon="bi:gear" />
    </button>
    <h1 class="min-w-0 grow text-zinc-200 *:text-center">
      <div class="overflow-hidden text-2xl font-bold text-nowrap text-ellipsis">
        {{ plan?.name || "锻炼计划" }}
      </div>
      <div>{{ num2Time(totalDuration) }}</div>
    </h1>
    <button type="button" class="p-2" @click="meta.slide = 's-list'">
      <Icon icon="bi:list" />
    </button>
  </header>

  <main
    class="relative min-h-0 grow scrollbar-none overflow-y-scroll overscroll-none"
    ref="el-main"
  >
    <div
      class="p-4 *:text-center"
      v-for="(step, i) in steps"
      :key="i"
      :style="{ 'background-color': step.bg }"
    >
      <p>{{ step.desc }}</p>
      <h2 class="text-5xl">{{ step.name }}</h2>
      <div
        class="transition-[font-size] duration-250"
        :class="{
          'text-9xl font-stretch-75%': currentStep === i,
          'text-5xl': currentStep !== i,
        }"
      >
        {{ num2Time(step.dura) }}
      </div>
    </div>

    <div
      :style="{
        height:
          (currentStep + 1 === steps.length ? bottomSpacer - FONT_SIZE_DIFF : bottomSpacer) +
          'px',
      }"
    ></div>
  </main>

  <footer class="mb-safe mt-auto flex items-center justify-around p-2">
    <button type="button" class="invisible rounded-full p-2">
      <Icon icon="bi:question-circle" class="text-3xl" />
    </button>
    <button
      type="button"
      class="rounded-full bg-green-400 p-2"
      @click="start()"
      v-if="state !== STATE.START"
    >
      <Icon icon="bi:play-circle" class="text-5xl" />
    </button>
    <button type="button" class="rounded-full bg-yellow-400 p-2" @click="pause()" v-else>
      <Icon icon="bi:pause-circle" class="text-5xl" />
    </button>
    <button
      type="button"
      class="rounded-full p-2"
      @click="stop()"
      :class="state === STATE.STOP ? 'bg-zinc-400' : 'bg-red-400'"
    >
      <Icon
        :icon="state === STATE.STOP ? 'bi:arrow-clockwise' : 'bi:stop-circle'"
        class="text-3xl"
      />
    </button>
  </footer>

  <PlanConf />
  <PlanList />
</template>
