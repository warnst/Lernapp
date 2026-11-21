import type { ChoiceOption, SyllableWord, Task } from '@/domain/types';
import { LETTERS, speakBlend, speakSyllable } from './phonics';

/**
 * Aufgabe 1: Groß- und Kleinbuchstaben-Zwilling finden (wie Connis „Buchstaben-Suppe“).
 * Das große Vorbild + Anlautbild sind sichtbar, das Kind tippt den passenden Kleinbuchstaben an.
 */
export function twinTask(opts: {
  id: string;
  letterId: string;
  distractors: [string, string];
  isReview?: boolean;
}): Task {
  const info = LETTERS[opts.letterId];
  if (!info) throw new Error(`Unbekannter Buchstabe: ${opts.letterId}`);
  const [d1, d2] = opts.distractors;
  const reviewLead = opts.isReview
    ? `Erinnerst du dich noch an das große ${info.upper} wie in ${info.anchorWord}?`
    : `Schau mal: Das große ${info.upper} wie in ${info.anchorWord} sucht seinen kleinen Zwilling!`;

  const options: ChoiceOption[] = [
    {
      id: 'correct',
      label: info.lower,
      correct: true,
      largeGlyph: true,
      speakLabel: `Das kleine ${info.lower}! ${info.soundCue}, wie in ${info.anchorWord}.`,
    },
    {
      id: 'd1',
      label: d1,
      largeGlyph: true,
      speakLabel: `Das ist ein kleines ${d1}.`,
      feedback: `Das ist das kleine ${d1}. ${info.memoryTip}`,
    },
    {
      id: 'd2',
      label: d2,
      largeGlyph: true,
      speakLabel: `Das ist ein kleines ${d2}.`,
      feedback: `Das ist das kleine ${d2}. ${info.memoryTip}`,
    },
  ];

  return {
    id: opts.id,
    title: `Zwilling von ${info.upper}`,
    difficulty: 1,
    authoredFor: 1,
    scene: {
      kind: 'syllables',
      mode: 'letter-pair',
      letter: {
        upper: info.upper,
        anchorWord: info.anchorWord,
        itemId: info.itemId,
        speak: info.pairSpeak,
      },
    },
    story: reviewLead,
    speak: `${reviewLead} ${info.soundCue}, wie in ${info.anchorWord}. Welcher kleine Buchstabe gehört zum großen ${info.upper}? Tippe darauf!`,
    parts: [
      {
        id: `${opts.id}-a`,
        question: `Welcher kleine Buchstabe passt zum großen ${info.upper}?`,
        answer: {
          type: 'choice',
          layout: 'cards',
          shuffle: true,
          hideOptionSpeaker: true,
          options,
        },
        hints: [
          info.memoryTip,
          `Tippe auf das kleine ${info.lower} – es gehört zum großen ${info.upper} wie in ${info.anchorWord}.`,
        ],
        explanation: `Super! Das große ${info.upper} und das kleine ${info.lower} sind Zwillinge: ${info.soundCue}, wie in ${info.anchorWord}!`,
        praise: 'Gut hingeschaut!',
      },
    ],
  };
}

/**
 * Aufgabe 2: Silbe hören und antippen (inkl. sanfter Aussprache-Erklärung).
 * In Kapitel 1–2 optional komplett in GROSSBUCHSTABEN als sanfte Brücke.
 */
