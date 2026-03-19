import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { GlobalStyles } from './styles/GlobalStyles';
import { AppThemeProvider } from './providers/AppThemeProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <GlobalStyles />
        <App />
      </AppThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
