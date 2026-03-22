# Contributing to Hydra Deploy

> Built for 30+ contributors. Read this once — it covers everything.

## Quick Setup

```bash
git clone https://github.com/wavegxz-design/hydra-deploy
cd hydra-deploy && npm install
cp .env.example .env     # fill in your tokens
npm run dev              # start in dev mode
```

## Branch Naming

```
feat/description     New features
fix/description      Bug fixes
docs/description     Documentation
test/description     Tests
refactor/description Refactoring
```

## Commit Format (Conventional Commits)

```
feat: add Railway deploy adapter
fix: prevent RangeError in box drawing
docs: update deploy guide
test: add ErrorHandler unit tests
refactor: simplify recovery registry
```

## What We Accept

| Area | Description |
|------|-------------|
| Platform adapters | Railway, Fly.io, Render, Heroku, AWS |
| Social integrations | Real API adapters |
| Test coverage | Any module below 80% |
| Documentation | Examples, guides, API docs |
| Bug fixes | With reproduction steps |

## Pull Request Checklist

- [ ] TypeScript strict mode — no `any` without justification
- [ ] Error handling uses `HydraError` with an `ErrorCode`
- [ ] Recovery strategy registered if applicable
- [ ] No hardcoded strings that should be config
- [ ] No padding/layout math that can produce negative values
- [ ] `npm run lint` passes
- [ ] `npm test` passes

## Contact

- Telegram: [t.me/Skrylakk](https://t.me/Skrylakk)
- Email: Workernova@proton.me
- GitHub: [github.com/wavegxz-design](https://github.com/wavegxz-design)

---

*krypthane — use responsibly.*
