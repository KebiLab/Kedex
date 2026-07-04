import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Trash2, Plus, Eye, EyeOff, Globe, Check, AlertTriangle } from 'lucide-react';
import type { ProviderConfig, ProviderId } from '@shared/ipc';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import { cn } from '@/lib/utils';

interface Props {
  providers: ProviderConfig[];
  activeProviderId: ProviderId | null;
  onActivate: (id: ProviderId) => void;
  onSave: (p: ProviderConfig) => void;
  onRemove: (id: ProviderId) => void;
}

const PROVIDER_HINTS: Record<ProviderId, { url: string; keyLabel: string; keyHelp?: string }> = {
  openai: { url: 'https://api.openai.com/v1', keyLabel: 'OpenAI API key', keyHelp: 'sk-...' },
  anthropic: { url: 'https://api.anthropic.com', keyLabel: 'Anthropic API key', keyHelp: 'sk-ant-...' },
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
      <div className="space-y-2">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-fg">Connected providers</h3>
          <Button size="sm" variant="ghost">
            <Plus className="h-3.5 w-3.5" /> Add custom
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-line">
          {providers.map((p, i) => {
            const active = p.id === activeProviderId;
            const connected = !!p.apiKey || !p.requiresApiKey;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'group flex items-center gap-3 border-b border-line bg-bg-1/60 px-3 py-2.5 last:border-b-0 transition',
                  active && 'bg-accent-500/5',
                )}
              >
                <ProviderLogo provider={p.id} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-fg">{p.label}</span>
                    {active && (
                      <span className="rounded-full border border-accent-500/30 bg-accent-500/10 px-1.5 py-0.5 text-2xs text-accent-400">
                        active
                      </span>
                    )}
                    {connected ? (
                      <span className="inline-flex items-center gap-1 text-2xs text-success">
                        <Check className="h-3 w-3" /> connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-2xs text-warn">
                        <AlertTriangle className="h-3 w-3" /> missing key
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-2xs text-fg-faint">
                    <Globe className="h-3 w-3" />
                    <span className="font-mono">{p.baseUrl || '—'}</span>
                    <span>·</span>
                    <span>model: {p.defaultModel}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition group-hover:opacity-100">
                  {!active && (
                    <Button size="sm" variant="ghost" onClick={() => onActivate(p.id)}>
                      Use
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => open(p)}>
                    Configure
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onRemove(p.id)}
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.aside
        key={editing ?? 'empty'}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-xl border border-line bg-bg-1/60 p-4"
      >
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
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-fg-faint">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-dashed border-line text-fg-dim">
              <Key className="h-4 w-4" />
            </div>
            <p className="text-sm text-fg-muted">Select a provider to edit</p>
            <p className="mt-1 max-w-[240px] text-2xs text-fg-faint">
              API keys are stored in the OS keychain (Keychain on macOS, Credential Manager on Windows) via the Rust `keyring` module.
            </p>
          </div>
        )}
      </motion.aside>
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
      <div className="flex items-center gap-2">
        <ProviderLogo provider={draft.id} size={28} />
        <div>
          <div className="text-sm font-semibold text-fg">Edit {draft.label}</div>
          <div className="text-2xs text-fg-faint">Stored locally · encrypted at rest</div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="API key" hint={hint.keyHelp}>
          <div className="relative">
            <input
              type={reveal ? 'text' : 'password'}
              value={draft.apiKey ?? ''}
              onChange={(e) => onChange({ ...draft, apiKey: e.target.value })}
              placeholder={hint.keyLabel}
              className="input pr-9 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setReveal(!reveal)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-fg-faint hover:bg-bg-3 hover:text-fg"
            >
              {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </Field>

        <Field label="Base URL">
          <input
            value={draft.baseUrl ?? ''}
            onChange={(e) => onChange({ ...draft, baseUrl: e.target.value })}
            placeholder={hint.url}
            className="input font-mono text-xs"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Default model">
            <input
              value={draft.defaultModel}
              onChange={(e) => onChange({ ...draft, defaultModel: e.target.value })}
              className="input font-mono text-xs"
            />
          </Field>
          <Field label="Streaming">
            <select
              value={draft.streaming}
              onChange={(e) =>
                onChange({ ...draft, streaming: e.target.value as ProviderConfig['streaming'] })
              }
              className="input text-xs"
            >
              <option value="sse">Server-sent events</option>
              <option value="json">JSON</option>
              <option value="ollama">Ollama NDJSON</option>
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-line bg-bg-2/60 px-3 py-2">
          <div>
            <div className="text-xs font-medium text-fg">Auto-detect models</div>
            <div className="text-2xs text-fg-faint">Fetch the model list from the provider</div>
          </div>
          <Switch />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave}>
          Save changes
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
        <span className="text-2xs font-medium uppercase tracking-wider text-fg-faint">{label}</span>
        {hint && <span className="font-mono text-2xs text-fg-faint">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
