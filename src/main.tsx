import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against Firebase Auth internal SDK assertion failures during popup lifecycle
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' 
      ? reason 
      : reason?.message || reason?.toString?.() || '';
    if (
      msg.includes('Pending promise was never set') || 
      msg.includes('INTERNAL ASSERTION FAILED')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.warn('[Global] Suppressed Firebase Auth internal assertion rejection:', msg);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event?.message || event?.error?.message || '';
    if (
      msg.includes('Pending promise was never set') || 
      msg.includes('INTERNAL ASSERTION FAILED')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.warn('[Global] Suppressed Firebase Auth internal assertion error:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
