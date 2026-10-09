import { Route, Switch } from 'wouter';
import { Home } from '@/screens/Home';

export function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
    </Switch>
  );
}
