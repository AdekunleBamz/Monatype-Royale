import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { createMultisynqSession } from '@multisynq/react';
import { PresenceModel } from './model';

// Initialize Multisynq session before any models are created
createMultisynqSession({
  appId: import.meta.env.VITE_MULTISYNQ_APP_ID,
  apiKey: import.meta.env.VITE_MULTISYNQ_API_KEY,
  model: PresenceModel,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
