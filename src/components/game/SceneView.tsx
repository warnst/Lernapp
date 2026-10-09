import { UI } from '@/content/ui';
import { formatMoney } from '@/domain/money';
import { renderText } from '@/domain/text';
import type { BalanceSide, MoneyPiece, Scene, SeqItem } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import styles from './Game.module.css';
import { ItemCard } from './ItemCard';
import { MoneyPieceView } from './MoneyPieceView';
import { ObjectScene } from './ObjectScene';
import { PriceTag } from './PriceTag';

function Pieces({ pieces }: { pieces: readonly MoneyPiece[] }) {
  return (
    <span className={styles.money}>
      {pieces.map((piece, i) => (
        <MoneyPieceView key={i} value={piece} />
      ))}
    </span>
  );
}

function NoteLine({ line }: { line: string }) {
  const parts = renderText(line).split('▢');
  return (
    <p>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className={styles.blot} role="img" aria-label={UI.scene.blot} />
          )}
        </span>
      ))}
    </p>
  );
}

function SeqCard({ item }: { item: SeqItem }) {
  switch (item.kind) {
    case 'number':
      return <span className={styles.tag}>{item.value}</span>;
    case 'money':
      return <PriceTag price={item.cents} />;
    case 'icon':
      return <ItemIcon itemId={item.icon} size={56} />;
    case 'objects':
      return (
        <span className={styles.group}>
          {Array.from({ length: item.count }, (_, i) => (
            <ItemIcon key={i} itemId={item.itemId} size={32} />
          ))}
        </span>
      );
    case 'blank':
      return <span className={styles.tag}>?</span>;
  }
}

function Side({ side }: { side: BalanceSide }) {
  return (
    <div className={styles.group}>
      {side.pieces && <Pieces pieces={side.pieces} />}
      {side.objects &&
        Array.from({ length: side.objects.count }, (_, i) => (
          <ItemIcon key={i} itemId={side.objects?.itemId ?? ''} size={36} />
        ))}
      {Array.from({ length: side.unknown ?? 0 }, (_, i) => (
        <span key={`u${String(i)}`} className={styles.tag}>
          ?
        </span>
      ))}
    </div>
  );
}

/** Bühne oben im Spiel (docs/02 5, docs/03 4). Waage, Muster und Schloss bekommen in Phase 7 ihre Bilder. */
export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.kind) {
    case 'none':
      return null;
    case 'coins':
      return (
        <div className={styles.scene}>
          {scene.groups ? (
            scene.groups.map((group, i) => (
              <div key={i} className={styles.group}>
                <Pieces pieces={group} />
              </div>
            ))
          ) : (
            <Pieces pieces={scene.pieces} />
          )}
          {scene.label !== undefined && <span className={styles.sceneLabel}>{scene.label}</span>}
        </div>
      );
    case 'items':
      return (
        <div className={styles.scene}>
          {scene.items.map((item) => (
            <ItemCard key={item.itemId} item={item} />
          ))}
          {scene.decor &&
            Array.from({ length: scene.decor.count }, (_, i) => (
              <ItemIcon key={i} itemId={scene.decor?.itemId ?? ''} size={36} />
            ))}
          {scene.hand && (
            <div className={styles.side}>
              {UI.scene.hand}
              <Pieces pieces={scene.hand} />
            </div>
          )}
          {scene.paidWith && (
            <div className={styles.side}>
              {UI.scene.paidWith}
              <Pieces pieces={scene.paidWith} />
            </div>
          )}
        </div>
      );
    case 'people':
      return (
        <div className={styles.scene}>
          {scene.people.map((person) => (
            <div key={person.name} className={styles.person}>
              <span>{person.name}</span>
              {person.amount !== undefined && (
                <span className={styles.tag}>{formatMoney(person.amount)}</span>
              )}
            </div>
          ))}
        </div>
      );
    case 'note':
      return (
        <div className={styles.scene}>
          <div className={styles.note}>
            {scene.lines.map((line) => (
              <NoteLine key={line} line={line} />
            ))}
          </div>
        </div>
      );
    case 'objects':
      return (
        <div className={styles.scene}>
          <ObjectScene groups={scene.groups} />
        </div>
      );
    case 'sequence':
      return (
        <div className={styles.scene}>
          {scene.items.map((item, i) => (
            <SeqCard key={i} item={item} />
          ))}
        </div>
      );
    case 'balance':
      return (
        <div className={styles.scene}>
          <Side side={scene.left} />
          <Side side={scene.right} />
        </div>
      );
    case 'clues':
      return (
        <div className={styles.scene}>
          {scene.clues.map((clue) => (
            <div key={clue.symbol} className={styles.person}>
              <ItemIcon itemId={clue.symbol} size={40} />
              <span>{clue.text}</span>
            </div>
          ))}
        </div>
      );
  }
}
