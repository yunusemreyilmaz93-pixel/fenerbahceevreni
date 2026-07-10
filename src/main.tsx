import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initFirebaseAppCheck } from './lib/firebase';

// App Check as early as possible (before Auth / Firestore traffic)
void initFirebaseAppCheck();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
