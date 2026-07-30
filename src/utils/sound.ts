const ctx = new AudioContext();

export function beep(frequency = 800, duration = 100) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.value = 0.05;

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();

  oscillator.stop(ctx.currentTime + duration / 1000);
}
