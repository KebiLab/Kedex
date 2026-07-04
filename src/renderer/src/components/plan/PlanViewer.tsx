import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  SkipForward,
  Play,
  Pause,
  Pencil,
  Trash2,
  GripVertical,
  Plus,
  Wand2,
} from 'lucide-react';
import type { Plan, PlanStep } from '@shared/ipc';
import { cn, uid } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const STATUS_META: Record<PlanStep['status'], { icon: React.ReactNode; tone: string }> = {
  pending: { icon: <Circle className="h-3.5 w-3.5" />, tone: 'text-fg-faint' },
  running: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, tone: 'text-accent-400' },
  success: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, tone: 'text-success' },
  failed: { icon: <XCircle className="h-3.5 w-3.5" />, tone: 'text-danger' },
  skipped: { icon: <SkipForward className="h-3.5 w-3.5" />, tone: 'text-fg-faint' },
};

export function PlanViewer({
  plan,
  onChange,
  onApprove,
  onReject,
  onAddStep,
}: {
  plan: Plan;
  onChange: (p: Plan) => void;
  onApprove: () => void;
  onReject: () => void;
  onAddStep: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<PlanStep>) => {
    onChange({
      ...plan,
      steps: plan.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const remove = (id: string) => {
    onChange({ ...plan, steps: plan.steps.filter((s) => s.id !== id) });
  };

  const reorder = (next: PlanStep[]) => onChange({ ...plan, steps: next });

  const completed = plan.steps.filter((s) => s.status === 'success').length;

  return (
    <div className="rounded-2xl border border-line bg-bg-1/80 shadow-soft backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="grid h-7 w-7 place-items-center rounded-lg border border-accent-500/30 bg-accent-500/10 text-accent-400">
          <Wand2 className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-fg">{plan.title}</h3>
            <span className="pill">
              {completed}/{plan.steps.length} done
            </span>
          </div>
          <div className="mt-0.5 truncate text-2xs text-fg-faint">
            Plan ID <span className="font-mono">{plan.id.slice(0, 8)}</span> · created{' '}
            {new Date(plan.createdAt).toLocaleString()}
          </div>
        </div>

        <Button variant="ghost" size="sm">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button variant="primary" size="sm" onClick={onApprove}>
          <Play className="h-3.5 w-3.5" /> Approve &amp; run
        </Button>
      </div>

      <div className="relative">
        <div className="absolute left-[26px] top-2 bottom-2 w-px bg-line" />
        <Reorder.Group axis="y" values={plan.steps} onReorder={reorder} className="flex flex-col">
          {plan.steps.map((step, i) => {
            const meta = STATUS_META[step.status];
            const isEditing = editingId === step.id;
            return (
              <Reorder.Item
                key={step.id}
                value={step}
                className="group relative flex items-start gap-3 px-4 py-2.5 transition hover:bg-bg-2/40"
              >
                <div className="z-10 grid h-5 w-5 shrink-0 translate-y-1 place-items-center rounded-full border border-line-strong bg-bg-1 text-fg-faint">
                  <span className="font-mono text-[9px]">{i + 1}</span>
                </div>

                <button
                  className={cn(
                    'mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full transition',
                    meta.tone,
                  )}
                  onClick={() =>
                    update(step.id, {
                      status:
                        step.status === 'success'
                          ? 'pending'
                          : step.status === 'pending'
                            ? 'success'
                            : 'pending',
                    })
                  }
                  aria-label="Toggle step status"
                >
                  {meta.icon}
                </button>

                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      autoFocus
                      defaultValue={step.title}
                      onBlur={(e) => {
                        update(step.id, { title: e.target.value });
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className="w-full rounded-md border border-accent-500/40 bg-bg-0 px-2 py-1 text-sm text-fg focus:outline-none"
                    />
                  ) : (
                    <div
                      onDoubleClick={() => setEditingId(step.id)}
                      className={cn(
                        'cursor-text text-sm',
                        step.status === 'success' && 'text-fg-muted line-through',
                        step.status === 'failed' && 'text-danger',
                        step.status !== 'success' && step.status !== 'failed' && 'text-fg',
                      )}
                    >
                      {step.title}
                    </div>
                  )}
                  <div className="mt-0.5 flex items-center gap-2 text-2xs text-fg-faint">
                    <span className="font-mono">{step.id.slice(0, 6)}</span>
                    <span>·</span>
                    <span>priority {step.priority}</span>
                    {step.dependsOn.length > 0 && (
                      <>
                        <span>·</span>
                        <span>depends on {step.dependsOn.length}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <span className="cursor-grab text-fg-faint">
                    <GripVertical className="h-3.5 w-3.5" />
                  </span>
                  <button
                    onClick={() => setEditingId(step.id)}
                    className="rounded p-1 text-fg-faint hover:bg-bg-3 hover:text-fg"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => remove(step.id)}
                    className="rounded p-1 text-fg-faint hover:bg-bg-3 hover:text-danger"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
        <Button variant="ghost" size="sm" onClick={onAddStep}>
          <Plus className="h-3.5 w-3.5" /> Add step
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReject}>
            <Pause className="h-3.5 w-3.5" /> Reject
          </Button>
          <Button variant="primary" size="sm" onClick={onApprove}>
            <Play className="h-3.5 w-3.5" /> Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

export function buildSamplePlan(): Plan {
  return {
    id: uid('plan'),
    title: 'Refactor auth middleware to use async/await',
    createdAt: new Date().toISOString(),
    steps: [
      { id: uid('s'), title: 'Inspect existing middleware and call sites', status: 'success', priority: 0, dependsOn: [] },
      { id: uid('s'), title: 'Draft new `withAuth` async wrapper signature', status: 'running', priority: 1, dependsOn: [] },
      { id: uid('s'), title: 'Add Postgres `sessions` table + RLS policy', status: 'pending', priority: 1, dependsOn: [] },
      { id: uid('s'), title: 'Write unit tests for happy + expired paths', status: 'pending', priority: 2, dependsOn: [] },
      { id: uid('s'), title: 'Run linter, typecheck, full test suite', status: 'pending', priority: 2, dependsOn: [] },
    ],
  };
}
