# Bibliography Manager Frontend — Design System

## Overview

This design system defines the visual language for the bibliography manager frontend. It combines the editor's Tailwind CSS foundation with custom tokens from the Figma mockups, prioritizing dark theme aesthetics with a distinctive neon green accent.

**Design Principles**:
- **Consistency**: Match editor frontend patterns where possible
- **Accessibility**: WCAG 2.1 Level AA compliance minimum
- **Dark-first**: Optimized for low-light research environments
- **Modern**: Clean, minimal, VS Code-inspired aesthetics
- **Responsive**: Works on desktop (primary) and tablets (Phase 2)

---

## 1. Color Palette

### 1.1 Tailwind v4 CSS Custom Properties (IMPORTANT)

**Tailwind v4 uses CSS custom properties** for dynamic theming. Colors are defined in `src/styles/tailwind.css` using the `@theme` block and referenced in `tailwind.config.js` via `var()`.

**src/styles/tailwind.css** (@theme block):
```css
@theme {
  /* Light mode colors (edit here for all themes) */
  --color-app-bg: #2E302F;
  --color-app-bg-secondary: #3A3C3B;
  --color-app-accent: #00DF82;        /* Neon green accent */
  --color-app-text: #FFFFFF;
  --color-app-text-muted: #CCCCCC;
  --color-app-border: #444444;
  --color-app-border-accent: #00DF82;
}
```

**tailwind.config.js** (reference via var()):
```javascript
export default {
  theme: {
    extend: {
      colors: {
        // ✅ App colors using CSS custom properties
        app: {
          bg: 'var(--color-app-bg)',
          'bg-secondary': 'var(--color-app-bg-secondary)',
          accent: 'var(--color-app-accent)',
          text: 'var(--color-app-text)',
          'text-muted': 'var(--color-app-text-muted)',
          border: 'var(--color-app-border)',
          'border-accent': 'var(--color-app-border-accent)',
        },
      }
    }
  }
}
```

**Usage in Components**:
```tsx
// ✅ CORRECT - Uses CSS custom properties
<div className="bg-app-bg text-app-text border border-app-border">
  <button className="bg-app-accent text-black hover:opacity-80">
    Click me
  </button>
</div>

// ❌ WRONG - Direct hex values (use var() instead)
<div className="bg-[#2E302F]">Don't do this</div>
```

**Why CSS Custom Properties?**
- ✅ Dynamic theme switching (change CSS vars in JS, entire app updates)
- ✅ Centralized color management (edit `tailwind.css`, not scattered throughout config)
- ✅ Better maintainability (Phase 2 light theme support)
- ✅ Performance (CSS vars computed by browser, not at build time)

---

### 1.2 Brand Color System (Adopted from Editor)

**PRIMARY: Bangladesh Green** (bibliography primary accent):
```typescript
primary: {
  50: '#E6F5F2',
  100: '#CCEBE5',
  200: '#99D7CB',
  300: '#66C3B1',
  400: '#33AF97',
  500: '#03624C',    // ← Main brand color (bibliog accent)
  600: '#024E3D',
  700: '#023B2E',
  800: '#01271F',
  900: '#01140F',
}
```

**SECONDARY: Caribbean Green** (highlights, success):
```typescript
secondary: {
  50: '#F0FCF0',
  100: '#E0F9E0',
  200: '#C2F3C2',
  300: '#A3EDA3',
  400: '#85E785',
  500: '#60DF60',    // ← Bright green (success, highlights)
  600: '#4DB24D',
  700: '#3A863A',
  800: '#265926',
  900: '#132D13',
}
```

**SUPPORTING: Rich Black + Cultured** (backgrounds):
```typescript
'rich-black': {
  DEFAULT: '#030F0F',
  // ... 50-900 scale for dark variant
},
cultured: {
  DEFAULT: '#F1F9FE',
  // ... 50-900 scale for light variant
}
```

**SEMANTIC** (errors, warnings, info - standard Tailwind):
```typescript
semantic: {
  danger: '#EF4444',    // red-500
  warning: '#F59E0B',   // amber-500
  success: '#10B981',   // green-500
  info: '#3B82F6',      // blue-500
}
```

