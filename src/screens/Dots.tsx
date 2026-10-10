import { type MouseEvent, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { cx } from '@/components/cx';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { DOTS } from '@/content/dots';
import { UI } from '@/content/ui';
import { mulberry32, pick } from '@/domain/random';
import type { Profile } from '@/domain/types';
import { stopSpeaking, toggleSpeak } from '@/speech/speak';
import { autoReadOf } from '@/state/progress';
import { useAppState } from '@/state/context';
import { towerOf } from '@/state/reducer';
import styles from './Dots.module.css';
import { TowerDone } from './TowerDone';

// Punkte verbinden (docs/12 3.7). Ein Tipp in die Nähe des nächsten Punktes verbindet ihn; ein
// falscher Punkt lässt nur den richtigen kurz wackeln. Am Ende wird das Bild farbig.

/** Wie nah (im Feld 0..100) ein Tipp am nächsten Punkt sein muss */
const REACH = 9;

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

function Play({ profile, onSolved }: { profile: Profile; onSolved: () => void }) {
  const { dispatch } = useAppState();
  const cfg = STUFEN[profile.stufe];
  const [seed] = useState(newSeed);
  const { picture, step } = useMemo(() => {
    const rng = mulberry32(seed);
    const variant = pick(rng, cfg.tower.dots);
    const choices = DOTS.filter((p) => p.points.length === variant.count);
    return { picture: pick(rng, choices.length > 0 ? choices : DOTS), step: variant.step };
  }, [cfg.tower.dots, seed]);
  const [done, setDone] = useState(0);
  const [wiggle, setWiggle] = useState(0);
  const finished = done >= picture.points.length;
  const number = (i: number) => (i + 1) * step;
  const [line, setLine] = useState(UI.dots.start(step, step));

  const connect = () => {
    const next = done + 1;
    setDone(next);
    if (next >= picture.points.length) {
      const text = UI.dots.done(picture.name);
      setLine(text);
      if (autoReadOf(profile)) {
        stopSpeaking();
        toggleSpeak(text);
      }
    }
  };

  const onTap = (event: MouseEvent<SVGSVGElement>) => {
    if (finished) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    const [px = 0, py = 0] = picture.points[done] ?? [];
    if (Math.hypot(px - x, py - y) <= REACH) {
      connect();
      return;
    }
    setWiggle(wiggle + 1);
    setLine(UI.dots.next(number(done)));
  };

  const drawn = picture.points.slice(0, finished && picture.closed ? undefined : done);
  const outline = drawn.map(([x, y]) => `${String(x)},${String(y)}`).join(' ');

  return (
    <Screen title={UI.dots.title}>
      <SpeechBubble pose={finished ? 'freut-sich' : 'zeigt'} kikoSize={48}>
        {line}
      </SpeechBubble>
      <svg
        className={styles.board}
        viewBox="0 0 100 100"
        role="group"
        aria-label={UI.dots.board}
        onClick={onTap}
      >
        {finished && (
          <g className={styles.reveal}>
            <polygon points={outline} fill={picture.fill} />
            {picture.extras.map((extra, i) => (
              <path key={i} d={extra.d} fill={extra.fill} />
            ))}
          </g>
        )}
        {finished && picture.closed ? (
          <polygon points={outline} className={styles.line} />
        ) : (
          <polyline points={outline} className={styles.line} />
        )}
        {!finished &&
          picture.points.map(([x, y], i) => {
            const isNext = i === done;
            return (
              <g
                key={i}
                className={cx(styles.point, i < done && styles.reached, isNext && styles.next)}
                role="button"
                tabIndex={isNext ? 0 : -1}
                aria-label={UI.dots.point(number(i))}
                onKeyDown={(event) => {
                  if (isNext && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    connect();
                  }
                }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isNext ? 2.2 : 1.5}
                  className={isNext && wiggle > 0 ? styles.wiggle : undefined}
                  key={isNext ? `w${String(wiggle)}` : 'p'}
                />
                <text
                  x={x > 82 ? x - 2.2 : x + 2.2}
                  y={y < 8 ? y + 5 : y - 1.8}
                  textAnchor={x > 82 ? 'end' : 'start'}
                >
                  {number(i)}
                </text>
              </g>
            );
          })}
      </svg>
      {finished && (
        <Button
          block
          onClick={() => {
            dispatch({ type: 'tower-solved', id: profile.id, kind: 'dots' });
            onSolved();
          }}
        >
          {UI.play.next}
        </Button>
      )}
    </Screen>
  );
}

/** Adresse `/raetsel/punkte` */
export function Dots({ profile }: { profile: Profile }) {
  const [round, setRound] = useState(0);
  const [before, setBefore] = useState<number | null>(null);
  if (before !== null) {
    return (
      <TowerDone
        profile={profile}
        before={before}
        onAgain={() => {
          setBefore(null);
          setRound(round + 1);
        }}
      />
    );
  }
  return (
    <Play
      key={round}
      profile={profile}
      onSolved={() => {
        setBefore(towerOf(profile).lamps);
      }}
    />
  );
}
