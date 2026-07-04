import { app, BrowserWindow } from 'electron';
import { createMainWindow, registerIpc, disposeIpc } from './main';

app.setName('Kedex');

app.whenReady().then(() => {
  createMainWindow();
  registerIpc();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  disposeIpc();
});
