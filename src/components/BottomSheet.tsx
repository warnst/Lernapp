import { type PointerEvent, type ReactNode, useEffect, useRef } from 'react';
import { UI } from '@/content/ui';
import { UiIcon } from '@/illustrations/UiIcon';
import styles from './BottomSheet.module.css';

const SWIPE_CLOSE_PX = 80;

/** Sheet von unten: Stationskarte und Dialoge (docs/02, Abschnitt 5). */
export function BottomSheet({
  labelledBy,
  onClose,
  children,
}: {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    const previous = document.activeElement;
    sheet.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [onClose]);

  const onPointerDown = (event: PointerEvent) => {
    dragStart.current = event.clientY;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (dragStart.current !== null && event.clientY - dragStart.current > SWIPE_CLOSE_PX) onClose();
    dragStart.current = null;
  };

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        aria-label={UI.sheet.close}
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={sheet}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <div
          className={styles.handle}
          aria-hidden="true"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        />
        <button
          type="button"
          className={styles.close}
          aria-label={UI.sheet.close}
          onClick={onClose}
        >
          <UiIcon name="schliessen" />
        </button>
        {children}
      </div>
    </>
  );
}
