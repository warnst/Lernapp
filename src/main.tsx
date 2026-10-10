import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-700.css';
import '@fontsource-variable/fredoka';
import '@/styles/tokens.css';
import '@/styles/global.css';
import '@/styles/print.css';
import { App } from '@/App';
import { unlockSpeechOnFirstTap } from '@/speech/speak';
import { startServiceWorker } from '@/state/pwa';

const root = document.getElementById('root');
if (root === null) throw new Error('Element #root fehlt in index.html');

startServiceWorker();
unlockSpeechOnFirstTap();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
