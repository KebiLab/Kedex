export function Markdown({ content, streaming }: { content: string; streaming?: boolean }) {
  // Very small subset of markdown: paragraphs, inline code, code blocks, lists.
  const blocks = content.split(/\n{2,}/g);
  return (
    <div className="space-y-2 text-sm leading-6">
      {blocks.map((b, i) => {
        if (b.startsWith('```')) {
          const m = b.match(/^```([\w-]*)\n([\s\S]*?)```$/);
          if (m) {
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-lg border border-line bg-bg-0/80 p-3 font-mono text-xs leading-5 text-fg"
              >
                <code>{m[2]}</code>
              </pre>
            );
          }
        }
        if (/^[-*]\s/.test(b)) {
          const items = b.split(/\n/).map((l) => l.replace(/^[-*]\s+/, ''));
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 marker:text-fg-faint">
              {items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(b)}</p>;
      })}
      {streaming && null}
    </div>
  );
}

function renderInline(s: string) {
  const parts: (string | JSX.Element)[] = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    if (m[1] !== undefined) parts.push(<code key={key++} className="rounded bg-bg-3 px-1 py-0.5 font-mono text-2xs text-fg">{m[1]}</code>);
    else if (m[2] !== undefined) parts.push(<strong key={key++} className="font-semibold text-fg">{m[2]}</strong>);
    else if (m[3] !== undefined) parts.push(<em key={key++} className="italic text-fg-muted">{m[3]}</em>);
    last = re.lastIndex;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}
