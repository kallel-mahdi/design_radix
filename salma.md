# Editor Layout Design Specs

## Color Palette

### Dark Mode (Default)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#080a10` | Main background, editor content |
| `--bg-secondary` | `#0e1218` | Sidebar, PDF content area |
| `--bg-tertiary` | `#161c24` | Activity bar, tab bar, theme toggle |
| `--bg-hover` | `#1e2630` | Hover states |
| `--text-primary` | `#e6ecf6` | Main text, active tabs |
| `--text-secondary` | `#a4b4c8` | Secondary text, file items |
| `--text-muted` | `#6d7a8c` | Muted text, icons, line numbers |
| `--accent-primary` | `#0ea5e9` | Primary accent (sky blue) |
| `--accent-secondary` | `#38bdf8` | Secondary accent (lighter blue) |
| `--accent-success` | `#22c55e` | Recompile icon (green) |
| `--accent-warning` | `#fbbf24` | Code braces (amber) |
| `--accent-error` | `#f472b6` | Error indicator (pink) |
| `--accent-violet` | `#a855f7` | Code keywords (purple) |
| `--border-default` | `#242e3c` | Borders, scrollbar thumb |
| `--border-subtle` | `#1a222c` | Subtle dividers |
| `--selection` | `rgba(14, 165, 233, 0.22)` | Active item backgrounds |
| `--shadow-soft` | `rgba(0, 0, 0, 0.4)` | Sidebar shadow |

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#f6f8fc` | Main background |
| `--bg-secondary` | `#ffffff` | Sidebar, panels |
| `--bg-tertiary` | `#dce5f0` | Activity bar, tab bar |
| `--bg-hover` | `#d0dcea` | Hover states |
| `--text-primary` | `#121620` | Main text |
| `--text-secondary` | `#384050` | Secondary text |
| `--text-muted` | `#677383` | Muted text, icons |
| `--accent-primary` | `#0178b5` | Primary accent |
| `--accent-secondary` | `#0ea5e9` | Secondary accent |
| `--accent-success` | `#16a34a` | Success (green) |
| `--accent-warning` | `#d97706` | Warning (amber) |
| `--accent-error` | `#db2777` | Error (pink) |
| `--accent-violet` | `#9333ea` | Code keywords |
| `--border-default` | `#d8e2f0` | Borders |
| `--border-subtle` | `#ecf0f8` | Subtle dividers |
| `--selection` | `rgba(2, 132, 199, 0.14)` | Selection |
| `--shadow-soft` | `rgba(0, 0, 0, 0.08)` | Shadows |

---

## UI Elements & Sizing

| Element | Height | Notes |
|---------|--------|-------|
| Header | 44px (`2.75rem`) | Sidebar header, logo section |
| Toolbar | 44px (`2.75rem`) | Editor/PDF toolbars |
| Tab | 44px (`2.75rem`) | Tab bar height |
| Row | 44px (`2.75rem`) | Table rows |
| Button | 32px (`2rem`) | Toolbar buttons |
| Activity bar | 56px wide (`3.5rem`) | Left icon bar |
| Sidebar | 256px wide (`16rem`) | File browser |
| Resize handle | 8px (`0.5rem`) | Splitter between panes |

### Icon Sizes

| Icon Type | Size |
|-----------|------|
| Activity icons | 28px (`1.75rem`) |
| Button icons | 20px (`1.25rem`) |
| Small icons | 16px (`1rem`) |
| Logo | 22px (`1.375rem`) |

---

## Typography

| Element | Size | Weight |
|---------|------|--------|
| Body text | 14px (`0.875rem`) | 400 |
| Tab labels | 13px (`0.8125rem`) | 400 |
| Sidebar title | 12px (`0.75rem`) | 600, uppercase |
| Outline items | 13px (`0.8125rem`) | 400 |
| Zoom value | 12px (`0.75rem`) | 500 |

### Fonts

- **UI**: `Inter` (weights: 400, 500, 600, 700)
- **Code**: `JetBrains Mono` (weights: 400, 500)

---

## Component Colors Summary

### Activity Bar
- Background: `--bg-tertiary`
- Icon default: `--text-muted`
- Icon hover: `--text-secondary` on `--bg-hover`
- Icon active: `--accent-primary` on `--selection`
- Border: `--border-subtle` (right edge)

### Sidebar
- Background: `--bg-secondary`
- Header border: `--border-subtle`
- Title: `--text-muted` (uppercase)
- File item: `--text-secondary`
- File hover: `--text-primary` on `--bg-hover`
- File active: `--accent-primary` on `--selection`
- Shadow: inset shadow using `--shadow-soft`

### Tab Bar
- Background: `--bg-tertiary`
- Tab default: `--text-muted`
- Tab hover: `--text-secondary` on `--bg-hover`
- Tab active: `--text-primary`
- Border: `--border-subtle` (bottom)

### Toolbar
- Background: transparent
- Button default: `--text-muted`
- Button hover: `--text-secondary` on `--bg-hover`
- Button active: `--accent-primary` on `--selection`
- Divider: `--border-subtle`

### Editor Content
- Background: `--bg-primary`
- Line numbers: `--text-muted`
- Code text: `--text-secondary`
- Keywords: `--accent-violet`
- Commands: `--accent-primary`
- Braces: `--accent-warning`
- Comments: `--text-muted` (italic)

### PDF Pane
- Content background: `--bg-secondary`
- Recompile icon: `--accent-success`
- Error indicator: `--accent-error`

### Resize Handle
- Default: `--bg-tertiary`
- Hover/Active: `--accent-primary`
- Grip indicator: `--text-muted`
