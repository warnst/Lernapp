import type { ReactNode } from 'react';
import { STUFEN } from '@/config/levels';
import { PRINT } from '@/content/print';
import { UI } from '@/content/ui';
import { WORLDS } from '@/content/worlds';
import { renderText } from '@/domain/text';
import type { Station, StufeConfig, Task, WorldId } from '@/domain/types';
import { Chest } from '@/illustrations/Chest';
import { FindlingIcon } from '@/illustrations/FindlingIcon';
import { Kiko } from '@/illustrations/Kiko';
import { Pearl } from '@/illustrations/Pearl';
import { Star } from '@/illustrations/Star';
import { StationIcon } from '@/illustrations/StationIcon';
import { cx } from '@/components/cx';
import type { PrintOptions, Sheet } from './job';
import { PaperTask } from './PaperTask';
import { solutionText } from './solution';
import { TowerSheetBody, TowerSolutions } from './TowerSheet';
import styles from './Paper.module.css';

// Alle Druckseiten in Druckreihenfolge (docs/06 3–7). Vorschau und Druck nutzen dieselben Seiten.

/** Bucht-Blätter: höchstens 3 Aufgaben pro Seite, auf der ersten wegen des Kopfs 2 (docs/06 1). */
const BAY_TASKS_PER_PAGE = 3;
const BAY_TASKS_FIRST_PAGE = 2;

function Page({
  large,
  className,
  children,
}: {
  large: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={cx('paper', 'print-page', styles.page, large && styles.large, className)}>
      {children}
    </article>
  );
}

function NameLine() {
  return (
    <p className={styles.nameLine}>
      <span>{PRINT.name}</span>
      <span className={styles.blank} />
      <span>{PRINT.date}</span>
      <span className={styles.blank} />
    </p>
  );
}

function Footer({ lines }: { lines: string[] }) {
  return <p className={styles.footer}>{lines.join(' · ')}</p>;
}

function Foot({ station, children }: { station: Station; children: ReactNode }) {
  return (
    <div className={styles.foot}>
      <span className={styles.stars}>
        {PRINT.howWasIt}
        {[0, 1, 2].map((i) => (
          <Star key={i} size={22} filled={false} />
        ))}
      </span>
      {children}
      <FindlingIcon id={station.findling.id} size={44} />
    </div>
  );
}

/** Seiten der Bucht: erst `first` Aufgaben, dann je `size`. Liefert [Startindex, Aufgaben]. */
function bayPages<T>(items: readonly T[], first: number, size: number): [number, T[]][] {
  const pages: [number, T[]][] = [[0, items.slice(0, first)]];
  for (let start = first; start < items.length; start += size) {
    pages.push([start, items.slice(start, start + size)]);
  }
  return pages;
}

