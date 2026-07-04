import { useState } from 'react';
import { FileCode, CaretRight, Plus, Minus } from '@phosphor-icons/react';
import type { FileDiff } from '@shared/ipc';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const SAMPLE: FileDiff[] = [
  {
    path: 'src/auth/middleware.ts',
    status: 'modified',
    hunks: [
      {
        oldStart: 12,
        oldLines: 8,
        newStart: 12,
        newLines: 10,
        lines: [
          { kind: 'context', text: 'import { NextRequest, NextResponse } from "next/server";', oldLineNumber: 12, newLineNumber: 12 },
          { kind: 'del', text: 'export function authGuard(req: NextRequest) {', oldLineNumber: 13 },
          { kind: 'context', text: '  const token = req.cookies.get("kedex_session");', oldLineNumber: 14, newLineNumber: 13 },
          { kind: 'del', text: '  if (!token) return NextResponse.redirect("/login");', oldLineNumber: 15 },
          { kind: 'add', text: 'export async function authGuard(req: NextRequest) {', newLineNumber: 14 },
          { kind: 'add', text: '  const session = await readSession(req);', newLineNumber: 15 },
          { kind: 'add', text: '  if (!session) return NextResponse.redirect("/login");', newLineNumber: 16 },
          { kind: 'context', text: '  return NextResponse.next();', oldLineNumber: 16, newLineNumber: 17 },
          { kind: 'context', text: '}', oldLineNumber: 17, newLineNumber: 18 },
        ],
      },
    ],
  },
  {
    path: 'src/auth/session.ts',
    status: 'added',
    hunks: [
      {
        oldStart: 0,
        oldLines: 0,
        newStart: 1,
        newLines: 8,
        lines: [
          { kind: 'add', text: 'import { cookies } from "next/headers";', newLineNumber: 1 },
          { kind: 'add', text: 'import { db } from "@/lib/db";', newLineNumber: 2 },
          { kind: 'add', text: '', newLineNumber: 3 },
          { kind: 'add', text: 'export async function readSession(req: NextRequest) {', newLineNumber: 4 },
          { kind: 'add', text: '  const token = req.cookies.get("kedex_session")?.value;', newLineNumber: 5 },
          { kind: 'add', text: '  if (!token) return null;', newLineNumber: 6 },
          { kind: 'add', text: '  return db.session.findUnique({ where: { token } });', newLineNumber: 7 },
          { kind: 'add', text: '}', newLineNumber: 8 },
        ],
      },
    ],
  },
];

export function DiffViewer({ diffs = SAMPLE }: { diffs?: FileDiff[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    () => Object.fromEntries(diffs.map((d) => [d.path, true])),
  );

  let adds = 0;
  let dels = 0;
  for (const d of diffs) {
    for (const h of d.hunks) for (const l of h.lines) {
      if (l.kind === 'add') adds++;
      else if (l.kind === 'del') dels++;
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-bg">
      <div className="flex items-center gap-3 border-b border-line px-5 py-2.5">
        <span className="text-sm font-medium text-fg">Unstaged</span>
        <span className="text-2xs text-fg-dim">
          <span className="text-success">+{adds}</span> <span className="text-danger">−{dels}</span>
        </span>
        <span className="ml-2 text-2xs text-fg-dim">{diffs.length} files</span>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Minus className="h-3.5 w-3.5" weight="bold" /> Reject all
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" weight="bold" /> Stage all
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {diffs.map((d) => {
          const open = expanded[d.path] ?? true;
          return (
            <div key={d.path} className="border-b border-line">
              <button
                onClick={() => setExpanded((s) => ({ ...s, [d.path]: !open }))}
                className="flex w-full items-center gap-2 px-5 py-2 text-left transition hover:bg-bg-1"
              >
                <CaretRight
                  className={cn(
                    'h-3.5 w-3.5 text-fg-dim transition',
                    open && 'rotate-90',
                  )}
                  weight="bold"
                />
                <FileCode className="h-3.5 w-3.5 text-fg-muted" weight="fill" />
                <span className="font-mono text-xs text-fg">{d.path}</span>
                <span className="ml-auto text-2xs text-fg-dim">
                  {d.hunks.length} hunk{d.hunks.length === 1 ? '' : 's'}
                </span>
              </button>
              {open && (
                <div>
                  {d.hunks.map((h, hi) => (
                    <div key={hi} className="border-t border-line font-mono text-2xs">
                      <div className="flex items-center gap-3 border-b border-line bg-bg-1 px-5 py-1 text-fg-dim">
                        <span>@@ -{h.oldStart},{h.oldLines} +{h.newStart},{h.newLines} @@</span>
                      </div>
                      {h.lines.map((l, li) => (
                        <div
                          key={li}
                          className={cn(
                            'flex',
                            l.kind === 'add' && 'bg-success/[0.06]',
                            l.kind === 'del' && 'bg-danger/[0.06]',
                          )}
                        >
                          <span className="w-12 shrink-0 select-none px-2 py-px text-right text-fg-dim">
                            {l.oldLineNumber ?? ''}
                          </span>
                          <span className="w-12 shrink-0 select-none px-2 py-px text-right text-fg-dim">
                            {l.newLineNumber ?? ''}
                          </span>
                          <span
                            className={cn(
                              'w-6 select-none text-center',
                              l.kind === 'add' && 'text-success',
                              l.kind === 'del' && 'text-danger',
                            )}
                          >
                            {l.kind === 'add' ? '+' : l.kind === 'del' ? '−' : ' '}
                          </span>
                          <span className="flex-1 whitespace-pre px-2 py-px text-fg">{l.text}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
