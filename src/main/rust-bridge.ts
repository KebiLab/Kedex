import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import { EventEmitter } from 'node:events';
import path from 'node:path';
import fs from 'node:fs';
import { app } from 'electron';
import type { IpcEvent, IpcRequest, IpcResponse } from '../shared/ipc';

interface PendingCall {
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
}

/**
 * Spawns the Rust `kedex-core` binary and bridges JSON-RPC stdio
 * with the Electron main process. Every IPC request that targets
 * the agent is funneled through here.
 */
export class RustBridge extends EventEmitter {
  private child: ChildProcessWithoutNullStreams | null = null;
  private pending = new Map<string, PendingCall>();
  private buffer = '';
  private nextId = 1;
  private ready: Promise<void>;

  constructor() {
    super();
    this.ready = this.spawnBinary();
  }

  private binaryPath(): string {
    const exeName = process.platform === 'win32' ? 'kedex-core.exe' : 'kedex-core';
    const candidates = [
      path.join(process.cwd(), 'core', 'target', 'release', exeName),
      path.join(process.cwd(), 'core', 'target', 'debug', exeName),
      path.join(app.getAppPath(), '..', 'core', 'target', 'release', exeName),
      path.join(app.getAppPath(), 'core', 'target', 'release', exeName),
      path.join(process.resourcesPath ?? '', 'core', exeName),
    ];
    for (const p of candidates) {
      try {
        if (p && fs.existsSync(p)) return p;
      } catch {
        /* ignore */
      }
    }
    return candidates[0];
  }

  private spawnBinary(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const bin = this.binaryPath();
        this.child = spawn(bin, [], { stdio: ['pipe', 'pipe', 'pipe'] });
      } catch (err) {
        this.emit('log', {
          kind: 'log',
          level: 'error',
          message: `failed to spawn kedex-core: ${(err as Error).message}`,
        } satisfies IpcEvent);
        resolve();
        return;
      }

      this.child.stdout.on('data', (chunk) => this.onStdout(chunk.toString('utf8')));
      this.child.stderr.on('data', (chunk) =>
        this.emit('log', {
          kind: 'log',
          level: 'warn',
          message: chunk.toString('utf8').trim(),
        } satisfies IpcEvent),
      );
      this.child.on('exit', (code) => {
        this.emit('log', {
          kind: 'log',
          level: 'warn',
          message: `kedex-core exited with code ${code}`,
        } satisfies IpcEvent);
        this.child = null;
      });
      this.emit('log', {
        kind: 'log',
        level: 'info',
        message: 'kedex-core bridge ready',
      } satisfies IpcEvent);
      resolve();
    });
  }

  private onStdout(chunk: string) {
    this.buffer += chunk;
    let idx: number;
    while ((idx = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line) as IpcResponse & { event?: IpcEvent };
        this.routeMessage(msg);
      } catch (err) {
        this.emit('log', {
          kind: 'log',
          level: 'error',
          message: `invalid JSON from core: ${(err as Error).message}`,
        } satisfies IpcEvent);
      }
    }
  }

  private routeMessage(msg: { type: string; payload?: unknown; event?: IpcEvent; error?: unknown }) {
    if (msg.event) {
      this.emit('event', msg.event);
      return;
    }
    const id = (msg as { id?: string }).id ?? String(this.nextId - 1);
    const pending = this.pending.get(id);
    if (!pending) return;
    this.pending.delete(id);
    if (msg.type === 'error') {
      const e = msg.error as { code: string; message: string };
      pending.reject(new Error(`${e.code}: ${e.message}`));
    } else {
      pending.resolve(msg.payload);
    }
  }

  async call<T = unknown>(req: IpcRequest): Promise<T> {
    await this.ready;
    const id = String(this.nextId++);
    const envelope = { id, ...req };
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: (v) => resolve(v as T), reject });
      try {
        this.child?.stdin.write(JSON.stringify(envelope) + '\n');
      } catch (err) {
        this.pending.delete(id);
        reject(err as Error);
      }
    });
  }

  dispose() {
    try {
      this.child?.stdin.end();
    } catch {
      /* ignore */
    }
    this.child?.kill();
  }
}
