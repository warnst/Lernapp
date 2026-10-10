import { Route, Switch } from 'wouter';
import { UI } from '@/content/ui';
import { AdultArea } from '@/screens/AdultArea';
import { AdultProfile } from '@/screens/AdultProfile';
import { Adults } from '@/screens/Adults';
import { BonusPlay } from '@/screens/BonusPlay';
import { ChildLayout } from '@/screens/ChildLayout';
import { Placeholder } from '@/screens/Placeholder';
import { Practice } from '@/screens/Practice';
import { PracticePlay } from '@/screens/PracticePlay';
import { Play } from '@/screens/Play';
import { Print } from '@/screens/Print';
import { Setup } from '@/screens/Setup';
import { StationComplete } from '@/screens/StationComplete';
import { Tower } from '@/screens/Tower';
import { TowerPlay } from '@/screens/TowerPlay';
import { Treasures } from '@/screens/Treasures';
import { JokeBook } from '@/screens/JokeBook';
import { CertificatePreview } from '@/screens/CertificatePreview';
import { WhoPlays } from '@/screens/WhoPlays';
import { WorldMap } from '@/screens/WorldMap';
import { AppStateProvider } from '@/state/app-state';
import { useAppState } from '@/state/context';

/** „/“: beim allerersten Start die Einrichtung, sonst die Welt des Kindes. */
function Home() {
  const { state } = useAppState();
  if (!state.setupDone) return <Setup />;
  return <ChildLayout>{(profile) => <WorldMap key={profile.id} profile={profile} />}</ChildLayout>;
}

function PracticePage() {
  return <ChildLayout>{(profile) => <Practice key={profile.id} profile={profile} />}</ChildLayout>;
}
function TowerPage() {
  return <ChildLayout>{(profile) => <Tower key={profile.id} profile={profile} />}</ChildLayout>;
}
function JokeBookPage() {
  return <ChildLayout>{(profile) => <JokeBook key={profile.id} profile={profile} />}</ChildLayout>;
}
function TreasuresPage() {
  return <ChildLayout>{(profile) => <Treasures key={profile.id} profile={profile} />}</ChildLayout>;
}

/** Alle Routen aus docs/03, Abschnitt 3. Noch fehlende Seiten sind Platzhalter. */
export function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wer-spielt" component={WhoPlays} />
      <Route path="/station/:stationId/geschafft">
        {(params) => <StationComplete stationId={params.stationId} />}
      </Route>
      <Route path="/station/:stationId/bonus">
        {(params) => <BonusPlay stationId={params.stationId} />}
      </Route>
      <Route path="/station/:stationId">{(params) => <Play stationId={params.stationId} />}</Route>
      <Route path="/ueben/spiel" component={PracticePlay} />
      <Route path="/ueben" component={PracticePage} />
      <Route path="/raetsel/:slug">{(params) => <TowerPlay slug={params.slug} />}</Route>
      <Route path="/raetsel" component={TowerPage} />
      <Route path="/schaetze/urkunde" component={CertificatePreview} />
      <Route path="/schaetze/witze" component={JokeBookPage} />
      <Route path="/schaetze" component={TreasuresPage} />
      <Route path="/erwachsene/kind/:profileId">
        {(params) => (
          <AdultArea>
            <AdultProfile profileId={params.profileId} />
          </AdultArea>
        )}
      </Route>
      <Route path="/erwachsene/drucken">
        <AdultArea>
          <Print />
        </AdultArea>
      </Route>
      <Route path="/erwachsene">
        <AdultArea>
          <Adults />
        </AdultArea>
      </Route>
      <Route>
        <Placeholder title={UI.nav.adventure} />
      </Route>
    </Switch>
  );
}

export function App() {
  return (
    <AppStateProvider>
      <Routes />
    </AppStateProvider>
  );
}
