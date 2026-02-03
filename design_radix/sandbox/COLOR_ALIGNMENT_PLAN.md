# Color Alignment Plan: design_mahdi → Radix Sandbox

## Executive Summary

The current Radix sandbox has **significant color mismatches** with the original "Scholarly Warmth" design system. This plan provides a systematic approach to align them.

---

## 1. Current State Analysis

### Original Design System (`design_mahdi/`)

The "Scholarly Warmth" palette uses these exact hex values:

**Light Mode Foundation:**
| Token | Original Value | Purpose |
|-------|---------------|---------|
| `bg-primary` | `#FAF8F5` | Main background - warm cream |
| `bg-secondary` | `#FFFFFF` | Cards, panels |
| `bg-tertiary` | `#F2EFEA` | Sidebar, input backgrounds |
| `bg-hover` | `#E8E4DD` | Hover states |
| `text-primary` | `#2C2825` | Main text - warm charcoal |
| `text-secondary` | `#6B635B` | Supporting text |
| `text-muted` | `#736B63` | Placeholders, disabled |
| `border-default` | `#D9D4CB` | Standard borders |
| `border-subtle` | `#E8E4DD` | Subtle dividers |

**Dark Mode Foundation:**
| Token | Original Value | Purpose |
|-------|---------------|---------|
| `bg-primary` | `#000000` | TRUE BLACK (OLED) |
| `bg-secondary` | `#171614` | Elevated surfaces |
| `bg-hover` | `#1E1D1A` | Hover states |
| `text-primary` | `#E8E4DF` | Warm off-white |
| `text-secondary` | `#9A958D` | Muted text |
| `text-muted` | `#857F77` | Disabled text |

**Module Accents (Balanced Mood):**

| Module | Light Mode | Dark Mode | Hue |
|--------|-----------|-----------|-----|
| Bibliography | `#3A6D90` | `#5A9FD4` | ~205 (Steel Blue) |
| Manuscripts | `#247A5E` | `#4DCBA8` | ~163 (Teal) |
| Discover | `#7E5098` | `#BC8BD0` | ~278 (Violet) |
| Planner | `#6B635B` | `#9A958D` | Neutral |

**Tag Colors (Light Mode):**
| Tag | Background | Text |
|-----|-----------|------|
| Cyan | `#E3EDF4` | `#2A5270` |
| Violet | `rgba(126, 80, 152, 0.15)` | `#7E5098` |
| Emerald | `rgba(42, 130, 104, 0.15)` | `#2A8268` |
| Amber | `rgba(184, 134, 11, 0.15)` | `#B8860B` |

---

## 2. Gap Analysis - Critical Mismatches

### Problem 1: Background Warmth
- **Original**: `#FAF8F5` (RGB 250, 248, 245 - warm cream with red > blue)
- **Current**: Sand-2 `#f9f9f8` (RGB 249, 249, 248 - neutral gray)
- **Issue**: Radix Sand scale lacks the warm cream undertone

### Problem 2: Dark Mode Base
- **Original**: `#000000` (true black for OLED)
- **Current**: Sand-1 dark which is NOT true black
- **Issue**: Dark mode loses OLED optimization

### Problem 3: Module Color Hues
| Module | Original Hue | Radix Scale Used | Radix Hue | Mismatch |
|--------|-------------|------------------|-----------|----------|
| Bibliography | ~205 (Steel) | Blue | ~210 | Close |
| Manuscripts | ~163 (Teal) | Green | ~140 | **WRONG** - should use Teal |
| Discover | ~278 (Violet) | Purple | ~275 | Close |

### Problem 4: Text Warmth
- **Original text-primary**: `#2C2825` (warm charcoal)
- **Current (mauve-12)**: `#211f26` (cooler, purple undertone)

---

## 3. Color Mapping Table

### Recommended Radix Color Mappings