export function listenSyllableTask(opts: {
  id: string;
  target: string;
  distractors: [string, string];
  consonant: string;
  vowel: string;
  uppercase?: boolean;
  exampleWord?: string;
  itemId?: string;
  isReview?: boolean;
}): Task {
  const show = (s: string) => (opts.uppercase ? s.toUpperCase() : s);
  const targetDisplay = show(opts.target);
  const d1Display = show(opts.distractors[0]);
  const d2Display = show(opts.distractors[1]);
  const spokenTarget = speakSyllable(opts.target);
  const blendExplain = speakBlend(opts.consonant, opts.vowel);
  const exampleText = opts.exampleWord ? ` Wie in ${opts.exampleWord}!` : '';
  const lead = opts.isReview
    ? `Kiko holt eine bekannte Silbe aus seiner Schatzkiste! Hör gut zu: ${spokenTarget}!`
    : `Hör gut zu, welche Silbe Kiko dir vorspricht: ${spokenTarget}!${exampleText}`;

  const options: ChoiceOption[] = [
    {
      id: 'correct',
      label: targetDisplay,
      correct: true,
      largeGlyph: true,
      syllables: [targetDisplay],
      speakLabel: `${spokenTarget}!`,
    },
    {
      id: 'd1',
      label: d1Display,
      largeGlyph: true,
      syllables: [d1Display],
      speakLabel: speakSyllable(opts.distractors[0]),
      feedback: `Das war ${speakSyllable(opts.distractors[0])}. Hör noch einmal genau auf den Klang: ${spokenTarget}!`,
    },
    {
      id: 'd2',
      label: d2Display,
      largeGlyph: true,
      syllables: [d2Display],
      speakLabel: speakSyllable(opts.distractors[1]),
      feedback: `Das war ${speakSyllable(opts.distractors[1])}. Hör noch einmal auf Kikos Silbe: ${spokenTarget}!`,
    },
  ];

  return {
    id: opts.id,
    title: `Silbe hören: ${targetDisplay}`,
    difficulty: 1,
    authoredFor: 1,
    scene: {
      kind: 'syllables',
      mode: 'listen',
      listen: {
        speak: `${spokenTarget}! ${blendExplain}`,
        buttonLabel: 'Silbe anhören',
        ...(opts.itemId ? { itemId: opts.itemId } : {}),
      },
    },
    story: opts.isReview
      ? 'Wiederholung! Hör dir Kikos Silbe an.'
      : 'Hör gut zu! Welche Silbe spricht Kiko?',
    speak: `${lead} Tippe unten auf die passende Silbe!`,
    parts: [
      {
        id: `${opts.id}-a`,
        question: 'Tippe auf die Silbe, die Kiko sagt!',
        answer: {
          type: 'choice',
          layout: 'cards',
          shuffle: true,
          hideOptionSpeaker: true,
          options,
        },
        hints: [
          `Tippe oben auf den Lautsprecher, dann spricht Kiko die Silbe noch einmal vor: ${spokenTarget}.`,
          `Achte auf die zwei Buchstaben: ${blendExplain}`,
        ],
        explanation: `${blendExplain}${exampleText}`,
        praise: 'Prima zugehört!',
      },
    ],
  };
}

/**
 * Aufgabe 3: Laut-Synthese im Baukasten (Konsonant + Vokal = Silbe, z. B. M + A → MA).
 */
