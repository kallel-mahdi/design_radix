# Landing Page Agent Prompt

## Task
Build a landing page in the React sandbox (`design_radix/sandbox/`) using **actual Magic UI components**. The design reference is `design_radix/landing-mockups.html`.

## Working Directory
```
/home/mahdi/Desktop/bibliography/design_radix/sandbox/
```

## Design Decisions (Already Made)
- **Visual Tone:** Academic/Scholarly — restrained, typography-focused, minimal animations
- **Animations:** Selective accent only — one hero animation + subtle scroll reveals
- **Primary CTA:** "Sign Up Free"
- **Trust Signals:** University logos (placeholder), testimonials (placeholder)

## Magic UI Components to Use

Install via:
```bash
npx shadcn@latest add "https://magicui.design/r/<component>.json"
```

### Required Components:
| Component | Use Case | Install |
|-----------|----------|---------|
| `blur-fade` | Scroll reveal animations | `blur-fade` |
| `marquee` | Trust strip logos | `marquee` |
| `word-rotate` | Hero headline cycling | `word-rotate` |
| `dot-pattern` | Subtle hero background | `dot-pattern` |
| `border-beam` | CTA card accent | `border-beam` |
| `number-ticker` | Stats section (optional) | `number-ticker` |
| `bento-grid` | Feature showcase | `bento-grid` |

### Optional (if needed):
- `shimmer-button` — for primary CTA
- `animated-gradient-text` — alternative to word-rotate
- `grid-pattern` — alternative to dot-pattern

## Page Structure

### 1. Hero Section
- Headline: "Your research." + word-rotate cycling ["One home.", "Organized.", "Connected.", "Simplified."]
- Subheadline: "Read, write, and discover — finally in one place..."
- CTA buttons: "Start for free" (primary), "Watch demo" (outline)
- Background: `<DotPattern>` with subtle opacity
- All elements wrapped in `<BlurFade>` with staggered delays

### 2. Trust Strip
- `<Marquee>` with university logos: Stanford, MIT, Oxford, Harvard, Caltech, ETH Zürich, Cambridge, Berkeley
- Slow speed, pauseOnHover, subtle fade masks on edges

### 3. Bento Grid Features
Use `<BentoGrid>` with these features:

**Hero Features (large tiles):**
1. **PDF Reading & Annotation** — Bibliography module (blue)
2. **LaTeX Editor + Live Compilation** — Manuscripts module (jade/teal)
3. **Citation Autocomplete** — Cross-module integration
4. **Discover / Citation Graph** — Discover module (iris/violet)

**Supporting Features (medium tiles):**
5. One-click Import
6. Real-time Collaboration
7. AI Recommendations
8. Smart Tagging

Each card should:
- Use module colors from design system (biblio, manu, discover)
- Have `<BlurFade>` with staggered delays
- Show placeholder preview area

### 4. Testimonials Section
- 3 cards with placeholder quotes
- `<BlurFade>` on each card

### 5. CTA Section
- Card with `<BorderBeam>` effect
- Headline: "Start writing better papers today"
- Primary CTA button

## File Structure
Create:
```
src/ui/pages/LandingPage.tsx        # Main landing page
src/ui/components/landing/          # Landing-specific components
  HeroSection.tsx
  TrustStrip.tsx
  BentoFeatures.tsx
  Testimonials.tsx
  CTASection.tsx
```

## Color Tokens (from design system)
```css
/* Use these semantic tokens */
--biblio: var(--blue-9)        /* Bibliography module */
--biblio-tint: var(--blue-3)
--manu: var(--jade-9)          /* Manuscripts module */
--manu-tint: var(--jade-3)
--discover: var(--iris-9)      /* Discover module */
--discover-tint: var(--iris-3)
```

## Constraints
- Use ONLY Radix color tokens — no hardcoded hex values
- Use shadcn/ui components + Magic UI components
- Follow existing patterns in `src/components/ui/`
- Respect `prefers-reduced-motion`
- WCAG AA contrast compliance

## Reference Files
- Design mockup: `/home/mahdi/Desktop/bibliography/design_radix/landing-mockups.html`
- Existing styles: `src/styles/index.css`, `src/styles/shared-tokens.css`
- Button component: `src/components/ui/button.tsx`

## Run Dev Server
```bash
cd /home/mahdi/Desktop/bibliography/design_radix/sandbox
npm run dev -- --host 0.0.0.0 --port 5174
```

Preview at: `http://localhost:5174/`

## Success Criteria
1. All Magic UI components actually imported and working
2. Animations are subtle/scholarly (not flashy)
3. Responsive design (mobile-first)
4. Uses semantic color tokens throughout
5. Matches the visual hierarchy from landing-mockups.html
