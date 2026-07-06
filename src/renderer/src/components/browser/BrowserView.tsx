import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Camera, PenNib, Square, X, ArrowsClockwise, ArrowSquareOut, ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/app';

const ANNOTATIONS = [
  { id: 'a1', color: 'bg-danger', label: 'Header misaligned', coord: '128, 64' },
  { id: 'a2', color: 'bg-warn', label: 'Contrast too low', coord: '420, 220' },
];

export function BrowserView() {
  const open = useApp((s) => s.browserOpen);
  const setOpen = useApp((s) => s.setBrowserOpen);
  const [url, setUrl] = useState('http://localhost:3000');
  const [input, setInput] = useState(url);
  const [commenting, setCommenting] = useState(false);
  const [history, setHistory] = useState<string[]>([url]);
  const [idx, setIdx] = useState(0);

  const go = (next: string) => {
    if (!/^https?:\/\//.test(next)) next = 'https://' + next;
    const nh = history.slice(0, idx + 1);
    nh.push(next);
    setHistory(nh);
    setIdx(nh.length - 1);
    setUrl(next);
    setInput(next);
  };

  const back = () => {
    if (idx === 0) return;
    const i = idx - 1;
    setIdx(i);
    setUrl(history[i]);
    setInput(history[i]);
  };
  const fwd = () => {
    if (idx === history.length - 1) return;
    const i = idx + 1;
    setIdx(i);
    setUrl(history[i]);
    setInput(history[i]);
  };
  const reload = () => {
    setUrl((u) => u + '#r=' + Date.now());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <DialogContent size="xl" className="overflow-hidden p-0">
            <DialogHeader className="px-4 py-2.5">
              <div className="absolute right-3 top-3 flex items-center gap-1.5">
                <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-3.5 w-3.5" weight="bold" />
                </Button>
              </div>
              <DialogTitle className="flex items-center gap-2 text-sm">
                <Globe className="h-3.5 w-3.5 text-fg-muted" weight="fill" />
                Browser
              </DialogTitle>
            </DialogHeader>

            <div className="flex h-[60vh] min-h-[420px] border-t border-line">
              <div className="relative flex-1 overflow-hidden bg-bg-1">
                <div className="flex items-center gap-1.5 border-b border-line bg-bg-0/60 px-3 py-2">
                  <Button size="icon" variant="ghost" onClick={back} disabled={idx === 0} aria-label="Back">
                    <ArrowLeft className="h-3.5 w-3.5" weight="bold" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={fwd}
                    disabled={idx === history.length - 1}
                    aria-label="Forward"
                  >
                    <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={reload} aria-label="Reload">
                    <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
                  </Button>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      go(input);
                    }}
                    className="flex flex-1 items-center gap-2 rounded-md border border-line bg-bg-2 px-2.5 py-1"
                  >
                    <Globe className="h-3.5 w-3.5 text-fg-dim" />
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-fg placeholder:text-fg-faint focus:outline-none"
                      placeholder="Search or enter address"
                    />
                  </form>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => window.kedex.invoke({ type: 'app/openExternal', payload: { url } })}
                    aria-label="Open externally"
                  >
                    <ArrowSquareOut className="h-3.5 w-3.5" weight="bold" />
                  </Button>
                </div>

                <div className="absolute inset-0 top-[45px]">
                  <iframe
                    key={url}
                    src={url}
                    title="Browser"
                    className="h-full w-full bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                  {ANNOTATIONS.map((a) => (
                    <motion.div
                      key={a.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`pointer-events-none absolute h-16 w-28 rounded-md border-2 ${a.color}/80 ${a.color}/10`}
                      style={{ left: a.coord.split(',')[0] + 'px', top: a.coord.split(',')[1] + 'px' }}
                    >
                      <div className={`absolute -top-6 left-0 rounded-md ${a.color} px-1.5 py-0.5 text-[10px] font-medium text-white`}>
                        {a.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <aside className="w-64 shrink-0 border-l border-line p-3">
                <div className="mb-2 text-2xs font-medium uppercase tracking-wider text-fg-dim">Tools</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <ToolButton active={commenting} onClick={() => setCommenting((v) => !v)} icon={<Camera className="h-3.5 w-3.5" weight="fill" />} label="Snap" />
                  <ToolButton active={commenting} onClick={() => setCommenting((v) => !v)} icon={<PenNib className="h-3.5 w-3.5" weight="fill" />} label="Draw" />
                  <ToolButton icon={<Square className="h-3.5 w-3.5" weight="fill" />} label="Box" />
                </div>

                <div className="mt-4 mb-1 text-2xs font-medium uppercase tracking-wider text-fg-dim">Annotations</div>
                <div className="space-y-1.5">
                  {ANNOTATIONS.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 rounded-xl border border-line px-2 py-1.5 text-2xs">
                      <span className={`h-2 w-2 rounded-full ${a.color}`} />
                      <span className="flex-1 truncate text-fg">{a.label}</span>
                      <span className="font-mono text-fg-dim">{a.coord}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

function ToolButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-2xs transition ' +
        (active
          ? 'border-fg/40 bg-bg-2 text-fg'
          : 'border-line bg-bg-0 text-fg-muted hover:border-line-strong hover:text-fg')
      }
    >
      {icon}
      {label}
    </button>
  );
}
