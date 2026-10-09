import { Route, Switch } from 'wouter';
import { UI } from '@/content/ui';
import { AdultArea } from '@/screens/AdultArea';
import { AdultProfile } from '@/screens/AdultProfile';
import { Adults } from '@/screens/Adults';
import { ChildLayout } from '@/screens/ChildLayout';
import { Placeholder } from '@/screens/Placeholder';
import { Play } from '@/screens/Play';
import { Setup } from '@/screens/Setup';
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

function withNav(title: string) {
  return function ChildPlaceholder() {
    return <ChildLayout>{() => <Placeholder title={title} withNav />}</ChildLayout>;
  };
}

const PracticePage = withNav(UI.nav.practice);
const TreasuresPage = withNav(UI.nav.treasures);

/** Alle Routen aus docs/03, Abschnitt 3. Noch fehlende Seiten sind Platzhalter. */
export function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wer-spielt" component={WhoPlays} />
      <Route path="/station/:stationId/geschafft">
        <Placeholder title={UI.nav.adventure} />
      </Route>
      <Route path="/station/:stationId/bonus">
        <Placeholder title={UI.nav.adventure} />
      </Route>
      <Route path="/station/:stationId">{(params) => <Play stationId={params.stationId} />}</Route>
      <Route path="/ueben/spiel">
        <Placeholder title={UI.nav.practice} />
      </Route>
      <Route path="/ueben" component={PracticePage} />
      <Route path="/schaetze/urkunde">
        <Placeholder title={UI.nav.treasures} />
      </Route>
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
          <Placeholder title={UI.adults.print} />
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
