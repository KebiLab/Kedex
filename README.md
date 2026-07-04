# Kedex

> Multi-provider AI coding desktop agent — a from-scratch alternative to OpenAI Codex.

**Stack:** Electron · React 18 · TypeScript · Rust Core (JSON-RPC over stdio) · Tailwind · Framer Motion

---

## Features

- **Provider-agnostic LLM access** — OpenAI, Anthropic, Google Gemini, DeepSeek, Mistral, Ollama (local), or any custom OpenAI-compatible endpoint.
- **Plan & Goal modes** — agent writes a plan, user approves/edits, then agent executes and self-corrects on errors.
- **Voice input** — push-to-talk with cloud Whisper or local transcription; text auto-fills the prompt.
- **Interactive Diff viewer** — side-by-side code review before changes are committed.
- **Worktree-isolated execution** — agent works in git worktrees so your main branch stays clean.
- **Built-in browser & UI annotations** — capture screenshots, draw on them, agent reads coordinates + DOM and fixes the bug.
- **Encrypted secrets** — keys stored in OS keychain via Rust `keyring` crate.
- **Auto Git/GitHub workflow** — Conventional Commits, auto-push after each approved plan step.

## Architecture

```
kedex-app/
├── src/
│   ├── main/          # Electron main process (windows, IPC, node-pty)
│   ├── preload/       # contextBridge API surface
│   ├── renderer/      # React 18 UI (Tailwind + Radix + Framer Motion)
│   └── shared/        # IPC type contracts
├── core/              # Rust binary: kedex-core (JSON-RPC, tree-sitter, LLM)
└── resources/
```

Communication between Electron (Node) and Rust core is **JSON-RPC over stdio**.

## Development

```bash
# install JS deps
npm install

# build Rust core (requires Rust toolchain)
cd core && cargo build --release && cd ..

# run dev (Vite + Electron)
npm run dev

# production build
npm run build
```

## License

Proprietary — © KebiLab
