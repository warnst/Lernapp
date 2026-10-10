import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { cx } from '@/components/cx';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { CIPHER_MESSAGES } from '@/content/cipher';
import { UI } from '@/content/ui';
import type { KikoPose } from '@/domain/hints';
import { hashSeed, mulberry32, pick } from '@/domain/random';
import type { Profile } from '@/domain/types';
import { CipherSymbol } from '@/illustrations/CipherSymbol';
import { cipherKey, cipherLetters } from '@/practice/tower/cipher';
import { stopSpeaking, toggleSpeak } from '@/speech/speak';
import { autoReadOf } from '@/state/progress';
import { useAppState } from '@/state/context';
import { towerOf } from '@/state/reducer';
import styles from './Cipher.module.css';
import { TowerDone } from './TowerDone';

// Geheimschrift (docs/12 3.8): Symbol → Buchstabe (Stufe 3–4) oder Zahl → Buchstabe (Stufe 4).

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

function KeyCode({ code, numbers, size }: { code: number; numbers: boolean; size: number }) {
  return numbers ? (
    <span className={styles.number} style={{ fontSize: `${String(Math.round(size * 0.7))}px` }}>
      {code}
    </span>
  ) : (
    <CipherSymbol index={code} size={size} />
  );
}

/** Eine Botschaft entschlüsseln; auch im Detektivfall (Geheimbrief) benutzt. */
export function CipherPuzzle({
  profile,
  message,
  seed,
  numbers = false,
  onSolved,
}: {
  profile: Profile;
  message: string;
  seed: number;
  numbers?: boolean;
  onSolved: () => void;
}) {
  const letters = useMemo(() => cipherLetters(message), [message]);
  const keys = useMemo(
    () => cipherKey(message, seed, numbers, UI.cipher.symbolNames.length),
    [message, numbers, seed],
  );
  const codeOf = (letter: string) => keys.find((k) => k.letter === letter)?.code ?? 0;
  const slots = Array.from(message)
    .map((char, index) => ({ char, index }))
    .filter((s) => s.char !== ' ');
  const [filled, setFilled] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(slots[0]?.index ?? null);
  const [glow, setGlow] = useState<string | null>(null);
  const [pose, setPose] = useState<KikoPose>('hallo');
  const [line, setLine] = useState<string>(numbers ? UI.cipher.startNumbers : UI.cipher.start);
  const [solved, setSolved] = useState(false);

  const say = (text: string, nextPose: KikoPose = 'hallo') => {
    setLine(text);
    setPose(nextPose);
    if (autoReadOf(profile)) {
      stopSpeaking();
      toggleSpeak(text);
    }
  };

  const nextEmpty = (done: readonly string[], after: number) => {
    const open = slots.filter((s) => !done.includes(s.char));
    return (open.find((s) => s.index > after) ?? open[0])?.index ?? null;
  };

  const choose = (letter: string) => {
    const slot = slots.find((s) => s.index === selected);
    if (!slot || filled.includes(slot.char)) {
      say(UI.cipher.pickSlot, 'denkt');
      return;
    }
    if (letter !== slot.char) {
      say(UI.cipher.wrong, 'denkt');
      return;
    }
    // ein richtiger Buchstabe steht gleich unter allen gleichen Zeichen
    const next = [...filled, letter];
    setFilled(next);
    setGlow(null);
    if (slots.every((s) => next.includes(s.char))) {
      setSolved(true);
      setSelected(null);
      const text = UI.cipher.done(message);
      setLine(text);
      setPose('freut-sich');
      stopSpeaking();
      // vorlesen immer, mit kleinen Buchstaben, damit nicht buchstabiert wird
      toggleSpeak(UI.cipher.done(message.toLowerCase()));
      return;
    }
    setSelected(nextEmpty(next, slot.index));
    setLine(UI.cipher.right);
    setPose('freut-sich');
  };

  const hint = () => {
    const slot = slots.find((s) => s.index === selected && !filled.includes(s.char));
    const target = slot ?? slots.find((s) => !filled.includes(s.char));
    if (!target) return;
    setSelected(target.index);
    setGlow(target.char);
    say(UI.cipher.hint, 'zeigt');
  };

  return (
    <Screen title={UI.cipher.title}>
      <SpeechBubble pose={pose} kikoSize={48}>
        {line}
      </SpeechBubble>
      <section aria-label={UI.cipher.key}>
        <h2 className={styles.heading}>{UI.cipher.key}</h2>
        <ul className={styles.key}>
          {keys.map((key) => (
            <li
              key={key.letter}
              className={cx(styles.pair, glow === key.letter && styles.glow)}
              aria-label={UI.cipher.pair(
                numbers ? String(key.code) : (UI.cipher.symbolNames[key.code] ?? ''),
                key.letter,
              )}
            >
              <KeyCode code={key.code} numbers={numbers} size={26} />
              <span aria-hidden="true">=</span>
              <span className={styles.letter}>{key.letter}</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label={UI.cipher.message} className={styles.message}>
        {message.split(' ').map((word, w) => {
          const start = message.split(' ').slice(0, w).join(' ').length + (w > 0 ? 1 : 0);
          return (
            <span key={w} className={styles.word}>
              {Array.from(word).map((char, i) => {
                const index = start + i;
                const done = filled.includes(char);
                return (
                  <button
                    key={index}
                    type="button"
                    className={cx(
                      styles.slot,
                      selected === index && styles.selected,
                      done && styles.done,
                    )}
                    aria-label={UI.cipher.slot(index + 1, done ? char : null)}
                    aria-pressed={selected === index}
                    disabled={solved}
                    onClick={() => {
                      setSelected(index);
                    }}
                  >
                    <KeyCode code={codeOf(char)} numbers={numbers} size={30} />
                    <span className={styles.answer}>{done ? char : ''}</span>
                  </button>
                );
              })}
            </span>
          );
        })}
      </section>
      {solved ? (
        <>
          <p className={styles.solved}>{UI.cipher.solved}</p>
          <Button block onClick={onSolved}>
            {UI.play.next}
          </Button>
        </>
      ) : (
        <>
          <div className={styles.letters} role="group" aria-label={UI.cipher.letters}>
            {letters.map((letter) => (
              <button
                key={letter}
                type="button"
                className={styles.letterButton}
                disabled={filled.includes(letter)}
                onClick={() => {
                  choose(letter);
                }}
              >
                {letter}
              </button>
            ))}
          </div>
          <Button variant="secondary" block onClick={hint}>
            {UI.play.hint}
          </Button>
        </>
      )}
    </Screen>
  );
}

/** Adresse `/raetsel/geheimschrift` */
export function Cipher({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const cfg = STUFEN[profile.stufe].tower.cipher;
  const [seed, setSeed] = useState(newSeed);
  const [before, setBefore] = useState<number | null>(null);
  const rng = mulberry32(hashSeed(seed, 'botschaft'));
  const message = pick(
    rng,
    CIPHER_MESSAGES.filter((m) => cfg.messages.includes(m.from)),
  );
  const numbers = cfg.numberKey && rng() < 0.5;

  if (before !== null) {
    return (
      <TowerDone
        profile={profile}
        before={before}
        praise={UI.cipher.solved}
        onAgain={() => {
          setBefore(null);
          setSeed(newSeed());
        }}
      />
    );
  }
  return (
    <CipherPuzzle
      key={seed}
      profile={profile}
      message={message.text}
      seed={seed}
      numbers={numbers}
      onSolved={() => {
        setBefore(towerOf(profile).lamps);
        dispatch({ type: 'tower-solved', id: profile.id, kind: 'cipher' });
      }}
    />
  );
}