export function blendBuildTask(opts: {
  id: string;
  consonant: string;
  vowel: string;
  extraTiles: string[];
  uppercase?: boolean;
  exampleWord?: string;
  itemId?: string;
  isReview?: boolean;
}): Task {
  const cText = opts.uppercase ? opts.consonant.toUpperCase() : opts.consonant;
  const vText = opts.uppercase ? opts.vowel.toUpperCase() : opts.vowel.toLowerCase();
  const syllable = `${opts.consonant}${opts.vowel.toLowerCase()}`;
  const spokenSyl = speakSyllable(syllable);
  const blendExplain = speakBlend(opts.consonant, opts.vowel);
  const cInfo = LETTERS[opts.consonant] ?? LETTERS[opts.consonant.toUpperCase()];
  const vInfo = LETTERS[opts.vowel] ?? LETTERS[opts.vowel.toUpperCase()];
  const extraBank = opts.extraTiles.map((t, idx) => {
    const tInfo = LETTERS[t] ?? LETTERS[t.toUpperCase()];
    const display = opts.uppercase ? t.toUpperCase() : t;
    return {
      id: `x${String(idx)}`,
      text: display,
      speak: tInfo ? tInfo.soundCue : display,
    };
  });

  return {
    id: opts.id,
    title: `Silbe bauen: ${cText}${vText}`,
    difficulty: 2,
    authoredFor: 1,
    scene: {
      kind: 'syllables',
      mode: 'listen',
      listen: {
        speak: `${spokenSyl}! ${blendExplain}`,
        buttonLabel: 'Silbe anhören',
        ...(opts.itemId ? { itemId: opts.itemId } : {}),
      },
    },
    story: opts.isReview
      ? 'Wiederholung! Baue Kikos Silbe aus zwei Buchstaben.'
      : 'Jetzt darfst du selbst eine Silbe zusammenbauen!',
    speak: `Hör gut zu: ${spokenSyl}! ${blendExplain} Tippe zuerst den ersten Buchstaben an, dann den zweiten, und drücke danach auf Prüfen!`,
    parts: [
      {
        id: `${opts.id}-a`,
        question: 'Setze die zwei Buchstaben zur Silbe zusammen!',
        answer: {
          type: 'syllable-build',
          mode: 'blend',
          target: [cText, vText],
          bank: [
            { id: 'c', text: cText, speak: cInfo ? cInfo.soundCue : cText },
            { id: 'v', text: vText, speak: vInfo ? vInfo.soundCue : vText },
            ...extraBank,
          ],
          speakResult: `${spokenSyl}!`,
        },
        hints: [
          `Hör auf den Anfang: Zuerst kommt ${cInfo ? cInfo.soundCue : cText}.`,
          `Nach ${cText} rutscht ${vInfo ? vInfo.soundCue : vText} dazu: ${cText} und ${vText} ergeben ${spokenSyl}!`,
        ],
        explanation: `${blendExplain}${opts.exampleWord ? ` Wie in ${opts.exampleWord}!` : ''}`,
        praise: 'Toll zusammengesetzt!',
      },
    ],
  };
}

/**
 * Aufgabe 4: Silben-Baukasten (2 oder 3 Silben zu einem echten Wort mit Bild bauen).
 */
export function wordBuildTask(opts: {
  id: string;
  word: string;
  syllables: string[];
  extraSyllables: string[];
  itemId: string;
  isReview?: boolean;
}): Task {
  const spokenParts = opts.syllables.map(speakSyllable).join(' … ');
  const fullSpeak = `${spokenParts}! ${opts.word}!`;
  const bank = [
    ...opts.syllables.map((s, idx) => ({
      id: `t${String(idx)}`,
      text: s,
      speak: speakSyllable(s),
    })),
    ...opts.extraSyllables.map((s, idx) => ({
      id: `d${String(idx)}`,
      text: s,
      speak: speakSyllable(s),
    })),
  ];

  return {
    id: opts.id,
    title: `Wort bauen: ${opts.word}`,
    difficulty: 2,
    authoredFor: 1,
    scene: {
      kind: 'syllables',
      mode: 'listen',
      listen: {
        speak: fullSpeak,
        buttonLabel: 'Wort anhören',
        itemId: opts.itemId,
      },
    },
    story: opts.isReview
      ? `Wiederholung! Kannst du das Wort ${opts.word} wieder aus Silben bauen?`
      : `Schau dir das Bild an und hör genau hin: ${opts.word}!`,
    speak: `${opts.isReview ? 'Wiederholung! ' : ''}Baue das Wort ${opts.word}! Sprich langsam mit: ${spokenParts}! Tippe die Silben der Reihe nach an und drücke dann auf Prüfen!`,
    parts: [
      {
        id: `${opts.id}-a`,
        question: 'Setze die Silben zum Wort zusammen!',
        answer: {
          type: 'syllable-build',
          mode: 'word',
          target: opts.syllables,
          bank,
          speakResult: fullSpeak,
        },
        hints: [
          `Klatsche das Wort langsam mit: ${spokenParts}. Mit welcher Silbe fängt es an?`,
          `Die erste Silbe ist ${speakSyllable(opts.syllables[0] ?? '')}. Danach kommt ${speakSyllable(opts.syllables[1] ?? '')}.`,
        ],
        explanation: `${spokenParts} – zusammen heißt das Wort ${opts.word}!`,
        praise: 'Du baust schon richtige Wörter!',
      },
    ],
  };
}

