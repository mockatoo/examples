# Repository guide

This repository contains Mockatoo example apps and authentication configurations.

- Use pnpm 10 and Node.js 24.
- Each example folder is its own pnpm root, with its own `pnpm-lock.yaml`, `pnpm-workspace.yaml` and `biome.json`. Nothing at this repository's root is shared.
- Before proposing a change to an example, run `pnpm install` and `pnpm run ci` in its folder. `ci` runs lint, typecheck and the browser tests, the same steps as the example's workflow.
- Keep imports and links inside this repository.
- Connectors are consumed from the published `@mockatoo/connect-better-auth` and `@mockatoo/connect-authjs` npm packages.
