import { PRINT } from '@/content/print';
import { choiceOrder } from '@/domain/choice';
import { formatMoney } from '@/domain/money';
import { renderText } from '@/domain/text';
import type {
  Answer,
  ClueSymbol,
  CoinValue,
  GridAnswer,
  MoneyPiece,
  StufeConfig,
  Task,
} from '@/domain/types';
import { Coin } from '@/illustrations/Coin';
import { Container } from '@/illustrations/Container';
import { ClockFace } from '@/illustrations/ClockFace';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { Note } from '@/illustrations/Note';
import { cx } from '@/components/cx';
import styles from './Paper.module.css';

// Antworttypen auf Papier (docs/06 4 und 6). Ohne jede Lösung: keine correct-Markierung im DOM.

/** 2-Euro-Münze im Druck 26 mm (1 mm ≈ 3,78 CSS-Pixel); die anderen im echten Verhältnis (docs/06 4). */
const TWO_EURO_PX = 26 * 3.78;

function isCoin(value: MoneyPiece): value is CoinValue {
  return value <= 200;
}

/** small: in Auswahl- und Ordnungskarten verkleinert, im selben Verhältnis */
function PaperPiece({ value, small = false }: { value: MoneyPiece; small?: boolean }) {
  const scale = small ? 0.6 : 1;
  if (!isCoin(value)) return <Note value={value} width={88 * scale} />;
  return <Coin value={value} size={TWO_EURO_PX * scale} />;
}

function Pieces({ pieces, small = false }: { pieces: readonly MoneyPiece[]; small?: boolean }) {
  return (
    <span className={styles.pieces}>
      {pieces.map((piece, i) => (
        <PaperPiece key={i} value={piece} small={small} />
      ))}
    </span>
  );
}

const TRIANGLE_SPOTS: Record<string, [number, number]> = {
  a: [50, 24],
  b: [28, 68],
  c: [72, 68],
  ab: [14, 40],
  bc: [50, 93],
  ca: [86, 40],
};

function PaperGrid({ answer }: { answer: GridAnswer }) {
  const show = (value: number) => (answer.unit === 'cents' ? formatMoney(value) : String(value));
  const brick = (cell: GridAnswer['cells'][number]) => (
    <span key={cell.id} className={cx(styles.brick, !cell.given && styles.open)}>
      {cell.given ? show(cell.value) : ''}
    </span>
  );
  if (answer.shape === 'triangle') {
    return (
      <div className={styles.triangle}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <polygon points="50,6 8,84 92,84" />
        </svg>
        {answer.cells.map((cell) => {
          const [x, y] = TRIANGLE_SPOTS[cell.id] ?? [0, 0];
          return (
            <span
              key={cell.id}
              className={styles.spot}
              style={{ left: `${String(x)}%`, top: `${String(y)}%` }}
            >
              {brick(cell)}
            </span>
          );
        })}
      </div>
    );
  }
  if (answer.shape === 'house') {
    const roof = answer.cells.find((cell) => cell.id === 'dach');
    const floors = (answer.cells.length - 1) / 2;
    return (
      <div className={styles.wall}>
        {roof && <div className={styles.wallRow}>{brick(roof)}</div>}
        {Array.from({ length: floors }, (_, row) => (
          <div key={row} className={styles.wallRow}>
            {answer.cells
              .filter((cell) => cell.id === `r${String(row)}l` || cell.id === `r${String(row)}r`)
              .map(brick)}
          </div>
        ))}
      </div>
    );
  }
  const width = answer.cells.filter((cell) => cell.id.startsWith('r0c')).length;
  return (
    <div className={styles.wall}>
      {Array.from({ length: width }, (_, i) => width - 1 - i).map((row) => (
        <div key={row} className={styles.wallRow}>
          {answer.cells
            .filter((cell) => cell.id.startsWith(`r${String(row)}c`))
            .sort((a, b) => a.id.localeCompare(b.id, 'de', { numeric: true }))
            .map(brick)}
        </div>
      ))}
    </div>
  );
}

const SYMBOLS: ClueSymbol[] = ['muschel', 'stern', 'fisch', 'krebs'];

