function p20(v: number) {
  return String(v).padStart(2, "0");
}

export function num2Time(v: number) {
  return `${p20(Math.floor(v / 60))}:${p20(Math.ceil(v % 60))}`;
}

export function time2Num(s: string) {
  const [min, sec] = s.split(":");
  return +min! * 60 + +sec!;
}
