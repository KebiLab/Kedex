import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '@/store/app';

export function Toaster() {
  const toasts = useApp((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon =
            t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? AlertCircle : Info;
          const accent =
            t.tone === 'success'
              ? 'text-success border-success/30'
              : t.tone === 'error'
                ? 'text-danger border-danger/30'
                : 'text-info border-info/30';
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
              className={`pointer-events-auto flex items-center gap-2 rounded-lg border bg-bg-2/95 px-3 py-2 text-sm text-fg shadow-soft backdrop-blur ${accent}`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