export function PaperAnswer({
  task,
  answer,
  cfg,
}: {
  task: Task;
  answer: Answer;
  cfg: StufeConfig;
}) {
  switch (answer.type) {
    case 'choice': {
      const options = choiceOrder(answer, task.id);
      const pictorial = answer.layout === 'coins' || answer.layout === 'bags';
      return (
        <div className={styles.options}>
          {options.map((option) =>
            pictorial ? (
              <span key={option.id} className={styles.option}>
                {answer.layout === 'bags' && (option.pieces ?? option.objects) && (
                  <Container
                    kind={option.objects ? 'eimer' : option.icon ? 'beutel' : 'geldboerse'}
                    symbol={option.icon}
                    size={40}
                  />
                )}
                {answer.layout === 'bags' && <span>{renderText(option.label)}</span>}
                {option.pieces && <Pieces pieces={option.pieces} small />}
                {option.objects && (
                  <span className={styles.pieces}>
                    {Array.from({ length: option.objects.count }, (_, i) => (
                      <ItemIcon key={i} itemId={option.objects?.itemId ?? ''} size={26} />
                    ))}
                  </span>
                )}
                {!option.pieces && !option.objects && answer.layout !== 'bags' && (
                  <span>{renderText(option.label)}</span>
                )}
                <span className={styles.circle} />
              </span>
            ) : (
              <span key={option.id} className={styles.optionLine}>
                <span className={styles.circle} />
                {option.icon && <ItemIcon itemId={option.icon} size={32} />}
                {renderText(option.label)}
              </span>
            ),
          )}
        </div>
      );
    }
    case 'money':
      return (
        <p className={styles.answerLine}>
          {PRINT.answer} <span className={styles.fill} /> {PRINT.euro}
          {cfg.money.useCents && (
            <>
              {' '}
              <span className={styles.fill} /> {PRINT.cent}
            </>
          )}
        </p>
      );
    case 'number':
      if (cfg.numberInput === 'numberline') {
        return (
          <div className={styles.numberLine}>
            {Array.from({ length: 11 }, (_, n) => (
              <span key={n} className={styles.tick}>
                {n}
              </span>
            ))}
          </div>
        );
      }
      return (
        <p className={styles.answerLine}>
          {PRINT.number} <span className={cx(styles.box, cfg.id === 1 && styles.bigBox)} />
        </p>
      );
    case 'pay':
      return (
        <>
          <div className={styles.tray} />
          <Pieces pieces={answer.palette} />
        </>
      );
    case 'pay-variants':
      return (
        <>
          <div className={styles.trays}>
            {Array.from({ length: answer.required }, (_, i) => (
              <div key={i} className={styles.tray}>
                <span className={styles.trayLabel}>{PRINT.variant(i + 1)}</span>
              </div>
            ))}
          </div>
          <Pieces pieces={answer.palette} />
        </>
      );
    case 'order':
      return (
        <div className={styles.cards}>
          {answer.entries.map((entry) => (
            <span key={entry.id} className={styles.card}>
              <span className={styles.cardBox} />
              {entry.piece !== undefined && <PaperPiece value={entry.piece} small />}
              {entry.itemId && <ItemIcon itemId={entry.itemId} size={28} />}
              {entry.objects && (
                <span className={styles.pieces}>
                  {Array.from({ length: entry.objects.count }, (_, i) => (
                    <ItemIcon key={i} itemId={entry.objects?.itemId ?? ''} size={20} />
                  ))}
                </span>
              )}
              <span>{renderText(entry.label)}</span>
            </span>
          ))}
        </div>
      );
    case 'select':
      return (
        <div className={styles.cards}>
          {answer.items.map((item) => (
            <span key={item.itemId} className={styles.card}>
              <ItemIcon itemId={item.itemId} size={28} />
              <span>{renderText(item.label)}</span>
              {item.price !== undefined && (
                <span className={styles.priceTag}>
                  {formatMoney(item.price, item.priceFormat ?? 'auto')}
                </span>
              )}
            </span>
          ))}
        </div>
      );
    case 'grid':
      return <PaperGrid answer={answer} />;
    case 'code': {
      const fromScene = task.scene.kind === 'clues' ? task.scene.clues.map((c) => c.symbol) : [];
      const symbols =
        fromScene.length === answer.digits.length
          ? fromScene
          : SYMBOLS.slice(0, answer.digits.length);
      return (
        <div className={styles.lock}>
          {symbols.map((symbol) => (
            <span key={symbol} className={styles.wheel}>
              <ItemIcon itemId={symbol} size={32} />
              <span className={styles.box} />
            </span>
          ))}
        </div>
      );
    }
    case 'clock':
      // leere Uhr zum Einzeichnen der Zeiger
      return (
        <div className={styles.clock}>
          <ClockFace size={130} />
          <span>{PRINT.drawHands}</span>
        </div>
      );
  }
}
