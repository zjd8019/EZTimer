type Action = {
  name: string;
  duration: number;
};

type Circuit = {
  actions: Action[];
  interval: number;
  rounds: number;
};

type Phase = {
  name: string;
  circuits: Circuit[];
  interval: number;
  repeat: number;
};

type Workout = {
  name: string;
  prepare: number;
  phases: Phase[];
  cooldown: number;
};

type Step = {
  name: string;
  dura: number;
  bg: string;
  desc?: string;
  init: number;
};

export type { Action, Circuit, Phase, Workout, Step };
