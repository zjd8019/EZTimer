import type { Workout } from "@/types";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";

function preset(): Workout {
  return {
    name: "锻炼计划",
    prepare: 5,
    phases: [
      {
        name: "变速魔鬼",
        circuits: [
          {
            actions: [
              { name: "慢速跳", duration: 30 },
              { name: "极速跳", duration: 15 },
              { name: "慢速跳", duration: 30 },
            ],
            interval: 90,
            rounds: 6,
          },
        ],
        repeat: 1,
        interval: 60,
      },
      {
        name: "耐力金字塔",
        circuits: [
          {
            actions: [{ name: "中速跳", duration: 60 }],
            interval: 0,
            rounds: 1,
          },
          {
            actions: [{ name: "中速跳", duration: 120 }],
            interval: 0,
            rounds: 1,
          },
          {
            actions: [{ name: "中速跳", duration: 60 }],
            interval: 0,
            rounds: 1,
          },
        ],
        repeat: 1,
        interval: 30,
      },
    ],
    cooldown: 10,
  };
}

export const useTimerStore = defineStore("timer", () => {
  // ---- persisted state ----
  const plans = useStorage<Workout[]>("timers", [preset()]);
  const currentPlanIndex = useStorage("currentPlan", 0);

  return {
    // persisted
    plans,
    currentPlanIndex,
  };
});
