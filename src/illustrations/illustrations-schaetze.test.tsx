import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chest } from './Chest';
import { FindlingIcon } from './FindlingIcon';
import { Gem } from './Gem';
import { Pearl } from './Pearl';
import { Star } from './Star';

const FINDLINGE = [
  'glitzermuschel',
  'strohhut',
  'bambusfloete',
  'goldener-schluessel',
  'bunte-feder',
  'kompass',
  'fernrohr',
  'schatzkarte',
  'goldene-krone',
  'perlmuttmuschel',
  'gluecksstein',
  'kleiner-eimer',
  'moewenfeder',
  'perle',
];
const LOCKS = [0, 1, 2, 3, 4, 5];

function decorativeSvg(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector('svg');
  if (svg === null) throw new Error('kein svg gerendert');
  expect(svg).toHaveAttribute('aria-hidden', 'true');
  expect(svg).toHaveAttribute('focusable', 'false');
  return svg;
}

describe('Fundstücke', () => {
  it.each(FINDLINGE)('%s gefunden: farbig mit Details, ohne „?“', (id) => {
    const { container } = render(<FindlingIcon id={id} className="f" />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-findling', id);
    expect(svg).toHaveAttribute('data-found', 'true');
    expect(svg).toHaveAttribute('width', '96');
    expect(svg).toHaveClass('f');
    expect(container.textContent).toBe('');
    expect(container.innerHTML).not.toContain('var(--ill-silhouette)');
  });

  it.each(FINDLINGE)('%s nicht gefunden: graue Silhouette mit „?“', (id) => {
    const found = render(<FindlingIcon id={id} />).container;
    const { container } = render(<FindlingIcon id={id} found={false} size={64} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-found', 'false');
    expect(svg).toHaveAttribute('width', '64');
    expect(container.textContent).toBe('?');
    expect(container.querySelector('text')).toHaveAttribute('fill', 'var(--ink-600)');
    // nur Grau, keine farbigen Flächen und weniger Formen als im gefundenen Zustand
    const fills = [...container.querySelectorAll('path')].map((p) => p.getAttribute('fill'));
    expect(fills.every((f) => f === 'var(--ill-silhouette)' || f === 'none')).toBe(true);
    expect(container.querySelectorAll('path, circle').length).toBeLessThan(
      found.querySelectorAll('path, circle').length,
    );
  });

  it('zeigt bei unbekannten IDs das Paket-Icon', () => {
    const { container } = render(<FindlingIcon id="gibt-es-nicht" size={50} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-icon', 'paket');
    expect(svg).toHaveAttribute('width', '50');
  });

  it('zeichnet das Kreuz der Schatzkarte ohne Rot', () => {
    const { container } = render(<FindlingIcon id="schatzkarte" />);
    expect(container.innerHTML).toContain('stroke="var(--ink-900)"');
    expect(container.innerHTML).not.toContain('coral');
  });
});

describe('Schatztruhe', () => {
  it.each(LOCKS)('zu mit %i Schlössern', (locks) => {
    const { container } = render(<Chest locks={locks} lidClassName="deckel" />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-chest', 'closed');
    expect(svg).toHaveAttribute('data-locks', String(locks));
    expect(svg).toHaveAttribute('width', '160');
    expect(container.querySelectorAll('[data-lid] ~ g[transform]')).toHaveLength(locks);
    expect(container.querySelector('.deckel')).toHaveAttribute('data-lid', 'closed');
  });

  it('begrenzt die Schlösser auf 0 bis 5', () => {
    expect(decorativeSvg(render(<Chest locks={9} />).container).getAttribute('data-locks')).toBe(
      '5',
    );
    expect(decorativeSvg(render(<Chest locks={-2} />).container).getAttribute('data-locks')).toBe(
      '0',
    );
  });

  it('offen mit Deckel-Klasse, ohne Schlösser', () => {
    const { container } = render(
      <Chest open locks={3} size={200} className="t" lidClassName="deckel" />,
    );
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-chest', 'open');
    expect(svg).toHaveAttribute('data-locks', '0');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveClass('t');
    expect(container.querySelector('.deckel')).toHaveAttribute('data-lid', 'open');
    expect(container.innerHTML).toContain('stroke="var(--ill-sun)"');
  });
});

describe('Perle, Glitzerstein, Stern', () => {
  it('Perle', () => {
    const svg = decorativeSvg(render(<Pearl className="p" />).container);
    expect(svg).toHaveAttribute('width', '28');
    expect(svg).toHaveClass('p');
  });

  it('Glitzerstein gefunden', () => {
    const { container } = render(<Gem />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('data-found', 'true');
    expect(container.innerHTML).toContain('var(--ill-gem)');
  });

  it('Glitzerstein nicht gefunden: nur gestrichelter Umriss', () => {
    const { container } = render(<Gem found={false} size={48} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-found', 'false');
    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(1);
    expect(paths[0]).toHaveAttribute('fill', 'none');
    expect(paths[0]).toHaveAttribute('stroke', 'var(--ink-600)');
    expect(paths[0]).toHaveAttribute('stroke-dasharray');
  });

  it('Stern gefüllt', () => {
    const { container } = render(<Star />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-star', 'filled');
    expect(svg).toHaveAttribute('width', '40');
    expect(container.querySelector('path')).toHaveAttribute('fill', 'var(--ill-sun)');
  });

  it('Stern leer: gestrichelte Kontur', () => {
    const { container } = render(<Star filled={false} size={24} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-star', 'empty');
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('fill', 'none');
    expect(path).toHaveAttribute('stroke', 'var(--ink-600)');
    expect(path).toHaveAttribute('stroke-dasharray');
  });
});

it('enthält keine Hex-Farben in den Zeichnungen', () => {
  const { container } = render(
    <>
      {FINDLINGE.map((id) => (
        <FindlingIcon key={id} id={id} />
      ))}
      {FINDLINGE.map((id) => (
        <FindlingIcon key={`${id}-?`} id={id} found={false} />
      ))}
      {LOCKS.map((n) => (
        <Chest key={n} locks={n} />
      ))}
      <Chest open />
      <Pearl />
      <Gem />
      <Gem found={false} />
      <Star />
      <Star filled={false} />
    </>,
  );
  expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
});
