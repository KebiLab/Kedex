import { BrowserWindow, app, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import { RustBridge } from './rust-bridge';
import { PtyManager } from './pty-manager';
import {
  getProviders,
  saveProvider,
  removeProvider,
  getSettings,
  setSettings,
  getMcpServers,
  saveMcpServer,
  deleteMcpServer,
  savePlan,
  getPlans,
  getPlan,
} from './db';
import { runCommand } from './util';
import {
  gitStatus as gitStatusCmd,
  gitDiff as gitDiffCmd,
  gitCommit as gitCommitCmd,
  gitPush as gitPushCmd,
  gitLog as gitLogCmd,
  isGitRepo,
  worktreeList,
  worktreeCreate,
  worktreeRemove,
} from './git';
import { readFile, writeFile, listDir, exists as fsExists } from './fs-ops';
import type {
  IpcEvent,
  IpcRequest,
  McpServer,
  AppSettings,
  DEFAULT_SETTINGS as _DEFAULTS_TYPE,
} from '../shared/ipc';
import { DEFAULT_SETTINGS } from '../shared/ipc';

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
    backgroundColor: '#0F0F10',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    icon: path.join(__dirname, '../../resources/icon.svg'),
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

function sendEvent(e: IpcEvent) {
  mainWindow?.webContents.send('ipc:event', e);
}

export function registerIpc() {
  bridge = new RustBridge();
  pty = new PtyManager();

  bridge.on('event', (e: IpcEvent) => sendEvent(e));
  bridge.on('log', (e: IpcEvent) => sendEvent(e));

  pty.on('data', (payload: { id: string; data: string }) =>
    sendEvent({ kind: 'pty:data', ...payload }),
  );
  pty.on('exit', (payload: { id: string; code: number }) =>
    sendEvent({ kind: 'pty:exit', ...payload }),
  );

  ipcMain.handle('ipc:invoke', async (_evt, req: IpcRequest) => {
    try {
      switch (req.type) {
        case 'settings/get':
          return { type: 'ok', payload: getSettings() } as const;
        case 'settings/set':
          return { type: 'ok', payload: setSettings(req.payload as Partial<AppSettings>) } as const;

        case 'providers/list':
          return { type: 'ok', payload: getProviders() } as const;
        case 'providers/save':
          saveProvider(req.payload);
          return { type: 'ok' } as const;
        case 'providers/remove':
          removeProvider(req.payload.id);
          return { type: 'ok' } as const;

        case 'secrets/set': {
          // Persist into Rust keyring via JSON-RPC
          const result = await bridge!.call({
            id: `sec_${Date.now()}`,
            type: 'secrets/set',
            payload: { provider_id: req.payload.providerId, value: req.payload.apiKey },
          });
          // Also keep a copy in the provider row for quick access
          const all = getProviders();
          const p = all.find((x) => x.id === req.payload.providerId);
          if (p) saveProvider({ ...p, apiKey: req.payload.apiKey });
          return { type: 'ok', payload: result } as const;
        }
        case 'secrets/get': {
          const result = (await bridge!.call({
            id: `sec_${Date.now()}`,
            type: 'secrets/get',
            payload: { provider_id: req.payload.providerId },
          })) as { value: string | null } | null;
          return { type: 'ok', payload: result?.value ?? null } as const;
        }
        case 'secrets/has': {
          const result = (await bridge!.call({
            id: `sec_${Date.now()}`,
            type: 'secrets/has',
            payload: { provider_id: req.payload.providerId },
          })) as { has: boolean } | null;
          return { type: 'ok', payload: !!result?.has } as const;
        }

        case 'fs/readFile': {
          const content = await readFile(req.payload.path);
          return { type: 'ok', payload: content } as const;
        }
        case 'fs/writeFile': {
          await writeFile(req.payload.path, req.payload.content);
          return { type: 'ok' } as const;
        }
        case 'fs/listDir': {
          const items = await listDir(req.payload.path);
          return { type: 'ok', payload: items } as const;
        }
        case 'fs/exists': {
          const ok = await fsExists(req.payload.path);
          return { type: 'ok', payload: ok } as const;
        }

        case 'git/status': {
          const s = await gitStatusCmd(req.payload.cwd);
          return { type: 'ok', payload: s } as const;
        }
        case 'git/diff': {
          const diff = await gitDiffCmd(req.payload.path, req.payload.cwd);
          return { type: 'ok', payload: diff } as const;
        }
        case 'git/commit': {
          const r = await gitCommitCmd(req.payload.message, req.payload.cwd);
          return { type: 'ok', payload: r } as const;
        }
        case 'git/push': {
          const r = await gitPushCmd(req.payload.cwd);
          return { type: 'ok', payload: r } as const;
        }
        case 'git/log': {
          const log = await gitLogCmd(req.payload.limit ?? 20, req.payload.cwd);
          return { type: 'ok', payload: log } as const;
        }
        case 'git/checkIsRepo': {
          const ok = await isGitRepo(req.payload.cwd);
          return { type: 'ok', payload: ok } as const;
        }

        case 'worktree/list': {
          const wt = await worktreeList(req.payload.cwd);
          return { type: 'ok', payload: wt } as const;
        }
        case 'worktree/create': {
          const r = await worktreeCreate(req.payload);
          return { type: 'ok', payload: r } as const;
        }
        case 'worktree/remove': {
          const r = await worktreeRemove(req.payload.path, req.payload.force);
          return { type: 'ok', payload: r } as const;
        }

        case 'plan/create': {
          const plan = {
            id: `plan_${Date.now()}`,
            title: req.payload.title,
            data: { steps: [] },
            threadId: req.payload.threadId,
            createdAt: new Date().toISOString(),
          };
          savePlan(plan);
          return { type: 'ok', payload: plan } as const;
        }
        case 'plan/list': {
          return { type: 'ok', payload: getPlans() } as const;
        }
        case 'plan/get': {
          const p = getPlan(req.payload.id);
          return { type: 'ok', payload: p } as const;
        }
        case 'plan/save': {
          savePlan({
            id: req.payload.plan.id,
            title: req.payload.plan.title,
            data: req.payload.plan,
            createdAt: req.payload.plan.createdAt,
          });
          return { type: 'ok' } as const;
        }

        case 'pty/spawn': {
          const id = pty!.spawn(req.payload);
          return { type: 'ok', payload: { id } } as const;
        }
        case 'pty/write': {
          pty!.write(req.payload.id, req.payload.data);
          return { type: 'ok' } as const;
        }
        case 'pty/resize': {
          pty!.resize(req.payload.id, req.payload.cols, req.payload.rows);
          return { type: 'ok' } as const;
        }
        case 'pty/kill': {
          pty!.kill(req.payload.id);
          return { type: 'ok' } as const;
        }
        case 'pty/run': {
          const shell = process.platform === 'win32' ? 'cmd' : '/bin/sh';
          const args =
            process.platform === 'win32'
              ? ['/C', req.payload.command]
              : ['-c', req.payload.command];
          const r = await runCommand(shell, args, { cwd: req.payload.cwd });
          return { type: 'ok', payload: r } as const;
        }

        case 'shell/approve':
          return { type: 'ok' } as const;

        case 'voice/transcribe': {
          // Real: forward to Rust core → OpenAI Whisper
          const provider = getSettings().whisperProvider;
          let apiKey: string | null = null;
          let baseUrl: string | undefined;
          if (provider === 'openai') {
            apiKey =
              ((await bridge!.call({
                id: `sec_${Date.now()}`,
                type: 'secrets/get',
                payload: { provider_id: 'openai' },
              })) as { value: string | null } | null)?.value ?? null;
            baseUrl = 'https://api.openai.com/v1';
          }
          if (!apiKey) {
            return { type: 'error', error: { code: 'NO_KEY', message: 'No API key for whisper' } } as const;
          }
          const result = (await bridge!.call({
            id: `whisper_${Date.now()}`,
            type: 'commands/whisper',
            payload: {
              audio_base64: req.payload.audioBase64,
              mime: req.payload.mime,
              provider,
              api_key: apiKey,
              base_url: baseUrl,
            },
          })) as { text: string } | null;
          return { type: 'ok', payload: { text: result?.text ?? '' } } as const;
        }

        case 'mcp/list': {
          return { type: 'ok', payload: getMcpServers() } as const;
        }
        case 'mcp/add': {
          const id = `mcp_${Date.now()}`;
          saveMcpServer({
            id,
            name: req.payload.name,
            command: req.payload.command,
            args: req.payload.args,
            env: req.payload.env,
            enabled: req.payload.enabled,
            status: 'connecting',
            tools: [],
            lastError: null,
          });
          return { type: 'ok', payload: { id } } as const;
        }
        case 'mcp/remove': {
          deleteMcpServer(req.payload.id);
          return { type: 'ok' } as const;
        }
        case 'mcp/toggle': {
          const all = getMcpServers();
          const s = all.find((x) => x.id === req.payload.id);
          if (s) {
            saveMcpServer({
              ...s,
              enabled: req.payload.enabled,
              status: req.payload.enabled ? 'connecting' : 'disconnected',
            });
          }
          return { type: 'ok' } as const;
        }
        case 'mcp/restart': {
          const all = getMcpServers();
          const s = all.find((x) => x.id === req.payload.id);
          if (s) saveMcpServer({ ...s, status: 'connecting', lastError: null });
          return { type: 'ok' } as const;
        }

        case 'app/openExternal': {
          await shell.openExternal(req.payload.url);
          return { type: 'ok' } as const;
        }
        case 'app/openPath': {
          const r = await shell.openPath(req.payload.path);
          return { type: 'ok', payload: { ok: !r } } as const;
        }
        case 'window/minimize':
          mainWindow?.minimize();
          return { type: 'ok' } as const;
        case 'window/maximize':
          if (mainWindow?.isMaximized()) mainWindow.unmaximize();
          else mainWindow?.maximize();
          return { type: 'ok' } as const;
        case 'window/close':
          mainWindow?.close();
          return { type: 'ok' } as const;

        case 'agent/run': {
          // Forward to Rust core for real streaming
          const threadId = req.payload.threadId;
          const runId = `run_${Date.now()}`;
          const settings = getSettings();
          const providerId = settings.env === 'cloud' ? 'openai' : 'openai'; // local
          const apiKey =
            ((await bridge!.call({
              id: `sec_${Date.now()}`,
              type: 'secrets/get',
              payload: { provider_id: providerId },
            })) as { value: string | null } | null)?.value ?? null;
          const all = getProviders();
          const providerCfg = all.find((p) => p.id === providerId);
          const model = req.payload.mode === 'plan' ? 'gpt-4o-mini' : (providerCfg?.defaultModel ?? 'gpt-4o-mini');
          // Forward mode-aware call to core
          bridge!
            .call({
              id: runId,
              type: 'agent/run',
              payload: {
                run_id: runId,
                prompt: req.payload.prompt,
                provider: providerId,
                model,
                api_key: apiKey,
                base_url: providerCfg?.baseUrl,
                temperature: settings.temperature,
                mode: req.payload.mode,
              },
            })
            .catch(() => undefined);
          return { type: 'ok', payload: { runId, threadId } } as const;
        }
        case 'agent/cancel': {
          // Real cancellation would require run tracking; emit log instead.
          sendEvent({ kind: 'log', level: 'warn', message: `cancel ${req.payload.runId}` });
          return { type: 'ok' } as const;
        }

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
