import { useCallback, useState } from 'react';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  /** data: URL for image previews, blob: URL for other files. */
  preview: string;
  kind: 'image' | 'file';
}

function uid(): string {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function detectKind(mime: string): 'image' | 'file' {
  return mime.startsWith('image/') ? 'image' : 'file';
}

async function readFile(file: File): Promise<AttachedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: uid(),
        name: file.name,
        size: file.size,
        mime: file.type || 'application/octet-stream',
        preview: typeof reader.result === 'string' ? reader.result : '',
        kind: detectKind(file.type || ''),
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export { readFile, formatBytes };
