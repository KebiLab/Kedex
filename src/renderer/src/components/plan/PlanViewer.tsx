import { useState } from 'react';
import {
  CheckCircle,
  Circle,
  CircleNotch,
  XCircle,
  SkipForward,
  Play,
  Plus,
} from '@phosphor-icons/react';
import type { Plan, PlanStep } from '@shared/ipc';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const STATUS_META: Record<PlanStep['status'], { icon: React.ReactNode }> = {
  pending: { icon: <Circle className="h-4 w-4" /> },
  running: { icon: <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> },
  success: { icon: <CheckCircle className="h-4 w-4" weight="fill" /> },
  failed: { icon: <XCircle className="h-4 w-4" weight="fill" /> },
  skipped: { icon: <SkipForward className="h-4 w-4" weight="fill" /> },
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
  const completed = plan.steps.filter((s) => s.status === 'success').length;

  const update = (id: string, patch: Partial<PlanStep>) =>
    onChange({ ...plan, steps: plan.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const remove = (id: string) =>
    onChange({ ...plan, steps: plan.steps.filter((s) => s.id !== id) });

  return (
    <div className="rounded-2xl border border-line bg-bg">
      <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium text-fg">{plan.title}</h3>
            <span className="text-2xs text-fg-dim">
              {completed}/{plan.steps.length}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onReject}>
          Reject
        </Button>
        <Button variant="primary" size="sm" onClick={onApprove}>
          <Play className="h-3.5 w-3.5" weight="fill" /> Approve
        </Button>
      </div>

      <div>
        {plan.steps.map((step, i) => {
          const meta = STATUS_META[step.status];
          const isEditing = editingId === step.id;
          return (
            <div
              key={step.id}
              className="group flex items-center gap-3 border-b border-line px-5 py-2.5 last:border-b-0 transition hover:bg-bg-1"
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line text-2xs text-fg-dim">
                {i + 1}
              </span>
              <button
                className={cn(
                  'grid h-4 w-4 shrink-0 place-items-center rounded-full text-fg-dim transition hover:text-fg',
                  step.status === 'success' && 'text-fg',
                  step.status === 'failed' && 'text-danger',
                )}
                onClick={() =>
                  update(step.id, {
                    status: step.status === 'success' ? 'pending' : 'success',
                  })
                }
                aria-label="Toggle"
              >
                {meta.icon}
              </button>
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
                  className="flex-1 rounded-md border border-line bg-bg px-2 py-1 text-sm text-fg focus:outline-none"
                />
              ) : (
                <div
                  onDoubleClick={() => setEditingId(step.id)}
                  className={cn(
                    'flex-1 cursor-text text-sm',
                    step.status === 'success' && 'text-fg-dim line-through',
                    step.status === 'failed' && 'text-danger',
                    step.status !== 'success' &&
                      step.status !== 'failed' &&
                      'text-fg',
                  )}
                >
                  {step.title}
                </div>
              )}
              <button
                onClick={() => remove(step.id)}
                className="text-2xs text-fg-dim opacity-0 transition group-hover:opacity-100 hover:text-danger"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-5 py-2.5">
        <Button variant="ghost" size="sm" onClick={onAddStep}>
          <Plus className="h-3.5 w-3.5" weight="bold" /> Add step
        </Button>
        <span className="text-2xs text-fg-dim">{plan.steps.length} steps</span>
      </div>
    </div>
  );
}

export function buildSamplePlan(): Plan {
  return {
    id: 'plan_demo',
    title: 'Refactor auth middleware to async/await',
    createdAt: new Date().toISOString(),
    steps: [
      { id: 's1', title: 'Inspect existing middleware and call sites', status: 'success', priority: 0, dependsOn: [] },
      { id: 's2', title: 'Draft new `withAuth` async wrapper signature', status: 'running', priority: 1, dependsOn: [] },
      { id: 's3', title: 'Add Postgres `sessions` table + RLS policy', status: 'pending', priority: 1, dependsOn: [] },
      { id: 's4', title: 'Write unit tests for happy + expired paths', status: 'pending', priority: 2, dependsOn: [] },
      { id: 's5', title: 'Run linter, typecheck, full test suite', status: 'pending', priority: 2, dependsOn: [] },
    ],
  };
}
