# Project

Created by AI Company from its project template.

- `api/`: a Fastify JSON API (TypeScript).
- `web/`: a Vite + React web app (TypeScript).

```bash
npm ci
npm run build
npm run lint
npm test
```

Dependencies and lockfile are managed by people, not agents: changes to `package.json`, `package-lock.json`, CI
workflows, `.npmrc`, the lint and test configuration (`eslint.config.js`, `vitest.config.ts`) and `.aico/`
are refused by the orchestrator's change rules.
