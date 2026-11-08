import type { ReactNode } from 'react';
import { starPath } from './star-path';

const RAINBOW_VARS = [
  'var(--nb-1-red)',
  'var(--nb-2-orange)',
  'var(--nb-3-yellow)',
  'var(--nb-4-green)',
  'var(--nb-5-blue)',
  'var(--nb-7-indigo)',
  'var(--nb-7-violet)',
] as const;

function blockColorVar(n: number): string {
  switch (n) {
    case 1:
      return 'var(--nb-1-red)';
    case 2:
      return 'var(--nb-2-orange)';
    case 3:
      return 'var(--nb-3-yellow)';
    case 4:
      return 'var(--nb-4-green)';
    case 5:
      return 'var(--nb-5-blue)';
    case 6:
      return 'var(--nb-6-purple)';
    case 7:
      return 'var(--nb-7-violet)';
    case 8:
      return 'var(--nb-8-magenta)';
    case 9:
      return 'var(--nb-9-grey-2)';
    default:
      return 'var(--ill-white)';
  }
}

interface CubeSpec {
  col: number;
  row: number; // 0 = bottom
  fill: string;
  rim?: string;
  dot?: boolean;
  button?: boolean;
}

function buildCubes(
  value: number,
  mystery: boolean,
): {
  cols: number;
  rows: number;
  cubes: CubeSpec[];
} {
  if (mystery) {
    return {
      cols: 2,
      rows: 2,
      cubes: [
        { col: 0, row: 0, fill: 'var(--ill-silhouette)' },
        { col: 1, row: 0, fill: 'var(--ill-silhouette)' },
        { col: 0, row: 1, fill: 'var(--ill-silhouette)' },
        { col: 1, row: 1, fill: 'var(--ill-silhouette)' },
      ],
    };
  }

  if (value === 1) {
    return {
      cols: 1,
      rows: 1,
      cubes: [{ col: 0, row: 0, fill: 'var(--nb-1-red)' }],
    };
  }
  if (value === 2) {
    return {
      cols: 1,
      rows: 2,
      cubes: [
        { col: 0, row: 0, fill: 'var(--nb-2-orange)' },
        { col: 0, row: 1, fill: 'var(--nb-2-orange)' },
      ],
    };
  }
  if (value === 3) {
    return {
      cols: 1,
      rows: 3,
      cubes: [
        { col: 0, row: 0, fill: 'var(--nb-3-yellow)', button: true },
        { col: 0, row: 1, fill: 'var(--nb-3-yellow)', button: true },
        { col: 0, row: 2, fill: 'var(--nb-3-yellow)', button: true },
      ],
    };
  }
  if (value === 4) {
    return {
      cols: 2,
      rows: 2,
      cubes: [
        { col: 0, row: 0, fill: 'var(--nb-4-green)' },
        { col: 1, row: 0, fill: 'var(--nb-4-green)' },
        { col: 0, row: 1, fill: 'var(--nb-4-green)' },
        { col: 1, row: 1, fill: 'var(--nb-4-green)' },
      ],
    };
  }
  if (value === 5) {
    return {
      cols: 1,
      rows: 5,
      cubes: Array.from({ length: 5 }, (_, row) => ({
        col: 0,
        row,
        fill: 'var(--nb-5-blue)',
      })),
    };
  }
  if (value === 6) {
    return {
      cols: 2,
      rows: 3,
      cubes: Array.from({ length: 6 }, (_, i) => ({
        col: i % 2,
        row: Math.floor(i / 2),
        fill: 'var(--nb-6-purple)',
        dot: true,
      })),
    };
  }
  if (value === 7) {
    return {
      cols: 1,
      rows: 7,
      cubes: RAINBOW_VARS.map((fill, row) => ({ col: 0, row, fill })),
    };
  }
  if (value === 8) {
    return {
      cols: 2,
      rows: 4,
      cubes: Array.from({ length: 8 }, (_, i) => ({
        col: i % 2,
        row: Math.floor(i / 2),
        fill: 'var(--nb-8-magenta)',
      })),
    };
  }
  if (value === 9) {
    const greys = ['var(--nb-9-grey-1)', 'var(--nb-9-grey-2)', 'var(--nb-9-grey-3)'];
    return {
      cols: 3,
      rows: 3,
      cubes: Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3);
        return {
          col: i % 3,
          row,
          fill: greys[row] ?? 'var(--nb-9-grey-2)',
        };
      }),
    };
  }
  if (value === 10) {
    return {
      cols: 2,
      rows: 5,
      cubes: Array.from({ length: 10 }, (_, i) => ({
        col: i % 2,
        row: Math.floor(i / 2),
        fill: 'var(--ill-white)',
        rim: 'var(--nb-1-red)',
      })),
    };
  }

  // 11–19: Zehner-Säule (2×5) + Einer-Blöcke rechts daneben
  if (value > 10 && value < 20) {
    const ones = value - 10;
    const oneFill = blockColorVar(ones);
    const tenCubes: CubeSpec[] = Array.from({ length: 10 }, (_, i) => ({
      col: i % 2,
      row: Math.floor(i / 2),
      fill: 'var(--ill-white)',
      rim: 'var(--nb-1-red)',
    }));
    const oneCubes: CubeSpec[] = Array.from({ length: ones }, (_, i) => ({
      col: 2 + (ones > 5 ? i % 2 : 0),
      row: ones > 5 ? Math.floor(i / 2) : i,
      fill: oneFill,
    }));
    return {
      cols: ones > 5 ? 4 : 3,
      rows: 5,
      cubes: [...tenCubes, ...oneCubes],
    };
  }

  // Zehner-Blöcke 20, 30, 40, ..., 100
  const tensCount = Math.min(10, Math.max(2, Math.round(value / 10)));
  const accentFill = tensCount === 10 ? 'var(--ill-white)' : blockColorVar(tensCount);
  const rows = 5;
  const cols = tensCount;
  return {
    cols,
    rows,
    cubes: Array.from({ length: cols * rows }, (_, i) => ({
      col: i % cols,
      row: Math.floor(i / cols),
      fill:
        tensCount === 10 && (Math.floor(i / cols) + (i % cols)) % 2 === 1
          ? 'var(--ill-shell)'
          : accentFill,
      rim: 'var(--nb-1-red)',
    })),
  };
}

