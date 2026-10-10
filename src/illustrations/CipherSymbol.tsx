import type { ReactNode } from 'react';

// Zeichen der Geheimschrift (docs/12 3.8): eigene Formen statt Unicode, damit nichts zum Emoji wird.
// Reihenfolge und Anzahl wie UI.cipher.symbolNames. viewBox 0 0 24 24.

const SHAPES: readonly ReactNode[] = [
  <circle key="kreis" cx={12} cy={12} r={8} />,
  <rect key="quadrat" x={4.5} y={4.5} width={15} height={15} rx={1.5} />,
  <path key="dreieck" d="M12 3.5 L21 20 H3 Z" />,
  <path
    key="stern"
    d="M12 2.5 L14.6 9 L21.5 9.3 L16.1 13.6 L18 20.4 L12 16.5 L6 20.4 L7.9 13.6 L2.5 9.3 L9.4 9 Z"
  />,
  <path
    key="herz"
    d="M12 20.5 C5 15.5 2.5 12 2.5 8.5 C2.5 5.5 5 3.5 7.5 3.5 C9.5 3.5 11 4.7 12 6.5 C13 4.7 14.5 3.5 16.5 3.5 C19 3.5 21.5 5.5 21.5 8.5 C21.5 12 19 15.5 12 20.5 Z"
  />,
  <path key="raute" d="M12 2.5 L20.5 12 L12 21.5 L3.5 12 Z" />,
  <path key="mond" d="M15.5 3 A9 9 0 1 0 21 15.5 A7 7 0 1 1 15.5 3 Z" />,
  <path key="blitz" d="M13.5 2.5 L5.5 13.5 H11 L9.5 21.5 L18.5 9.5 H13 Z" />,
  <path key="kreuz" d="M9 3.5 H15 V9 H20.5 V15 H15 V20.5 H9 V15 H3.5 V9 H9 Z" />,
  <path
    key="welle"
    d="M2.5 9 C5 5.5 7.5 5.5 10 9 C12.5 12.5 15 12.5 17.5 9 C19 7 20.5 6.5 21.5 7 V15 C20.5 14.5 19 15 17.5 17 C15 20.5 12.5 20.5 10 17 C7.5 13.5 5 13.5 2.5 17 Z"
  />,
  <path key="tropfen" d="M12 2.5 C16 8 19 11.5 19 15 A7 7 0 0 1 5 15 C5 11.5 8 8 12 2.5 Z" />,
  <g key="sonne">
    <circle cx={12} cy={12} r={5} />
    <path
      d="M12 1.5 V5 M12 19 V22.5 M1.5 12 H5 M19 12 H22.5 M4.5 4.5 L7 7 M17 17 L19.5 19.5 M19.5 4.5 L17 7 M7 17 L4.5 19.5"
      fill="none"
    />
  </g>,
  <path key="blatt" d="M4 20 C4 9 10 4 20.5 3.5 C20 14 15 20 4 20 Z M4 20 L13 11" />,
  <path key="pfeil" d="M3 9.5 H13 V4.5 L21.5 12 L13 19.5 V14.5 H3 Z" />,
  <path
    key="glocke"
    d="M12 3 C16 3 17.5 6.5 17.5 10 V15 L20 18 H4 L6.5 15 V10 C6.5 6.5 8 3 12 3 Z M10 19.5 A2 2 0 0 0 14 19.5"
  />,
  <path key="fisch" d="M2.5 12 C6 6 13 5 17 10 L21.5 6.5 V17.5 L17 14 C13 19 6 18 2.5 12 Z" />,
];

export function CipherSymbol({ index, size = 32 }: { index: number; size?: number }) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24">
      <g
        fill="var(--sea-700)"
        stroke="var(--stroke)"
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {SHAPES[index % SHAPES.length]}
      </g>
    </svg>
  );
}
