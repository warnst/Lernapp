import { useEffect } from 'react';
import type { AnswerInput } from '@/domain/check';
import type { MoneyPiece, StufeConfig, Task, TaskPart } from '@/domain/types';
import { ChoiceView } from './ChoiceView';
import { CoinTray } from './CoinTray';
import { FoundVariants } from './FoundVariants';
import { MoneyEntry } from './MoneyEntry';
import { NumberEntry } from './NumberEntry';
import { OrderView } from './OrderView';
import { SelectView } from './SelectView';

export type PendingInput = AnswerInput;

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
  solved,
  onPending,
  onSubmit,
}: {
  task: Task;
  part: TaskPart;
  config: StufeConfig;
  tried: readonly string[];
  found: readonly MoneyPiece[][];
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
    case 'code':
      // Zahlenmauer, Rechendreieck und Zahlenschloss folgen in Phase 7.
      return null;
  }
}
