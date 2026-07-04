import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { applyTheme, getStoredTheme, watchSystemTheme } from '@/lib/theme';
import { TooltipProvider } from '@/components/ui/Tooltip';

const initialTheme = getStoredTheme();
applyTheme(initialTheme);
if (initialTheme === 'system') watchSystemTheme(() => applyTheme('system'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider delayDuration={150}>
      <App />
    </TooltipProvider>
  </React.StrictMode>,
);