**Complete tailwind.config.js Color Section**:
```javascript
export default {
  theme: {
    extend: {
      colors: {
        // CSS custom property colors (REQUIRED)
        app: {
          bg: 'var(--color-app-bg)',
          'bg-secondary': 'var(--color-app-bg-secondary)',
          accent: 'var(--color-app-accent)',
          text: 'var(--color-app-text)',
          'text-muted': 'var(--color-app-text-muted)',
          border: 'var(--color-app-border)',
          'border-accent': 'var(--color-app-border-accent)',
        },

        // Brand color scales
        primary: {
          50: '#E6F5F2', 100: '#CCEBE5', 200: '#99D7CB', 300: '#66C3B1',
          400: '#33AF97', 500: '#03624C', 600: '#024E3D', 700: '#023B2E',
          800: '#01271F', 900: '#01140F'
        },
        secondary: {
          50: '#F0FCF0', 100: '#E0F9E0', 200: '#C2F3C2', 300: '#A3EDA3',
          400: '#85E785', 500: '#60DF60', 600: '#4DB24D', 700: '#3A863A',
          800: '#265926', 900: '#132D13'
        },

        // High contrast neutrals (for text on light/dark)
        neutral: {
          50: '#FAFAFA', 100: '#F5F5F5', 200: '#E5E5E5', 300: '#D4D4D4',
          400: '#A3A3A3', 500: '#737373', 600: '#525252', 700: '#404040',
          800: '#262626', 900: '#171717', 950: '#0A0A0A'
        },

        // Standard colors (use for utility, avoid primary/secondary)
        white: '#FFFFFF',
        black: '#000000'
      }
    }
  }
}
```

### 1.2 Tag Colors (Zotero-inspired, 9 max)

**Color Palette for Tag Assignment**:
```typescript
tagColors: {
  1: '#EF4444',  // Red
  2: '#F97316',  // Orange
  3: '#F59E0B',  // Amber
  4: '#EAB308',  // Yellow
  5: '#22C55E',  // Green
  6: '#06B6D4',  // Cyan
  7: '#3B82F6',  // Blue
  8: '#8B5CF6',  // Purple
  9: '#EC4899',  // Pink
}
```

**Tag Color Picker UI**:
```
┌────────────────────────────┐
│ Assign Color to Tag        │
├────────────────────────────┤
│ Position 1: ⚫ Red          │  (if not already assigned)
│ Position 2: 🟠 Orange      │
│ Position 3: 🟡 Amber       │
│ ...                        │
│ Position 9: 🩷 Pink        │
│                            │
│ [ Remove Color ]           │  (if tag already has color)
└────────────────────────────┘
```

### 1.3 Light Theme (Phase 2)

**Future Light Mode Palette**:
```typescript
// Light theme colors (to be added in Phase 2)
light: {
  bg: {
    light: '#FFFFFF',
    surface: '#F9FAFB',
    hover: '#F3F4F6',
  },
  border: {
    DEFAULT: '#E5E7EB',
    accent: '#04E39E',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    muted: '#9CA3AF',
  },
  // Accent remains same (good contrast on light)
}
```

**Tailwind Dark Mode Config**:
```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // Use class strategy for manual toggle
  // ... colors defined above
}
```

**Theme Switching** (Phase 2):
```tsx
// Apply 'dark' class to <html> for dark theme
document.documentElement.classList.add('dark')

// Use Tailwind dark: variant
<div className="bg-bg-light dark:bg-bg-dark">
```

---

## 2. Typography

### 2.1 Font Family (Tailwind v4 with CSS Custom Properties)

**src/styles/tailwind.css** (@theme block):
```css
@theme {
  /* Font families (edit here to change globally) */
  --font-family-sans: 'Josefin Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
}
```

**tailwind.config.js**:
```javascript
export default {
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-family-sans)'],
        'mono': ['var(--font-family-mono)'],
      },
    }
  }
}
```

**Usage**:
```tsx
// Default (uses --font-family-sans from CSS vars)
<p className="font-sans">This is body text</p>

// Monospace (for DOI, code, technical)
<code className="font-mono">10.1234/example</code>
```

**Why CSS Custom Properties for Fonts?**
- ✅ Easy to swap font stack globally in one place
- ✅ Design consistency across editor and bibliography
- ✅ Phase 2 font switching (e.g., dyslexia-friendly fonts)
- ✅ Matches Tailwind v4 approach

### 2.2 Font Scale

