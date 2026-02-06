# Repository Guidelines

This repo contains UI/UX design prototypes for Citable plus a React/Radix sandbox used to migrate and validate components.

## Project Structure & Module Organization
- Top-level `*.html` files are standalone mockups (e.g., `home-radix.html`, `landing-mockups.html`, `editor-radix.html`).
- `radix-tokens.css` defines shared design tokens and Radix color mappings.
- `*.png` files are exported visuals and review artifacts.
- `sandbox/` is a Vite + React + TypeScript playground that re-implements the HTML mockups.
- `sandbox/src/ui/pages` and `sandbox/src/ui/components` contain page-level UI and composites.
- `sandbox/src/components` and `sandbox/src/components/ui` contain reusable building blocks.
- `sandbox/src/styles` holds global styles.

## Build, Test, and Development Commands
From repo root:
- Open any top-level `*.html` directly in a browser (no build step).

From `sandbox/`:
- `npm install` installs dependencies.
- `npm run dev` starts the Vite dev server.
- `npm run build` runs TypeScript build + Vite production build.
- `npm run preview` serves the production build locally.

## Coding Style & Naming Conventions
- Follow existing formatting in the file you touch (double quotes, semicolons in TS/TSX).
- React components use `PascalCase` filenames; hooks use `useX` naming.
- Keep UI grouped by purpose: page-level code in `sandbox/src/ui/pages`, reusable parts in `sandbox/src/components`.

## Design System Constraints
- Use Radix UI primitives and Radix Colors only.
- Do not introduce hardcoded color literals (`#`, `rgb()`, `hsl()`, Tailwind arbitrary colors).
- Prefer semantic tokens in `radix-tokens.css` over direct scale usage.

## Testing Guidelines
- No automated test scripts are configured in `sandbox/package.json`.
- If you add tests, also add a `test` script and document how to run it here.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits with scopes (e.g., `feat(landing): refine hero layout`).
- PRs should include a short summary, linked issues if applicable, and screenshots for any visual changes.
