import { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  Lock,
  ArrowsClockwise,
  Camera,
  Cursor,
  Plus,
  Trash,
  CheckCircle,
  XCircle,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useApp } from '@/store/app';
import { cn } from '@/lib/utils';

interface DomainRule {
  id: string;
  pattern: string;
  action: 'allow' | 'block';
}

const SEED_RULES: DomainRule[] = [
  { id: 'r1', pattern: 'localhost', action: 'allow' },
  { id: 'r2', pattern: '127.0.0.1', action: 'allow' },
  { id: 'r3', pattern: '*.openai.com', action: 'allow' },
  { id: 'r4', pattern: '*.anthropic.com', action: 'allow' },
];

export function BrowserSettingsTab() {
  const setSettings = useApp((s) => s.setSettings);
  const settings = useApp((s) => s.settings);
  const setBrowserOpen = useApp((s) => s.setBrowserOpen);
  const pushToast = useApp((s) => s.pushToast);
  const [rules, setRules] = useState<DomainRule[]>(SEED_RULES);
  const [newPattern, setNewPattern] = useState('');
  const [newAction, setNewAction] = useState<'allow' | 'block'>('allow');

  const addRule = () => {
    const p = newPattern.trim();
    if (!p) return;
    setRules((r) => [...r, { id: `r_${Date.now()}`, pattern: p, action: newAction }]);
    setNewPattern('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-medium text-fg">Browser</h2>
        <p className="mt-0.5 text-2xs text-fg-dim">
          Built-in browser for opening local dev URLs and previewing changes. Runs in a sandboxed
          iframe with explicit domain allow/block rules.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-bg-1 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-warm/15 text-accent-warm">
            <Globe className="h-4 w-4" weight="fill" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-fg">Enable built-in browser</div>
            <p className="mt-0.5 text-2xs text-fg-dim">
              Show the Browser panel in the app for opening localhost URLs and capturing screenshots
              during review.
            </p>
          </div>
          <Switch
            checked={settings.env !== 'cloud'}
            onCheckedChange={(b) => {
              if (b) setSettings({ env: 'worktree' });
              pushToast({ tone: 'info', text: 'Browser panel is always available' });
            }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={() => setBrowserOpen(true)}>
            <Globe className="h-3.5 w-3.5" weight="fill" /> Open browser
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              try {
                await window.kedex.invoke({
                  type: 'app/openExternal',
                  payload: { url: 'http://localhost:3000' },
                });
              } catch (err) {
                pushToast({ tone: 'error', text: (err as Error).message });
              }
            }}
          >
            <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" /> Open localhost in system
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-bg-1 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-fg">
          <ShieldCheck className="h-4 w-4 text-fg-muted" weight="fill" />
          Sandbox & permissions
        </div>
        <div className="space-y-2">
          <ToggleRow
            icon={<Lock className="h-3.5 w-3.5" weight="fill" />}
            label="Sandboxed iframe"
            description="Browser panel uses a sandboxed iframe (allow-scripts allow-same-origin allow-forms)."
            checked
            onChange={() => undefined}
            disabled
          />
          <ToggleRow
            icon={<Camera className="h-3.5 w-3.5" weight="fill" />}
            label="Allow screenshots"
            description="Agent can capture screenshots of the current page when running in Build/Goal mode."
            checked
            onChange={() => undefined}
          />
          <ToggleRow
            icon={<Cursor className="h-3.5 w-3.5" weight="fill" />}
            label="Allow form input"
            description="Agent can fill and submit forms (disabled blocks all input/click events)."
            checked={false}
            onChange={() => undefined}
          />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-bg-1 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-fg">
          <Globe className="h-4 w-4 text-fg-muted" weight="fill" />
          Domain rules
        </div>
        <p className="mb-3 text-2xs text-fg-dim">
          Allow or block origins the agent can navigate to. Patterns support <code>*</code> as a
          wildcard.
        </p>

        <div className="space-y-1.5">
          {rules.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 rounded-md border border-line bg-bg-2 px-2.5 py-1.5"
            >
              {r.action === 'allow' ? (
                <CheckCircle className="h-3.5 w-3.5 text-success" weight="fill" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-danger" weight="fill" />
              )}
              <span className="font-mono text-xs text-fg">{r.pattern}</span>
              <span className="ml-auto text-2xs text-fg-dim">{r.action}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setRules((s) => s.filter((x) => x.id !== r.id))}
                aria-label="Remove"
              >
                <Trash className="h-3 w-3" weight="bold" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={newPattern}
            onChange={(e) => setNewPattern(e.target.value)}
            placeholder="*.example.com"
            className="input flex-1 font-mono text-xs"
          />
          <select
            value={newAction}
            onChange={(e) => setNewAction(e.target.value as 'allow' | 'block')}
            className="h-9 rounded-md border border-line bg-bg-2 px-2 text-xs text-fg"
          >
            <option value="allow" className="bg-bg-1">allow</option>
            <option value="block" className="bg-bg-1">block</option>
          </select>
          <Button size="sm" variant="primary" onClick={addRule}>
            <Plus className="h-3.5 w-3.5" weight="bold" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (b: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border border-line bg-bg-2/40 px-3 py-2.5',
        disabled && 'opacity-70',
      )}
    >
      <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded bg-bg-3 text-fg-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-fg">{label}</div>
        <div className="text-2xs text-fg-dim">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
