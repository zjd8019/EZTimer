<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import BaseSlide from "./BaseSlide.vue";
import { emptyPlan, useTimerStore } from "@/stores/timer.ts";
import { computed } from "vue";
import TimePicker from "./TimePicker.vue";
import DeleteButton from "./DeleteButton.vue";

const { t } = useI18n();
const timer = useTimerStore();
const plan = computed(() => timer.plans[timer.currentPlanIndex] || emptyPlan());

function focusTimePicker(ev: MouseEvent) {
  const elPicker = (ev.currentTarget as HTMLElement).nextElementSibling;
  (elPicker as HTMLDivElement | undefined)?.focus();
}
function addAction(i: number, j: number) {
  const phase = plan.value.phases[i];
  if (!phase) return;
  const circuit = phase.circuits[j];
  if (!circuit) return;
  circuit.actions.push({
    name: "",
    duration: 60,
  });
}
function addCircuit(i: number) {
  const phase = plan.value.phases[i];
  if (!phase) return;
  phase.circuits.push({
    actions: [],
    interval: 30,
    rounds: 1,
  });
}
function addPhase() {
  plan.value.phases.push({
    name: "",
    circuits: [],
    interval: 60,
    repeat: 1,
  });
}
</script>

<template>
  <BaseSlide id="s-conf" icon="bi:gear" :name="t('conf')">
    <div class="mb-3">
      <label class="form-label" for="plan-name">{{ t("plan.name") }}</label>
      <input
        type="text"
        class="form-input"
        id="plan-name"
        name="plan-name"
        v-model="plan.name"
      />
    </div>
    <div class="mb-3">
      <span class="form-label" @click="focusTimePicker">{{ t("plan.prepare") }}</span>
      <TimePicker id="plan-prepare" v-model="plan.prepare" />
    </div>
    <div class="mb-3">
      <h3 class="text-2xl">{{ t("plan.phase") }}</h3>
      <div class="rounded-xl border p-2">
        <div v-for="(phase, i) in plan.phases" :key="i">
          <div class="mb-3">
            <label class="form-label" :for="`phase-${i}-name`">{{ t("phase.name") }}</label>
            <input
              type="text"
              class="form-input"
              :id="`phase-${i}-name`"
              :name="`phase-${i}-name`"
              v-model="phase.name"
            />
          </div>
          <div class="mb-3">
            <h3 class="text-2xl">{{ t("phase.circuit") }}</h3>
            <div class="rounded-xl border border-yellow-400/70 p-2">
              <div v-for="(circuit, j) in phase.circuits" :key="j">
                <div class="mb-3">
                  <h3 class="text-2xl">{{ t("circuit.action") }}</h3>
                  <div class="rounded-xl border border-blue-400/70 p-2">
                    <div v-for="(action, k) in circuit.actions" :key="k">
                      <div class="mb-3">
                        <label
                          class="form-label"
                          :for="`phase-${i}-circuit-${j}-action-${k}-name`"
                          >{{ t("action.name") }}</label
                        >
                        <input
                          type="text"
                          class="form-input"
                          :id="`phase-${i}-circuit-${j}-action-${k}-name`"
                          :name="`phase-${i}-circuit-${j}-action-${k}-name`"
                          v-model="action.name"
                        />
                      </div>
                      <div class="mb-3">
                        <span class="form-label" @click="focusTimePicker">{{
                          t("action.duration")
                        }}</span>
                        <TimePicker
                          :id="`phase-${i}-circuit-${j}-action-${k}-duration`"
                          v-model="action.duration"
                        />
                      </div>
                      <DeleteButton @delete="circuit.actions.splice(k, 1)" />
                      <hr class="-mx-2 my-3 border-blue-400/70" />
                    </div>
                    <button
                      type="button"
                      class="w-full rounded-xl border border-emerald-500 py-1.5 text-emerald-500"
                      @click="addAction(i, j)"
                    >
                      {{ t("action.add") }}
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <span class="form-label" @click="focusTimePicker">{{
                    t("circuit.interval")
                  }}</span>
                  <TimePicker
                    :id="`phase-${i}-circuit-${j}-interval`"
                    v-model="circuit.interval"
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label" :for="`phase-${i}-circuit-${j}-rounds`">{{
                    t("circuit.rounds")
                  }}</label>
                  <input
                    type="number"
                    class="form-input"
                    :id="`phase-${i}-circuit-${j}-rounds`"
                    :name="`phase-${i}-circuit-${j}-rounds`"
                    v-model="circuit.rounds"
                  />
                </div>
                <DeleteButton @delete="phase.circuits.splice(j, 1)" />
                <hr class="-mx-2 my-3 border-yellow-400/70" />
              </div>
              <button
                type="button"
                class="w-full rounded-xl border border-emerald-500 py-1.5 text-emerald-500"
                @click="addCircuit(i)"
              >
                {{ t("circuit.add") }}
              </button>
            </div>
          </div>
          <div class="mb-3">
            <span class="form-label" @click="focusTimePicker">{{ t("phase.interval") }}</span>
            <TimePicker :id="`phase-${i}-interval`" v-model="phase.interval" />
          </div>
          <div class="mb-3">
            <label class="form-label" :for="`phase-${i}-repeat`">{{ t("phase.repeat") }}</label>
            <input
              type="number"
              class="form-input"
              :id="`phase-${i}-repeat`"
              :name="`phase-${i}-repeat`"
              v-model="phase.repeat"
            />
          </div>
          <DeleteButton @delete="plan.phases.splice(i, 1)" />
          <hr class="-mx-2 my-5" />
        </div>
        <button
          type="button"
          class="w-full rounded-xl border border-emerald-500 py-1.5 text-emerald-500"
          @click="addPhase()"
        >
          {{ t("phase.add") }}
        </button>
      </div>
    </div>
    <div class="mb-12">
      <span class="form-label" @click="focusTimePicker">{{ t("plan.cooldown") }}</span>
      <TimePicker id="plan-cooldown" v-model="plan.cooldown" />
    </div>
  </BaseSlide>
</template>
