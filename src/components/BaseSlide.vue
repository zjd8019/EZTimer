<script setup lang="ts">
import { useMetaStore } from "@/stores/meta";
import { Icon } from "@iconify/vue";
import { computed } from "vue";

interface Prop {
  id: string;
  icon?: string;
  name?: string;
  position?: "left" | "right";
}
const { id, icon, name, position = "left" } = defineProps<Prop>();
const meta = useMetaStore();
const show = computed(() => meta.slide === id);
</script>

<template>
  <Transition name="slide">
    <div
      class="fixed z-30 size-full bg-gray-500/70 transition-colors"
      role="slide-backdrop"
      v-show="show"
      @click.self="meta.slide = ''"
    >
      <div
        class="slide pb-safe flex size-full max-w-sm flex-col bg-black text-white transition-transform"
        :class="{ 'ml-auto border-l': position === 'right' }"
        role="slide-container"
      >
        <div class="flex items-center gap-x-1 border-b px-3 py-2 text-2xl" role="slide-header">
          <slot name="header">
            <Icon :icon="icon" v-if="icon" />
            <div>{{ name }}</div>
          </slot>
          <button type="button" class="btn ml-auto p-0 text-zinc-500" @click="meta.slide = ''">
            <Icon icon="bi:x-lg" />
          </button>
        </div>
        <div class="grow overflow-auto px-3 py-2" role="slide-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>