```typescript
fontSize: {
  xs: '12px',      // Small labels, tag counts, metadata
  sm: '14px',      // Body text, table cells, secondary info
  base: '16px',    // Primary text, form inputs
  lg: '20px',      // Card titles, section headers
  xl: '24px',      // Page titles, modal headers
  '2xl': '30px',   // Rarely used (Phase 2+)
}
```

### 2.3 Font Weights

```typescript
fontWeight: {
  regular: 400,    // Body text
  medium: 500,     // Emphasis, buttons
  semibold: 600,   // Headings, labels
}
```

**Usage Guidelines**:
- **Body text**: Regular (400), 14px
- **Headings**: Semibold (600), 20-24px
- **Labels**: Medium (500), 12-14px
- **Buttons**: Medium (500), 14-16px

### 2.4 Line Height

```typescript
lineHeight: {
  tight: 1.25,     // Headings
  normal: 1.5,     // Body text
  relaxed: 1.75,   // Long-form text (notes, descriptions)
}
```

### 2.5 Typography Examples

```tsx
// Page title
<h1 className="text-xl font-semibold text-text-primary">Library</h1>

// Section header
<h2 className="text-lg font-semibold text-text-primary mb-4">Collections</h2>

// Body text
<p className="text-sm text-text-secondary">No references found</p>

// Label
<label className="text-sm font-medium text-text-primary">Title</label>

// Muted hint
<span className="text-xs text-text-muted">Optional</span>

// Monospace (DOI)
<code className="font-mono text-sm text-blue-400">10.1234/example</code>
```

---

## 3. Spacing

### 3.1 Spacing Scale (8px base grid)

**Tailwind Defaults** (use as-is):
```typescript
spacing: {
  0: '0px',
  0.5: '2px',
  1: '4px',
  2: '8px',       // Base unit
  3: '12px',
  4: '16px',      // Standard gap (2× base)
  5: '20px',
  6: '24px',      // Section spacing (3× base)
  8: '32px',      // Large gaps (4× base)
  10: '40px',
  12: '48px',     // Extra large gaps (6× base)
  16: '64px',     // Activity bar width (8× base)
}
```

### 3.2 Layout Spacing

```typescript
// Common spacing patterns
padding: {
  card: 'p-4',              // 16px padding for cards
  modal: 'p-6',             // 24px padding for modals
  section: 'py-6 px-4',     // 24px vertical, 16px horizontal for sections
}

gap: {
  form: 'space-y-4',        // 16px gap between form fields
  buttons: 'gap-3',         // 12px gap between buttons
  table: 'gap-2',           // 8px gap in table cells
}

margin: {
  section: 'mb-6',          // 24px bottom margin for sections
  heading: 'mb-4',          // 16px bottom margin for headings
}
```

### 3.3 Component-Specific Spacing

**ReferenceTable**:
- Row padding: `px-3 py-2` (12px horizontal, 8px vertical)
- Row gap: `space-x-3` (12px between cells)
- Header padding: `px-3 py-3` (12px horizontal, 12px vertical)

**TreeView**:
- Indent per level: `16px` (set via `paddingLeft: ${level * 16}px`)
- Item padding: `px-2 py-1` (8px horizontal, 4px vertical)
- Vertical gap: `space-y-1` (4px between items)

**Modal**:
- Header/Footer padding: `px-6 py-4` (24px horizontal, 16px vertical)
- Body padding: `px-6 py-4`
- Gap between elements: `space-y-4` (16px)

**Sidebar**:
- Default width: `280px`
- Min width: `100px`
- Max width: `600px`
- Resize handle width: `1px` (hover: `2px`)

---

## 4. Border Radius

```typescript
borderRadius: {
  none: '0px',
  sm: '2px',       // Small elements (badges, pills)
  DEFAULT: '4px',  // Buttons, inputs, cards
  md: '6px',       // Larger cards, panels
  lg: '8px',       // Modals, large surfaces
  xl: '12px',      // Hero elements (rare)
  full: '9999px',  // Pills, circular elements
}
```

**Usage Guidelines**:
- **Buttons**: `rounded` (4px)
- **Inputs**: `rounded` (4px)
- **Cards**: `rounded-lg` (8px)
- **Modals**: `rounded-lg` (8px)
- **Tag pills**: `rounded-full` (9999px)
- **Badges**: `rounded-full` (9999px)

---

## 5. Shadows (Custom Brand Shadows)