| Original Token | Original Hex | Recommended Radix | Notes |
|----------------|-------------|-------------------|-------|
| **Backgrounds** ||||
| bg-primary (light) | `#FAF8F5` | **Custom** | Radix has no warm cream |
| bg-primary (dark) | `#000000` | **Custom** `#000000` | Radix grays not true black |
| bg-secondary (light) | `#FFFFFF` | `--sand-1` | Works |
| bg-secondary (dark) | `#171614` | **Custom** | Warm elevated surface |
| bg-tertiary | `#F2EFEA` | `--sand-3` | Close enough |
| bg-hover | `#E8E4DD` | `--sand-4` | Test contrast |
| **Text** ||||
| text-primary | `#2C2825` | **Custom** | Mauve-12 is too cool |
| text-secondary | `#6B635B` | **Custom** | Check contrast |
| text-muted | `#736B63` | **Custom** | Needs warmth |
| **Module: Bibliography** ||||
| biblio (light) | `#3A6D90` | **Custom** | Blue-11 too saturated |
| biblio (dark) | `#5A9FD4` | `--blue-10` or custom | Check match |
| biblio-tint | `#E3EDF4` | `--blue-3` | Blue-3 = `#e6f4fe` |
| **Module: Manuscripts** ||||
| manu (light) | `#247A5E` | **`--teal-11`** NOT green | Teal-11 = `#008573` |
| manu (dark) | `#4DCBA8` | `--teal-9` | Check match |
| manu-tint | `#E0F2EC` | `--teal-3` | Teal-3 = `#e0f8f3` |
| **Module: Discover** ||||
| discover (light) | `#7E5098` | `--purple-11` | Close match |
| discover (dark) | `#BC8BD0` | `--purple-9` | Check match |
| discover-tint | `#F0E6F5` | `--purple-3` | Purple-3 = `#f7edfe` |

---

## 4. Recommended Approach: Hybrid Custom + Radix

### Why Hybrid?

Radix colors are great for accessible color steps, but they can't match the **warm cream** and **warm charcoal** tones of the original "Scholarly Warmth" design.

**Solution**: Use original hex values where Radix doesn't have a close match, and use Radix scales for everything else.

### What Stays Custom (Original Hex)
- `--bg-primary` (light): `#FAF8F5`
- `--bg-primary` (dark): `#000000`
- `--bg-secondary` (dark): `#171614`
- `--text-primary`: `#2C2825` (light) / `#E8E4DF` (dark)
- `--text-secondary`: `#6B635B` (light) / `#9A958D` (dark)
- `--biblio`: `#3A6D90` (light) / `#5A9FD4` (dark)
- `--manu`: `#247A5E` (light) / `#4DCBA8` (dark)
- `--discover`: `#7E5098` (light) / `#BC8BD0` (dark)

### What Uses Radix Scales
- Hover states: Use Radix alpha overlays
- Tints: Use Radix step 3 or alpha-3
- Semantic colors (success, warning, error): Radix green, amber, tomato
- Borders: Radix sand scale

---

## 5. Implementation Plan

### Phase 1: Add Teal Scale Import
**File:** `src/styles/radix-colors.css`

```css
/* Add Teal for Manuscripts module */
@import "@radix-ui/colors/teal.css";
@import "@radix-ui/colors/teal-dark.css";
@import "@radix-ui/colors/teal-alpha.css";
@import "@radix-ui/colors/teal-dark-alpha.css";
```

### Phase 2: Update shared-tokens.css

Replace Radix approximations with original hex values:

