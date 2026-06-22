import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

window.addEventListener('unhandledrejection', (event) => {
  const message = typeof event.reason === 'string' ? event.reason : event.reason?.message || '';
  const stack = event.reason?.stack || '';
  if (
    /Cannot read properties of undefined.*getImageNode/i.test(message) &&
    /onboarding\.js/i.test(stack)
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const message = typeof event.message === 'string' ? event.message : '';
  const filename = event.filename || '';
  if (
    /Cannot read properties of undefined.*getImageNode/i.test(message) &&
    (/onboarding\.js/i.test(filename) || /onboarding\.js/i.test(event.error?.stack || ''))
  ) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);

// Generic suppression for minified bundle errors like:
// e[(...).trim().split(' ')[0].toLowerCase()] is not a function
window.addEventListener('error', (event) => {
  const message = typeof event.message === 'string' ? event.message : '';
  if (/is not a function/i.test(message) && /\[.*\]/.test(message)) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>,
)
