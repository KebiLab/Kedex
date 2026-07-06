import path from 'node:path';
import { runCommand, pathExists, ensureDir } from './util';
import type { GitStatus, WorktreeInfo } from '../shared/ipc';

async function git(
  args: string[],
  cwd?: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  return runCommand('git', args, { cwd });
}

export async function isGitRepo(dir?: string): Promise<boolean> {
  const r = await git(['rev-parse', '--is-inside-work-tree'], dir);
  return r.code === 0 && r.stdout.trim() === 'true';
}

export async function gitStatus(cwd?: string): Promise<GitStatus> {
  const repo = await isGitRepo(cwd);
  if (!repo) {
    return {
      branch: '',
      ahead: 0,
      behind: 0,
      files: [],
      isRepo: false,
      error: 'Not a git repository',
    };
  }
  const branchRes = await git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  const branch = branchRes.stdout.trim() || 'HEAD';

  const statusRes = await git(['status', '--porcelain=v1', '-uall'], cwd);
  const files: GitStatus['files'] = [];
  for (const line of statusRes.stdout.split('\n')) {
    if (!line || line.length < 4) continue;
    const x = line[0];
    const y = line[1];
    const filePath = line.slice(3).trim();
    let status: GitStatus['files'][number]['status'] = 'M';
    if (x === '?' || y === '?') status = '?';
    else if (x === 'A' || y === 'A') status = 'A';
    else if (x === 'D' || y === 'D') status = 'D';
    else if (x === 'R' || y === 'R') status = 'R';
    else if (x === 'M' || y === 'M') status = 'M';
    if (filePath) files.push({ path: filePath, status });
  }

  let ahead = 0;
  let behind = 0;
  try {
    const ab = await git(
      ['rev-list', '--left-right', '--count', `${branch}...@{u}`],
      cwd,
    );
    if (ab.code === 0) {
      const [l, r] = ab.stdout.trim().split(/\s+/);
      ahead = Number(l) || 0;
      behind = Number(r) || 0;
    }
  } catch {
    // no upstream
  }

  return { branch, ahead, behind, files, isRepo: true };
}

export async function gitDiff(filePath?: string, cwd?: string): Promise<string> {
  if (!filePath) {
    const r = await git(['diff', '--no-color'], cwd);
    return r.stdout;
  }
  const r = await git(['diff', '--no-color', '--', filePath], cwd);
  return r.stdout;
}

export async function gitCommit(message: string, cwd?: string): Promise<{ ok: boolean; error?: string }> {
  // Stage all
  await git(['add', '-A'], cwd);
  const r = await git(['commit', '-m', message, '--no-verify'], cwd);
  if (r.code !== 0) return { ok: false, error: r.stderr || r.stdout };
  return { ok: true };
}

export async function gitPush(cwd?: string): Promise<{ ok: boolean; error?: string }> {
  const r = await git(['push'], cwd);
  if (r.code !== 0) return { ok: false, error: r.stderr || r.stdout };
  return { ok: true };
}

export async function gitLog(limit = 20, cwd?: string): Promise<{ hash: string; subject: string; author: string; date: string }[]> {
  const fmt = '%H%x1f%s%x1f%an%x1f%ad';
  const r = await git(['log', `--pretty=format:${fmt}`, '-n', String(limit), '--date=iso'], cwd);
  if (r.code !== 0) return [];
  return r.stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, subject, author, date] = line.split('\x1f');
      return { hash, subject, author, date };
    });
}

export async function worktreeList(cwd?: string): Promise<WorktreeInfo[]> {
  if (!(await isGitRepo(cwd))) return [];
  const r = await git(['worktree', 'list', '--porcelain'], cwd);
  if (r.code !== 0) return [];
  const out: WorktreeInfo[] = [];
  let cur: Partial<WorktreeInfo> = {};
  for (const line of r.stdout.split('\n')) {
    if (line.startsWith('worktree ')) {
      if (cur.path) out.push(cur as WorktreeInfo);
      cur = { path: line.slice('worktree '.length), isMain: false };
    } else if (line.startsWith('HEAD ')) {
      cur.commit = line.slice('HEAD '.length);
    } else if (line.startsWith('branch ')) {
      cur.branch = line.slice('branch '.length).replace('refs/heads/', '');
    } else if (line === 'bare') {
      cur.isMain = true;
    } else if (line === '') {
      if (cur.path) out.push(cur as WorktreeInfo);
      cur = {};
    }
  }
  if (cur.path) out.push(cur as WorktreeInfo);
  if (out.length > 0) out[0].isMain = true;
  return out;
}

export async function worktreeCreate(opts: { branch: string; base?: string; cwd?: string }): Promise<{ ok: boolean; path?: string; error?: string }> {
  if (!(await isGitRepo(opts.cwd))) {
    return { ok: false, error: 'Not a git repository' };
  }
  const list = await worktreeList(opts.cwd);
  const repoRoot = list[0]?.path ?? opts.cwd ?? process.cwd();
  const safeName = opts.branch.replace(/[^a-zA-Z0-9_\-./]/g, '-');
  const worktreePath = path.join(path.dirname(repoRoot), `${path.basename(repoRoot)}.${safeName}`);
  if (await pathExists(worktreePath)) {
    return { ok: false, error: `Path already exists: ${worktreePath}` };
  }
  await ensureDir(path.dirname(worktreePath));
  const args = ['worktree', 'add', '-b', safeName, worktreePath];
  if (opts.base) args.push(opts.base);
  const r = await git(args, opts.cwd);
  if (r.code !== 0) return { ok: false, error: r.stderr || r.stdout };
  return { ok: true, path: worktreePath };
}

export async function worktreeRemove(targetPath: string, force = false): Promise<{ ok: boolean; error?: string }> {
  const r = await git(['worktree', 'remove', force ? '--force' : '', targetPath].filter(Boolean));
  if (r.code !== 0) return { ok: false, error: r.stderr || r.stdout };
  return { ok: true };
}
