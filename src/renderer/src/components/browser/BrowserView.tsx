import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Camera, PenNib, Square, X, ArrowsClockwise, ArrowSquareOut } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/app';

export function BrowserView() {
  const open = useApp((s) => s.browserOpen);
  const setOpen = useApp((s) => s.setBrowserOpen);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <DialogContent size="xl" className="overflow-hidden p-0">
            <DialogHeader className="px-5 py-2.5">
              <div className="absolute right-3 top-3 flex items-center gap-1.5">
                <Button size="icon" variant="ghost" aria-label="Reload">
                  <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Open externally">
                  <ArrowSquareOut className="h-3.5 w-3.5" weight="bold" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-3.5 w-3.5" weight="bold" />
                </Button>
              </div>
              <DialogTitle className="text-sm">localhost:3000</DialogTitle>
            </DialogHeader>

            <div className="flex h-[60vh] min-h-[420px] border-t border-line">
              <div className="relative flex-1 overflow-hidden bg-white">
                <ScreenshotMock />
              </div>
              <aside className="w-64 shrink-0 border-l border-line p-3">
                <div className="mb-2 text-2xs font-medium uppercase tracking-wider text-fg-dim">
                  Tools
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { icon: <Camera className="h-3.5 w-3.5" weight="fill" />, label: 'Snap' },
                    { icon: <PenNib className="h-3.5 w-3.5" weight="fill" />, label: 'Draw' },
                    { icon: <Square className="h-3.5 w-3.5" weight="fill" />, label: 'Box' },
                  ].map((t) => (
                    <button
                      key={t.label}
                      className="flex flex-col items-center gap-1 rounded-xl border border-line px-2 py-2 text-2xs text-fg-muted transition hover:border-line-strong hover:text-fg"
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 mb-1 text-2xs font-medium uppercase tracking-wider text-fg-dim">
                  Annotations
                </div>
                <div className="space-y-1.5">
                  {[
                    { color: 'bg-danger', label: 'Header misaligned', coord: '128, 64' },
                    { color: 'bg-warn', label: 'Contrast too low', coord: '420, 220' },
                  ].map((a) => (
                    <div
                      key={a.label}
                      className="flex items-center gap-2 rounded-xl border border-line px-2 py-1.5 text-2xs"
                    >
                      <span className={`h-2 w-2 rounded-full ${a.color}`} />
                      <span className="flex-1 truncate text-fg">{a.label}</span>
                      <span className=" text-fg-dim">{a.coord}</span>
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

function ScreenshotMock() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-10 border-b border-black/5 bg-black/[0.02]">
        <div className="flex h-full items-center gap-3 px-4 text-2xs text-black/40">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          </div>
          <span className="">localhost:3000</span>
        </div>
      </div>

      <div className="absolute inset-x-0 top-10 bottom-0 p-6">
        <div className="mx-auto max-w-md space-y-3">
          <div className="h-3 w-2/3 rounded bg-black/10" />
          <div className="h-3 w-1/2 rounded bg-black/10" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-20 rounded-md border border-black/5 bg-black/[0.03]" />
            <div className="h-20 rounded-md border border-black/5 bg-black/[0.03]" />
            <div className="h-20 rounded-md border border-black/5 bg-black/[0.03]" />
            <div className="h-20 rounded-md border border-black/5 bg-black/[0.03]" />
          </div>
          <div className="h-8 w-32 rounded-md border border-black/10 bg-black/[0.05]" />
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 220, damping: 18 }}
        className="absolute left-20 top-20 h-16 w-28 rounded-md border-2 border-danger/80 bg-danger/10"
      >
        <div className="absolute -top-6 left-0 rounded-md bg-danger/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
          Misaligned 6px
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute left-72 top-48 h-10 w-32 rounded-md border-2 border-warn/80 bg-warn/10"
      >
        <div className="absolute -top-6 left-0 rounded-md bg-warn/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
          Contrast 3.1:1
        </div>
      </motion.div>
    </div>
  );
}