function StationPages({
  station,
  tasks,
  options,
  cfg,
}: {
  station: Station;
  tasks: Task[];
  options: PrintOptions;
  cfg: StufeConfig;
}) {
  const world = WORLDS[station.world];
  const bay = station.world === 'kleine-bucht';
  // Bei Station 1 entfällt im Druck Kikos Begrüßung (docs/06 3)
  const intro = station.number === 1 ? station.intro.slice(1) : station.intro;
  const variant = tasks.some((task, i) => task !== station.tasks[i]);
  const pages: [number, Task[]][] = bay
    ? bayPages(tasks, BAY_TASKS_FIRST_PAGE, BAY_TASKS_PER_PAGE)
    : [[0, tasks]];
  return (
    <>
      {pages.map(([start, pageTasks], p) => {
        const footer = (
          <Footer
            lines={[
              PRINT.footerStation(world.title, station.number, bay ? p + 1 : undefined),
              ...(variant ? [PRINT.footerVariant(cfg.name, options.seed)] : []),
            ]}
          />
        );
        return (
          <Page key={p} large={options.large}>
            {p === 0 && (
              <>
                {options.nameField && <NameLine />}
                <div className={styles.head}>
                  <StationIcon icon={station.icon} size={52} />
                  <div>
                    <h1 className={styles.title}>
                      {PRINT.stationTitle(station.number, station.title)}
                    </h1>
                    {intro.map((line) => (
                      <p key={line} className={styles.intro}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
                <hr className={styles.rule} />
              </>
            )}
            {pageTasks.map((task, i) => (
              <PaperTask key={task.id} task={task} index={start + i} cfg={cfg} workings={!bay} />
            ))}
            {p === pages.length - 1 ? <Foot station={station}>{footer}</Foot> : footer}
          </Page>
        );
      })}
    </>
  );
}

function ListPage({
  title,
  tasks,
  seed,
  options,
  cfg,
}: {
  title: string;
  tasks: Task[];
  seed: number;
  options: PrintOptions;
  cfg: StufeConfig;
}) {
  return (
    <Page large={options.large}>
      {options.nameField && <NameLine />}
      <h1 className={styles.title}>{title}</h1>
      <hr className={styles.rule} />
      {tasks.map((task, i) => (
        <PaperTask
          key={task.id}
          task={task}
          index={i}
          cfg={cfg}
          workings={cfg.world !== 'kleine-bucht'}
        />
      ))}
      <Footer lines={[PRINT.footerSheet(title, seed)]} />
    </Page>
  );
}

function CertificatePage({ world, name }: { world: WorldId; name?: string }) {
  const stations = WORLDS[world].stations;
  return (
    <Page large={false} className={styles.certificate}>
      <svg className={styles.waves} viewBox="0 0 200 20" aria-hidden="true">
        <path d="M0 10 Q12.5 0 25 10 T50 10 T75 10 T100 10 T125 10 T150 10 T175 10 T200 10" />
      </svg>
      <h1 className={styles.certTitle}>{PRINT.certTitle}</h1>
      {world === 'schatzinsel' ? <Chest open size={150} /> : <Pearl size={110} />}
      <p className={styles.certName}>{name ?? ' '}</p>
      <p className={styles.certText}>{PRINT.certExplored[world]}</p>
      <p className={styles.stars}>
        {stations.map((station) => (
          <Star key={station.id} size={34} filled={false} />
        ))}
      </p>
      <p className={styles.certSkills}>{PRINT.certSkills[world]}</p>
      <div className={styles.certFoot}>
        <p className={styles.nameLine}>
          <span>{PRINT.date}</span>
          <span className={styles.blank} style={{ minWidth: '50mm' }} />
        </p>
        <span className={styles.signature}>
          <Kiko pose="freut-sich" size={90} />
          {PRINT.certSignature}
        </span>
      </div>
      <svg className={styles.waves} viewBox="0 0 200 20" aria-hidden="true">
        <path d="M0 10 Q12.5 0 25 10 T50 10 T75 10 T100 10 T125 10 T150 10 T175 10 T200 10" />
      </svg>
    </Page>
  );
}

function SolutionTable({ caption, tasks }: { caption: string; tasks: Task[] }) {
  return (
    <table className={styles.table}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th>{PRINT.colNumber}</th>
          <th>{PRINT.colTask}</th>
          <th>{PRINT.colSolution}</th>
          <th>{PRINT.colWorkings}</th>
        </tr>
      </thead>
      <tbody>
        {tasks.flatMap((task, i) =>
          task.parts.map((part, j) => (
            <tr key={part.id}>
              <td>
                {i + 1}
                {task.parts.length > 1 ? `${'abc'.charAt(j)})` : ''}
              </td>
              <td>{task.title}</td>
              <td>{solutionText(part.answer)}</td>
              <td>{renderText(part.explanation)}</td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}

function sheetTitle(sheet: Sheet, cfg: StufeConfig): string {
  switch (sheet.kind) {
    case 'station':
      return PRINT.stationTitle(sheet.station.number, sheet.station.title);
    case 'practice':
      return PRINT.practiceTitle(UI.practice.topics[sheet.topic], cfg.name);
    case 'riddles':
      return PRINT.riddleTitle(cfg.name);
    case 'tower':
      return PRINT.towerTitle(cfg.name);
    case 'certificate':
      return PRINT.certTitle;
  }
}

/** Lösungsblatt: immer auf eigenen Seiten hinter allen Arbeitsblättern (docs/06 5). */
function SolutionPages({
  sheets,
  options,
  cfg,
}: {
  sheets: Sheet[];
  options: PrintOptions;
  cfg: StufeConfig;
}) {
  const withTasks = sheets.flatMap((sheet) =>
    sheet.kind === 'certificate' || sheet.kind === 'tower'
      ? []
      : [{ title: sheetTitle(sheet, cfg), tasks: sheet.tasks }],
  );
  const tower = sheets.find((sheet) => sheet.kind === 'tower');
  if (withTasks.length === 0 && !tower) return null;
  return (
    <Page large={false}>
      <div className={styles.solutions}>
        <h1 className={styles.title}>{PRINT.solutionsTitle}</h1>
        <p>{PRINT.solutionsHint}</p>
        {withTasks.map((entry) => (
          <SolutionTable key={entry.title} caption={entry.title} tasks={entry.tasks} />
        ))}
        {tower && (
          <>
            <h2>{sheetTitle(tower, cfg)}</h2>
            <TowerSolutions puzzles={tower.puzzles} />
          </>
        )}
      </div>
      <Footer lines={[PRINT.solutionsTitle, PRINT.footerVariant(cfg.name, options.seed)]} />
    </Page>
  );
}

/** Alle Seiten des Ausdrucks. Ohne Lösungsblatt enthält der DOM keine Lösung. */
export function PrintDocument({ sheets, options }: { sheets: Sheet[]; options: PrintOptions }) {
  const cfg = STUFEN[options.stufe];
  return (
    <>
      {sheets.map((sheet) => {
        switch (sheet.kind) {
          case 'station':
            return (
              <StationPages
                key={sheet.station.id}
                station={sheet.station}
                tasks={sheet.tasks}
                options={options}
                cfg={cfg}
              />
            );
          case 'practice':
            return (
              <ListPage
                key="practice"
                title={sheetTitle(sheet, cfg)}
                tasks={sheet.tasks}
                seed={options.practiceSeed}
                options={options}
                cfg={cfg}
              />
            );
          case 'riddles':
            return (
              <ListPage
                key="riddles"
                title={sheetTitle(sheet, cfg)}
                tasks={sheet.tasks}
                seed={options.riddleSeed}
                options={options}
                cfg={cfg}
              />
            );
          case 'tower':
            return (
              <Page key="tower" large={false}>
                <h1 className={styles.title}>{sheetTitle(sheet, cfg)}</h1>
                {options.nameField && <NameLine />}
                <TowerSheetBody puzzles={sheet.puzzles} />
                <Footer
                  lines={[PRINT.towerLegend, PRINT.footerVariant(cfg.name, options.towerSeed)]}
                />
              </Page>
            );
          case 'certificate':
            return (
              <CertificatePage
                key="certificate"
                world={sheet.world}
                {...(sheet.name ? { name: sheet.name } : {})}
              />
            );
        }
      })}
      {options.solutions && <SolutionPages sheets={sheets} options={options} cfg={cfg} />}
    </>
  );
}
