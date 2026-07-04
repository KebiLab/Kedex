import { useMemo, useState } from 'react';
import { Plus, Minus, RotateCcw, FileCode2, ChevronDown, ChevronRight } from 'lucide-react';
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
          { kind: 'del', text: '-export function authGuard(req: NextRequest) {', oldLineNumber: 13 },
          { kind: 'context', text: '  const token = req.cookies.get("kedex_session");', oldLineNumber: 14, newLineNumber: 13 },
          { kind: 'del', text: '-  if (!token) return NextResponse.redirect("/login");', oldLineNumber: 15 },
          { kind: 'add', text: '+export async function authGuard(req: NextRequest) {', newLineNumber: 14 },
          { kind: 'add', text: '+  const session = await readSession(req);', newLineNumber: 15 },
          { kind: 'add', text: '+  if (!session) return NextResponse.redirect("/login");', newLineNumber: 16 },
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
        newLines: 14,
        lines: [
          { kind: 'add', text: '+import { cookies } from "next/headers";', newLineNumber: 1 },
          { kind: 'add', text: '+import { db } from "@/lib/db";', newLineNumber: 2 },
          { kind: 'add', text: '', newLineNumber: 3 },
          { kind: 'add', text: '+export async function readSession(req: NextRequest) {', newLineNumber: 4 },
          { kind: 'add', text: '+  const token = req.cookies.get("kedex_session")?.value;', newLineNumber: 5 },
          { kind: 'add', text: '+  if (!token) return null;', newLineNumber: 6 },
          { kind: 'add', text: '+  return db.session.findUnique({ where: { token } });', newLineNumber: 7 },
          { kind: 'add', text: '+}', newLineNumber: 8 },
        ],
      },
    ],
  },
];

export function DiffViewer({ diffs = SAMPLE }: { diffs?: FileDiff[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    () => Object.fromEntries(diffs.map((d) => [d.path, true])),
  );

  const stats = useMemo(() => {
    let adds = 0;
    let dels = 0;
    for (const d of diffs) {
      for (const h of d.hunks) {
        for (const l of h.lines) {
          if (l.kind === 'add') adds++;
          else if (l.kind === 'del') dels++;
        }
      }
    }
    return { adds, dels };
  }, [diffs]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-bg-1/80 shadow-soft">
      <div className="flex items-center gap-3 border-b border-line px-3 py-2">
        <div className="grid h-6 w-6 place-items-center rounded-md border border-line bg-bg-2 text-fg-muted">
          <FileCode2 className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-fg">Changes</div>
          <div className="text-2xs text-fg-faint">
            <span className="text-success">+{stats.adds}</span>{' '}
            <span className="text-danger">−{stats.dels}</span> · {diffs.length} file
            {diffs.length === 1 ? '' : 's'}
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" title="Reset view">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {diffs.map((d) => {
          const open = expanded[d.path] ?? true;
          return (
            <div key={d.path} className="border-b border-line last:border-b-0">
              <button
                onClick={() => setExpanded((s) => ({ ...s, [d.path]: !open }))}
                className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-bg-2/50"
              >
                {open ? (
                  <ChevronDown className="h-3.5 w-3.5 text-fg-faint" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-fg-faint" />
                )}
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                    d.status === 'added' && 'bg-success/10 text-success',
                    d.status === 'deleted' && 'bg-danger/10 text-danger',
                    d.status === 'modified' && 'bg-warn/10 text-warn',
                    d.status === 'renamed' && 'bg-info/10 text-info',
                  )}
                >
                  {d.status}
                </span>
                <span className="truncate font-mono text-xs text-fg">{d.path}</span>
                <span className="ml-auto text-2xs text-fg-faint">
                  {d.hunks.length} hunk{d.hunks.length === 1 ? '' : 's'}
                </span>
              </button>
              {open && (
                <div className="bg-bg-0/40">
                  {d.hunks.map((h, hi) => (
                    <div key={hi} className="border-t border-line/60 font-mono text-2xs">
                      <div className="flex items-center gap-3 border-b border-line/40 bg-bg-2/30 px-3 py-1 text-fg-faint">
                        <span>@@ -{h.oldStart},{h.oldLines} +{h.newStart},{h.newLines} @@</span>
                      </div>
                      {h.lines.map((l, li) => (
                        <div
                          key={li}
                          className={cn(
                            'flex',
                            l.kind === 'add' && 'bg-success/[0.07]',
                            l.kind === 'del' && 'bg-danger/[0.07]',
                          )}
                        >
                          <span className="w-10 shrink-0 select-none px-1 py-px text-right text-fg-faint">
                            {l.oldLineNumber ?? ''}
                          </span>
                          <span className="w-10 shrink-0 select-none px-1 py-px text-right text-fg-faint">
                            {l.newLineNumber ?? ''}
                          </span>
                          <span
                            className={cn(
                              'w-4 select-none text-center',
                              l.kind === 'add' && 'text-success',
                              l.kind === 'del' && 'text-danger',
                            )}
                          >
                            {l.kind === 'add' ? '+' : l.kind === 'del' ? '-' : ' '}
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

      <div className="flex items-center gap-2 border-t border-line bg-bg-0/40 px-3 py-2">
        <Button variant="ghost" size="sm">
          <Minus className="h-3.5 w-3.5" /> Reject all
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm">
            Stage &amp; review
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" /> Apply all
          </Button>
        </div>
      </div>
    </div>
  );
}
