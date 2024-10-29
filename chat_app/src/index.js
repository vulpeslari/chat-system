import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppProvider } from './AppContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AppProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </AppProvider>
);

reportWebVitals();
