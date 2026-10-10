import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { KikoPose } from '@/domain/hints';
import type { AvatarId, WorldId } from '@/domain/types';
import { AvatarIllustration } from './AvatarIllustration';
import { Fog } from './Fog';
import { Kiko } from './Kiko';
import { MapBackground } from './MapBackground';
import { StationIcon } from './StationIcon';
import { StufeIcon } from './StufeIcon';
import { UiIcon, type UiIconName } from './UiIcon';

const POSES: KikoPose[] = ['hallo', 'denkt', 'freut-sich', 'zeigt', 'schlaeft'];
const AVATARS: AvatarId[] = [
  'delfin',
  'schildkroete',
  'seepferdchen',
  'pinguin',
  'robbe',
  'flamingo',
];
const STATION_ICONS = [
  'station-muschel',
  'station-markt',
  'station-kiosk',
  'station-geldboerse',
  'station-laden',
  'station-bruecke',
  'station-leuchtturm',
  'station-hoehle',
  'station-truhe',
  'station-muschelufer',
  'station-muenzquelle',
  'station-kikos-laden',
  'station-kruemels-wippe',
  'station-muscheltruhe',
];
const STUFE_ICONS = ['stufe-muschel', 'stufe-seestern', 'stufe-krebs', 'stufe-oktopus'];
const UI_ICONS: UiIconName[] = [
  'zahnrad',
  'schliessen',
  'lautsprecher',
  'schloss',
  'haken',
  'stern',
  'palme',
  'muschel',
  'muenzen',
  'truhe',
  'pfeil-weiter',
  'uhr',
  'gluehbirne',
  'plus',
  'download',
  'upload',
  'zurueck',
  'stift',
  'hand-zahl',
  'leuchtturm',
  'herz',
];
const WORLDS: WorldId[] = ['schatzinsel', 'kleine-bucht'];

function decorativeSvg(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector('svg');
  if (svg === null) throw new Error('kein svg gerendert');
  expect(svg).toHaveAttribute('aria-hidden', 'true');
  expect(svg).toHaveAttribute('focusable', 'false');
  return svg;
}

describe('Illustrationen', () => {
  it.each(POSES)('Kiko in der Pose %s', (pose) => {
    const { container } = render(<Kiko pose={pose} size={80} className="k" />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('data-pose', pose);
    expect(svg).toHaveClass('k');
  });

  it.each(AVATARS)('Avatar %s', (avatar) => {
    const { container } = render(<AvatarIllustration avatar={avatar} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('width', '96');
    // jede Instanz hat einen eigenen Clip-Pfad
    const clip = svg.querySelector('clipPath');
    expect(clip?.id).toMatch(/^avatar-clip-[a-zA-Z0-9-]+$/);
  });

  it.each(STATION_ICONS)('Stations-Icon %s', (icon) => {
    const { container } = render(<StationIcon icon={icon} />);
    expect(decorativeSvg(container)).toHaveAttribute('data-icon', icon);
  });

  it.each(STUFE_ICONS)('Stufen-Icon %s', (icon) => {
    const { container } = render(<StufeIcon icon={icon} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-icon', icon);
    expect(svg).toHaveAttribute('width', '40');
  });

  it('zeigt bei unbekannten IDs das Paket-Icon', () => {
    const station = render(<StationIcon icon="gibt-es-nicht" />);
    expect(decorativeSvg(station.container)).toHaveAttribute('data-icon', 'paket');
    const stufe = render(<StufeIcon icon="gibt-es-nicht" size={32} />);
    const svg = decorativeSvg(stufe.container);
    expect(svg).toHaveAttribute('data-icon', 'paket');
    expect(svg).toHaveAttribute('width', '32');
  });

  it.each(UI_ICONS)('UI-Icon %s erbt die Textfarbe', (name) => {
    const { container } = render(<UiIcon name={name} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('width', '24');
  });

  it.each(WORLDS)('Kartenhintergrund %s füllt den Container', (world) => {
    const { container } = render(<MapBackground world={world} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('width', '100%');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid slice');
  });

  it('Nebel', () => {
    const { container } = render(<Fog size={100} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('width', '100');
    expect(svg).toHaveAttribute('height', '60');
  });

  it('enthält keine Hex-Farben in den Zeichnungen', () => {
    const { container } = render(
      <>
        {POSES.map((p) => (
          <Kiko key={p} pose={p} />
        ))}
        {AVATARS.map((a) => (
          <AvatarIllustration key={a} avatar={a} />
        ))}
        {WORLDS.map((w) => (
          <MapBackground key={w} world={w} />
        ))}
      </>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
