<script setup lang="ts">
import { click } from "@/utils/sound";
import { computed, onMounted, useTemplateRef } from "vue";

const { id } = defineProps<{ id: string }>();
const time = defineModel<number>({ required: true });

const min = computed({
  get: () => Math.floor(time.value / 60),
  set: (v) => (time.value = v * 60 + sec.value),
});
const sec = computed({
  get: () => time.value % 60,
  set: (v) => (time.value = min.value * 60 + v),
});

const elMin = useTemplateRef("el-min");
const elSec = useTemplateRef("el-sec");

const root = useTemplateRef("root");

const ROW_HEIGHT = 24;

function onScroll(ev: Event, type: "minute" | "second") {
  const el = ev.target as HTMLElement;

  const index = Math.round(el.scrollTop / ROW_HEIGHT);

  if (type === "minute") {
    if (index !== min.value) {
      click();
    }
    min.value = index;
  } else {
    if (index !== sec.value) {
      click();
    }
    sec.value = index;
  }
}

function scrollToTime() {
  if (!elMin.value || !elSec.value) return;

  elMin.value.scrollTop = min.value * ROW_HEIGHT;
  elSec.value.scrollTop = sec.value * ROW_HEIGHT;
}

onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      requestAnimationFrame(() => {
        scrollToTime();
      });
    }
  });

  observer.observe(root.value!);
});
</script>

<template>
  <div
    ref="root"
    tabindex="0"
    class="group form-input flex items-center border px-3 py-1.5"
    :id="id"
  >
    <!-- minute -->
    <div class="transition-height h-6 flex-1 overflow-hidden group-focus:h-30">
      <div
        ref="el-min"
        class="h-30 -translate-y-12 snap-y snap-mandatory scrollbar-none overflow-hidden text-center transition-transform group-focus:translate-y-0 group-focus:overflow-y-scroll"
        @scroll="onScroll($event, 'minute')"
      >
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div v-for="v in 60" :key="v" class="wheel-item snap-center">
          {{ String(v - 1).padStart(2, "0") }}
        </div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
      </div>
    </div>

    <div class="px-1.5">:</div>

    <!-- second -->
    <div class="transition-height h-6 flex-1 overflow-hidden group-focus:h-30">
      <div
        ref="el-sec"
        class="h-30 -translate-y-12 snap-y snap-mandatory scrollbar-none overflow-hidden text-center transition-transform group-focus:translate-y-0 group-focus:overflow-y-scroll"
        @scroll="onScroll($event, 'second')"
      >
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div v-for="v in 60" :key="v" class="wheel-item snap-center">
          {{ String(v - 1).padStart(2, "0") }}
        </div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
      </div>
    </div>
  </div>
</template>

<style>
.group:focus .wheel-item {
  animation: wheel-focus linear both;
  animation-timeline: view();
  animation-range: entry 25% exit 75%;
  animation-duration: auto; /* explicit for Safari */

  /* GPU layer hints */
  will-change: transform, opacity;
  contain: layout style;
}

@keyframes wheel-focus {
  0%,
  100% {
    opacity: 0.15;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
