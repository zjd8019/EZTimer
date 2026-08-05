import { defineStore } from "pinia";
import { ref } from "vue";

export const useMetaStore = defineStore("meta", () => {
  const slide = ref("");

  return { slide };
});
