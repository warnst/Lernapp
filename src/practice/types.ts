import type { Rng } from '@/domain/random';
import type { PracticeTopicId, Stufe, StufeConfig, Task, TemplateId } from '@/domain/types';

// Schnittstelle der Vorlagen (docs/05 Abschnitt 1, docs/10 5.1).

export interface GenerateOptions {
  bind?: Record<string, string>;
  force?: Record<string, unknown>;
}

export interface Generator {
  id: TemplateId;
  topic: PracticeTopicId;
  /** wo die Vorlage überhaupt sinnvoll ist; Reihenfolge der Vorlagen im Thema = leicht → schwer */
  stufen: Stufe[];
  generate(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported';
}