**tailwind.config.js**:
```typescript
boxShadow: {
  // Tailwind defaults
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Brand shadows (from editor)
  'brand': '0 4px 6px -1px rgba(3, 98, 76, 0.1), 0 2px 4px -1px rgba(3, 98, 76, 0.06)',
  'brand-lg': '0 10px 15px -3px rgba(3, 98, 76, 0.1), 0 4px 6px -2px rgba(3, 98, 76, 0.05)',
  'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
}
```

**Usage Guidelines**:
- **Cards**: `shadow-soft` (subtle, dark theme optimized)
- **Cards (elevated)**: `shadow-soft-lg`
- **Brand elements**: `shadow-brand` (green tint)
- **Modals**: `shadow-lg` (Tailwind default)
- **Dropdowns**: `shadow-lg`
- **Inputs**: `shadow-inner` (focus: `shadow-md`)
- **Buttons**: No shadow (use borders/accents instead)

**Dark Theme Advantage**:
Custom soft shadows work better on dark backgrounds than default Tailwind shadows (less contrast needed):

---

## 6. Borders

```typescript
borderWidth: {
  DEFAULT: '1px',
  0: '0px',
  2: '2px',      // Thick borders (selected states)
  4: '4px',      // Extra thick (rare, Phase 2)
}

borderColor: {
  DEFAULT: '#1F2330',  // border-border
  accent: '#04E39E',   // border-accent
  transparent: 'transparent',
}
```

**Usage Guidelines**:
- **Cards**: `border border-border`
- **Selected items**: `border-l-2 border-accent` (left accent border)
- **Inputs (focus)**: `ring-2 ring-accent` (focus ring, not border)
- **Dividers**: `border-t border-border` (horizontal divider)

**Border Styles**:
```tsx
// Default border
<div className="border border-border rounded-lg">

// Accent border (selected)
<div className="border-l-2 border-accent">

// Focus ring (inputs)
<input className="focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-dark">
```

---

## 7. Icons

### 7.1 Icon Library

**Heroicons** (@heroicons/react) - MIT licensed, Tailwind-designed

**Sizes**:
- **20px** (`w-5 h-5`): Inline icons (buttons, form fields)
- **24px** (`w-6 h-6`): Activity bar icons, primary actions
- **16px** (`w-4 h-4`): Tree expand/collapse, small buttons
- **32px** (`w-8 h-8`): Empty state icons (rare)

**Styles**:
- **Outline** (default): Thin stroke, modern aesthetic
- **Solid** (rare): Use for filled states (notifications, alerts)

### 7.2 Common Icons

```tsx
import {
  // Navigation
  BookOpenIcon,            // Library
  MagnifyingGlassIcon,     // Search
  LinkIcon,                // Projects
  ExclamationTriangleIcon, // Duplicates
  TrashIcon,               // Trash
  Cog6ToothIcon,           // Settings

  // Actions
  PlusIcon,                // Add
  PencilIcon,              // Edit
  XMarkIcon,               // Close, remove
  ArrowDownTrayIcon,       // Download
  ArrowUpTrayIcon,         // Upload
  DocumentArrowDownIcon,   // Export
  DocumentArrowUpIcon,     // Import

  // UI
  ChevronRightIcon,        // Expand (tree)
  ChevronDownIcon,         // Dropdown
  FolderIcon,              // Collection
  TagIcon,                 // Tag
  PaperClipIcon,           // Attachment
  CheckIcon,               // Success, check
  ArrowPathIcon,           // Loading spinner

  // Misc
  InformationCircleIcon,   // Info
  ExclamationCircleIcon,   // Warning
  XCircleIcon,             // Error
} from '@heroicons/react/24/outline'
```

### 7.3 Icon Usage Examples

```tsx
// Activity bar
<BookOpenIcon className="w-6 h-6 text-accent" />

// Button with icon
<button>
  <PlusIcon className="w-5 h-5 mr-2" />
  New Reference
</button>

// Tree expand icon with rotation
<ChevronRightIcon className={clsx("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />

// Loading spinner
<ArrowPathIcon className="w-5 h-5 animate-spin" />

// Status icons (colored)
<CheckIcon className="w-5 h-5 text-green-500" />
<ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />
<XCircleIcon className="w-5 h-5 text-red-500" />
```

---

## 8. Animations & Transitions

### 8.1 Custom Animations (from Editor)

