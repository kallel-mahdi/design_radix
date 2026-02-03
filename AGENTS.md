# Citable — UI/UX + Component Migration Guide (Codex)

## Project context

**Citable** is an AI-powered research platform that combines:
- **Zotero** (reference/bibliography management)
- **Overleaf** (collaborative LaTeX editing)
- **Connected Papers** (paper discovery + citation graphs)

Target users are academic researchers spending **6–10+ hours/day** in the app. The UI must prioritize **sustained focus**, **low eye strain**, and **high readability**.

### Core modules & color roles
- **Bibliography**: consultation/reading/checking sources → calm, reliable
- **Manuscripts**: writing/creating → confident, “active creation”
- **Discover**: exploration/connection → curious, expansive
- **Research Planner**: neutral (no distinct accent)

### Hard constraints
- Use **Radix components and Radix colors only**.
- **No hardcoded color literals anywhere** (no `#...`, `rgb(...)`, `rgba(...)`, Tailwind arbitrary colors like `bg-[#...]`, etc.).

## Design system approach (Radix-only)

### Key principle
Use **Radix UI** as the source of truth for:
- **Components**: `@radix-ui/react-*` primitives (and/or Radix Themes if adopted later)
- **Colors**: `@radix-ui/colors` tokens (via CSS variables)

Use shadcn **only as an MCP-assisted migration tool** (discovery/scaffolding), but do not ship shadcn/ui component code as the final implementation.

### Token rules
- Prefer semantic variables (e.g. `--bg-*`, `--text-*`, `--biblio`, `--manu`, `--discover`) over direct scale tokens in component styles.
- For text on light surfaces, Radix typically expects **`*-11` / `*-12`**; `*-9` is commonly for solid fills, and `*-10` often fails AA on very light backgrounds.
- Dark mode should be implemented using Radix dark scales (e.g. `.dark-theme`) without introducing custom color literals.

## MCP setup (Codex CLI)

Codex reads MCP server config from `~/.codex/config.toml`. You can manage servers either:
- via CLI (`codex mcp ...`), or
- by editing `~/.codex/config.toml` directly.

In the Codex TUI, use `/mcp` to inspect whether servers are connected.

### shadcn MCP server (official shadcn)
Add to `~/.codex/config.toml`:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["-y", "shadcn@latest", "mcp"]
```

Restart Codex after changes.

Notes:
- shadcn registries are controlled by your project’s `components.json`.
- Prefer pinning versions for reproducible migrations (replace `@latest` with a known-good version once selected).
- If `/mcp` shows the server enabled but **Tools: (none)**, update Codex CLI and try removing `-y`, then restart.

### Radix MCP server (`@gianpieropuleo/radix-mcp-server`)
Recommended Codex config:

```toml
[mcp_servers.radix]
command = "npx"
args = ["-y", "@gianpieropuleo/radix-mcp-server@2.0.0"]
```

This server exposes access to Radix **Themes**, **Primitives**, and **Colors** (source, install guides, tokens).

## How to use MCP during component migration

### When migrating UI components (React)
1. **Use shadcn MCP first** to:
   - list available components/blocks,
   - install baseline components into the project,
   - generate consistent file layout + Tailwind patterns.
2. **Use Radix MCP** to:
   - verify which Radix Primitive backs a given shadcn component,
   - confirm accessibility behavior and recommended structure,
   - pull Radix Colors guidance when choosing token mappings.
3. **Adapt styling to Citable tokens**:
   - Replace component-local colors with semantic tokens.
   - Ensure module accents reflect the mental model (Bibliography calm, Manuscripts strong, Discover expansive).
4. **Verify contrast**:
   - Treat AA failures on “muted text” as a token mapping issue (usually too-light steps).
   - Validate both light and dark themes.

### Prompting tips (what to ask the agent)
- “List shadcn components available for dialogs/menus/tables in this repo and install the minimal set.”
- “For this shadcn Dialog, show the underlying Radix Primitive structure and required a11y props.”
- “Replace hardcoded colors with semantic tokens and ensure AA for normal text on primary surfaces.”
