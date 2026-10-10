import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NEST_ITEMS } from '@/content/outfits';
import { NestItemIcon, NestRoom } from './NestRoom';

describe('Kikos Nest', () => {
  it('leeres Zimmer rendert ohne Teile, aria-hidden', () => {
    const { container } = render(<NestRoom items={{}} />);
    const svg = container.querySelector('svg[data-nest-room]');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('[data-nest-item]')).toHaveLength(0);
    expect(container.querySelector('[data-nest-kiko]')).toBeNull();
  });

  it('zeigt Kiko in einem verschachtelten SVG mit viewBox 0 0 96 96', () => {
    const { container } = render(<NestRoom items={{}} kiko={<g data-testid="kiko" />} />);
    const slot = container.querySelector('svg[data-nest-kiko]');
    expect(slot).toHaveAttribute('viewBox', '0 0 96 96');
    expect(slot?.querySelector('[data-testid="kiko"]')).not.toBeNull();
  });

  for (const item of NEST_ITEMS) {
    it(`${item.id}: Zeichnung im Zimmer und als Kachel`, () => {
      const { container } = render(
        <>
          <NestRoom items={{ [item.slot]: item.id }} />
          <NestItemIcon id={item.id} />
        </>,
      );
      const drawn = container.querySelectorAll(`[data-nest-item="${item.id}"]`);
      expect(drawn).toHaveLength(2);
      expect(container.querySelector('[data-icon="paket"]')).toBeNull();
    });
  }

  it('unbekannte Teile: Paket in der Kachel, nichts im Zimmer', () => {
    const { container } = render(
      <>
        <NestRoom items={{ boden: 'gibt-es-nicht', wand: 'teppich-welle' }} />
        <NestItemIcon id="gibt-es-nicht" />
      </>,
    );
    expect(container.querySelector('[data-icon="paket"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-nest-item]')).toHaveLength(0);
  });
});
