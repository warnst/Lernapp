import { UI } from '@/content/ui';
import { formatMoney } from '@/domain/money';
import { renderText } from '@/domain/text';
import type { MoneyPiece, Scene } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import styles from './Game.module.css';
import { ItemCard } from './ItemCard';
import { MoneyPieceView } from './MoneyPieceView';
import { ObjectScene } from './ObjectScene';
import { BalanceScene, CluesScene, SequenceScene } from './RiddleScenes';

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

/** Bühne oben im Spiel (docs/02 5, docs/03 4). */
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
          <SequenceScene items={scene.items} />
        </div>
      );
    case 'balance':
      return (
        <div className={styles.scene}>
          <BalanceScene left={scene.left} right={scene.right} />
        </div>
      );
    case 'clues':
      return (
        <div className={styles.scene}>
          <CluesScene clues={scene.clues} />
        </div>
      );
  }
}