/**
 * Aufgabe 5: Silben klatschen (Wie viele Silben hat dieses Wort?).
 */
export function clapCountTask(opts: {
  id: string;
  word: string;
  syllables: string[];
  itemId: string;
  isReview?: boolean;
}): Task {
  const count = opts.syllables.length;
  const spokenParts = opts.syllables.map(speakSyllable).join(' – ');
  const nums = [1, 2, 3];
  const options: ChoiceOption[] = nums.map((n) => ({
    id: `n${String(n)}`,
    label: n === 1 ? '1 Silbe' : `${String(n)} Silben`,
    largeGlyph: true,
    ...(n === count ? { correct: true as const } : {}),
    speakLabel: n === 1 ? 'Eine Silbe' : `${String(n)} Silben`,
    ...(n !== count
      ? {
          feedback: `Klatsch noch einmal langsam mit: ${spokenParts}. Wie oft hast du geklatscht?`,
        }
      : {}),
  }));

  return {
    id: opts.id,
    title: `Silben klatschen: ${opts.word}`,
    difficulty: 2,
    authoredFor: 1,
    scene: {
      kind: 'syllables',
      mode: 'listen',
      listen: {
        speak: `${opts.word}! Klatsch mit: ${spokenParts}!`,
        buttonLabel: 'Wort anhören',
        itemId: opts.itemId,
      },
    },
    story: opts.isReview
      ? `Wiederholung! Klatsch mit Kiko die Silben von ${opts.word}.`
      : `Klatsch mit den Händen mit: ${opts.word}!`,
    speak: `Klatsch mit den Händen beim Wort ${opts.word}! ${spokenParts}. Wie viele Silben hörst du? Tippe auf 1, 2 oder 3!`,
    parts: [
      {
        id: `${opts.id}-a`,
        question: 'Wie viele Silben hat dieses Wort?',
        answer: {
          type: 'choice',
          layout: 'cards',
          shuffle: false,
          options,
        },
        hints: [
          `Sprich das Wort ganz langsam und klatsch bei jedem Schwung: ${spokenParts}.`,
          `Zähle beim Klatschen mit den Fingern mit: ${opts.syllables.map((s, i) => `${String(i + 1)}: ${speakSyllable(s)}`).join(', ')}.`,
        ],
        explanation: `${spokenParts}! Das sind genau ${String(count)} ${count === 1 ? 'Silbe' : 'Silben'}!`,
        praise: 'Super geklatscht!',
      },
    ],
  };
}

/**
 * Aufgabe 6: Lese-Automat (Zweifarbiges Silbenwort lesen → passendes Bild antippen).
 * Das Kind kann oben einzelne Silben antippen, wenn es Hilfe braucht!
 */
