import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { Routes } from '@/App';
import type { AppStateV2 } from '@/domain/types';
import { AppStateProvider } from '@/state/app-state';
import { memoryStorage } from '@/state/test-helpers';

/** Rendert die App mit Speicher im RAM und einer Adresse im Speicher. */
export function renderApp(path = '/', initial?: AppStateV2) {
  const storage = memoryStorage(initial);
  const location = memoryLocation({ path, record: true });
  const user = userEvent.setup();
  const view = render(
    <Router hook={location.hook}>
      <AppStateProvider storage={storage}>
        <Routes />
      </AppStateProvider>
    </Router>,
  );
  return { ...view, user, storage, location };
}
