import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, ShieldX } from 'lucide-react';
import { useApp } from '@/store/app';
import { Button } from '@/components/ui/Button';

export function ApprovalBar() {
  const approval = useApp((s) => s.pendingApproval);
  const setApproval = useApp((s) => s.setPendingApproval);
  return (
    <AnimatePresence>
      {approval && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="border-b border-line bg-gradient-to-b from-warn/10 to-bg-1/60 backdrop-blur"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg border border-warn/40 bg-warn/10 text-warn">
              <Terminal className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-2xs font-medium uppercase tracking-wider text-warn">
                Shell approval required
              </div>
              <div className="truncate font-mono text-xs text-fg">{approval.command}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setApproval(null);
              }}
            >
              <ShieldX className="h-3.5 w-3.5" /> Deny
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setApproval(null);
              }}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Allow
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
