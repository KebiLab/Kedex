import { useCallback, useRef, useState } from 'react';
import { Paperclip, Square, Microphone, PaperPlaneTilt, X, FileText, FileCode, Image as ImageIcon } from '@phosphor-icons/react';
import { useApp } from '@/store/app';
import { cn, uid } from '@/lib/utils';
import type { AgentMode } from '@shared/ipc';
import { ModeMenu } from './ModeMenu';
import { ModelMenu } from './ModelMenu';
import { readFile, formatBytes, type AttachedFile } from '@/lib/attachments';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function PromptArea() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<AgentMode>('plan');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMessage = useApp((s) => s.addMessage);
  const activeThreadId = useApp((s) => s.activeThreadId);
  const setStreaming = useApp((s) => s.setStreaming);
  const isStreaming = useApp((s) => s.isStreaming);
  const appendStream = useApp((s) => s.appendStream);
  const finishStream = useApp((s) => s.finishStream);
  const activeModel = useApp((s) => s.activeModel);
  const activeProviderId = useApp((s) => s.activeProviderId);
  const providers = useApp((s) => s.providers);
  const setActiveProvider = useApp((s) => s.setActiveProvider);

  const addFiles = useCallback(async (incoming: FileList | File[]) => {
    const next: AttachedFile[] = [];
    for (const f of Array.from(incoming)) {
      if (f.size > MAX_FILE_BYTES) continue;
      try {
        next.push(await readFile(f));
      } catch {
        // ignore
      }
    }
    if (next.length) setFiles((cur) => [...cur, ...next]);
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === 'file') {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        addFiles(files);
      }
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const removeFile = (id: string) => setFiles((cur) => cur.filter((f) => f.id !== id));

  const submit = () => {
    const value = text.trim();
    if (!value || !activeThreadId) return;
    const attachmentNote = files.length
      ? `\n\n[Attached: ${files.map((f) => f.name).join(', ')}]`
      : '';
    addMessage(activeThreadId, {
      id: uid('m'),
      role: 'user',
      content: value + attachmentNote,
      createdAt: Date.now(),
    });
    setText('');
    setFiles([]);
    setStreaming(true);
    const demo =
      "Got it. I'll start by mapping the current schema, then propose a migration that adds `workspace_id` to every table and rewrites the RLS policies to scope by it.";
    let i = 0;
    const tick = () => {
      i += 4;
      appendStream(demo.slice(0, i));
      if (i < demo.length) requestAnimationFrame(tick);
      else finishStream();
    };
    requestAnimationFrame(tick);
  };

  const liteProviders = providers.map((p) => ({
    id: p.id,
    label: p.label,
    defaultModel: p.defaultModel,
  }));

  return (
    <div className="px-6 pb-10">
      <div className="mx-auto w-full max-w-3xl">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'rounded-2xl border bg-bg-1 shadow-soft transition',
            dragOver
              ? 'border-fg/40 ring-2 ring-fg/20'
              : 'border-line focus-within:border-fg/20 focus-within:shadow-pop',
          )}
        >
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {files.map((f) => (
                <FileChip key={f.id} file={f} onRemove={() => removeFile(f.id)} />
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
            }}
            placeholder="Ask Codex Anything…  ·  paste images or drop files"
            rows={files.length > 0 ? 1 : 2}
            className="block max-h-[280px] min-h-[60px] w-full resize-none bg-transparent px-6 pt-4 pb-3 text-[15px] leading-7 text-fg placeholder:text-fg-dim focus:outline-none"
          />

          <div className="flex items-center gap-1.5 px-3 pb-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              className="grid h-8 w-8 place-items-center rounded-lg text-fg-muted transition hover:bg-bg-2 hover:text-fg"
              aria-label="Attach"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" weight="bold" />
            </button>

            <ModeMenu value={mode} onChange={setMode} />

            <ModelMenu
              value={activeProviderId}
              onChange={(id) => setActiveProvider(id, activeModel)}
              providers={liteProviders}
              activeModel={activeModel}
            />

            <div className="ml-auto flex items-center gap-1.5">
              <button
                className="grid h-8 w-8 place-items-center rounded-lg text-fg-muted transition hover:bg-bg-2 hover:text-fg"
                aria-label="Voice"
                title="Hold to dictate"
              >
                <Microphone className="h-4 w-4" weight="fill" />
              </button>
              {isStreaming ? (
                <button
                  onClick={finishStream}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-fg text-bg-0 transition hover:bg-fg/90"
                  aria-label="Stop"
                >
                  <Square className="h-3 w-3" weight="fill" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!text.trim()}
                  className={cn(
                    'grid h-8 w-8 place-items-center rounded-lg transition',
                    text.trim()
                      ? 'bg-fg text-bg-0 hover:bg-fg/90'
                      : 'bg-bg-2 text-fg-dim',
                  )}
                  aria-label="Send"
                >
                  <PaperPlaneTilt className="h-4 w-4" weight="fill" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileChip({ file, onRemove }: { file: AttachedFile; onRemove: () => void }) {
  const Icon = file.kind === 'image' ? ImageIcon : /\.(ts|tsx|js|jsx|json|py|rs|go|html|css)$/i.test(file.name) ? FileCode : FileText;
  return (
    <div className="group flex items-center gap-2 rounded-lg border border-line bg-bg-2 p-1.5">
      {file.kind === 'image' ? (
        <img
          src={file.preview}
          alt={file.name}
          className="h-10 w-10 rounded-md object-cover"
        />
      ) : (
        <div className="grid h-10 w-10 place-items-center rounded-md bg-bg-3 text-fg-muted">
          <Icon className="h-4 w-4" weight="fill" />
        </div>
      )}
      <div className="min-w-0 pr-1">
        <div className="max-w-[160px] truncate text-xs text-fg">{file.name}</div>
        <div className="text-2xs text-fg-dim">{formatBytes(file.size)}</div>
      </div>
      <button
        onClick={onRemove}
        className="grid h-6 w-6 place-items-center rounded-md text-fg-dim transition hover:bg-bg-3 hover:text-fg"
        aria-label="Remove"
      >
        <X className="h-3 w-3" weight="bold" />
      </button>
    </div>
  );
}
