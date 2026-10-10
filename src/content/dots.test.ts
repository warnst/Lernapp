import { describe, expect, it } from 'vitest';
import { DOTS } from './dots';

type Point = readonly [number, number];

/** Vorzeichen des Kreuzprodukts: Liegt c links oder rechts von a→b? */
const side = (a: Point, b: Point, c: Point) =>
  Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));

/** Schneiden sich die Strecken p–q und r–s (auch Berühren und Überlappen zählt)? */
function segmentsTouch(p: Point, q: Point, r: Point, s: Point): boolean {
  const d1 = side(r, s, p);
  const d2 = side(r, s, q);
  const d3 = side(p, q, r);
  const d4 = side(p, q, s);
  if (d1 !== d2 && d3 !== d4 && d1 * d2 <= 0 && d3 * d4 <= 0) return true;
  // kollinear: Überlappen die Bereiche?
  const within = (a: Point, b: Point, c: Point) =>
    side(a, b, c) === 0 &&
    Math.min(a[0], b[0]) <= c[0] &&
    c[0] <= Math.max(a[0], b[0]) &&
    Math.min(a[1], b[1]) <= c[1] &&
    c[1] <= Math.max(a[1], b[1]);
  return within(p, q, r) || within(p, q, s) || within(r, s, p) || within(r, s, q);
}

const segmentsOf = (points: readonly Point[], closed: boolean) => {
  const segments: [Point, Point][] = [];
  points.forEach((point, i) => {
    const next = points[i + 1] ?? (closed ? points[0] : undefined);
    if (next) segments.push([point, next]);
  });
  return segments;
};

describe('Punkte verbinden (docs/12 3.7)', () => {
  it('IDs eindeutig, je 3 Bilder mit 10, 20, 30 und 50 Punkten', () => {
    const ids = DOTS.map((picture) => picture.id);
    expect(new Set(ids).size).toBe(ids.length);
    const counts = DOTS.map((picture) => picture.points.length).sort((a, b) => a - b);
    expect(counts).toEqual([10, 10, 10, 20, 20, 20, 30, 30, 30, 50, 50, 50]);
  });

  it('alle Punkte im Bereich 5..95 und mindestens 6 voneinander entfernt', () => {
    for (const picture of DOTS) {
      for (const [x, y] of picture.points) {
        expect(x, picture.id).toBeGreaterThanOrEqual(5);
        expect(x, picture.id).toBeLessThanOrEqual(95);
        expect(y, picture.id).toBeGreaterThanOrEqual(5);
        expect(y, picture.id).toBeLessThanOrEqual(95);
      }
      picture.points.forEach(([x1, y1], i) => {
        picture.points.slice(i + 1).forEach(([x2, y2], j) => {
          const distance = Math.hypot(x2 - x1, y2 - y1);
          expect(
            distance,
            `${picture.id} ${String(i + 1)}–${String(i + j + 2)}`,
          ).toBeGreaterThanOrEqual(6);
        });
      });
    }
  });

  it('keine Linie kreuzt eine andere', () => {
    for (const picture of DOTS) {
      const segments = segmentsOf(picture.points, picture.closed);
      segments.forEach(([p, q], i) => {
        segments.forEach(([r, s], j) => {
          const neighbours =
            j === i + 1 || (picture.closed && i === 0 && j === segments.length - 1);
          if (j > i && !neighbours) {
            expect(
              segmentsTouch(p, q, r, s),
              `${picture.id} Linie ${String(i + 1)}/${String(j + 1)}`,
            ).toBe(false);
          }
        });
      });
    }
  });

  it('Segment-Prüfung erkennt Kreuzen, Berühren und Überlappen', () => {
    expect(segmentsTouch([0, 0], [10, 10], [0, 10], [10, 0])).toBe(true);
    expect(segmentsTouch([0, 0], [10, 0], [5, 0], [5, 8])).toBe(true);
    expect(segmentsTouch([0, 0], [10, 0], [5, 0], [15, 0])).toBe(true);
    expect(segmentsTouch([0, 0], [10, 0], [0, 5], [10, 5])).toBe(false);
    expect(segmentsTouch([0, 0], [10, 0], [12, 0], [20, 0])).toBe(false);
  });

  it('1–4 Verzierungen, alle Farben sind Tokens', () => {
    for (const picture of DOTS) {
      expect(picture.fill, picture.id).toMatch(/^var\(--[a-z0-9-]+\)$/);
      expect(picture.extras.length, picture.id).toBeGreaterThanOrEqual(1);
      expect(picture.extras.length, picture.id).toBeLessThanOrEqual(4);
      for (const extra of picture.extras) {
        expect(extra.fill, picture.id).toMatch(/^var\(--[a-z0-9-]+\)$/);
        expect(extra.d, picture.id).toMatch(/^M[-\d.\s]+[\dA-Za-z\s.-]*Z$/);
      }
    }
  });
});
