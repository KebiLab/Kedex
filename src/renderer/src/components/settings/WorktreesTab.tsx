import { useEffect, useState } from 'react';
import { GitBranch, Plus, Trash, ArrowsClockwise, CheckCircle, XCircle, CircleNotch } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/app';
import { uid } from '@/lib/utils';
import type { WorktreeInfo } from '@shared/ipc';

export function WorktreesTab() {
  const worktrees = useApp((s) => s.worktrees);
  const setWorktrees = useApp((s) => s.setWorktrees);
  const pushToast = useApp((s) => s.pushToast);
  const settings = useApp((s) => s.settings);
  const setSettings = useApp((s) => s.setSettings);
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState('');
  const [isRepo, setIsRepo] = useState<boolean | null>(null);
  const [cwd, setCwd] = useState('');

  useEffect(() => {
    void window.kedex
      ?.invoke<{ isRepo: boolean }>({ type: 'git/checkIsRepo', payload: {} })
      .then((r) => setIsRepo(r.isRepo))
      .catch(() => setIsRepo(false));
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = (await window.kedex.invoke({ type: 'worktree/list', payload: {} })) as WorktreeInfo[];
      setWorktrees(list);
    } catch (err) {
      pushToast({ tone: 'error', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const create = async () => {
    const name = branch.trim() || `kedex-${Date.now()}`;
    setLoading(true);
    try {
      const r = (await window.kedex.invoke({
        type: 'worktree/create',
        payload: { branch: name, cwd: cwd || undefined },
      })) as { ok: boolean; path?: string; error?: string };
      if (!r.ok) {
        pushToast({ tone: 'error', text: r.error ?? 'Failed' });
      } else {
        pushToast({ tone: 'success', text: `Worktree → ${r.path}` });
        setBranch('');
        await refresh();
      }
    } catch (err) {
      pushToast({ tone: 'error', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (path: string) => {
    setLoading(true);
    try {
      const r = (await window.kedex.invoke({
        type: 'worktree/remove',
        payload: { path, force: false },
      })) as { ok: boolean; error?: string };
      if (!r.ok) {
        pushToast({ tone: 'error', text: r.error ?? 'Failed' });
      } else {
        pushToast({ tone: 'success', text: 'Worktree removed' });
        await refresh();
      }
    } catch (err) {
      pushToast({ tone: 'error', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-medium text-fg">Worktrees</h2>
        <p className="mt-0.5 text-2xs text-fg-dim">
          Agent edits run inside an isolated git worktree so your main branch stays clean.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-bg-1 p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-warm/15 text-accent-warm">
            <GitBranch className="h-4 w-4" weight="fill" />
          </div>
          <div className="min-w-0 flex-1 text-xs text-fg-muted">
            <span className="text-fg">Always isolate agent edits</span> in a new git worktree.
            Disabled in <span className="font-mono">local</span> env.
            <div className="mt-1 text-2xs text-fg-dim">
              Current env: <span className="font-mono">{settings.env}</span>. Worktree path is auto-detected from the parent of the main repo.
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.worktreeIsolation}
            onChange={(e) => setSettings({ worktreeIsolation: e.target.checked })}
            className="h-4 w-4 accent-fg"
          />
        </div>
      </div>

      {isRepo === false && (
        <div className="rounded-xl border border-warn/30 bg-warn/10 p-4 text-2xs text-warn">
          Current directory is not a git repository. Worktrees are unavailable.
        </div>
      )}

      <div className="rounded-xl border border-line bg-bg-1 p-4">
        <div className="mb-3 text-sm font-medium text-fg">Create worktree</div>
        <div className="flex gap-2">
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="feature/awesome"
            className="input flex-1 font-mono text-xs"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={create}
            disabled={loading || isRepo === false}
          >
            {loading ? <CircleNotch className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" weight="bold" />}
            Create
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-2xs text-fg-dim">
          <span>Working dir:</span>
          <input
            value={cwd}
            onChange={(e) => setCwd(e.target.value)}
            placeholder="(default: cwd)"
            className="flex-1 rounded border border-line bg-bg-2 px-2 py-0.5 font-mono text-2xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        {worktrees.length === 0 && (
          <div className="grid place-items-center rounded-xl border border-dashed border-line py-10 text-sm text-fg-dim">
            No worktrees.
          </div>
        )}
        {worktrees.map((wt) => (
          <div
            key={wt.path}
            className="flex items-center gap-3 rounded-xl border border-line bg-bg-1 p-3"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-bg-2 text-fg-muted">
              <GitBranch className="h-4 w-4" weight="fill" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-fg">{wt.branch || 'detached'}</span>
                {wt.isMain && (
                  <span className="rounded-md bg-bg-2 px-1.5 py-0.5 text-2xs text-fg-dim">main</span>
                )}
              </div>
              <div className="truncate font-mono text-2xs text-fg-dim">{wt.path}</div>
              <div className="font-mono text-2xs text-fg-faint">{wt.commit.slice(0, 8)}</div>
            </div>
            {!wt.isMain && (
              <Button size="icon" variant="ghost" onClick={() => remove(wt.path)} aria-label="Remove">
                <Trash className="h-3.5 w-3.5" weight="bold" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button variant="secondary" size="sm" onClick={refresh} disabled={loading}>
        <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" /> Refresh
      </Button>
    </div>
  );
}