export function wordPictureTask(opts: {
  id: string;
  word: string;
  syllables: string[];
  itemId: string;
  distractors: [{ label: string; itemId: string }, { label: string; itemId: string }];
  uppercase?: boolean;
  isReview?: boolean;
}): Task {
  const spokenParts = opts.syllables.map(speakSyllable).join(' … ');
  const options: ChoiceOption[] = [
    {
      id: 'correct',
      label: opts.word,
      icon: opts.itemId,
      iconOnly: true,
      correct: true,
      speakLabel: opts.word,
    },
    {
      id: 'd1',
      label: opts.distractors[0].label,
      icon: opts.distractors[0].itemId,
      iconOnly: true,
      speakLabel: opts.distractors[0].label,
      feedback: `Das ist ${opts.distractors[0].label}. Tippe oben auf die blaue und die rote Silbe und höre gut zu!`,
    },
    {
      id: 'd2',
      label: opts.distractors[1].label,
      icon: opts.distractors[1].itemId,
      iconOnly: true,
      speakLabel: opts.distractors[1].label,
      feedback: `Das ist ${opts.distractors[1].label}. Lies zuerst die blaue Silbe und dann die rote Silbe!`,
    },
  ];

  return {
    id: opts.id,
    title: `Wort lesen: ${opts.word}`,
    difficulty: 2,
    authoredFor: 1,
    scene: {
      kind: 'syllables',
      mode: 'word',
      word: {
        syllables: opts.syllables,
        speak: `${spokenParts}! ${opts.word}!`,
        speakSyllables: opts.syllables.map(speakSyllable),
        ...(opts.uppercase ? { uppercase: true } : {}),
      },
    },
    story: opts.isReview
      ? 'Wiederholung! Lies das Wort Silbe für Silbe.'
      : 'Lies zuerst die blaue Silbe und dann die rote Silbe!',
    speak:
      'Schau dir das zweifarbige Wort an! Lies zuerst die blaue Silbe und dann die rote. Wenn du magst, tippe auf eine Silbe zum Anhören. Welches Bild passt zu dem Wort?',
    parts: [
      {
        id: `${opts.id}-a`,
        question: 'Welches Bild passt zu diesem Wort?',
        answer: {
          type: 'choice',
          layout: 'cards',
          shuffle: true,
          hideOptionSpeaker: true,
          options,
        },
        hints: [
          'Tippe oben auf die blaue Silbe – dann hilft Kiko dir beim Anfang!',
          `Zusammen klingt es: ${spokenParts} – also ${opts.word}!`,
        ],
        explanation: `${spokenParts} – das heißt ${opts.word}! Du hast ein echtes Wort gelesen!`,
        praise: 'Stark gelesen!',
      },
    ],
  };
}

/**
 * Aufgabe 7: Mini-Silbengeschichte (Conni-Stil) mit Bild-Verständnisfrage.
 */
export function miniStoryTask(opts: {
  id: string;
  title: string;
  sentences: SyllableWord[][];
  storySpeak: string;
  itemId: string;
  question: string;
  options: [
    { label: string; itemId: string; feedback?: string },
    { label: string; itemId: string; feedback: string },
    { label: string; itemId: string; feedback: string },
  ];
  explanation: string;
}): Task {
  const [correctOpt, d1, d2] = opts.options;
  return {
    id: opts.id,
    title: opts.title,
    difficulty: 3,
    authoredFor: 1,
    scene: {
      kind: 'syllables',
      mode: 'story',
      story: {
        sentences: opts.sentences,
        itemId: opts.itemId,
        speak: opts.storySpeak,
      },
    },
    story: 'Mini-Silbengeschichte! Tippe auf die Wörter zum Mitlesen.',
    speak: `Hier kommt eine kleine Silbengeschichte! Tippe oben auf die Wörter oder hör Kiko zu: ${opts.storySpeak} ${opts.question}`,
    parts: [
      {
        id: `${opts.id}-a`,
        question: opts.question,
        answer: {
          type: 'choice',
          layout: 'cards',
          shuffle: true,
          options: [
            {
              id: 'correct',
              label: correctOpt.label,
              icon: correctOpt.itemId,
              correct: true,
              speakLabel: correctOpt.label,
            },
            {
              id: 'd1',
              label: d1.label,
              icon: d1.itemId,
              feedback: d1.feedback,
              speakLabel: d1.label,
            },
            {
              id: 'd2',
              label: d2.label,
              icon: d2.itemId,
              feedback: d2.feedback,
              speakLabel: d2.label,
            },
          ],
        },
        hints: [
          'Tippe oben auf den Lautsprecher neben der Geschichte, dann liest Kiko sie dir noch einmal langsam vor.',
          opts.explanation,
        ],
        explanation: opts.explanation,
        praise: 'Du liest schon richtige kleine Geschichten!',
      },
    ],
  };
}