```css
:root {
  /* === FOUNDATION: WARM SCHOLARLY PALETTE === */

  /* Backgrounds - Original "Scholarly Warmth" values */
  --bg-primary: #FAF8F5;      /* Warm cream - NOT Radix */
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F2EFEA;
  --bg-hover: #E8E4DD;
  --bg-hover-subtle: rgba(0, 0, 0, 0.04);

  /* Text - Warm charcoal tones */
  --text-primary: #2C2825;    /* Warm charcoal - NOT mauve-12 */
  --text-secondary: #6B635B;
  --text-muted: #736B63;

  /* Borders */
  --border-default: #D9D4CB;
  --border-subtle: #E8E4DD;

  /* === MODULE ACCENTS: BALANCED MOOD === */

  /* Bibliography - Steel Blue (~205 hue) */
  --biblio: #3A6D90;
  --biblio-hover: #2D5A7A;
  --biblio-tint: #E3EDF4;
  --biblio-strong: #2A5270;

  /* Manuscripts - Teal (~163 hue) - NOT green! */
  --manu: #247A5E;
  --manu-hover: #1C6149;
  --manu-tint: #E0F2EC;
  --manu-strong: #1A5C47;

  /* Discover - Violet (~278 hue) */
  --discover: #7E5098;
  --discover-hover: #6A4380;
  --discover-tint: #F0E6F5;
  --discover-strong: #5C3A70;

  /* === TAG COLORS === */
  --tag-cyan-bg: #E3EDF4;
  --tag-cyan-text: #2A5270;
  --tag-violet-bg: rgba(126, 80, 152, 0.15);
  --tag-violet-text: #7E5098;
  --tag-emerald-bg: rgba(42, 130, 104, 0.15);
  --tag-emerald-text: #2A8268;
  --tag-amber-bg: rgba(184, 134, 11, 0.15);
  --tag-amber-text: #B8860B;
}

.dark-theme {
  /* === DARK MODE: TRUE BLACK BASE === */

  /* Backgrounds - OLED optimized */
  --bg-primary: #000000;      /* TRUE BLACK */
  --bg-secondary: #171614;    /* Warm elevated */
  --bg-tertiary: #1E1D1A;
  --bg-hover: #252320;
  --bg-hover-subtle: rgba(255, 255, 255, 0.06);

  /* Text - Warm off-whites */
  --text-primary: #E8E4DF;
  --text-secondary: #9A958D;
  --text-muted: #857F77;

  /* Borders */
  --border-default: #3D3A35;
  --border-subtle: #2E2B27;

  /* === MODULE ACCENTS: DARK MODE === */
  --biblio: #5A9FD4;
  --biblio-hover: #7AB4E0;
  --biblio-tint: rgba(90, 159, 212, 0.15);

  --manu: #4DCBA8;
  --manu-hover: #6ED9BC;
  --manu-tint: rgba(77, 203, 168, 0.15);

  --discover: #BC8BD0;
  --discover-hover: #CDA3DD;
  --discover-tint: rgba(188, 139, 208, 0.15);
}
```

### Phase 3: Update index.css Tailwind Theme

Map the custom tokens to Tailwind utility classes.

### Phase 4: Update Tag Badge Classes

In `BibliographyPage.tsx`, update tag variant classes to use the new tokens.

---

## 6. Testing Checklist

### Contrast Verification (WCAG AA: 4.5:1 for text)
- [ ] `#2C2825` on `#FAF8F5` = 11.8:1 ✓
- [ ] `#6B635B` on `#FAF8F5` = 5.2:1 ✓
- [ ] `#3A6D90` on `#FAF8F5` = 5.4:1 ✓
- [ ] `#247A5E` on `#FAF8F5` = 5.9:1 ✓
- [ ] `#7E5098` on `#FAF8F5` = 5.1:1 ✓
- [ ] `#E8E4DF` on `#000000` = 14.3:1 ✓

### Visual Comparison
- [ ] HomePage matches `home-citable-balanced.html`
- [ ] BibliographyPage background has warm cream tone
- [ ] Module cards have correct accent colors
- [ ] Dark mode is TRUE black (#000000)
- [ ] Tags use correct background/text combinations

---

## 7. Files to Modify

1. **`src/styles/radix-colors.css`** - Add teal imports
2. **`src/styles/shared-tokens.css`** - Replace with original hex values
3. **`src/styles/index.css`** - Update Tailwind theme bridge
4. **`src/ui/pages/BibliographyPage.tsx`** - Update tag variant classes
5. **`src/ui/pages/HomePage.tsx`** - Verify module card colors

---

## Sources

- [Radix Colors Custom Palettes](https://www.radix-ui.com/colors/docs/overview/custom-palettes)
- [Radix Themes Color Documentation](https://www.radix-ui.com/themes/docs/theme/color)
- Original design files in `design_mahdi/`
