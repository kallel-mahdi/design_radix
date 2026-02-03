# Citable Color System — Design Rationale

**Document Version:** 1.1
**Date:** January 2026 (Updated with WCAG-corrected values)  
**Prepared for:** Graphic Design Team

---

## Executive Summary

Citable is an academic research productivity platform integrating collaborative document editing, bibliography management, and AI-powered paper discovery. This document outlines the complete design rationale for our color system, created to support researchers during extended work sessions (6-10+ hours daily) while maintaining visual distinction between platform modules.

The palette is named **"Scholarly Warmth"** — a system that prioritizes eye comfort and reading endurance without sacrificing personality or modern aesthetics.

---

## 1. Design Brief & Requirements

### Primary Constraints

1. **True Black Dark Mode (#000000)** — Non-negotiable requirement for OLED display optimization. Many researchers work on tablets and phones; true black saves battery and reduces eye strain in low-light environments.

2. **Extended Reading Sessions** — The platform's primary use case involves reading academic papers for 6-10+ hours daily. Every color choice must minimize eye fatigue.

3. **Three Distinct Modules** — The platform has three functional areas that need visual differentiation:
   - **Bibliography** — Reference management, reading, consultation
   - **Manuscripts** — Document editing, writing, creation
   - **Discover** — Paper discovery, exploration, recommendations

4. **WCAG AA Compliance** — All text must meet accessibility standards (4.5:1 for normal text, 3:1 for UI components).

5. **PDF Integration** — Academic PDFs must feel "native" to the interface, not like floating foreign objects.

### Secondary Goals

- Warm, inviting aesthetic (not clinical or corporate)
- Cohesive visual harmony across all modules
- Flexibility for user preference (mood variants)
- Professional appearance suitable for academic context

---

## 2. Inspirations & Influences

### 2.1 Catppuccin Latte

**What we borrowed:** The philosophy of warm cream backgrounds instead of stark white.

Catppuccin's "Latte" variant demonstrated that productivity interfaces don't need to be clinical. Their warm foundation creates a sense of comfort during long work sessions — like working in a well-lit café rather than a fluorescent office.

**Our adaptation:** We adopted the cream background concept but tuned our specific values (#FAF8F5) to work optimally with academic content and our module accent colors.

### 2.2 Rosé Pine

**What we borrowed:** The low-saturation harmony approach.

Rosé Pine proved that accent colors can be distinctive without being loud. Their ~40% saturation creates a "muted jewel tone" effect — colors that have personality but don't compete for attention.

**Our adaptation:** We applied this saturation philosophy to our three module colors, ensuring they're distinguishable but harmonious. We also created "mood variants" that let users dial saturation up or down based on preference.

### 2.3 Flexoki

**What we borrowed:** The reading-focused warmth philosophy.

Flexoki was designed specifically for reading interfaces, with careful attention to reducing blue light and harsh contrasts. Their research into reading comfort informed our text color choices.

**Our adaptation:** Our warm charcoal text (#2C2825) in light mode and cream-tinted off-white (#E8E4DF) in dark mode both reduce harshness compared to pure black/white.

### 2.4 Academic & Library Aesthetics

**Conceptual inspiration:** The feeling of aged paper, wooden reading desks, and warm library lighting.

We wanted Citable to evoke the comfort of a well-appointed academic library — not the harsh efficiency of a laboratory. This influenced our choice of warm undertones throughout, even in dark mode where elevated surfaces carry subtle brown tints.

### 2.5 What's Original

While we drew inspiration from existing palettes, several elements are our own contribution:

- **Module-to-mental-model mapping:** Deliberately mapping blue→consultation, teal→creation, purple→exploration based on color psychology research
- **True black + warmth combination:** Achieving cozy dark mode while maintaining #000000 base through warm elevated surfaces
- **Mood variant system:** Three saturation tiers sharing the same foundation
- **PDF integration strategy:** Specific approach to making documents "melt into" the interface

---

## 3. Color Architecture

### 3.1 Foundation Layer (Theme-Dependent, Mood-Independent)

The foundation colors remain constant regardless of which "mood" the user selects. This ensures stability and consistency.

#### Light Mode Foundation

| Token | Value | Purpose |
|-------|-------|---------|
| `bg-primary` | #FAF8F5 | Main page background — warm cream |
| `bg-secondary` | #F2EFEA | Sidebar, panels — slightly deeper warmth |
| `bg-canvas` | #FFFFFF | Cards, elevated surfaces, PDF container |
| `bg-elevated` | #FEFDFB | Tooltips, dropdowns, popovers |
| `text-primary` | #2C2825 | Main text — warm charcoal (13.78:1 contrast) |
| `text-secondary` | #6B635B | Supporting text (5.56:1 contrast) |
| `text-tertiary` | #736B63 | Placeholders, disabled states (5.2:1 contrast) |
| `border-subtle` | #E8E4DD | Subtle dividers |
| `border-default` | #D9D4CB | Standard borders |
| `border-strong` | #C4BDB2 | Emphasized borders |

**Design note:** The primary background (#FAF8F5) has RGB values of 250, 248, 245 — the red channel is higher than blue, creating perceptible warmth without appearing yellow or tinted.

#### Dark Mode Foundation

| Token | Value | Purpose |
|-------|-------|---------|
| `bg-primary` | #000000 | TRUE BLACK — OLED optimized |
| `bg-secondary` | #0D0D0C | Barely lifted — sidebar, panels |
| `bg-canvas` | #171614 | Cards, elevated surfaces |
| `bg-elevated` | #1E1D1A | Tooltips, dropdowns |
| `text-primary` | #E8E4DF | Warm off-white (16.59:1 contrast) |
| `text-secondary` | #9A958D | Muted warm gray (7.06:1 contrast) |
| `text-tertiary` | #857F77 | Placeholders, disabled states (4.84:1 contrast) |
| `border-subtle` | #1F1E1B | Barely visible dividers |
| `border-default` | #2D2B27 | Standard borders |
| `border-strong` | #3D3A35 | Emphasized borders |

**Design note:** While the base is true black, elevated surfaces (#171614, #1E1D1A) carry warm undertones. The hex values have slightly higher red than blue channels, preventing the "cold void" feeling of pure gray dark modes.

**Eye comfort note:** Pure black (#000000) with pure white (#FFFFFF) text can cause a "halation" effect for users with astigmatism, where text appears to blur. Our warm off-white text (#E8E4DF) mitigates this issue while maintaining excellent contrast (16.59:1).

### 3.2 Module Accent Layer (Mood-Dependent)

Each module has a dedicated color that carries semantic meaning:

| Module | Mental Model | Emotional Association | Hue |
|--------|--------------|----------------------|-----|
| **Bibliography** | Consultation, Reading | Calm, trustworthy, scholarly | ~205° (Steel Blue) |
| **Manuscripts** | Creation, Writing | Focused, productive, confident | ~163° (Teal) |
| **Discover** | Exploration, Connection | Curious, expansive, inspiring | ~278° (Soft Violet) |

**Hue distribution rationale:** The three hues are spread across the color wheel with minimum 40° separation, ensuring clear visual distinction even for users with color vision deficiencies. Blue and teal are adjacent but distinct; purple provides strong contrast to both.

---

## 4. Mood Variants

To accommodate different preferences and contexts, we created three "mood" options that adjust module color saturation while keeping the foundation constant.

### 4.1 Muted (Default)

**Saturation:** ~20-36%
**Best for:** Long reading sessions, maximum eye comfort

This is the recommended default. Colors are clearly distinguishable but never demanding. The lower saturation reduces visual fatigue during extended use. The saturation varies slightly by hue to maintain perceptual balance.

| Module | Light Mode | Dark Mode |
|--------|------------|-----------|
| Bibliography | #4A6A82 | #7BA3C2 |
| Manuscripts | #3A7A68 | #6BB8A2 |
| Discover | #7A5A88 | #AD8FBD |

### 4.2 Balanced

**Saturation:** ~40-45%  
**Best for:** Daily use, good balance of energy and ease

Slightly more presence than Muted, suitable for users who find the default too subdued.

| Module | Light Mode | Dark Mode |
|--------|------------|-----------|
| Bibliography | #3A6D90 | #5A9FD4 |
| Manuscripts | #247A5E | #4DCBA8 |
| Discover | #7E5098 | #BC8BD0 |

### 4.3 Vibrant

**Saturation:** ~50-55%  
**Best for:** Shorter focused sessions, users who prefer more color

The most energetic option, still within the warm palette family but noticeably more saturated.

| Module | Light Mode | Dark Mode |
|--------|------------|-----------|
| Bibliography | #2E6E98 | #47A3E0 |
| Manuscripts | #188060 | #2DD4A8 |
| Discover | #8048A8 | #C97DE0 |

**Important:** All mood variants pass WCAG AA requirements. The light mode colors were specifically darkened to ensure white text on colored buttons achieves 4.5:1 contrast ratio.

---

## 5. Color Harmony Strategy

### 5.1 The Problem

Three distinct module colors risk creating visual chaos. Many applications with multiple accent colors feel disjointed because each color was chosen in isolation.

### 5.2 Our Solution

We harmonized the three module colors by constraining them to similar saturation and lightness values while varying only the hue. This creates what we call "coordinated distinction" — the colors are clearly different but feel like they belong to the same family.

**Muted mood example (light mode):**
- Bibliography: H:206° S:27% L:40%
- Manuscripts: H:163° S:36% L:35%
- Discover: H:282° S:20% L:44%

The saturation spread is only 16% and lightness spread is only 9%, creating strong visual cohesion.

### 5.3 Dark Mode Adjustment

In dark mode, we increase both saturation and lightness to maintain visibility against the dark background. The colors shift brighter but maintain their relative relationships.

---

## 6. PDF Integration Philosophy

Academic PDFs present a unique challenge: they're typically white documents that must display within our interface without feeling like foreign objects.

### Light Mode Approach

The PDF container uses pure white (#FFFFFF), which is slightly brighter than our cream background (#FAF8F5). This creates a natural "paper on desk" effect — the document feels like it's sitting on a warm surface rather than floating in a void.

**Visual metaphor:** A printed paper lying on a wooden desk in warm afternoon light.

### Dark Mode Approach

Instead of displaying white PDFs (which would create jarring contrast against true black), we render the PDF container in warm dark gray (#1A1917). This eliminates harsh contrast jumps while maintaining readability.

**Annotation colors** also shift:
- Light mode: #FFF8DC (warm cream highlight)
- Dark mode: #3D3520 (warm amber tint)

---

## 7. Semantic Colors

Status indicators use warm-tinted versions of traditional semantic colors:

| Status | Light Mode | Dark Mode | Use Case |
|--------|------------|-----------|----------|
| Success | #4A7A4A | #7DB87D | Save confirmed, sync complete |
| Warning | #A07030 | #D4A558 | Unsaved changes, conflicts |
| Error | #A84845 | #D47B77 | Validation errors, failures |
| Info | (Bibliography blue) | (Bibliography blue) | Tips, neutral notifications |

These colors were chosen to feel cohesive with the warm palette while maintaining their semantic clarity.

---

## 8. WCAG Compliance Summary

All color combinations have been validated for WCAG AA compliance:

### Text Contrast (requires ≥4.5:1)
- ✅ Light primary text on cream: 13.78:1
- ✅ Light secondary text on cream: 5.56:1
- ✅ Dark primary text on black: 16.59:1
- ✅ Dark secondary text on black: 7.06:1

### UI Component Contrast (requires ≥3:1)
- ✅ All module colors on respective backgrounds: >3:1
- ✅ All semantic colors: >3:1

### Button Text (white on colored backgrounds, requires ≥4.5:1)
- ✅ All light mode module colors: >4.5:1
- ✅ Achieved by darkening original color selections

---

## 9. Logo Gradient Rationale

The Citable logo uses a diagonal gradient incorporating all three module colors:

```
Top-left: #7E5098 (Discover — Purple)
Center: #3A6D90 (Bibliography — Blue)
Bottom-right: #247A5E (Manuscripts — Teal)
```

**Rationale:** The gradient represents the unified platform where all three workflows connect. The diagonal flow suggests movement and progress — appropriate for a productivity tool. Purple at top-left catches the eye first (exploration/discovery), flowing through blue (research/reading) to teal (creation/writing), mirroring a typical research workflow.

**Alternative provided:** A blue-focused vertical gradient for contexts where the tri-color approach is too complex (favicons, small sizes).

---

## 10. Implementation Notes for Designers

### Color Tokens

We recommend implementing colors as design tokens/CSS custom properties rather than hard-coded values. This enables:
- Easy theme switching
- Mood variant toggling
- Future palette refinements without find-replace

### Opacity Usage

For module "soft" backgrounds (e.g., selected states, hover states), use the primary color at 12-14% opacity rather than defining separate light tint colors. This ensures consistency if primary colors are adjusted.

### Dark Mode Transitions

When animating between light and dark mode, transition background colors over ~300ms with ease timing. This prevents jarring flashes, especially important given the dramatic shift from cream to true black.

### Accessibility Testing

We recommend testing with:
- macOS/iOS "Increase Contrast" mode
- Windows High Contrast mode
- Colorblindness simulators (particularly deuteranopia and protanopia)

The 40°+ hue separation between modules should maintain distinction for most color vision deficiencies, but real-user testing is recommended.

**Colorblind-specific notes:**
- Blue (Bibliography) is the safest choice—most colorblindness types perceive blue accurately
- The blue/teal pair (42° separation) may appear similar for some deuteranopia users
- Consider supplementing color with icons or labels in critical navigation contexts
- Tritanopia (blue-yellow blindness) is rare (<0.01%) but may affect blue/purple distinction

---

## 11. Files Provided

| File | Description |
|------|-------------|
| `citable-palette.jsx` | Interactive React component with all values |
| `final-palette.js` | JavaScript object with complete palette definition |
| `color-options-comparison.html` | Interactive comparison tool |
| `citable-logo-balanced.svg` | Primary logo with tri-color gradient |
| `citable-logo-mono-blue.svg` | Monochrome version (bibliography blue) |
| `citable-logo-dark.svg` | Dark mode variant |
| `citable-icon-only.svg` | Icon without circle background |

---

## 12. Summary

The Scholarly Warmth palette balances three competing demands:

1. **Comfort** — Warm tones, reduced contrast, eye-friendly for extended sessions
2. **Clarity** — Three distinct modules remain visually distinguishable
3. **Compliance** — Full WCAG AA accessibility across all combinations

The system provides flexibility through mood variants while maintaining a cohesive visual identity. The true black dark mode respects OLED requirements while warm elevated surfaces prevent clinical coldness.

We've aimed to create an interface that feels like a comfortable, well-appointed academic library — a space where researchers can spend hours without fatigue, surrounded by their work in an environment that supports rather than distracts.

---

*Questions or refinements? This system is designed to be iterated upon. The underlying architecture (foundation + module + mood layers) allows for adjustments without rebuilding from scratch.*
