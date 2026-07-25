import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

GoogleAuth.initialize({
  clientId: '123154076628-oql4c5l6dr9v4d96o2u8f9ujn792nsq1.apps.googleusercontent.com',
  scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.events'],
  grantOfflineAccess: true,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
