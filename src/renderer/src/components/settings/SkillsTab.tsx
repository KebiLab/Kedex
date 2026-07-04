import { useState } from 'react';
import { MagnifyingGlass, Plus, PlusCircle, CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or short label
  installed: boolean;
  source: 'personal' | 'openai' | 'system';
}

const SKILLS: Skill[] = [
  { id: 's1', name: 'skill-creator', description: 'Create or update a skill', icon: '🎨', installed: true, source: 'openai' },
  { id: 's2', name: 'skill-installer', description: 'Install curated skills from openai/skills or other repos', icon: '📦', installed: true, source: 'openai' },

  { id: 's3', name: 'atlas', description: 'Use the bundled CLI to control Atlas and inspect local browser data.', icon: '🧭', installed: false, source: 'openai' },
  { id: 's4', name: 'cloudflare-deploy', description: 'Deploy Workers, Pages, and platform services on Cloudflare', icon: '☁️', installed: false, source: 'openai' },
  { id: 's5', name: 'develop-web-game', description: 'Web game dev + Playwright test loop', icon: '🎮', installed: false, source: 'openai' },
  { id: 's6', name: 'doc', description: 'Edit and review docx files', icon: '📄', installed: false, source: 'openai' },
  { id: 's7', name: 'figma', description: 'Use Figma MCP for design-to-code work', icon: '🎯', installed: false, source: 'openai' },
  { id: 's8', name: 'figma-implement-design', description: 'Turn Figma designs into production-ready code', icon: '🖼️', installed: false, source: 'openai' },
  { id: 's9', name: 'gh-address-comments', description: 'Address comments in a GitHub PR review', icon: '💬', installed: false, source: 'openai' },
  { id: 's10', name: 'gh-fix-ci', description: 'Debug failing GitHub Actions CI', icon: '🔧', installed: false, source: 'openai' },
  { id: 's11', name: 'imagegen', description: 'Generate and edit images using OpenAI', icon: '🌅', installed: false, source: 'openai' },
  { id: 's12', name: 'jupyter-notebook', description: 'Create Jupyter notebooks for experiments and tutorials', icon: '📓', installed: false, source: 'openai' },
  { id: 's13', name: 'linear', description: 'Manage Linear issues in Codex', icon: '📐', installed: false, source: 'openai' },
  { id: 's14', name: 'netlify-deploy', description: 'Deploy web projects to Netlify with the Netlify CLI', icon: '🌍', installed: false, source: 'openai' },
];

export function SkillsTab() {
  const [q, setQ] = useState('');
  const [skills, setSkills] = useState(SKILLS);
  const [filter, setFilter] = useState<'system' | 'personal' | 'recommended'>('recommended');

  const toggle = (id: string) =>
    setSkills((cur) =>
      cur.map((s) => (s.id === id ? { ...s, installed: !s.installed } : s)),
    );

  const installed = skills.filter((s) => s.installed);
  const recommended = skills.filter(
    (s) =>
      !s.installed &&
      s.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-medium text-fg">Skills</h2>
        <p className="mt-0.5 text-2xs text-fg-dim">
          Give Codex superpowers. Install curated skills from openai/skills or your own repos.
        </p>
      </div>

      <div className="relative">
        <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-faint" weight="bold" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search skills"
          className="h-9 w-full rounded-lg border border-line bg-bg-0 pl-9 pr-3 text-sm text-fg placeholder:text-fg-faint focus:border-line-strong focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1.5 text-2xs">
        {(['system', 'personal', 'recommended'] as const).map((id) => {
          const active = filter === id;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                'rounded-full border px-2.5 py-1 capitalize transition',
                active
                  ? 'border-fg/40 bg-bg-2 text-fg'
                  : 'border-line bg-bg-0 text-fg-muted hover:border-line-strong',
              )}
            >
              {id}
            </button>
          );
        })}
        <div className="ml-auto">
          <Button variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" weight="bold" /> New skill
          </Button>
        </div>
      </div>

      {installed.length > 0 && (
        <Section title="Installed">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {installed.map((s) => (
              <SkillRow key={s.id} skill={s} onToggle={() => toggle(s.id)} />
            ))}
          </div>
        </Section>
      )}

      {recommended.length > 0 && (
        <Section title="Recommended">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {recommended.map((s) => (
              <SkillRow key={s.id} skill={s} onToggle={() => toggle(s.id)} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-fg-dim">{title}</div>
      {children}
    </div>
  );
}

function SkillRow({ skill, onToggle }: { skill: Skill; onToggle: () => void }) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-line bg-bg-1 p-3 transition',
        !skill.installed && 'hover:border-line-strong',
      )}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-bg-2 text-base">
        {skill.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-fg">{skill.name}</div>
        <div className="truncate text-2xs text-fg-dim">{skill.description}</div>
      </div>
      {skill.installed ? (
        <Button size="icon" variant="ghost" onClick={onToggle} title="Configured">
          <CheckCircle className="h-4 w-4 text-success" weight="fill" />
        </Button>
      ) : (
        <Button size="icon" variant="ghost" onClick={onToggle} title="Install">
          <PlusCircle className="h-4 w-4 text-fg-muted" weight="fill" />
        </Button>
      )}
    </div>
  );
}
