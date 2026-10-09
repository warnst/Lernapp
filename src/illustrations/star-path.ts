// Pfad für einen Stern mit `points` Zacken (für Sterne, Sticker, Seestern).
export function starPath(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const round = (n: number) => Math.round(n * 10) / 10;
  const parts: string[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    const x = round(cx + r * Math.cos(angle));
    const y = round(cy + r * Math.sin(angle));
    parts.push(`${i === 0 ? 'M' : 'L'}${String(x)} ${String(y)}`);
  }
  return `${parts.join(' ')} Z`;
}
