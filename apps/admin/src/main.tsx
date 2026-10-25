import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from '@sard/components';
import { RtlProvider } from '@sard/components';
import { generateCssVariables, tokens } from '@sard/design-tokens';
import './styles/global.css';

// Inject design tokens as CSS variables
const style = document.createElement('style');
style.textContent = generateCssVariables(tokens);
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultMode="system">
      <RtlProvider defaultLocale="en">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RtlProvider>
    </ThemeProvider>
  </React.StrictMode>
);
