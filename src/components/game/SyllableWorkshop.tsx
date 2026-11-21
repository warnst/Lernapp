import { useState } from 'react';
import { cx } from '@/components/cx';
import { speakBlend, speakSyllable } from '@/content/worlds/lesen/phonics';
import type { LesenWorkshopConfig } from '@/content/worlds/lesen/types';
import { UiIcon } from '@/illustrations/UiIcon';
import { speakNow } from '@/speech/speak';
import { SyllableText } from './SyllableText';
import styles from './SyllableWorkshop.module.css';

/**
 * Interaktive Silben-Werkstatt für das selbstständige Entdecken auf dem iPad:
 * 1) Silbenrutsche (Konsonant rutscht an Vokal heran + sanfte Lautsynthese)
 * 2) Silbenteppich (antippbare Silbenmatrix)
 * Mit direktem GROSS / Normal-Umschalter als Brücke von Groß- zu Kleinbuchstaben.
 */
export function SyllableWorkshop({ config }: { config: LesenWorkshopConfig }) {
  const [tab, setTab] = useState<'slide' | 'carpet'>('slide');
  const [uppercase, setUppercase] = useState(config.defaultUppercase ?? false);
  const [consonant, setConsonant] = useState(config.consonants[0] ?? 'M');
  const [vowel, setVowel] = useState(config.vowels[0] ?? 'A');
  const [merged, setMerged] = useState(false);
  const [activeCarpet, setActiveCarpet] = useState<string | null>(null);

  const combined = `${consonant}${vowel.toLowerCase()}`;
  const displayConsonant = uppercase ? consonant.toUpperCase() : consonant;
  const displayVowel = uppercase ? vowel.toUpperCase() : vowel.toLowerCase();

  const triggerSlide = (nextC: string, nextV: string) => {
    setConsonant(nextC);
    setVowel(nextV);
    setMerged(true);
    speakNow(speakBlend(nextC, nextV));
  };

  return (
    <section className={styles.card} aria-label="Silben-Werkstatt">
      <div className={styles.header}>
        <h2 className={styles.title}>Kikos Silben-Werkstatt</h2>
        <div className={styles.caseToggle} role="group" aria-label="Schriftart wählen">
          <button
            type="button"
            className={cx(styles.caseBtn, uppercase && styles.caseActive)}
            aria-pressed={uppercase}
            onClick={() => {
              setUppercase(true);
            }}
          >
            GROSS (MA)
          </button>
          <button
            type="button"
            className={cx(styles.caseBtn, !uppercase && styles.caseActive)}
            aria-pressed={!uppercase}
            onClick={() => {
              setUppercase(false);
            }}
          >
            Normal (Ma)
          </button>
        </div>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Werkstatt-Modus">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'slide'}
          className={cx(styles.tabBtn, tab === 'slide' && styles.tabActive)}
          onClick={() => {
            setTab('slide');
          }}
        >
          Silbenrutsche
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'carpet'}
          className={cx(styles.tabBtn, tab === 'carpet' && styles.tabActive)}
          onClick={() => {
            setTab('carpet');
          }}
        >
          Silbenteppich
        </button>
      </div>

      {tab === 'slide' ? (
        <div className={styles.slideLayout}>
          <div className={styles.pickerGroup}>
            <p className={styles.pickerLabel}>1. Erster Laut</p>
            <div className={styles.pickerRow}>
              {config.consonants.map((c) => {
                const label = uppercase ? c.toUpperCase() : c;
                return (
                  <button
                    key={c}
                    type="button"
                    className={cx(styles.letterBtn, consonant === c && styles.consonantSelected)}
                    onClick={() => {
                      triggerSlide(c, vowel);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.stage}>
            <div className={cx(styles.track, merged && styles.trackMerged)} aria-live="polite">
              {merged ? (
                <div className={styles.mergedBox}>
                  <SyllableText syllables={[combined]} uppercase={uppercase} size="xl" />
                </div>
              ) : (
                <>
                  <span className={cx(styles.slidePart, styles.partConsonant)}>
                    {displayConsonant}
                  </span>
                  <span className={styles.slideArrow} aria-hidden="true">
                    →
                  </span>
                  <span className={cx(styles.slidePart, styles.partVowel)}>{displayVowel}</span>
                </>
              )}
            </div>
            <button
              type="button"
              className={styles.slideAction}
              onClick={() => {
                if (merged) {
                  setMerged(false);
                  window.setTimeout(() => {
                    triggerSlide(consonant, vowel);
                  }, 180);
                } else {
                  triggerSlide(consonant, vowel);
                }
              }}
            >
              <UiIcon name="lautsprecher" size={24} />
              Zusammenrutschen & hören!
            </button>
          </div>

          <div className={styles.pickerGroup}>
            <p className={styles.pickerLabel}>2. Zweiter Laut</p>
            <div className={styles.pickerRow}>
              {config.vowels.map((v) => {
                const label = uppercase ? v.toUpperCase() : v.toLowerCase();
                return (
                  <button
                    key={v}
                    type="button"
                    className={cx(styles.letterBtn, vowel === v && styles.vowelSelected)}
                    onClick={() => {
                      triggerSlide(consonant, v);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className={styles.carpetHint}>
            Tippe auf eine Silbe – Kiko spricht sie dir langsam vor! Sprich gerne laut mit!
          </p>
          <div className={styles.carpetGrid}>
            {config.carpetSyllables.map((syl) => {
              const display = uppercase ? syl.toUpperCase() : syl;
              return (
                <button
                  key={syl}
                  type="button"
                  className={cx(styles.carpetTile, activeCarpet === syl && styles.carpetTileActive)}
                  aria-label={`Silbe ${display} anhören`}
                  onClick={() => {
                    setActiveCarpet(syl);
                    speakNow(speakSyllable(syl));
                  }}
                >
                  <SyllableText syllables={[syl]} uppercase={uppercase} size="md" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
