import { BrowserWindow, app, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import { RustBridge } from './rust-bridge';
import { PtyManager } from './pty-manager';
import { getProviders, saveProvider, removeProvider, getSetting, setSetting } from './db';
import type { IpcEvent, IpcRequest } from '../shared/ipc';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let bridge: RustBridge | null = null;
let pty: PtyManager | null = null;

export function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 620,
    backgroundColor: '#0A0A0B',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

export function registerIpc() {
  bridge = new RustBridge();
  pty = new PtyManager();

  bridge.on('event', (e: IpcEvent) => {
    mainWindow?.webContents.send('ipc:event', e);
  });
  bridge.on('log', (e: IpcEvent) => {
    mainWindow?.webContents.send('ipc:event', e);
  });

  pty.on('data', (payload: { id: string; data: string }) => {
    mainWindow?.webContents.send('ipc:event', {
      kind: 'pty:data',
      ...payload,
    } satisfies IpcEvent);
  });
  pty.on('exit', (payload: { id: string; code: number }) => {
    mainWindow?.webContents.send('ipc:event', {
      kind: 'pty:exit',
      ...payload,
    } satisfies IpcEvent);
  });

  ipcMain.handle('ipc:invoke', async (_evt, req: IpcRequest) => {
    try {
      switch (req.type) {
        case 'settings/get':
          return { type: 'ok', payload: getSetting('app', {}) } as const;
        case 'settings/set':
          setSetting('app', req.payload);
          return { type: 'ok' } as const;
        case 'providers/list':
          return { type: 'ok', payload: getProviders() } as const;
        case 'providers/save':
          saveProvider(req.payload);
          return { type: 'ok' } as const;
        case 'providers/remove':
          removeProvider(req.payload.id);
          return { type: 'ok' } as const;
        case 'secrets/set':
          // Real implementation will call into the Rust `keyring` crate.
          // For now we persist the API key in the providers row.
          {
            const all = getProviders();
            const p = all.find((x) => x.id === req.payload.providerId);
            if (p) saveProvider({ ...p, apiKey: req.payload.apiKey });
          }
          return { type: 'ok' } as const;
        case 'secrets/get':
          {
            const all = getProviders();
            const p = all.find((x) => x.id === req.payload.providerId);
            return { type: 'ok', payload: p?.apiKey ?? null } as const;
          }
        case 'pty/spawn': {
          const id = pty!.spawn(req.payload);
          return { type: 'ok', payload: { id } } as const;
        }
        case 'pty/write':
          pty!.write(req.payload.id, req.payload.data);
          return { type: 'ok' } as const;
        case 'pty/resize':
          pty!.resize(req.payload.id, req.payload.cols, req.payload.rows);
          return { type: 'ok' } as const;
        case 'pty/kill':
          pty!.kill(req.payload.id);
          return { type: 'ok' } as const;
        case 'voice/transcribe':
          // Real implementation: forward to OpenAI Whisper / local Whisper.cpp.
          return {
            type: 'ok',
            payload: { text: 'Voice transcription is not wired in this build.' },
          } as const;
        case 'fs/readFile':
        case 'fs/writeFile':
        case 'fs/listDir':
          return { type: 'error', error: { code: 'NOT_IMPLEMENTED', message: req.type } } as const;
        case 'agent/run':
        case 'agent/cancel':
        case 'plan/create':
        case 'plan/list':
        case 'git/status':
        case 'git/diff':
        case 'git/commit':
        case 'git/push': {
          const result = await bridge!.call(req);
          return { type: 'ok', payload: result } as const;
        }
        case 'shell/approve':
          return { type: 'ok' } as const;
        default:
          return { type: 'error', error: { code: 'UNKNOWN', message: 'unknown request' } } as const;
      }
    } catch (err) {
      return {
        type: 'error',
        error: { code: 'IPC_FAIL', message: (err as Error).message },
      } as const;
    }
  });
}

export function disposeIpc() {
  bridge?.dispose();
  pty?.dispose();
}

export function getMainWindow() {
  return mainWindow;
}

export { dialog, app };
