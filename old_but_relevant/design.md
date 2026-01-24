# Bibliography Manager - Design System Specifications

> **For Figma Reproduction** | Last Updated: December 2025
> Base unit: `1rem = 16px` | Grid: 8px

---

## Design Standards Referenced

This design system was built by cross-referencing industry standards:

| Standard | Key Takeaways | Source |
|----------|---------------|--------|
| **WCAG 2.2 AA** | 24×24px minimum touch targets | [W3C Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) |
| **VS Code** | 48px activity bar, 24px icons, 50% ratio | [VS Code Issue #214557](https://github.com/microsoft/vscode/issues/214557) |
| **Zotero** | Data-dense tables, 12-14px fonts | Reference manager standard |
| **Data-Dense UIs** | 14px body, 12px labels minimum | [Stéphanie Walter](https://stephaniewalter.design/blog/what-minimum-font-size-for-a-high-density-data-web-app-do-you-suggest/) |

---

## Figma Setup

1. **Frame size**: 1920 × 1080px (24" desktop)
2. **Grid**: 8px columns with 8px gutters
3. **Font**: Inter (Google Fonts)
4. **Base font size**: 16px (all rem values × 16 = px)

---

## 8px Grid Spacing Scale

| Token | rem | px | Usage |
|-------|-----|-----|-------|
| `space-1` | 0.25rem | 4px | Micro gaps, icon padding |
| `space-2` | 0.5rem | 8px | Small gaps, base grid unit |
| `space-3` | 0.75rem | 12px | Medium gaps, list padding |
| `space-4` | 1rem | 16px | Standard gaps, section padding |
| `space-6` | 1.5rem | 24px | Large gaps, section margins |
| `space-8` | 2rem | 32px | XL spacing, button heights |

---

## Layout Structure (Bibliography)

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER ROW (44px)                        │
├──────────┬─────────────────┬────────────────────────────────────┤
│  Logo    │ Sidebar Header  │           Tab Bar                  │
│  56×44   │    256×44       │         remaining×44               │
├──────────┼─────────────────┼────────────────────────────────────┤
│          │                 │           Toolbar (32px buttons)   │
│ Activity │    Sidebar      │           ↓ 8px gap                │
│  Icons   │    Content      │           Table                    │
│          │                 │           (44px rows)              │
│  56px    │    256px        │                                    │
│  wide    │    wide         │         remaining                  │
└──────────┴─────────────────┴────────────────────────────────────┘
```

### Panel Dimensions

| Element | Width | Height | rem | Notes |
|---------|-------|--------|-----|-------|
| **Activity Bar** | 56px | 100vh | 3.5rem | Contains logo + nav icons |
| **Logo Section** | 56px | 44px | 3.5rem × 2.75rem | Top of activity bar |
| **Sidebar** | 256px | 100vh | 16rem | Collection tree |
| **Sidebar Header** | 256px | 44px | 16rem × 2.75rem | "Library" title + actions |
| **Tab Bar** | remaining | 44px | - × 2.75rem | File tabs |
| **Toolbar** | 100% | 44px | - × 2.75rem | Add/Import/Export + Search |
| **Main Content** | remaining | remaining | - | Table area |

---

## Layout Structure (Projects)

Projects page has NO sidebar - just Activity Bar + Main Content.

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER ROW (44px)                        │
├──────────┬──────────────────────────────────────────────────────┤
│  Logo    │                                                      │
│  56×44   │              (empty row - 44px + 8px)                │
├──────────┼──────────────────────────────────────────────────────┤
│          │              Toolbar (44px)                          │
│ Activity │              ↓ 8px gap                               │
│  Icons   │              Table                                   │
│          │              (44px rows)                             │
│  56px    │                                                      │
│  wide    │            remaining width                           │
└──────────┴──────────────────────────────────────────────────────┘
```

### Projects Panel Dimensions

| Element | Width | Height | rem | Notes |
|---------|-------|--------|-----|-------|
| **Activity Bar** | 56px | 100vh | 3.5rem | Same as Bibliography |
| **Toolbar top margin** | - | 52px | 3.25rem | Aligns with Bibliography toolbar |
| **Toolbar** | 100% | 44px | 2.75rem | New Project + Search |
| **Main Content** | remaining | remaining | - | Projects table |

---

## Activity Bar

| Property | rem | px | Notes |
|----------|-----|-----|-------|
| **Width** | 3.5rem | 56px | Custom (VS Code uses 48px) |
| **Icon size** | 1.75rem | 28px | 50% of bar width |
| **Touch target** | 3rem | 48px | WCAG AA+ compliant |
| **Logo icon** | 1.5rem | 24px | Smaller than nav icons |
| **Gap between icons** | 0.5rem | 8px | Vertical spacing |
| **Top padding** | 1rem | 16px | After logo section |
| **Icon border-radius** | 0.5rem | 8px | Rounded corners |

### Icon-to-Bar Ratio

```
Bar width:  56px (3.5rem)
Icon size:  28px (1.75rem)
Ratio:      50%

This matches VS Code's 48px bar with 24px icons (also 50%)
```

---

## Sidebar

| Property | rem | px | Notes |
|----------|-----|-----|-------|
| **Width** | 16rem | 256px | Comfortable for collection names |
| **Header height** | 2.75rem | 44px | Matches tab bar |
| **Header padding** | 0.5rem | 8px | Horizontal |
| **Content padding-top** | 1rem | 16px | Alignment spacing |

### Sidebar Header Actions

| Property | rem | px |
|----------|-----|-----|
| Icon size | 1rem | 16px |
| Touch target | 1.5rem | 24px |
| Gap between | 0.25rem | 4px |
| Border-radius | 0.25rem | 4px |

### Collection/File Items

| Property | rem | px | Notes |
|----------|-----|-----|-------|
| **Min height** | 2rem | 32px | Comfortable density |
| **Padding vertical** | 0.375rem | 6px | Top and bottom |
| **Padding-left (root)** | 1.5rem | 24px | First level |
| **Padding-left (nested)** | 2.25rem | 36px | Child items |
| **Icon size** | 1rem | 16px | Folder/file icons |
| **Gap (icon to text)** | 0.5rem | 8px | |
| **Border-radius** | 0.25rem | 4px | |
| **Font size** | 0.875rem | 14px | |

---

## Toolbar

| Property | rem | px | Notes |
|----------|-----|-----|-------|
| **Height** | 2.75rem | 44px | Matches tab bar height |
| **Top margin** | 0.5rem | 8px | Aligns with My Library row |
| **Bottom margin** | 0.5rem | 8px | Gap before table |
| **Horizontal padding** | 1rem | 16px | |

### Buttons

| Property | rem | px | Notes |
|----------|-----|-----|-------|
| **Height** | 2rem | 32px | Compact |
| **Padding horizontal** | 0.75rem | 12px | |
| **Icon size** | 1rem | 16px | |
| **Gap (icon to text)** | 0.5rem | 8px | |
| **Border-radius** | 0.375rem | 6px | |
| **Gap between buttons** | 0.25rem | 4px | |
| **Font size** | 0.8125rem | 13px | |
| **Font weight** | 500 | - | Medium |

### Search Input

| Property | rem | px |
|----------|-----|-----|
| Width | flexible | min 160px |
| Height | 2rem | 32px |
| Padding-left | 2rem | 32px |
| Padding-right | 0.75rem | 12px |
| Icon size | 1.25rem | 20px |
| Border-radius | 0.25rem | 4px |
| Font size | 0.875rem | 14px |

---

## Table

| Property | rem | px | Notes |
|----------|-----|-----|-------|
| **Row height** | 2.75rem | 44px | Data-dense |
| **Cell padding horizontal** | 0.75rem | 12px | |
| **Border-radius** | 0.375rem | 6px | Table corners |

### Column Widths

| Column | Width | Min Width |
|--------|-------|-----------|
| Checkbox | 2.5rem (40px) | - |
| Title | 35% | 12.5rem (200px) |
| Authors | 15% | 7.5rem (120px) |
| Year | 3.75rem (60px) | - |
| Venue | 5rem (80px) | - |
| Tags | 15% | 7.5rem (120px) |
| Files | 3.75rem (60px) | - |
| DOI | 15% | 7.5rem (120px) |

---

## Typography Scale (Data-Dense / Zotero-like)

| Element | rem | px | Weight | Notes |
|---------|-----|-----|--------|-------|
| **Sidebar title** | 0.6875rem | 11px | 500 | Uppercase, letter-spacing 0.05em |
| **Section header** | 0.8125rem | 13px | 600 | "My Library" |
| **Collection item** | 0.875rem | 14px | 400 | |
| **Button label** | 0.8125rem | 13px | 500 | |
| **Tab label** | 0.75rem | 12px | 400 | |
| **Table header** | 0.75rem | 12px | 500 | Uppercase, letter-spacing 0.05em |
| **Table cell** | 0.875rem | 14px | 400 | |
| **Table title cell** | 0.875rem | 14px | 400 | Primary color, no bold |
| **Tag label** | 0.6875rem | 11px | 400 | Data-dense minimum |
| **Group header** | 0.6875rem | 11px | 500 | Uppercase |
| **Search placeholder** | 0.875rem | 14px | 400 | |

### Typography Standards Applied

| Guideline | Requirement | Our Implementation |
|-----------|-------------|-------------------|
| Body text minimum | 14px for data-dense | 14px ✓ |
| Secondary text minimum | 12px safe minimum | 12px for headers ✓ |
| Metadata/badges | 10-12px acceptable | 11px for tags ✓ |
| Text resizing | Must support 200% zoom | rem units ✓ |

---

## Tags

| Property | rem | px |
|----------|-----|-----|
| Height | 1.25rem | 20px |
| Padding horizontal | 0.5rem | 8px |
| Border-radius | 0.25rem | 4px |
| Gap between | 0.25rem | 4px |
| Font size | 0.6875rem | 11px |
| Font weight | 400 | - |

---

## Editor Layout

The editor uses the same activity bar and sidebar dimensions as bibliography.

### Split Pane Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Activity │ Sidebar │   Editor Pane    │ ║ │    PDF Pane       │
│    Bar    │         │   Tab Bar (44px) │ ║ │   Tab Bar (44px)  │
│   56px    │  256px  │   Toolbar (32px) │ ║ │   Toolbar (32px)  │
│           │         │   Code Editor    │ ║ │   PDF Viewer      │
│           │         │                  │ ║ │                   │
└───────────┴─────────┴──────────────────┴─╨─┴───────────────────┘
                                          ↑
                                    Resize Handle (8px)
```

### Editor Toolbar (Flat Style)

| Element | Height | Notes |
|---------|--------|-------|
| Toolbar row | 32px | Flat, no backgrounds |
| Icon buttons | 32px | Undo, Redo, Bold, Italic, etc. |
| Text buttons | 32px | B, I formatting |

### PDF Toolbar (Flat Style)

| Element | Height | Notes |
|---------|--------|-------|
| Recompile button | 32px | Flat, transparent background |
| Zoom controls | 32px | −, value, + buttons |
| Log indicator | 32px | Shows error count |
| Download button | 32px | Icon only |

All PDF toolbar elements use flat style (transparent backgrounds, hover reveals).

---

## Color Palette

### Dark Mode (Default)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | #080a10 | Main content background |
| `bg-secondary` | #0e1218 | Sidebar, table, cards |
| `bg-tertiary` | #161c24 | Activity bar, inputs, tab bar |
| `bg-hover` | #1e2630 | Hover states |
| `text-primary` | #e6ecf6 | Main text, titles |
| `text-secondary` | #a4b4c8 | Body text |
| `text-muted` | #6d7a8c | Placeholder, inactive |
| `accent-primary` | #0ea5e9 | Primary buttons, active states |
| `accent-secondary` | #38bdf8 | Hover on primary |
| `accent-success` | #22c55e | Success, green tags |
| `accent-warning` | #fbbf24 | Warning, amber tags |
| `accent-error` | #f472b6 | Error states |
| `accent-violet` | #a855f7 | Violet tags |
| `border-default` | #242e3c | Visible borders |
| `border-subtle` | #1a222c | Subtle dividers |
| `selection` | rgba(14, 165, 233, 0.22) | Selected items |
| `shadow-soft` | rgba(0, 0, 0, 0.4) | Shadows |

### Light Mode

| Token | Hex |
|-------|-----|
| `bg-primary` | #f6f8fc |
| `bg-secondary` | #ffffff |
| `bg-tertiary` | #dce5f0 |
| `bg-hover` | #d0dcea |
| `text-primary` | #121620 |
| `text-secondary` | #384050 |
| `text-muted` | #677383 |
| `accent-primary` | #0178b5 |
| `accent-secondary` | #0ea5e9 |
| `accent-success` | #16a34a |
| `accent-warning` | #d97706 |
| `accent-error` | #db2777 |
| `accent-violet` | #9333ea |
| `border-default` | #d8e2f0 |
| `border-subtle` | #ecf0f8 |
| `selection` | rgba(2, 132, 199, 0.14) |
| `shadow-soft` | rgba(0, 0, 0, 0.08) |

### Tag Colors

| Tag | Background | Text |
|-----|------------|------|
| Cyan | rgba(14, 165, 233, 0.15) | #0178b5 |
| Violet | rgba(147, 51, 234, 0.15) | #9333ea |
| Emerald | rgba(22, 163, 74, 0.15) | #16a34a |
| Amber | rgba(217, 119, 6, 0.15) | #d97706 |

---

## Interactive States

| State | Background | Text |
|-------|------------|------|
| Default | transparent | `text-muted` |
| Hover | `bg-hover` | `text-secondary` |
| Active/Selected | `selection` | `accent-primary` |
| Primary Button | `accent-primary` | white |
| Primary Hover | `accent-secondary` | white |
| Secondary Button | transparent + border | `text-secondary` |
| Secondary Hover | `bg-hover` | `text-primary` |

---

## Border Styles

### Soft Depth (Default)

| Element | Style |
|---------|-------|
| Activity bar | 1px `border-subtle` right |
| Sidebar | Inner shadow: `inset -8px 0 12px -8px shadow-soft` |
| Sidebar header | 1px `border-subtle` bottom |
| Tab bar | 1px `border-subtle` bottom |
| Table | Box shadow: `0 2px 8px shadow-soft` |
| Table header | 1px `border-subtle` bottom |
| Table rows | 1px `border-subtle` bottom |

---

## Tab Styles

### Minimal (Default)

| Property | Value |
|----------|-------|
| Height | 1.75rem (28px) |
| Padding horizontal | 0.75rem (12px) |
| Border-radius | 0.25rem (4px) |
| Background | transparent |
| Active state | Brighter text only |
| Tab bar background | `bg-tertiary` |
| Font size | 0.75rem (12px) |

---

## Accessibility Compliance

| Requirement | Standard | Our Value | Status |
|-------------|----------|-----------|--------|
| Touch targets | WCAG AA 24×24px | 32-48px | ✓ Pass |
| Body font minimum | 14px for data-dense | 14px | ✓ Pass |
| Label font minimum | 12px safe | 12px | ✓ Pass |
| Grid alignment | 8px | All values | ✓ Pass |
| Text resizing | 200% zoom | rem units | ✓ Pass |

---

## Reference Files

| File | Purpose |
|------|---------|
| `bibliography-layouts-corrected.html` | Bibliography manager mockup |
| `projects-layouts.html` | Projects page mockup (no sidebar) |
| `editor-layouts-corrected.html` | LaTeX editor mockup |
| `citable-editor-layouts.html` | Editor styling showcase |

---

## Quick Reference Card

```
ACTIVITY BAR          SIDEBAR              MAIN CONTENT
─────────────────────────────────────────────────────────
Width:  56px (3.5rem) Width: 256px (16rem)  Remaining
Icons:  28px (1.75rem) Header: 44px         Tab bar: 44px
Touch:  48px (3rem)   Items: 32px min       Toolbar: 44px
Gap:    8px           Padding: 8px          Rows: 44px
─────────────────────────────────────────────────────────
Toolbar starts 8px below tab bar (aligns with My Library)
Projects toolbar starts 52px from top (no tab bar)
─────────────────────────────────────────────────────────
Font scale: 11px (tags/labels) → 12px (headers) → 14px (body)
─────────────────────────────────────────────────────────
```
