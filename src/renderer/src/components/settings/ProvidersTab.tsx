import { useState } from 'react';
import { Key, Eye, EyeSlash } from '@phosphor-icons/react';
import type { ProviderConfig, ProviderId } from '@shared/ipc';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils';

interface Props {
  providers: ProviderConfig[];
  activeProviderId: ProviderId | null;
  onActivate: (id: ProviderId) => void;
  onSave: (p: ProviderConfig) => void;
  onRemove: (id: ProviderId) => void;
}

const PROVIDER_HINTS: Record<ProviderId, { url: string; keyLabel: string; keyHelp?: string }> = {
  openai: { url: 'https://api.openai.com/v1', keyLabel: 'OpenAI API key', keyHelp: 'sk-…' },
  anthropic: { url: 'https://api.anthropic.com', keyLabel: 'Anthropic API key', keyHelp: 'sk-ant-…' },
  gemini: { url: 'https://generativelanguage.googleapis.com', keyLabel: 'Google AI API key' },
  deepseek: { url: 'https://api.deepseek.com/v1', keyLabel: 'DeepSeek API key' },
  mistral: { url: 'https://api.mistral.ai/v1', keyLabel: 'Mistral API key' },
  ollama: { url: 'http://localhost:11434', keyLabel: 'API key (optional)' },
  custom: { url: '', keyLabel: 'API key (optional)' },
};

export function ProvidersTab({ providers, activeProviderId, onActivate, onSave, onRemove }: Props) {
  const [editing, setEditing] = useState<ProviderId | null>(null);
  const [draft, setDraft] = useState<ProviderConfig | null>(null);
  const [reveal, setReveal] = useState(false);

  const open = (p: ProviderConfig) => {
    setEditing(p.id);
    setDraft({ ...p });
    setReveal(false);
  };
  const close = () => {
    setEditing(null);
    setDraft(null);
  };
  const save = () => {
    if (!draft) return;
    onSave(draft);
    close();
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-2xl border border-line">
        {providers.map((p, i) => {
          const active = p.id === activeProviderId;
          const connected = !!p.apiKey || !p.requiresApiKey;
          return (
            <div
              key={p.id}
              className={cn(
                'flex items-center gap-3 border-b border-line bg-bg px-4 py-3 last:border-b-0',
                i === 0 && 'rounded-t-2xl',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-fg">{p.label}</span>
                  {active && <span className="text-2xs text-fg-muted">active</span>}
                  {connected ? (
                    <span className="text-2xs text-fg-dim">connected</span>
                  ) : (
                    <span className="text-2xs text-warn">missing key</span>
                  )}
                </div>
                <div className="mt-0.5 truncate  text-2xs text-fg-dim">
                  {p.baseUrl || '—'} · {p.defaultModel}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!active && (
                  <Button size="sm" variant="ghost" onClick={() => onActivate(p.id)}>
                    Use
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => open(p)}>
                  Configure
                </Button>
                <Button size="sm" variant="danger" onClick={() => onRemove(p.id)}>
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="rounded-2xl border border-line bg-bg p-4">
        {draft ? (
          <ProviderEditor
            draft={draft}
            reveal={reveal}
            setReveal={setReveal}
            onChange={setDraft}
            onCancel={close}
            onSave={save}
          />
        ) : (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
            <Key className="mb-2 h-5 w-5 text-fg-dim" weight="fill" />
            <p className="text-sm text-fg-muted">Select a provider to edit</p>
            <p className="mt-1 max-w-[240px] text-2xs text-fg-dim">
              API keys are stored in the OS keychain via the Rust `keyring` module.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function ProviderEditor({
  draft,
  reveal,
  setReveal,
  onChange,
  onCancel,
  onSave,
}: {
  draft: ProviderConfig;
  reveal: boolean;
  setReveal: (b: boolean) => void;
  onChange: (p: ProviderConfig) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const hint = PROVIDER_HINTS[draft.id];
  return (
    <div className="flex h-full flex-col">
      <div>
        <div className="text-sm font-medium text-fg">{draft.label}</div>
        <div className="text-2xs text-fg-dim">Stored locally · encrypted at rest</div>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="API key" hint={hint.keyHelp}>
          <div className="relative">
            <input
              type={reveal ? 'text' : 'password'}
              value={draft.apiKey ?? ''}
              onChange={(e) => onChange({ ...draft, apiKey: e.target.value })}
              placeholder={hint.keyLabel}
              className="input pr-9  text-xs"
            />
            <button
              type="button"
              onClick={() => setReveal(!reveal)}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded text-fg-dim hover:bg-bg-2 hover:text-fg"
            >
              {reveal ? <EyeSlash className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" weight="fill" />}
            </button>
          </div>
        </Field>

        <Field label="Base URL">
          <input
            value={draft.baseUrl ?? ''}
            onChange={(e) => onChange({ ...draft, baseUrl: e.target.value })}
            placeholder={hint.url}
            className="input  text-xs"
          />
        </Field>

        <Field label="Default model">
          <input
            value={draft.defaultModel}
            onChange={(e) => onChange({ ...draft, defaultModel: e.target.value })}
            className="input  text-xs"
          />
        </Field>

        <div className="flex items-center justify-between rounded-xl border border-line bg-bg-1 px-3 py-2.5">
          <div>
            <div className="text-xs font-medium text-fg">Auto-detect models</div>
            <div className="text-2xs text-fg-dim">Fetch the model list from the provider</div>
          </div>
          <Switch />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-2xs font-medium uppercase tracking-wider text-fg-dim">{label}</span>
        {hint && <span className=" text-2xs text-fg-dim">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