function renderFace(
  value: number,
  mystery: boolean,
  centerX: number,
  topRowCenterY: number,
  cubeSize: number,
): ReactNode {
  if (mystery) {
    return (
      <text
        x={centerX}
        y={topRowCenterY + cubeSize * 0.25}
        textAnchor="middle"
        fontSize={cubeSize * 0.9}
        fontWeight={800}
        fill="var(--stroke)"
        stroke="none"
      >
        ?
      </text>
    );
  }

  const eyeR = Math.max(3.2, cubeSize * 0.19);
  const pupilR = Math.max(1.6, eyeR * 0.48);
  const eyeOffset = cubeSize * 0.34;
  const eyeY = topRowCenterY - cubeSize * 0.06;
  const mouthY = topRowCenterY + cubeSize * 0.24;

  // Block 1: Ein einzelnes Zyklopen-Auge genau in der Mitte
  if (value === 1) {
    return (
      <g>
        <circle
          cx={centerX}
          cy={eyeY}
          r={eyeR * 1.25}
          fill="var(--ill-white)"
          stroke="var(--nb-1-red)"
          strokeWidth={2.2}
        />
        <circle cx={centerX} cy={eyeY} r={pupilR * 1.2} fill="var(--stroke)" stroke="none" />
        <path
          d={`M${String(centerX - 4)} ${String(mouthY)} Q${String(centerX)} ${String(mouthY + 4)} ${String(centerX + 4)} ${String(mouthY)}`}
          fill="none"
          stroke="var(--stroke)"
          strokeWidth={2}
        />
      </g>
    );
  }

  // Block 4, 9 oder 100: Quadratische Augen (Quadrat-Club!)
  if (value === 4 || value === 9 || value === 100) {
    const sq = eyeR * 2.1;
    return (
      <g>
        <rect
          x={centerX - eyeOffset - sq / 2}
          y={eyeY - sq / 2}
          width={sq}
          height={sq}
          rx={1.5}
          fill="var(--ill-white)"
          stroke="var(--stroke)"
          strokeWidth={2}
        />
        <rect
          x={centerX + eyeOffset - sq / 2}
          y={eyeY - sq / 2}
          width={sq}
          height={sq}
          rx={1.5}
          fill="var(--ill-white)"
          stroke="var(--stroke)"
          strokeWidth={2}
        />
        <rect
          x={centerX - eyeOffset - pupilR}
          y={eyeY - pupilR}
          width={pupilR * 2}
          height={pupilR * 2}
          fill="var(--stroke)"
          stroke="none"
        />
        <rect
          x={centerX + eyeOffset - pupilR}
          y={eyeY - pupilR}
          width={pupilR * 2}
          height={pupilR * 2}
          fill="var(--stroke)"
          stroke="none"
        />
        <path
          d={`M${String(centerX - 5)} ${String(mouthY)} Q${String(centerX)} ${String(mouthY + 4)} ${String(centerX + 5)} ${String(mouthY)}`}
          fill="none"
          stroke="var(--stroke)"
          strokeWidth={2}
        />
      </g>
    );
  }

  // Block 5 oder 10: Stern-Auge(n)
  if (value === 5 || value === 10) {
    return (
      <g>
        <path
          d={starPath(centerX - eyeOffset * 0.75, eyeY, eyeR * 1.9, eyeR * 0.85, 5)}
          fill="var(--ill-sun)"
          stroke="var(--nb-1-red)"
          strokeWidth={1.6}
        />
        {value === 10 && (
          <path
            d={starPath(centerX + eyeOffset * 0.75, eyeY, eyeR * 1.9, eyeR * 0.85, 5)}
            fill="var(--ill-sun)"
            stroke="var(--nb-1-red)"
            strokeWidth={1.6}
          />
        )}
        <circle cx={centerX - eyeOffset * 0.75} cy={eyeY} r={eyeR} fill="var(--ill-white)" />
        <circle cx={centerX + eyeOffset * 0.75} cy={eyeY} r={eyeR} fill="var(--ill-white)" />
        <circle
          cx={centerX - eyeOffset * 0.75}
          cy={eyeY}
          r={pupilR}
          fill="var(--stroke)"
          stroke="none"
        />
        <circle
          cx={centerX + eyeOffset * 0.75}
          cy={eyeY}
          r={pupilR}
          fill="var(--stroke)"
          stroke="none"
        />
        <path
          d={`M${String(centerX - 4)} ${String(mouthY)} Q${String(centerX)} ${String(mouthY + 4)} ${String(centerX + 4)} ${String(mouthY)}`}
          fill="none"
          stroke="var(--stroke)"
          strokeWidth={2}
        />
      </g>
    );
  }

  // Standard 2 Augen (mit Brille bei 2, Okto-Maske bei 8)
  const sp = value <= 3 || value === 7 ? cubeSize * 0.24 : eyeOffset;
  return (
    <g>
      {value === 8 && (
        <rect
          x={centerX - sp - eyeR * 1.5}
          y={eyeY - eyeR * 1.3}
          width={(sp + eyeR * 1.5) * 2}
          height={eyeR * 2.6}
          rx={eyeR}
          fill="var(--kiko-pink)"
          stroke="var(--stroke)"
          strokeWidth={1.8}
        />
      )}
      <circle
        cx={centerX - sp}
        cy={eyeY}
        r={eyeR}
        fill="var(--ill-white)"
        stroke={value === 2 ? 'var(--ill-sun)' : 'var(--stroke)'}
        strokeWidth={value === 2 ? 2.4 : 1.8}
      />
      <circle
        cx={centerX + sp}
        cy={eyeY}
        r={eyeR}
        fill="var(--ill-white)"
        stroke={value === 2 ? 'var(--ill-sun)' : 'var(--stroke)'}
        strokeWidth={value === 2 ? 2.4 : 1.8}
      />
      <circle cx={centerX - sp} cy={eyeY} r={pupilR} fill="var(--stroke)" stroke="none" />
      <circle cx={centerX + sp} cy={eyeY} r={pupilR} fill="var(--stroke)" stroke="none" />
      <path
        d={`M${String(centerX - 4)} ${String(mouthY)} Q${String(centerX)} ${String(mouthY + 3.5)} ${String(centerX + 4)} ${String(mouthY)}`}
        fill="none"
        stroke="var(--stroke)"
        strokeWidth={1.8}
      />
    </g>
  );
}

