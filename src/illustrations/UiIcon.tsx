import type { ReactNode } from 'react';

// Kleine Strich-Icons (docs/02, Abschnitt 8): 24 px, 2,5 px Kontur, erben die Textfarbe.

export type UiIconName =
  | 'zahnrad'
  | 'schliessen'
  | 'lautsprecher'
  | 'schloss'
  | 'haken'
  | 'stern'
  | 'palme'
  | 'muschel'
  | 'muenzen'
  | 'truhe'
  | 'pfeil-weiter'
  | 'uhr'
  | 'gluehbirne'
  | 'plus'
  | 'download'
  | 'upload'
  | 'zurueck';

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Pfad aus Polarkoordinaten um (12|12), Winkel in Grad. */
function polarPath(points: [number, number][]): string {
  const parts = points.map(([deg, r]) => {
    const a = (deg * Math.PI) / 180;
    return `${String(round1(12 + r * Math.cos(a)))} ${String(round1(12 + r * Math.sin(a)))}`;
  });
  return `M${parts.join(' L')} Z`;
}

function gearPath(): string {
  const points: [number, number][] = [];
  for (let i = 0; i < 8; i += 1) {
    const base = i * 45;
    points.push([base - 14, 7.6], [base - 9, 10], [base + 9, 10], [base + 14, 7.6]);
  }
  return polarPath(points);
}

function starPath(): string {
  const points: [number, number][] = [];
  for (let i = 0; i < 10; i += 1) {
    points.push([i * 36 - 90, i % 2 === 0 ? 9.5 : 4.3]);
  }
  return polarPath(points);
}

const ICONS: Record<UiIconName, ReactNode> = {
  zahnrad: (
    <>
      <path d={gearPath()} />
      <circle cx={12} cy={12} r={3} />
    </>
  ),
  schliessen: <path d="M6 6 L18 18 M18 6 L6 18" />,
  lautsprecher: (
    <>
      <path d="M3 9.5 H7 L12 5 V19 L7 14.5 H3 Z" />
      <path d="M16 9 Q18 12 16 15 M19 6 Q23.5 12 19 18" />
    </>
  ),
  schloss: (
    <>
      <rect x={5} y={11} width={14} height={10} rx={2} />
      <path d="M8 11 V8 A4 4 0 0 1 16 8 V11 M12 15 V17" />
    </>
  ),
  haken: <path d="M5 12.5 L9.5 17 L19 7" />,
  stern: <path d={starPath()} fill="currentColor" />,
  palme: (
    <path d="M12 21 C12 16 11.5 12 10.5 9 M10.5 9 C8 6 4.5 6 2.5 8.5 M10.5 9 C10.5 5.5 13 3 16.5 3.5 M10.5 9 C14 7.5 18.5 8.5 20.5 12 M10.5 9 C7.5 9.5 5.5 11.5 5 14.5 M6 21 H18" />
  ),
  muschel: (
    <path d="M12 20 L4 11.5 C3.5 6.5 7.5 4 12 4 C16.5 4 20.5 6.5 20 11.5 Z M12 20 L8.5 5 M12 20 V4 M12 20 L15.5 5" />
  ),
  muenzen: (
    <>
      <ellipse cx={12} cy={6} rx={7} ry={3} />
      <path d="M5 6 V10 C5 11.7 8.1 13 12 13 C15.9 13 19 11.7 19 10 V6" />
      <path d="M5 10 V14 C5 15.7 8.1 17 12 17 C15.9 17 19 15.7 19 14 V10" />
      <path d="M5 14 V18 C5 19.7 8.1 21 12 21 C15.9 21 19 19.7 19 18 V14" />
    </>
  ),
  truhe: (
    <>
      <path d="M3 11 V8.5 C3 6 5 4 7.5 4 H16.5 C19 4 21 6 21 8.5 V11" />
      <rect x={3} y={11} width={18} height={9} rx={1.5} />
      <path d="M10.5 10 H13.5 V14 H10.5 Z" />
    </>
  ),
  'pfeil-weiter': <path d="M5 12 H19 M13 6 L19 12 L13 18" />,
  zurueck: <path d="M19 12 H5 M11 6 L5 12 L11 18" />,
  uhr: (
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7 V12 L15.5 14" />
    </>
  ),
  gluehbirne: (
    <path d="M9 15.5 C9 13 6 11.5 6 8 A6 6 0 0 1 18 8 C18 11.5 15 13 15 15.5 Z M9 18.5 H15 M10.5 21.5 H13.5" />
  ),
  plus: <path d="M12 5 V19 M5 12 H19" />,
  download: <path d="M12 4 V15 M7 10 L12 15 L17 10 M5 20 H19" />,
  upload: <path d="M12 15 V4 M7 9 L12 4 L17 9 M5 20 H19" />,
};

export function UiIcon({
  name,
  size = 24,
  className,
}: {
  name: UiIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      data-icon={name}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}