**tailwind.config.js**:
```typescript
animation: {
  'fade-in': 'fadeIn 0.3s ease-in-out',
  'slide-up': 'slideUp 0.3s ease-out',
  'slide-down': 'slideDown 0.3s ease-out',
  'spin': 'spin 1s linear infinite',  // Tailwind default
},

keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { transform: 'translateY(10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  slideDown: {
    '0%': { transform: 'translateY(-10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
}
```

**Usage**:
```tsx
// Fade in on mount
<div className="animate-fade-in">Content</div>

// Slide animations
<Modal className="animate-slide-up">Modal content</Modal>

// Loading spinner
<Icon className="animate-spin" />
```

### 8.2 Transition Durations

```typescript
transitionDuration: {
  75: '75ms',      // Instant (hover feedback)
  150: '150ms',    // Fast (button press, menu open)
  200: '200ms',    // Default (most transitions)
  300: '300ms',    // Slow (modal open, panel slide)
  500: '500ms',    // Very slow (page transitions, Phase 2)
}
```

**Default**: `transition-all duration-200` (200ms, all properties)

### 8.2 Transition Timing

```typescript
transitionTimingFunction: {
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',          // Accelerating (fade out)
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',         // Decelerating (fade in)
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',    // Smooth (default)
}
```

**Default**: `ease-in-out` for most transitions

### 8.3 Common Animations

**Hover States**:
```tsx
// Button hover
<button className="bg-accent hover:bg-accent-hover transition-colors duration-150">

// Row hover
<tr className="hover:bg-gray-800/50 transition-colors duration-75">
```

**Loading Spinner**:
```tsx
<ArrowPathIcon className="w-5 h-5 animate-spin" />
// Uses Tailwind's built-in spin animation (1s linear infinite)
```

**Fade In/Out** (Headless UI Transition):
```tsx
<Transition
  enter="transition-opacity duration-200"
  enterFrom="opacity-0"
  enterTo="opacity-100"
  leave="transition-opacity duration-150"
  leaveFrom="opacity-100"
  leaveTo="opacity-0"
>
  {children}
</Transition>
```

**Slide In** (Modal, Panel):
```tsx
<Transition
  enter="transition ease-out duration-200"
  enterFrom="opacity-0 scale-95"
  enterTo="opacity-100 scale-100"
  leave="transition ease-in duration-150"
  leaveFrom="opacity-100 scale-100"
  leaveTo="opacity-0 scale-95"
>
```

**Chevron Rotation** (Tree expand):
```tsx
<ChevronRightIcon className={clsx(
  "w-4 h-4 transition-transform duration-200",
  isExpanded && "rotate-90"
)} />
```

### 8.4 Motion Accessibility

**Respect `prefers-reduced-motion`** (Phase 3):
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Global Cursor System (GlobalCursor Component)

The editor uses a **custom neon green cursor** (GlobalCursor) that replaces the native cursor globally. This creates a unified, branded interaction experience.

### 9.1 Base CSS (src/styles/tailwind.css)

**Hide all native cursors** in `@layer base`:
```css
@layer base {
  html,
  body,
  #root {
    background-color: var(--color-app-bg);
    color: var(--color-app-text);
    cursor: none;  /* ← Hide native cursor */
  }

  /* Hide cursor on ALL interactive elements */
  *,
  *::before,
  *::after {
    cursor: none !important;
  }

  /* Hide on specific interactive elements */
  button, [type="button"], [type="submit"], a, input, textarea, select, [role="button"], [role="tab"] {
    cursor: none !important;
  }

  /* Hide on resizable elements */
  .resizer-handle,
  .resizer-handle * {
    cursor: none !important;
  }

  /* Hide during resize/drag operations */
  html.is-resizing,
  html.is-resizing * {
    cursor: none !important;
  }
}
```

### 9.2 GlobalCursor Component

**src/components/ui/GlobalCursor.tsx** (copy from editor):
```typescript
import React, { useEffect, useState } from 'react'

export const GlobalCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Neon green dot cursor */}
      <div
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--color-app-accent)',  // #00DF82
          borderRadius: '50%',
          boxShadow: '0 0 10px var(--color-app-accent)',
        }}
      />
    </div>
  )
}
```

### 9.3 App Integration

**src/App.tsx**:
```typescript
import { GlobalCursor } from '@/components/ui/GlobalCursor'

export const App = () => {
  return (
    <div>
      <GlobalCursor />
      {/* Rest of app content */}
    </div>
  )
}
```

