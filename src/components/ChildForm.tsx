import { type SubmitEvent, useId, useState } from 'react';
import { AGE_TO_STUFE, STUFEN } from '@/config/levels';
import { AVATARS } from '@/content/avatars';
import { UI } from '@/content/ui';
import type { AvatarId, Stufe } from '@/domain/types';
import { AvatarIllustration } from '@/illustrations/AvatarIllustration';
import { Button } from './Button';
import choice from './Choice.module.css';
import styles from './ChildForm.module.css';

export interface NewChild {
  name: string;
  avatar: AvatarId;
  stufe: Stufe;
}

const AGES = Object.keys(AGE_TO_STUFE).map(Number);

/** Kind anlegen: Name (optional), Tier, Alter → empfohlene Stufe (docs/09, 3.3). */
export function ChildForm({ onSave }: { onSave: (child: NewChild) => void }) {
  const nameId = useId();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<AvatarId | undefined>();
  const [age, setAge] = useState<number | undefined>();
  const [explain, setExplain] = useState(false);
  const stufe = age === undefined ? undefined : AGE_TO_STUFE[age];

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    if (avatar !== undefined && stufe !== undefined) onSave({ name, avatar, stufe });
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label htmlFor={nameId} className={styles.legend}>
          {UI.setup.name}
        </label>
        <input
          id={nameId}
          className={styles.input}
          value={name}
          maxLength={20}
          autoComplete="off"
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </div>

      <fieldset className={styles.field}>
        <legend className={styles.legend}>{UI.setup.animal}</legend>
        <div className={choice.grid}>
          {AVATARS.map((info) => (
            <button
              key={info.id}
              type="button"
              className={choice.option}
              aria-pressed={avatar === info.id}
              onClick={() => {
                setAvatar(info.id);
              }}
            >
              <AvatarIllustration avatar={info.id} size={64} />
              {info.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.field}>
        <legend className={styles.legend}>{UI.setup.age}</legend>
        <div className={choice.row}>
          {AGES.map((value) => (
            <button
              key={value}
              type="button"
              className={choice.option}
              aria-pressed={age === value}
              onClick={() => {
                setAge(value);
              }}
            >
              {value}
            </button>
          ))}
        </div>
        {stufe !== undefined && (
          <p className={styles.recommend} aria-live="polite">
            {UI.setup.recommend(STUFEN[stufe].name)}
          </p>
        )}
        <button
          type="button"
          className={styles.explain}
          aria-expanded={explain}
          onClick={() => {
            setExplain(!explain);
          }}
        >
          {UI.setup.explainLink}
        </button>
        {explain && (
          <ul className={styles.levels}>
            {Object.values(STUFEN).map((config) => (
              <li key={config.id}>
                <strong>
                  {config.name} ({config.ageHint})
                </strong>
                : {UI.stufen[config.id]}
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <Button type="submit" block disabled={avatar === undefined || stufe === undefined}>
        {UI.setup.save}
      </Button>
    </form>
  );
}
