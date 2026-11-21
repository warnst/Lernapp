import { useCallback, useEffect, useRef, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { Button, LinkButton } from '@/components/Button';
import { cx } from '@/components/cx';
import { SpeechBubble } from '@/components/SpeechBubble';
import { StationNode, type StationNodeState } from '@/components/StationNode';
import { SyllableText } from '@/components/game/SyllableText';
import { SyllableWorkshop } from '@/components/game/SyllableWorkshop';
import { UI } from '@/content/ui';
import {
  LESEN_CHAPTERS,
  LESEN_STATIONS,
  type LesenChapter,
  chapterById,
} from '@/content/worlds/lesen/chapters';
import {
  buildLesenReviewTasks,
  chapterStars,
  isChapterUnlocked,
  isLesenStationUnlocked,
} from '@/state/lesen-progress';
import type { Profile, Station } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { Kiko } from '@/illustrations/Kiko';
import { MapBackground } from '@/illustrations/MapBackground';
import { Pearl } from '@/illustrations/Pearl';
import { Star } from '@/illustrations/Star';
import { StationIcon } from '@/illustrations/StationIcon';
import { UiIcon } from '@/illustrations/UiIcon';
import { canSpeak, speakNow, stopSpeaking } from '@/speech/speak';
import { useAppState } from '@/state/context';
import { activeProfile, canResume, currentStation, isCompleted } from '@/state/progress';
import { Game } from './Game';
import { StationSheet } from './StationSheet';
import styles from './LesenMap.module.css';

const CHAPTER_LAYOUT: [number, number][] = [
  [50, 91], // 1. Vokal-Bucht
  [72, 79], // 2. Lama-Lagune
  [30, 67], // 3. Rosen-Insel
  [68, 55], // 4. Tomaten-Hafen
  [32, 43], // 5. Bananen-Dschungel
  [70, 31], // 6. Zauber-Leuchtturm
  [34, 19], // 7. Schnecken-Strand
  [52, 7], // 8. Silbenbuch-Finale
];

/** Übersicht der Silben-Insel (/lesen) mit 8 Kapiteln und täglicher Wiederholungs-Runde. */
export function LesenMap({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const [, navigate] = useLocation();
  const welcomeKey = 'welcome:lesen';
  const firstVisit = !profile.celebrated.includes(welcomeKey);
  const [showGreeting, setShowGreeting] = useState(true);
  const [lockedNotice, setLockedNotice] = useState(false);
  const currentRef = useRef<HTMLDivElement>(null);

  const nextStation = currentStation(profile, LESEN_STATIONS);
  const currentChapter =
    LESEN_CHAPTERS.find((c) => c.stations.some((s) => s.id === nextStation?.id)) ??
    (LESEN_CHAPTERS.every((c) => chapterStars(profile, c) === 3) ? undefined : LESEN_CHAPTERS[0]);
  const unlockedStories = LESEN_CHAPTERS.filter((c) => chapterStars(profile, c) === 3).length;

  useEffect(() => {
    if (firstVisit && profile.readAloud !== false) {
      speakNow(UI.map.firstVisit.lesen);
    }
    dispatch({ type: 'mark-celebrated', id: profile.id, key: welcomeKey });
    const timer = window.setTimeout(() => {
      setShowGreeting(false);
    }, 5500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [dispatch, firstVisit, profile.id, profile.readAloud, welcomeKey]);

  useEffect(() => {
    const node = currentRef.current;
    if (node && 'scrollIntoView' in node) node.scrollIntoView({ block: 'center' });
  }, []);

  const points = CHAPTER_LAYOUT.map(([x, y]) => `${String(x)},${String(y)}`).join(' ');

  const stateOfChapter = (chapter: LesenChapter, index: number): StationNodeState => {
    if (chapterStars(profile, chapter) === 3) return 'done';
    if (chapter.id === currentChapter?.id) return 'current';
    return isChapterUnlocked(profile, index) ? 'open' : 'locked';
  };

  return (
    <div className={styles.page}>
      {showGreeting && (
        <div className={styles.greeting}>
          <SpeechBubble kikoSize={56}>{UI.map.firstVisit.lesen}</SpeechBubble>
        </div>
      )}

      <div className={styles.map}>
        <MapBackground world="lesen" className={styles.background} />
        <svg
          className={styles.path}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline points={points} vectorEffect="non-scaling-stroke" />
        </svg>

        {LESEN_CHAPTERS.map((chapter, index) => {
          const [x, y] = CHAPTER_LAYOUT[index] ?? [50, 50];
          const nodeState = stateOfChapter(chapter, index);
          const stars = chapterStars(profile, chapter);
          return (
            <div
              key={chapter.id}
              ref={chapter.id === currentChapter?.id ? currentRef : undefined}
              className={styles.spot}
              style={{ left: `${String(x)}%`, top: `${String(y)}%` }}
            >
              <StationNode
                number={chapter.number}
                title={`${chapter.shortName} (${String(stars)}/3)`}
                icon={chapter.icon}
                state={nodeState}
                bonus={stars === 3}
                revealing={false}
                onSelect={() => {
                  if (nodeState === 'locked') {
                    setLockedNotice(true);
                    if (profile.readAloud !== false) {
                      speakNow(
                        'Diese Lese-Insel wartet noch! Schaffe zuerst die drei Stationen auf der Insel davor!',
                      );
                    }
                  } else {
                    navigate(`/lesen/${chapter.id}`);
                  }
                }}
              />
              {nodeState === 'current' && <Kiko pose="zeigt" size={56} className={styles.kiko} />}
            </div>
          );
        })}
      </div>

      <div className={styles.notice} aria-live="polite">
        {lockedNotice && (
          <SpeechBubble pose="denkt">
            Diese Lese-Insel wartet noch! Schaffe zuerst die Insel davor!
          </SpeechBubble>
        )}
      </div>

      <div className={styles.nextBar}>
        <div className={styles.nextPrimary}>
          {currentChapter ? (
            <Button
              block
              onClick={() => {
                navigate(`/lesen/${currentChapter.id}`);
              }}
            >
              <UiIcon name="pfeil-weiter" /> {UI.map.next(currentChapter.name)}
            </Button>
          ) : (
            <LinkButton href="/schaetze" block>
              {UI.map.allDone}
            </LinkButton>
          )}
        </div>
        <div className={styles.quickRow}>
          <LinkButton href="/lesen/ueben" variant="secondary" block>
            <UiIcon name="stern" size={20} /> Wiederholen
          </LinkButton>
          <LinkButton href="/schaetze/silbenbuch" variant="secondary" block>
            <UiIcon name="buch" size={20} /> Silbenbuch ({String(unlockedStories)})
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

/** Detailansicht eines Lese-Kapitels (/lesen/:chapterId) mit Buchstaben-Zwillingen, Silben-Werkstatt und 3 Stationen. */
export function LesenChapterView({ profile, chapterId }: { profile: Profile; chapterId: string }) {
  const chapter = chapterById(chapterId);
  const chapterIndex = LESEN_CHAPTERS.findIndex((c) => c.id === chapterId);
  const [openStation, setOpenStation] = useState<Station | undefined>();
  const [lockedMsg, setLockedMsg] = useState(false);

  const fullIntro = chapter
    ? `${chapter.name}. ${chapter.catchphrase} ${chapter.story.join(' ')}`
    : '';

  useEffect(() => {
    if (!chapter) return;
    if (profile.readAloud !== false) {
      speakNow(fullIntro);
    }
    return () => {
      stopSpeaking();
    };
  }, [chapter, fullIntro, profile.readAloud]);

  if (!chapter || !isChapterUnlocked(profile, chapterIndex)) {
    return <Redirect to="/lesen" />;
  }

  const bonusSolved = profile.worlds.lesen?.bonusSolved ?? [];
  const stars = chapterStars(profile, chapter);
  const nextChapter = LESEN_CHAPTERS[chapterIndex + 1];

  return (
    <div className={styles.chapterPage}>
      <div className={styles.topBar}>
        <LinkButton href="/lesen" variant="secondary">
          <UiIcon name="zurueck" /> Alle Lese-Inseln
        </LinkButton>
        <span className={styles.chapterStars}>
          {[0, 1, 2].map((i) => (
            <Star key={i} size={24} filled={i < stars} />
          ))}
        </span>
      </div>

      <header className={styles.chapterHeader}>
        <button
          type="button"
          className={styles.chapterIconBtn}
          aria-label={`${chapter.name} anhören`}
          onClick={() => {
            speakNow(fullIntro);
          }}
        >
          <StationIcon icon={chapter.icon} size={72} />
        </button>
        <div>
          <p className={styles.chapterNumber}>Kapitel {String(chapter.number)} von 8</p>
          <h1 className={styles.chapterTitle}>{chapter.name}</h1>
          <p className={styles.chapterSubtitle}>{chapter.subtitle}</p>
          <p className={styles.catchphrase}>„{chapter.catchphrase}“</p>
        </div>
      </header>

      <section className={styles.letterSection} aria-label="Buchstaben-Zwillinge">
        <h2 className={styles.sectionTitle}>Große &amp; kleine Buchstaben-Zwillinge</h2>
        <p className={styles.letterHint}>
          Tippe einen Buchstaben an – Kiko sagt dir, wie er klingt!
        </p>
        <div className={styles.letterGrid}>
          {chapter.letters.map((info) => (
            <button
              key={info.id}
              type="button"
              className={styles.letterTile}
              aria-label={`${info.upper} und ${info.lower} wie in ${info.anchorWord} anhören`}
              onClick={() => {
                speakNow(info.pairSpeak);
              }}
            >
              <span className={styles.letterPair}>
                <span className={styles.letterUpper}>{info.upper}</span>
                <span className={styles.letterLower}>{info.lower}</span>
              </span>
              <span className={styles.letterAnchor}>
                <ItemIcon itemId={info.itemId} size={44} />
                <span>{info.anchorWord}</span>
              </span>
            </button>
          ))}
        </div>

        {chapter.reviewLetters.length > 0 && (
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Schon gelernt (antippen):</span>
            {chapter.reviewLetters.map((info) => (
              <button
                key={info.id}
                type="button"
                className={styles.reviewChip}
                onClick={() => {
                  speakNow(info.pairSpeak);
                }}
              >
                <span className={styles.letterUpper} style={{ fontSize: 22 }}>
                  {info.upper}
                </span>
                <span className={styles.letterLower} style={{ fontSize: 20 }}>
                  {info.lower}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <SyllableWorkshop config={chapter.workshop} />

      <section className={styles.storyCard} aria-label="Kikos Erklärung">
        {chapter.story.map((line, i) => (
          <SpeechBubble key={line} kikoSize={52} kiko={i === 0}>
            {line}
          </SpeechBubble>
        ))}
        {canSpeak() && (
          <Button
            variant="secondary"
            onClick={() => {
              speakNow(fullIntro);
            }}
          >
            <UiIcon name="lautsprecher" /> Nochmal vorlesen
          </Button>
        )}
      </section>

      <section className={styles.stationList} aria-label="Stationen in diesem Kapitel">
        <h2 className={styles.sectionTitle}>Deine 3 Lese-Stationen</h2>
        <div className={styles.stationCards}>
          {chapter.stations.map((station, idx) => {
            const globalIdx = chapterIndex * 3 + idx;
            const done = isCompleted(profile, 'lesen', station.id);
            const unlocked = isLesenStationUnlocked(profile, globalIdx);
            const isNext = !done && unlocked;
            return (
              <button
                key={station.id}
                type="button"
                className={cx(
                  styles.stationCard,
                  done && styles.stationDone,
                  isNext && styles.stationCurrent,
                  !unlocked && styles.stationLocked,
                )}
                onClick={() => {
                  if (!unlocked) {
                    setLockedMsg(true);
                    if (profile.readAloud !== false) {
                      speakNow('Schaffe zuerst die Station davor!');
                    }
                  } else {
                    setOpenStation(station);
                  }
                }}
              >
                <StationIcon icon={station.icon} size={56} />
                <div className={styles.stationInfo}>
                  <span className={styles.stationStep}>Station {String(idx + 1)} von 3</span>
                  <strong className={styles.stationName}>{station.title}</strong>
                  <span className={styles.stationSkill}>{station.skillLabel}</span>
                </div>
                <div className={styles.stationStatus}>
                  {done ? (
                    <Star size={32} />
                  ) : unlocked ? (
                    <UiIcon name="pfeil-weiter" size={28} />
                  ) : (
                    <UiIcon name="schloss" size={26} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {lockedMsg && (
        <SpeechBubble pose="denkt">
          Schaffe zuerst die Station davor, dann öffnet sich diese Station!
        </SpeechBubble>
      )}

      {stars === 3 && (
        <section className={styles.bookBox} aria-label={chapter.storyBookPage.title}>
          <div className={styles.bookHeader}>
            <ItemIcon itemId={chapter.storyBookPage.itemId} size={68} />
            <div>
              <span className={styles.bookBadge}>Neue Seite in „Mein Silbenbuch“!</span>
              <h3 className={styles.bookTitle}>{chapter.storyBookPage.title}</h3>
            </div>
          </div>
          <div className={styles.bookSentences}>
            {chapter.storyBookPage.sentences.map((sentence, sIdx) => (
              <p key={sIdx} className={styles.bookSentence}>
                {sentence.map((word, wIdx) => {
                  const spoken = word.speak ?? word.syllables.join('');
                  return (
                    <button
                      key={`${String(sIdx)}-${String(wIdx)}`}
                      type="button"
                      className={styles.wordBtn}
                      aria-label={`${spoken} anhören`}
                      onClick={() => {
                        speakNow(spoken);
                      }}
                    >
                      <SyllableText syllables={word.syllables} size="md" />
                    </button>
                  );
                })}
              </p>
            ))}
          </div>
          <div className={styles.bookActions}>
            {canSpeak() && (
              <Button
                variant="secondary"
                onClick={() => {
                  speakNow(`${chapter.storyBookPage.title}. ${chapter.storyBookPage.fullSpeak}`);
                }}
              >
                <UiIcon name="lautsprecher" /> Geschichte vorlesen
              </Button>
            )}
            <LinkButton href="/schaetze/silbenbuch" variant="ghost">
              <UiIcon name="buch" /> Mein ganzes Silbenbuch
            </LinkButton>
            {nextChapter && (
              <LinkButton href={`/lesen/${nextChapter.id}`}>
                <UiIcon name="pfeil-weiter" /> Weiter zu {nextChapter.name}
              </LinkButton>
            )}
          </div>
        </section>
      )}

      {openStation && (
        <StationSheet
          station={openStation}
          completed={isCompleted(profile, 'lesen', openStation.id)}
          resumable={canResume(profile, openStation.id)}
          bonusOpen={!bonusSolved.includes(openStation.id)}
          onClose={() => {
            setOpenStation(undefined);
          }}
        />
      )}
    </div>
  );
}

/**
 * Tägliche Wiederholungs-Runde (/lesen/ueben):
 * Mischt 6 spielerische Aufgaben aus allen bereits freigeschalteten Lese-Kapiteln!
 */
export function LesenReviewPlay() {
  const { state, dispatch } = useAppState();
  const profile = activeProfile(state);
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);

  const onFinish = useCallback(() => {
    if (!profile) return;
    dispatch({ type: 'add-pearl', id: profile.id });
    setDone(true);
    if (profile.readAloud !== false) {
      speakNow(
        'Runde geschafft! Du hast deine Buchstaben und Silben super wiederholt! Eine neue Perle für deine Kette!',
      );
    }
  }, [dispatch, profile]);

  if (!profile) return <Redirect to="/" />;

  const seed = round * 101 + profile.practice.pearls * 17 + 7;
  const tasks = buildLesenReviewTasks(profile, seed);

  if (done) {
    return (
      <main className={styles.reviewDone}>
        <Kiko pose="freut-sich" size={120} />
        <Pearl size={88} />
        <SpeechBubble pose="freut-sich">
          Runde geschafft! Du hast deine Silben super wiederholt – eine neue Perle für deine Kette!
        </SpeechBubble>
        <div className={styles.reviewActions}>
          <Button
            block
            onClick={() => {
              setRound((r) => r + 1);
              setDone(false);
            }}
          >
            Noch eine Wiederholungs-Runde
          </Button>
          <LinkButton href="/lesen" variant="secondary" block>
            Zurück zur Silben-Insel
          </LinkButton>
        </div>
      </main>
    );
  }

  return (
    <Game
      key={`lesen-review-${profile.id}-${String(round)}`}
      profile={profile}
      tasks={tasks}
      progressStyle="shells"
      mapHref="/lesen"
      alwaysAutoRead
      onFinish={onFinish}
    />
  );
}
