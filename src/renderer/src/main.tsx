import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { TooltipProvider } from '@/components/ui/Tooltip';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider delayDuration={150}>
      <App />
    </TooltipProvider>
  </React.StrictMode>,
);
