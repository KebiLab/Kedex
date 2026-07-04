import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Check, X } from '@phosphor-icons/react';
import { useApp } from '@/store/app';
import { Button } from '@/components/ui/Button';

export function ApprovalBar() {
  const approval = useApp((s) => s.pendingApproval);
  const setApproval = useApp((s) => s.setPendingApproval);
  return (
    <AnimatePresence>
      {approval && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="border-b border-line bg-bg-2"
        >
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-2.5">
            <Terminal className="h-4 w-4 shrink-0 text-fg-muted" weight="fill" />
            <div className="min-w-0 flex-1">
              <div className="text-2xs text-fg-muted">Shell approval required</div>
              <div className="truncate  text-xs text-fg">{approval.command}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setApproval(null)}>
              <X className="h-3.5 w-3.5" weight="bold" /> Deny
            </Button>
            <Button variant="primary" size="sm" onClick={() => setApproval(null)}>
              <Check className="h-3.5 w-3.5" weight="bold" /> Allow
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
