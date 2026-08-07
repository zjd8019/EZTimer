<script setup lang="ts">
import { useTimerStore } from "@/stores/timer.ts";
import BaseSlide from "./BaseSlide.vue";
import { useI18n } from "vue-i18n";
import type { Workout } from "@/types/index.ts";
import { num2Time } from "@/utils/index.ts";
import { Icon } from "@iconify/vue";
import { useMetaStore } from "@/stores/meta.ts";

const { t, locale } = useI18n();
const timer = useTimerStore();
const meta = useMetaStore();
function totalPlanDuration(plan: Workout) {
  let dura = plan.prepare;

  for (let i = 0; i < plan.phases.length; i++) {
    const phase = plan.phases[i]!;
    let dura_i = 0;
    for (let j = 0; j < phase.circuits.length; j++) {
      const circuit = phase.circuits[j]!;
      const dura_j = circuit.actions.reduce((acc, a) => acc + a.duration, 0);
      dura_i += (dura_j + circuit.interval) * circuit.rounds - circuit.interval;
      if (j) dura_i += phase.interval;
    }
    dura += (dura_i + phase.interval) * phase.repeat - phase.interval;
    if (i) dura += phase.interval;
  }
  dura += plan.cooldown;
  return dura;
}

function toggleLocale() {
  locale.value = locale.value === "zh" ? "en" : "zh";
  localStorage.setItem("locale", locale.value);
}
function addPlan() {
  timer.plans.push({
    name: "",
    prepare: 5,
    phases: [],
    cooldown: 10,
  });
  timer.currentPlanIndex = timer.plans.length - 1;
  meta.slide = "s-conf";
}
function delPlan(ev: MouseEvent, i: number) {
  const scrollContainer = (ev.currentTarget as HTMLElement).parentElement!.parentElement!;
  scrollContainer.scrollLeft = 0;

  timer.plans.splice(i, 1);
  if (i <= timer.currentPlanIndex) {
    timer.currentPlanIndex -= 1;
  }
}
</script>

<template>
  <BaseSlide id="s-list" icon="bi:list" :name="t('list')" position="right">
    <div class="-mx-3 -my-2 flex h-[calc(100%+1rem)] w-[calc(100%+1.5rem)] flex-col">
      <div class="flex-1 overflow-y-scroll overscroll-y-contain pt-2">
        <div
          class="flex scrollbar-none flex-nowrap gap-3 overflow-x-scroll p-3 pt-1"
          v-for="(plan, i) in timer.plans"
          :key="i"
        >
          <div
            class="w-full shrink-0 rounded-xl border px-4 py-3 shadow-lg"
            :class="timer.currentPlanIndex === i ? 'shadow-blue-400/70' : 'shadow-gray-400/70'"
            @click="timer.currentPlanIndex = i"
          >
            <h1 class="mb-1 text-2xl">{{ plan.name || "-" }}</h1>
            <p>{{ num2Time(totalPlanDuration(plan)) }}</p>
          </div>
          <div class="self-center">
            <button
              type="button"
              class="rounded-xl border border-red-500 p-3 text-red-500"
              @click="delPlan($event, i)"
            >
              <Icon icon="bi:trash" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer bar: Locale + Add -->
      <div class="flex gap-3 px-3 py-2">
        <button
          type="button"
          class="rounded-xl border bg-gray-500 p-3 text-white"
          @click="toggleLocale"
        >
          <Icon icon="bi:translate" />
        </button>
        <button
          type="button"
          class="flex-1 rounded-xl border border-emerald-500 text-emerald-500"
          @click="addPlan"
        >
          {{ t("plan.add") }}
        </button>
      </div>
    </div>
  </BaseSlide>
</template>