/**
 * Zeichnet einen echten Zahlenblock (Numberblock 1–10, 11–20 oder Zehner 20–100)
 * aus einzelnen abgerundeten Einheits-Würfeln mit Zifferling (Numberling) über dem Kopf.
 */
export function NumberBlock({
  value,
  size = 96,
  mystery = false,
  className,
}: {
  value: number;
  size?: number;
  mystery?: boolean;
  className?: string;
}) {
  const { cols, rows, cubes } = buildCubes(value, mystery);
  const cubeSize = Math.min(24, Math.floor(82 / Math.max(cols, rows)));
  const gridW = cols * cubeSize;
  const gridH = rows * cubeSize;
  const viewW = Math.max(76, gridW + 28);
  const viewH = Math.max(92, gridH + 38);
  const startX = (viewW - gridW) / 2;
  const bottomY = viewH - 8;
  const topY = bottomY - gridH;
  const centerX = viewW / 2;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox={`0 0 ${String(viewW)} ${String(viewH)}`}
      className={className}
      data-numberblock={mystery ? 'mystery' : String(value)}
    >
      <g stroke="var(--stroke)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        {/* Zifferling-Stiel und Schild über dem Kopf */}
        <line x1={centerX} y1={topY} x2={centerX} y2={topY - 7} strokeWidth={2} />
        <rect
          x={centerX - (value >= 100 ? 18 : value >= 10 ? 14 : 10)}
          y={Math.max(2, topY - 25)}
          width={value >= 100 ? 36 : value >= 10 ? 28 : 20}
          height={18}
          rx={6}
          fill="var(--ill-white)"
          stroke="var(--stroke)"
          strokeWidth={2}
        />
        <text
          x={centerX}
          y={Math.max(15, topY - 11)}
          textAnchor="middle"
          fontSize={12.5}
          fontWeight={800}
          fill="var(--stroke)"
          stroke="none"
        >
          {mystery ? '?' : String(value)}
        </text>

        {/* Einzelne Einheits-Würfel */}
        {cubes.map((cube, idx) => {
          const x = startX + cube.col * cubeSize;
          const y = bottomY - (cube.row + 1) * cubeSize;
          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={cubeSize}
                height={cubeSize}
                rx={3.5}
                fill={cube.fill}
                stroke={cube.rim ?? 'var(--stroke)'}
                strokeWidth={cube.rim ? 2.6 : 2}
              />
              {cube.button && (
                <circle
                  cx={x + cubeSize / 2}
                  cy={y + cubeSize / 2}
                  r={Math.max(2, cubeSize * 0.14)}
                  fill="var(--nb-1-red)"
                  stroke="none"
                />
              )}
              {cube.dot && (
                <circle
                  cx={x + cubeSize * 0.28}
                  cy={y + cubeSize * 0.72}
                  r={Math.max(1.8, cubeSize * 0.11)}
                  fill="var(--ill-white)"
                  stroke="none"
                />
              )}
            </g>
          );
        })}

        {/* Charakter-Gesicht auf der obersten Würfel-Reihe */}
        {renderFace(value, mystery, centerX, topY + cubeSize * 0.5, cubeSize)}
      </g>
    </svg>
  );
}
