# Radix Colors Migration Notes

**Migrated**: January 2026
**Source**: Citable Balanced Palette
**Target**: Radix Colors (Stock)

---

## Overview

This folder contains design mockups using the **stock Radix Colors** system instead of custom color values. This provides:

- **12-step scales** for each color (backgrounds, borders, text)
- **Guaranteed WCAG compliance** at specific step combinations
- **Automatic dark mode** variants
- **Alpha variants** for transparency effects
- **Future-proof** compatibility with Radix ecosystem

---

## Files

| File | Purpose | Module Accent |
|------|---------|---------------|
| `radix-tokens.css` | Shared color system | All colors |
| `home-radix.html` | Home page mockup | All modules |
| `editor-radix.html` | Editor/Manuscripts mockup | Teal (`--manu-*`) |
| `bibliography-radix.html` | Bibliography mockup | Blue (`--biblio-*`) |

---

## Color Scales Used

### Base / Neutral
Neutral scale used for backgrounds, borders, and text.

Radix colors ship separate light/dark files; the variable names are the same (e.g. `--brown-2`), but values change under `.dark-theme`.

| Token | Use Case |
|------|----------|
| `--brown-1` / `--brown-2` / `--brown-3` | App surfaces |
| `--brown-4` / `--brown-5` | Hover/active surfaces |
| `--brown-6` / `--brown-7` | Borders |
| `--mauve-12` | Primary text |
| `--mauve-11` | Secondary/muted text (AA-safe on light surfaces) |

### Bibliography (Blue)
Uses Radix `blue` scale and derives a more “muted steel-blue” accent with `color-mix()` from `--blue-12` + the app background.

| Token | Use Case |
|------|----------|
| `--blue-12` | Deep blue base (used to derive `--biblio*`) |
| `--blue-3` / `--blue-4` | Tints |
| `--blue-a3` / `--blue-a4` | Alpha overlays / selection |

### Manuscripts (Green)
Uses Radix `green` scale.

| Token | Use Case |
|------|----------|
| `--green-11` / `--green-12` | Accent (text-safe steps) |
| `--green-3` / `--green-4` | Tints |
| `--green-a3` / `--green-a4` | Alpha overlays / selection |

### Discover (Purple)
Uses Radix `purple` scale.

| Token | Use Case |
|------|----------|
| `--purple-11` / `--purple-12` | Accent (text-safe steps) |
| `--purple-3` / `--purple-4` | Tints |
| `--purple-a3` / `--purple-a4` | Alpha overlays / selection |

---

## Token Mapping

### Backgrounds
| Token | Maps To |
|-------|---------|
| `--bg-primary` | `--sand-1` |
| `--bg-secondary` | `--sand-2` |
| `--bg-tertiary` | `--sand-3` |
| `--bg-hover` | `--sand-4` |
| `--bg-active` | `--sand-5` |

### Text
| Token | Maps To |
|-------|---------|
| `--text-primary` | `--sand-12` |
| `--text-secondary` | `--sand-11` |
| `--text-muted` | `--sand-10` |

### Borders
| Token | Maps To |
|-------|---------|
| `--border-subtle` | `--sand-5` |
| `--border-default` | `--sand-6` |
| `--border-strong` | `--sand-7` |

### Module: Bibliography (Blue)
| Token | Maps To |
|-------|---------|
| `--biblio` | `--blue-9` |
| `--biblio-hover` | `--blue-10` |
| `--biblio-strong` | `--blue-11` |
| `--biblio-tint` | `--blue-3` |
| `--biblio-light` | `--blue-4` |

### Module: Manuscripts (Teal)
| Token | Maps To |
|-------|---------|
| `--manu` | `--teal-9` |
| `--manu-hover` | `--teal-10` |
| `--manu-strong` | `--teal-11` |
| `--manu-tint` | `--teal-3` |
| `--manu-light` | `--teal-4` |

### Module: Discover (Violet)
| Token | Maps To |
|-------|---------|
| `--discover` | `--violet-9` |
| `--discover-hover` | `--violet-10` |
| `--discover-strong` | `--violet-11` |
| `--discover-tint` | `--violet-3` |
| `--discover-light` | `--violet-4` |

---

## Comparison: Citable vs Radix

| Element | Citable | Radix | Note |
|---------|---------|-------|------|
| Light bg | Citable Balanced bg token | `--bg-primary` (via `--brown-2`) | Close warmth, slightly different tint |
| Dark bg | OLED black surfaces | Radix dark surfaces under `.dark-theme` | Radix is “lifted” vs pure black |
| Primary text | Citable Balanced text token | `--text-primary` (via `--mauve-12`) | Similar warmth, strong contrast |
| Bibliography accent | Citable Balanced blue | `--biblio` (derived from `--blue-12`) | Muted blue tuned to match original vibe |
| Manuscripts accent | Citable Balanced teal/green | `--manu` / `--manu-text` (via `green`) | Use `-11/-12` for text contrast |
| Discover accent | Citable Balanced violet | `--discover` (via `purple`) | Similar “editorial” violet feel |

---

## Benefits of Stock Radix

1. **No manual WCAG testing** - contrast guaranteed
2. **Consistent hover/active states** - steps 4/5
3. **Built-in alpha variants** - `--blue-a3`, etc.
4. **Easy dark mode** - just toggle `.dark-theme` on the root element
5. **Ecosystem compatibility** - works with Radix Themes, shadcn/ui
6. **Maintained by community** - updates and fixes

---

## Usage

Each HTML file imports the shared tokens:

```html
<link rel="stylesheet" href="radix-tokens.css">
```

Then uses the semantic tokens in CSS:

```css
.button {
  background: var(--biblio);
  color: white;
}
.button:hover {
  background: var(--biblio-hover);
}
```

---

## Sources

- [Radix Colors](https://www.radix-ui.com/colors)
- [Sand Scale](https://www.radix-ui.com/colors/docs/palette-composition/scales)
- [Usage Guide](https://www.radix-ui.com/colors/docs/overview/usage)
