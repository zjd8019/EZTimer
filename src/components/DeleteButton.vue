<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { duration = 3000, disabled = false } = defineProps<{
  duration?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const root = useTemplateRef("root");

const confirming = ref(false);
const progress = ref(1);

const width = ref(342);
const height = ref(38);
const perimeter = computed(() => 2 * (width.value + height.value));

let animationId = 0;

/*
 * Convert remaining progress into conic-gradient angle.
 *
 * We ignore rounded corners and approximate the border as:
 *
 *   top    = width
 *   right  = height
 *   bottom = width
 *   left   = height
 *
 * This avoids conic-gradient's default circular distortion.
 */
const angle = computed(() => {
  const w = width.value;
  const h = height.value;
  const w2 = w / 2;
  const h2 = h / 2;
  let distance = progress.value * perimeter.value;

  // Stage 1: Top border (left half)
  if (distance <= w2) {
    return ((Math.atan(distance / h2) / Math.PI) * 50).toFixed(2) + "%";
  }

  distance -= w2;
  // Stage 2: Left border
  if (distance <= h) {
    return ((Math.atan((distance - h2) / w2) / Math.PI + 0.5) * 50).toFixed(2) + "%";
  }

  distance -= h;
  // Stage 3: Bottom border
  if (distance <= w) {
    return ((Math.atan((distance - w2) / h2) / Math.PI + 1) * 50).toFixed(2) + "%";
  }

  distance -= w;
  // Stage 2: Right border
  if (distance <= h) {
    return ((Math.atan((distance - h2) / w2) / Math.PI + 1.5) * 50).toFixed(2) + "%";
  }

  distance -= h;
  // Stage 1: Top border (left half)
  return ((Math.atan(h2 / (w2 - distance)) / Math.PI + 1.5) * 50).toFixed(2) + "%";
});

function startConfirm() {
  confirming.value = true;
  progress.value = 1;

  const start = performance.now();

  function animate(now: number) {
    const elapsed = now - start;

    progress.value = Math.max(0, 1 - elapsed / duration);

    if (progress.value > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      confirming.value = false;
      progress.value = 1;
    }
  }

  animationId = requestAnimationFrame(animate);
}

function cancelConfirm() {
  confirming.value = false;
  progress.value = 1;

  cancelAnimationFrame(animationId);
}

function handleClick() {
  if (confirming.value) {
    cancelConfirm();
    emit("delete");
    return;
  }

  startConfirm();
}

function updateSize() {
  if (!root.value) return;

  const rect = root.value.getBoundingClientRect();

  width.value = rect.width;
  height.value = rect.height;
}

let resizeObserver: ResizeObserver | undefined;

onMounted(async () => {
  await nextTick();

  updateSize();

  resizeObserver = new ResizeObserver(updateSize);

  if (root.value) {
    resizeObserver.observe(root.value);
  }
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  resizeObserver?.disconnect();
});
</script>

<template>
  <button
    ref="root"
    type="button"
    :disabled="disabled"
    class="relative w-full rounded-xl border border-transparent py-1.5 text-red-500 disabled:opacity-50"
    @click="handleClick"
  >
    <!-- animated border -->
    <span
      class="pointer-events-none absolute inset-0 rounded-[inherit] border border-red-500 mask-conic-from-100%"
      :style="{
        '--tw-mask-conic-to-position': angle,
        '--tw-mask-conic-from-position': angle,
      }"
    />

    <!-- content -->
    <slot>{{ confirming ? t("deleteConfirm") : t("delete") }}</slot>
  </button>
</template>
