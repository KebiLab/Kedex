import fs from 'node:fs/promises';
import path from 'node:path';

export async function readFile(p: string): Promise<string> {
  return fs.readFile(p, 'utf8');
}

export async function writeFile(p: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, 'utf8');
}

export async function listDir(p: string): Promise<{ name: string; path: string; isDir: boolean }[]> {
  const entries = await fs.readdir(p, { withFileTypes: true });
  return entries
    .map((e) => ({ name: e.name, path: path.join(p, e.name), isDir: e.isDirectory() }))
    .sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
