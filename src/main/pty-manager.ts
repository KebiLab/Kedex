import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import * as pty from 'node-pty';
import os from 'node:os';

interface Session {
  id: string;
  proc: pty.IPty;
  cwd: string;
}

export class PtyManager extends EventEmitter {
  private sessions = new Map<string, Session>();

  spawn(opts: { cwd?: string; cols?: number; rows?: number; shell?: string }): string {
    const id = randomUUID();
    const shell =
      opts.shell ?? (process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh');
    const proc = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: opts.cols ?? 120,
      rows: opts.rows ?? 30,
      cwd: opts.cwd ?? os.homedir(),
      env: process.env as Record<string, string>,
    });

    proc.onData((data) => this.emit('data', { id, data }));
    proc.onExit(({ exitCode }) => {
      this.sessions.delete(id);
      this.emit('exit', { id, code: exitCode });
    });

    this.sessions.set(id, { id, proc, cwd: opts.cwd ?? os.homedir() });
    return id;
  }

  write(id: string, data: string) {
    this.sessions.get(id)?.proc.write(data);
  }

  resize(id: string, cols: number, rows: number) {
    try {
      this.sessions.get(id)?.proc.resize(cols, rows);
    } catch {
      /* noop */
    }
  }

  kill(id: string) {
    const s = this.sessions.get(id);
    if (!s) return;
    try {
      s.proc.kill();
    } catch {
      /* noop */
    }
    this.sessions.delete(id);
  }

  dispose() {
    for (const id of [...this.sessions.keys()]) this.kill(id);
  }
}
