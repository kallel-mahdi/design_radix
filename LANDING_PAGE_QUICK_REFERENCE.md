# Landing Page Designer Quick Reference

## One-Pager for Rapid Design Decisions

### Essential Section Order
```
Hero → Value Prop → Features/Bento → Social Proof → Secondary CTA → Pricing/Final CTA → Footer
```

### Hero Section Anatomy
- **Headline**: 32-48px, answers "why would I use this?"
- **Subheading**: 16-20px, adds credibility (e.g., "Loved by 50K+ researchers")
- **Visual**: Product demo, video, or animation (loads in <2s)
- **CTA**: Primary button, contrasts with background, 44px minimum height
- **Trust Signal**: Institution logos or "Used by MIT, Stanford..."

### Typography Essentials
| Element | Size | Weight | Use |
|---------|------|--------|-----|
| Hero Headline | 32-48px | Semi-bold | Hero section only |
| Section Headline | 24-28px | Semi-bold | Features, pricing, etc |
| Body Text | 16px | Regular | All paragraphs |
| CTA Button | 14-16px | Semi-bold | Buttons only |
| Subtext | 12-14px | Regular | Labels, meta |

**Rule**: Max line length 65-75 characters (wrap body text, don't stretch)

### Spacing Grid (Tailwind Units)
- Section gaps: `gap-16` to `gap-24` (64-96px)
- Card padding: `p-6` to `p-8` (24-32px)
- Grid gaps: `gap-4` to `gap-6` (16-24px)
- Line height: `1.5` for body, `1.3` for headlines

### Color Palette (Citable Standards)
| Use | Radix Token | Variant |
|-----|------------|---------|
| Primary CTA | --blue-9 | Button background |
| Secondary CTA | --teal-9 or --violet-9 | Secondary buttons |
| Text (light bg) | --mauve-12 or --slate-12 | Body, headers |
| Text (dark bg) | --mauve-12 | Warm off-white, never pure white |
| Borders | --mauve-6, --blue-6 | Dividers, rings |
| Tints (bg) | --blue-3, --teal-3 | Card backgrounds, highlights |

**Contrast Rule**: All text ≥4.5:1 (WCAG AA), verify in both light & dark themes

### Animation Quick Rules
✓ Scroll-triggered fade-in (200-400ms)
✓ Button hover scale (0.98) with 150ms duration
✓ Micro-interactions on user action (<200ms)
✓ Product demo animation (3-5s, loops smoothly)

✗ Parallax scrolling (distracting, harder to follow)
✗ Full-page animations (slows navigation)
✗ Animations >1 second unless scroll-triggered
✗ Avoid `prefers-reduced-motion` users

### Mobile Breakpoints
```
< 768px:  Single column, 16px padding, 28-32px headlines
768-1024: Two columns, 24px padding, 36-40px headlines
> 1024px: Multi-column bento, 40-60px padding, 40-48px headlines
```

### CTA Copy Formula
```
Action Verb + Outcome

✓ "Start Free Trial"
✓ "Request Demo"
✓ "Explore Your Research Hub"
✓ "See How It Works"

✗ "Learn More"
✗ "Click Here"
✗ "Submit"
```

**Placement**: Hero + Section endings + final before footer (max 2-3 distinct CTAs)

### Feature Grid Best Practice
```
Bento Layout (variable sizes):
┌────────────────────┬─────────────┐
│ Hero Feature       │ Supporting  │
│ (Large)            │ Feature     │
├────────────────┬───┴─────────────┤
│ Supporting     │ Hero Feature    │
│ Feature (sm)   │ (Large)         │
└────────────────┴─────────────────┘

Card Structure:
- Icon (32-40px, Radix color)
- Headline (16-18px, bold)
- Description (14px, 1.5 line-height, max 2 lines)
- Optional metric or badge
- Hover: Lift effect (4px) or border color change
```

### Social Proof Placement
- **Position**: Within sections 2-4 (after value prop)
- **Near CTAs**: Place testimonials directly above/below CTAs
- **Format**: Avatar + name + title + institution + 1-line quote
- **Alternative**: Institution logo wall (6-12 logos)
- **Benefit**: 68% conversion increase when placed near CTAs

### Performance Checklist (Critical)
- [ ] Loads in <2.5 seconds on 4G (DevTools throttle)
- [ ] Images compressed to WebP format
- [ ] Videos lazy-loaded (`loading="lazy"`)
- [ ] No unoptimized PNGs or JPEGs
- [ ] CSS minified and defer non-critical JS
- [ ] Lighthouse score ≥90 (Performance, Accessibility, SEO)

### Accessibility Essentials
- [ ] All text ≥4.5:1 contrast ratio (WCAG AA)
- [ ] Fully navigable via keyboard (Tab, Enter, Escape)
- [ ] Focus indicators visible (3px ring at 3:1 ratio)
- [ ] All images have alt text
- [ ] Form labels associated with inputs
- [ ] Respects `prefers-reduced-motion` (animations off)
- [ ] Screen reader tested (VoiceOver, NVDA)

### Common Pitfalls to Avoid
| Problem | Solution |
|---------|----------|
| Too many CTAs | Keep primary + 1 secondary per section |
| Vague headlines | Be specific: "Manage 500+ papers" not "Streamline workflow" |
| Slow to load | Compress media, lazy-load, <2.5s load time |
| Non-responsive | Test at 375px, 768px, 1920px widths |
| Poor contrast | Use WAVE or axe DevTools, verify in dark theme too |
| Only color for info | Use icons + color, text + color, not color alone |
| Overcomplicated motion | Subtle reveals only, avoid parallax or spinning elements |
| Missing trust signals | Add institution logos or testimonials in first 3 sections |

### Component Library Reference
**Use shadcn/ui for:**
- Button (all variants)
- Card (features, testimonials)
- Input, Textarea, Label (forms)
- Badge (tags, research areas)
- Avatar (testimonials)
- Dialog/Sheet (modals, navigation)

**Use Radix Colors for:**
- ALL colors (never hardcode hex #FFFFFF, #000000, etc.)
- Token naming: --blue-9, --mauve-12, --teal-3

**Optional: Magic UI / Aceternity UI**
- Bento grids (feature showcase)
- Spotlight effect (highlight key value)
- Mask reveal (before/after comparisons)
- Wavy backgrounds (premium feel)
- Card perspective (testimonials)

### Design Decision Tree

**Choosing a Hero Layout:**
```
Hero Demo Video Available?
  YES → Hero with Animated Background (video shows workflow)
  NO → Hero with Product Screenshot
       → Hero with Embedded Demo (GIF or interactive iframe)

Need to Show Multiple Features Quickly?
  YES → Bento Grid (4-6 cards, varied sizes)
  NO → Split Layout (Text left, visual right)

Researcher Trust Low?
  YES → Add institution logos to hero subheading
  NO → Social proof section 2-3 is sufficient
```

**Choosing Button Variants:**
```
Primary Action (Sign Up, Try Free)?
  → Filled background (--blue-9), white text, 44px height

Secondary Action (Learn More, See Demo)?
  → Outline or ghost variant, borders or transparent

Destructive (Delete, Cancel)?
  → Red/warning color (avoid unless necessary)

Disabled/Loading?
  → Reduced opacity, cursor: not-allowed
```

### Testing Checklist (Pre-Launch)
- [ ] **Desktop (1920x1080)**: All sections visible, readable
- [ ] **Mobile (375x667)**: Single column, thumb-friendly, <2.5s load
- [ ] **Dark Theme**: All text ≥4.5:1 contrast, colors correct
- [ ] **Keyboard Only**: Full navigation with Tab/Enter/Escape
- [ ] **Screen Reader**: Headings, links, buttons, images have labels
- [ ] **Lighthouse Audit**: >90 Performance, Accessibility, SEO
- [ ] **Form Testing**: Labels work, errors clear, submit accessible
- [ ] **Link Testing**: All CTAs go to correct destination
- [ ] **Browser Testing**: Chrome, Firefox, Safari, Edge (recent versions)

---

## Quick Conversion Wins (High Impact, Low Effort)

1. **Add Institution Logos** (+15-25% credibility boost)
   - Place in hero subheading or first section
   - 6-12 logos, fade effect on hover

2. **Add 3-5 Testimonials** (+68% conversion when near CTAs)
   - Include name, title, institution
   - Avatar + 1-line quote format

3. **Make CTA Stand Out** (+12% CTR)
   - Contrast with background
   - Action verb + outcome ("Start Free Trial", not "Click Here")
   - 44px minimum height, full width on mobile

4. **Add Video Demo** (50% increase in time on page)
   - 15-30 seconds showing researcher workflow
   - Autoplay, muted, loops seamlessly

5. **Improve Page Speed** (+32% conversion if <3s load)
   - Compress images to WebP
   - Lazy-load videos
   - Minify CSS/JS

6. **Add Mobile Optimization** (80% of traffic is mobile)
   - Single column layout
   - Full-width buttons
   - 16px+ body text

7. **Add Contrast Verification** (Catches accessibility fails)
   - Use WAVE or axe DevTools
   - Test light AND dark themes
   - Ensure 4.5:1 minimum

8. **Add Focus Indicators** (Keyboard users benefit)
   - 3px ring, 3:1 contrast ratio
   - Use Tailwind's `focus-visible:ring-2` utilities

---

## File Structure (Recommended)

```
landing-page/
├── src/
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Testimonials.tsx
│   │   ├── CTA.tsx
│   │   └── ui/ (shadcn components)
│   ├── styles/
│   │   ├── globals.css
│   │   ├── radix-tokens.css
│   │   └── animations.css
│   └── pages/
│       └── index.tsx
├── public/
│   └── images/
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

**Goal**: Every landing page should be beautiful, fast, accessible, and high-converting.

**Remember**: Design for researchers first. Be specific, transparent, and respectful of their time.