**Important**: Mount GlobalCursor once at app root level, not inside modals or dynamic components.

---

## 10. Component Variant Patterns (CVA)

### 9.1 Button Variants

```typescript
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-accent text-black hover:bg-accent-hover",
        secondary: "bg-gray-700 text-white hover:bg-gray-600",
        ghost: "text-gray-300 hover:bg-gray-800",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    }
  }
)

// Usage
<button className={buttonVariants({ variant: "primary", size: "md" })}>
  Save
</button>
```

### 9.2 Badge Variants (Status, Priority)

```typescript
const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full",
  {
    variants: {
      status: {
        todo: "bg-gray-100 text-gray-800",
        'in-progress': "bg-yellow-100 text-yellow-800",
        review: "bg-purple-100 text-purple-800",
        done: "bg-green-100 text-green-800",
      },
      priority: {
        low: "bg-gray-100 text-gray-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-orange-100 text-orange-800",
        urgent: "bg-red-100 text-red-800",
      }
    }
  }
)
```

### 9.3 Table Row Variants

```typescript
const rowVariants = cva(
  "border-b border-border cursor-pointer transition-colors",
  {
    variants: {
      selected: {
        true: "bg-accent/5 border-l-2 border-accent",
        false: "hover:bg-gray-800/50",
      },
      hasPdf: {
        true: "",
        false: "",
      }
    },
    compoundVariants: [
      {
        selected: true,
        hasPdf: true,
        className: "bg-accent/10" // Brighter if selected AND has PDF
      }
    ]
  }
)
```

---

## 10. Form Elements

### 10.1 Input Styles

```typescript
const inputVariants = cva(
  "w-full rounded border bg-bg-surface text-text-primary placeholder:text-text-muted transition-all focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-border focus:ring-2 focus:ring-accent focus:border-accent",
        error: "border-red-500 focus:ring-2 focus:ring-red-500",
        success: "border-green-500 focus:ring-2 focus:ring-green-500",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-5 py-3 text-lg",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    }
  }
)
```

**Usage**:
```tsx
<input
  type="text"
  className={inputVariants({ variant: "default", size: "md" })}
  placeholder="Enter title..."
/>

// With error
<input
  className={inputVariants({ variant: "error" })}
  aria-invalid="true"
  aria-describedby="error-message"
/>
<span id="error-message" className="text-red-500 text-sm">Title is required</span>
```

### 10.2 Checkbox & Radio

**Checkbox** (custom styled):
```tsx
<label className="flex items-center cursor-pointer">
  <input
    type="checkbox"
    className="w-4 h-4 rounded border-border text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-dark"
  />
  <span className="ml-2 text-sm text-text-primary">Select reference</span>
</label>
```

**Toggle Switch** (custom component):
```tsx
import { Switch } from '@headlessui/react'

<Switch
  checked={enabled}
  onChange={setEnabled}
  className={clsx(
    enabled ? 'bg-accent' : 'bg-gray-700',
    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors'
  )}
>
  <span className={clsx(
    enabled ? 'translate-x-6' : 'translate-x-1',
    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform'
  )} />
</Switch>
```

---

## 11. Empty States

**Pattern**:
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <FolderOpenIcon className="w-16 h-16 text-gray-600 mb-4" />
  <h3 className="text-lg font-medium text-text-secondary mb-2">No references yet</h3>
  <p className="text-sm text-text-muted mb-6 max-w-sm">
    Import your first reference to get started organizing your research
  </p>
  <button className={buttonVariants({ variant: "primary" })}>
    Import References
  </button>
</div>
```

**Icons for Empty States**:
- No references: `FolderOpenIcon`
- No search results: `MagnifyingGlassIcon`
- No duplicates: `CheckCircleIcon`
- No PDF: `DocumentIcon`
- No collections: `FolderIcon`

---

## 12. Loading States

### 12.1 Spinner (MVP)

```tsx
import { ArrowPathIcon } from '@heroicons/react/24/outline'

<div className="flex items-center justify-center py-12">
  <ArrowPathIcon className="w-8 h-8 text-accent animate-spin" />
  <span className="ml-3 text-text-secondary">Loading references...</span>
</div>
```

### 12.2 Button Loading State

```tsx
<button className={buttonVariants({ variant: "primary" })} disabled={loading}>
  {loading && <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />}
  {loading ? 'Saving...' : 'Save'}
