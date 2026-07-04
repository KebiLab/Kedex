import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, WarningCircle, Info } from '@phosphor-icons/react';
import { useApp } from '@/store/app';

export function Toaster() {
  const toasts = useApp((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = t.tone === 'success' ? CheckCircle : t.tone === 'error' ? WarningCircle : Info;
          const color =
            t.tone === 'success'
              ? 'text-success border-success/30'
              : t.tone === 'error'
                ? 'text-danger border-danger/30'
                : 'text-info border-info/30';
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={`pointer-events-auto flex items-center gap-2 rounded-md border bg-bg px-3 py-2 text-sm text-fg shadow-soft ${color}`}
            >
              <Icon className="h-4 w-4" weight="fill" />
              <span>{t.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
