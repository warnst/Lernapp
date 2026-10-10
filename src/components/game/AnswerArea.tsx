import { useEffect } from 'react';
import type { AnswerInput } from '@/domain/check';
import type { ClueSymbol, MoneyPiece, StufeConfig, Task, TaskPart } from '@/domain/types';
import { ChoiceView } from './ChoiceView';
import { CodeLock } from './CodeLock';
import { CoinTray } from './CoinTray';
import { FoundVariants } from './FoundVariants';
import { GridView } from './GridView';
import { MoneyEntry } from './MoneyEntry';
import { NumberEntry } from './NumberEntry';
import { OrderView } from './OrderView';
import { SelectView } from './SelectView';

export type PendingInput = AnswerInput;

const DEFAULT_SYMBOLS: ClueSymbol[] = ['muschel', 'stern', 'fisch', 'krebs'];

/** Symbole der Räder: aus den Rätselkarten der Szene, sonst der Reihe nach. */
function codeSymbols(task: Task, count: number): ClueSymbol[] {
  const fromScene = task.scene.kind === 'clues' ? task.scene.clues.map((c) => c.symbol) : [];
  return fromScene.length === count ? fromScene : DEFAULT_SYMBOLS.slice(0, count);
}

/**
 * Der Antwortbereich für den Typ des Aufgabenteils (docs/01 6.2). Eine vollständige Eingabe
 * wird über onPending gemeldet („Prüfen“ wird aktiv); Antwortkarten prüfen sofort über onSubmit.
 */
export function AnswerArea({
  task,
  part,
  config,
  tried,
  found,
  locked,
  solved,
  onPending,
  onSubmit,
}: {
  task: Task;
  part: TaskPart;
  config: StufeConfig;
  tried: readonly string[];
  found: readonly MoneyPiece[][];
  locked: readonly string[];
  solved: boolean;
  onPending: (input: PendingInput | null) => void;
  onSubmit: (input: PendingInput) => void;
}) {
  useEffect(() => {
    onPending(null);
  }, [onPending]);

  const answer = part.answer;
  const readOnTap = config.id === 1;
  switch (answer.type) {
    case 'choice':
      return (
        <ChoiceView
          answer={answer}
          seedId={task.id}
          tried={tried}
          solved={solved}
          readOnTap={readOnTap}
          onPick={(optionId) => {
            onSubmit({ type: 'choice', optionId });
          }}
        />
      );
    case 'money':
      return (
        <MoneyEntry
          useCents={config.money.useCents}
          onChange={(value) => {
            onPending(value ? { type: 'money', ...value } : null);
          }}
        />
      );
    case 'number':
      return (
        <NumberEntry
          mode={config.numberInput}
          max={config.numbers.max}
          readOnTap={readOnTap}
          onChange={(value) => {
            onPending(value === null ? null : { type: 'number', value });
          }}
        />
      );
    case 'pay':
      return (
        <CoinTray
          palette={answer.palette}
          showTotal={answer.showTotal}
          onChange={(pieces) => {
            onPending(pieces.length === 0 ? null : { type: 'pay', pieces });
          }}
        />
      );
    case 'pay-variants':
      return (
        <>
          <FoundVariants found={found} />
          <CoinTray
            palette={answer.palette}
            showTotal={answer.showTotal}
            onChange={(pieces) => {
              onPending(
                pieces.length === 0 ? null : { type: 'pay-variants', pieces, found: [...found] },
              );
            }}
          />
        </>
      );
    case 'order':
      return (
        <OrderView
          answer={answer}
          onChange={(ids) => {
            onPending(ids ? { type: 'order', ids } : null);
          }}
        />
      );
    case 'select':
      return (
        <SelectView
          answer={answer}
          onChange={(itemIds) => {
            onPending(itemIds ? { type: 'select', itemIds } : null);
          }}
        />
      );
    case 'grid':
      return (
        <GridView
          answer={answer}
          config={config}
          locked={locked}
          readOnTap={readOnTap}
          onChange={(values) => {
            onPending(values ? { type: 'grid', values } : null);
          }}
        />
      );
    case 'code': {
      const symbols = codeSymbols(task, answer.digits.length);
      return (
        <CodeLock
          symbols={symbols}
          onChange={(digits) => {
            onPending({ type: 'code', digits, symbols: [...symbols] });
          }}
        />
      );
    }
  }
}
