import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatMoney } from '@/domain/money';
import type { CoinValue, NoteValue } from '@/domain/types';
import { Coin } from './Coin';
import { coinDiameter } from './coin-size';
import { Container, type ContainerKind } from './Container';
import { ItemIcon } from './ItemIcon';
import { Note } from './Note';

const ITEM_IDS = [
  'muschel',
  'kokosnuss',
  'eis',
  'seil',
  'saft',
  'postkarte',
  'muschelkette',
  'keks',
  'fisch',
  'bonbon',
  'bananenbrot',
  'apfel',
  'wasser',
  'vogelpfeife',
  'tee',
  'streichhoelzer',
  'strandball',
  'stickerheft',
  'sonnencreme',
  'seifenblasen',
  'seestern',
  'schatzkaestchen',
  'piratenhut',
  'muschelarmband',
  'muffin',
  'melone',
  'marmelade',
  'mango',
  'lolli',
  'laterne',
  'lampenoel',
  'kopftuch',
  'kompass',
  'kokoskeks',
  'kerze',
  'kekse',
  'kaugummi',
  'karte',
  'kaese',
  'hut',
  'honig',
  'fischbroetchen',
  'fernglas',
  'federstift',
  'feder',
  'eimer',
  'decke',
  'brot',
  'banane',
  'ball',
  'augenklappe',
  'aepfel',
  'krebs',
  'stein',
  'moewe',
  'boot',
  'murmel',
  'sticker',
  'stern',
  'anker',
];
const COINS: CoinValue[] = [1, 2, 5, 10, 20, 50, 100, 200];
const NOTES: NoteValue[] = [500, 1000, 2000, 5000];
const KINDS: ContainerKind[] = ['beutel', 'geldboerse', 'eimer'];
const SYMBOLS = ['anker', 'stern', 'fisch', 'muschel'];

function decorativeSvg(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector('svg');
  if (svg === null) throw new Error('kein svg gerendert');
  expect(svg).toHaveAttribute('aria-hidden', 'true');
  expect(svg).toHaveAttribute('focusable', 'false');
  return svg;
}

describe('Sachen-Icons', () => {
  it.each(ITEM_IDS)('Icon %s mit höchstens 6 Formen', (id) => {
    const { container } = render(<ItemIcon itemId={id} className="i" />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-icon', id);
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveClass('i');
    const shapes = svg.querySelectorAll('path, circle, rect, ellipse, polygon, line');
    expect(shapes.length).toBeGreaterThan(0);
    expect(shapes.length).toBeLessThanOrEqual(6);
  });

  it('zeigt bei unbekannten IDs das Paket-Icon', () => {
    const { container } = render(<ItemIcon itemId="gibt-es-nicht" size={40} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-icon', 'paket');
    expect(svg).toHaveAttribute('width', '40');
  });
});

describe('Münzen', () => {
  it.each(COINS)('Münze %i ct', (value) => {
    const { container } = render(<Coin value={value} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-coin', String(value));
    expect(Number(svg.getAttribute('width'))).toBeCloseTo(coinDiameter(value), 5);
    expect(container.textContent).toBe(
      value >= 100 ? `${String(value / 100)}Euro` : `${String(value)}Cent`,
    );
  });

  it('hält das echte Größenverhältnis ein', () => {
    expect(coinDiameter(200)).toBe(72);
    expect(coinDiameter(1)).toBeCloseTo(45.4, 1);
    expect(coinDiameter(50)).toBeGreaterThan(coinDiameter(100));
    expect(coinDiameter(5)).toBeGreaterThan(coinDiameter(10));
    expect(coinDiameter(200, 100)).toBe(100);
  });

  it('skaliert alle Münzen über size', () => {
    const { container } = render(<Coin value={100} size={144} />);
    const svg = decorativeSvg(container);
    expect(Number(svg.getAttribute('width'))).toBeCloseTo(coinDiameter(100) * 2, 5);
  });
});

describe('Scheine', () => {
  it.each(NOTES)('Schein %i ct', (value) => {
    const { container } = render(<Note value={value} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '64');
    expect(container.textContent).toBe(formatMoney(value));
  });

  it('hält das Seitenverhältnis', () => {
    const { container } = render(<Note value={500} width={60} />);
    expect(decorativeSvg(container)).toHaveAttribute('height', '32');
  });
});

describe('Behälter', () => {
  it.each(KINDS)('Behälter %s ohne Symbol', (kind) => {
    const { container } = render(<Container kind={kind} />);
    const svg = decorativeSvg(container);
    expect(svg).toHaveAttribute('data-container', kind);
    expect(svg).toHaveAttribute('width', '96');
    expect(svg).not.toHaveAttribute('data-symbol');
  });

  it.each(KINDS.flatMap((kind) => SYMBOLS.map((symbol) => [kind, symbol] as const)))(
    'Behälter %s mit Symbol %s',
    (kind, symbol) => {
      const { container } = render(<Container kind={kind} symbol={symbol} size={80} />);
      const svg = decorativeSvg(container);
      expect(svg).toHaveAttribute('data-symbol', symbol);
      expect(svg).toHaveAttribute('width', '80');
    },
  );

  it('ignoriert unbekannte Symbole', () => {
    const { container } = render(<Container kind="beutel" symbol="gibt-es-nicht" />);
    expect(decorativeSvg(container)).not.toHaveAttribute('data-symbol');
  });
});

it('enthält keine Hex-Farben in den Zeichnungen', () => {
  const { container } = render(
    <>
      {ITEM_IDS.map((id) => (
        <ItemIcon key={id} itemId={id} />
      ))}
      {COINS.map((c) => (
        <Coin key={c} value={c} />
      ))}
      {NOTES.map((n) => (
        <Note key={n} value={n} />
      ))}
      {KINDS.map((k) => (
        <Container key={k} kind={k} symbol="anker" />
      ))}
    </>,
  );
  expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
});
