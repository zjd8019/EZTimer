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

export function click(freq = 1500) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);

  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.018);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();

  oscillator.stop(ctx.currentTime + 0.02);
}
