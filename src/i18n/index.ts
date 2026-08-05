import { createI18n } from "vue-i18n";

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem("locale") || "zh",
  fallbackLocale: "en",
  messages: {
    zh: {
      conf: "设置",
      list: "计划",
      plan: {
        name: "计划名称",
        prepare: "准备",
        phase: "阶段",
        cooldown: "冷却",
        add: "新增计划",
      },
      phase: {
        name: "阶段名称",
        circuit: "循环",
        interval: "间歇",
        repeat: "重复",
        add: "新增阶段",
      },
      circuit: {
        action: "动作",
        add: "新增循环",
        interval: "间歇",
        rounds: "轮次",
      },
      action: {
        name: "动作名称",
        duration: "时长",
        add: "新增动作",
      },
      delete: "删除",
      deleteConfirm: "再次点击以确认",
    },
    en: {
      conf: "Config",
      list: "Plans",
      plan: {
        name: "Plan Name",
        prepare: "Prepare",
        phase: "Phases",
        cooldown: "Cooldown",
        add: "Add Workout Plan",
      },
      phase: {
        name: "Phase Name",
        circuit: "Circuit",
        interval: "Interval",
        repeat: "Repeat",
        add: "Add Phase",
      },
      circuit: {
        action: "Actions",
        add: "Add Circuit",
        interval: "Interval",
        rounds: "Rounds",
      },
      action: {
        name: "Action Name",
        duration: "Duration",
        add: "Add Action",
      },
      delete: "Delete",
      deleteConfirm: "Click again to confirm",
    },
  },
});

export default i18n;