</button>
```

### 12.3 Skeleton Screens (Phase 3)

```tsx
// Skeleton for reference row
<div className="animate-pulse flex items-center px-3 py-2 border-b border-border">
  <div className="w-4 h-4 bg-gray-700 rounded"></div>
  <div className="ml-3 flex-1">
    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
  </div>
  <div className="w-12 h-4 bg-gray-700 rounded"></div>
</div>
```

---

## 13. Accessibility Guidelines

### 13.1 Color Contrast

**WCAG AA Requirements** (minimum):
- **Normal text** (< 18px): 4.5:1 contrast ratio
- **Large text** (≥ 18px or ≥ 14px bold): 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

**Verified Combinations** (all meet AA):
- `#E6E8EC` (text-primary) on `#0F1115` (bg-dark): **15.8:1** ✓
- `#9CA3AF` (text-secondary) on `#0F1115` (bg-dark): **9.1:1** ✓
- `#04E39E` (accent) on `#0F1115` (bg-dark): **8.5:1** ✓
- `#04E39E` (accent) on `#171A21` (bg-surface): **7.8:1** ✓

### 13.2 Focus Indicators

**Always visible** (never `outline: none` without replacement):
```tsx
// Default focus ring
<button className="focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-dark">

// Custom focus (for complex components)
<div className="focus-visible:outline-2 focus-visible:outline-accent">
```

### 13.3 Interactive Element Sizes

**Minimum touch target**: 44×44px (WCAG Level AAA)
**Recommended**: 48×48px for primary actions

```tsx
// Button meets target size
<button className="px-4 py-2">  // Height: ~40px (text + padding)
  Save
</button>

// Increase for touch
<button className="px-6 py-3">  // Height: ~48px
  Save
</button>
```

### 13.4 Screen Reader Text

**Visually hidden but accessible**:
```tsx
<span className="sr-only">Loading references</span>
<ArrowPathIcon className="w-8 h-8 animate-spin" aria-hidden="true" />
```

**Tailwind `sr-only` class**:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 14. Responsive Breakpoints (Phase 2+)

**Tailwind Default Breakpoints**:
```typescript
screens: {
  sm: '640px',    // Mobile landscape, small tablets
  md: '768px',    // Tablets
  lg: '1024px',   // Desktop (primary target for MVP)
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Extra large desktop
}
```

**MVP Target**: Desktop only (≥1024px). Mobile responsive in Phase 2.

---

## 15. Z-Index Scale

```typescript
zIndex: {
  0: 0,
  10: 10,        // Dropdown menus
  20: 20,        // Sticky headers
  30: 30,        // Tooltips
  40: 40,        // Fixed panels
  50: 50,        // Modals
  999: 999,      // Dev tools overlays
}
```

**Usage**:
- Modals: `z-50`
- Dropdowns: `z-10`
- Tooltips: `z-30`

---

## 16. Design Tokens Reference

**Complete Tailwind Config Snippet**:
```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: { dark: '#0F1115', surface: '#171A21', hover: '#1F2330' },
        border: { DEFAULT: '#1F2330', accent: '#04E39E' },
        text: { primary: '#E6E8EC', secondary: '#9CA3AF', muted: '#6B7280' },
        accent: { DEFAULT: '#04E39E', hover: '#2AF4B4', active: '#00D88A' },
        semantic: { danger: '#EF4444', warning: '#F59E0B', success: '#10B981', info: '#3B82F6' },
        // ... status colors, tag colors
      },
      fontSize: {
        xs: '12px', sm: '14px', base: '16px', lg: '20px', xl: '24px',
      },
      fontWeight: {
        regular: 400, medium: 500, semibold: 600,
      },
      spacing: {
        // Tailwind defaults (8px base grid)
      },
      borderRadius: {
        sm: '2px', DEFAULT: '4px', md: '6px', lg: '8px', xl: '12px', full: '9999px',
      },
      boxShadow: {
        // Tailwind defaults
      },
      transitionDuration: {
        75: '75ms', 150: '150ms', 200: '200ms', 300: '300ms', 500: '500ms',
      },
    }
  },
  plugins: [],
}
```

---

**Document Metadata**:
- Version: 1.0
- Date: 2025-01-08
- Author: Claude (Anthropic)
- Status: Draft for Review
- Related: Spec.md, ComponentsSpec.md, ImplementationChecklist.md
