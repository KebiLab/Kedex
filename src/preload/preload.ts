import { contextBridge, ipcRenderer } from 'electron';
import type { IpcEvent, IpcRequest, IpcResponse, KedexApi } from '../shared/ipc';

const invoke = <T = unknown>(req: IpcRequest): Promise<T> =>
  ipcRenderer.invoke('ipc:invoke', req) as Promise<T>;

const onEvent = (listener: (e: IpcEvent) => void) => {
  const sub = (_e: unknown, payload: IpcEvent) => listener(payload);
  ipcRenderer.on('ipc:event', sub);
  return () => ipcRenderer.removeListener('ipc:event', sub);
};

const api: KedexApi = {
  invoke: async <T = unknown>(req: IpcRequest): Promise<T> => {
    const res = (await invoke<IpcResponse>(req)) as IpcResponse;
    if (res.type === 'error') {
      throw new Error(`${res.error.code}: ${res.error.message}`);
    }
    if (res.type === 'event') return undefined as T;
    return res.payload as T;
  },
  onEvent,
  platform: process.platform,
  version: '0.1.0',
};

contextBridge.exposeInMainWorld('kedex', api);
