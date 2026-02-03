# Landing Page Designer Research Summary

## Executive Summary

Modern SaaS landing pages (2025-2026) prioritize **clarity over complexity**, with a proven structure of Hero → Value Prop → Features/Bento → Social Proof → CTAs. High-converting pages use:

1. **Single, Purpose-Driven CTA** - Multiple CTAs reduce conversions by 266%
2. **Mobile-First Design** - 80-83% of traffic is mobile; pages loading <3s convert 32% better
3. **Social Proof Placement** - Testimonials near CTAs increase conversions by 68%
4. **Minimal, Purposeful Motion** - Scroll-triggered reveals and micro-interactions engage without distraction
5. **Trust Signals Early** - Institution logos, researcher testimonials, and citation counts in first 3 sections

For **academic research tools** specifically, researchers are skeptical of marketing hype and value **transparency** (show the product immediately), **precision** in messaging, and **peer validation** over brand promises.

---

## 1. SaaS Landing Page Design Best Practices (2025-2026)

### Core Trends

**Personalization & Dynamic Content:**
- Segmented messaging (Startup vs. Enterprise, different user personas)
- Dynamic CTAs based on visitor behavior and traffic source
- AI-generated value propositions and headlines
- Custom illustrations and UI mockups aligned with brand

**Layout Trends:**
- Split layouts (text and visuals share equal weight) are trending again
- Bento grid layouts for feature showcases (varied card sizes create visual rhythm)
- Full-width, centered hero sections with product previews below
- Sticky headers with smart, minimal navigation (fewer links, clearer path to CTA)

**Navigation & Conversion Paths:**
- Fewer navigation links (treated as part of conversion funnel, not directory)
- Single goal per page (one primary CTA)
- CTAs placed above fold AND at natural conclusion points
- Sticky CTA on scroll (especially mobile)

**Visual & Interactive Elements:**
- Embedded product previews, video demos, guided tours in hero section
- Minimal motion with meaning (no decorative animations)
- Scroll-triggered reveals for content
- Interactive comparisons (hover to reveal before/after)

**Content Strategy:**
- Benefits over features (outcome-focused, not capability-focused)
- Shorter copy, skimmable format (headlines, subheads, bullet points)
- Visual demo over explaining verbally
- Social proof early and often

**Sources:**
- [SaaSFrame: 10 SaaS Landing Page Trends for 2026](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples)
- [Design Studio UIUX: 10 SaaS Landing Page Design Best Practices](https://www.designstudiouiux.com/blog/saas-landing-page-design/)

---

## 2. Conversion Rate Optimization (CTA, Social Proof, Placement)

### CTA Best Practices

**Copy Formula:**
- Action Verb + Outcome
- Examples: "Start Free Trial", "Request a Demo", "Explore Your Hub"
- Avoid: "Click Here", "Learn More", "Submit"

**Visual Design:**
- Contrasts with background (not buried in busy section)
- 44px+ height (touch-friendly)
- Semi-bold, 14-16px text
- Clear focus indicator (3px ring, 3:1 contrast)
- Hover state: Slight lift (4px) or color shift

**Quantity Rule:**
- One primary CTA per section
- Maximum 2-3 distinct CTAs per page
- Adding more CTAs decreases conversions by 266%

**Placement Strategy:**
- Above the fold in hero
- After showing benefits/value (when visitor is ready)
- Repeat at natural conclusion points
- Sticky/fixed CTA on scroll-down (especially mobile)
- Final CTA above footer

### Social Proof Effectiveness

**Impact**: Testimonials + reviews near CTAs → 68% conversion increase

**High-Converting Formats:**
1. **Testimonial Cards**: Avatar + Name + Title/Institution + 1-line quote
2. **Logo Wall**: 6-12 institution logos (Fade effect on hover)
3. **Star Ratings**: 5-star visual (emoji or icon) above quote
4. **Metrics-Based**: "Trusted by 50,000+ researchers"

**Placement:**
- Position near CTAs (directly above/below)
- Within first 3-4 sections (validate credibility early)
- For research tools: Institution affiliation > number of users
- Research area specificity ("Used by Philosophy, Biology, Medical researchers")

### Conversion Metrics

- **Load time impact**: Pages loading <3s have 32% higher conversion rate
- **CTA personalization**: Personalized CTAs convert better than generic ones
- **Trust signals**: Social proof integration leverages social proof psychology

**Sources:**
- [HubSpot: 15 Call-to-Action Statistics](https://blog.hubspot.com/marketing/personalized-calls-to-action-convert-better-data)
- [Unbounce: 15 High-Converting Landing Page Examples](https://unbounce.com/landing-page-examples/high-converting-landing-pages/)
- [VWO: 5 Parameters of High Converting CTAs](https://vwo.com/blog/high-converting-call-to-action-button-examples/)

---

## 3. Magic UI Components for Landing Pages

### Overview

Magic UI provides 150+ free, open-source animated React components built with:
- React + TypeScript
- Tailwind CSS
- Framer Motion (for animations)

**Philosophy**: Motion as a first-class feature; animations that enhance UX, not distract from it.

### High-Converting Component Patterns

1. **Bento Grid** - Feature showcase with varied card sizes
2. **Animated Hero** - Scroll-triggered entrance animations
3. **Interactive Buttons** - Micro-interactions on hover/click
4. **Product Carousel** - Step through features smoothly
5. **Call-to-Action Cards** - Attention-grabbing feature highlights
6. **Form Interactions** - Progressive disclosure in multi-step forms

### Magic UI Advantages

- Copy-paste ready (no configuration overhead)
- Pre-optimized for performance (GPU-accelerated transforms)
- Responsive by default (mobile-first)
- Customizable with Tailwind utilities
- Zero dependencies beyond React, Framer Motion

### Integration Pattern

```typescript
// Import Magic UI component
import { BentoGrid, BentoGridItem } from "@/components/magic-ui/bento-grid"

// Use in landing page
<BentoGrid>
  {features.map((feature) => (
    <BentoGridItem
      title={feature.title}
      description={feature.description}
      icon={feature.icon}
    />
  ))}
</BentoGrid>
```

**Sources:**
- [Magic UI: Official Site](https://magicui.design/)
- [Magic UI: How To Create a Landing Page](https://magicui.design/blog/how-to-create-a-landing-page)
- [Magic UI: 13 Essential Landing Page Sections](https://magicui.design/blog/landing-page-sections)

---

## 4. Aceternity UI Patterns for Modern Landing Pages

### Overview

Aceternity UI is "shadcn/ui for magic effects"—a collection of animated components built with:
- React + TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Seamless shadcn/ui integration

### Key Components for Landing Pages

1. **Spotlight Effect** - Draw attention to key elements on scroll
2. **Mask Reveal** - Hover to reveal hidden content (before/after comparisons)
3. **Card Perspective** - 3D hover effect for premium feel (testimonials, features)
4. **Wavy/Swirly Vortex Background** - Eye-catching CTA sections
5. **Bento Grid** - Feature showcase with visual rhythm

### Pre-Built Templates

- **Startup Landing Page Template**: Clean, minimalistic, startup-focused with microinteractions
- **Foxtrot SaaS Marketing Template**: Modern design with premium feel, perfect for single-page websites

### Design Characteristics

- Modern, class-based React components
- Zero setup required (copy-paste from component gallery)
- Minimal motion (respects accessibility)
- Dark theme optimized
- Tailwind CSS + Framer Motion under the hood

### Integration Philosophy

Use Aceternity UI when:
- You need premium, polished effects without complexity
- Time is limited (pre-built > custom)
- Accessibility is critical (all components tested)

**Sources:**
- [Aceternity UI: Official Site](https://ui.aceternity.com/)
- [Aceternity UI: Components Library](https://ui.aceternity.com/components)
- [Aceternity UI Pro: Templates](https://pro.aceternity.com/templates)

---

## 5. Premium Landing Page Patterns (Linear, Vercel, Notion)

### Linear's Approach

**Design Philosophy**: Bold, pixel-perfect design with unforgiving precision.

**Key Elements:**
- Large, clear headline hitting a specific pain point
- Dark theme (makes content pop)
- Product dashboard screenshot immediately visible
- Extensive navbar with helpful dropdowns (organized info hierarchy)
- Trust signals: "Used by teams at [logos]"
- Performance-focused messaging ("50ms interactions", "real-time sync")
- Interactive comparisons (hover to reveal differences)

**Visual Strategy:**
- Clean typography hierarchy
- High contrast between text and background
- Strategic use of white space
- Subtle hover effects on interactive elements
- Keyword: "Engineered with precision"

### Vercel's Approach

**Templates & Tech Stack:**
- Built with Next.js, Tailwind CSS, Framer Motion
- Optimized for Core Web Vitals (LCP, FID, CLS)
- Astro + Tailwind for static landing pages
- Seamless integration with Notion for content management

**Design Pattern:**
- Minimal, sleek aesthetic
- Split layouts (text left, visual right)
- Clear conversion paths
- Performance-first approach

### Notion's Approach

**Content-First Design:**
- Notion database as CMS (data-driven)
- Flexible layouts (Notion blocks translate to web)
- Hierarchical information structure
- Emphasis on readability and organization

### Common Premium Patterns Across All Three

1. **Bold Typography** - Large, impactful headlines (32-48px+)
2. **Whitespace** - Generous spacing around key elements
3. **Dark Theme** - Premium aesthetic, reduces eye strain
4. **Social Proof Early** - Within first 2-3 sections
5. **Interactive Elements** - Hover effects, comparisons, micro-interactions
6. **Product Visibility** - Dashboard screenshot or demo video early
7. **Clear Hierarchy** - Navigation supports (not crowds) the conversion goal
8. **Performance Focus** - Fast load times, optimized media, lazy-loading

### Technical Stack Commonality

All three use:
- Next.js or Astro (performance-first)
- Tailwind CSS (utility-first, consistent spacing)
- Framer Motion (purposeful animations)
- Dark mode toggle (respects user preference)

**Sources:**
- [Linear Page Analysis - SaaSLandingPage](https://saaslandingpage.com/linear/)
- [Vercel: SaaS Website Templates](https://vercel.com/templates/saas)
- [Notion Starter Templates on Vercel](https://vercel.com/templates/notion)

---

## 6. Typography & Spacing Standards

### Typographic Scale

```
Hero Headline:        32-48px, semi-bold or bold
Section Headline:     24-28px, semi-bold
Card/Subheading:      16-18px, semi-bold
Body Text:            16px (web), 1.5 line-height, regular
CTA Button:           14-16px, semi-bold
Small/Meta:           12-14px, regular
```

### Font Selection

**Best Practices:**
- Maximum 2 typefaces (one serif or display, one sans-serif)
- Sans-serif fonts preferred for digital (cleaner, better for mobile)
- Geometric and neutral styles trending (minimalist, professional feel)

**Why:**
- Easier to implement across devices
- Better mobile responsiveness
- Less cognitive load
- Industry standard for SaaS/tech

### Spacing & Readability

**Line Length:**
- Body text: 65-75 characters (prevents eye strain)
- Tailwind: Use `max-w-2xl` or custom constraint
- Researcher benefit: Extended reading sessions demand comfortable width

**Line Spacing (Leading):**
- Body text: 1.5× line-height (1.5 in Tailwind)
- Headlines: 1.3× line-height
- Improved accuracy + readability

**Letter Spacing:**
- Body: Normal (tracking 0)
- Headlines: Slight tightness (tracking -0.02em) for premium feel
- CTA buttons: Normal or +0.02em for emphasis

**Paragraph Spacing:**
- Between sections: 60-100px gap
- Between cards in grid: 16-24px gap
- Padding within cards: 24-32px (24px = `p-6`)

### Mobile Typography Adjustments

- **Minimum body text**: 16px (Apple HIG standard)
- **Headline scaling**: May reduce by 2-4px on mobile if necessary (e.g., 40px → 32px)
- **Line length**: Still cap at 65-75 chars (not full width)
- **Padding**: Reduce to 24px on mobile

**Sources:**
- [Unbounce: Landing Page Typography 101](https://unbounce.com/landing-page-typography/)
- [Learn UI: Font Size Guidelines](https://www.learnui.design/blog/mobile-desktop-website-font-size-guidelines.html)
- [SaaSFrame: Best Practices 2026](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples)

---

## 7. Animation Best Practices & Micro-Interactions

### What Works (High Engagement)

1. **Scroll-Triggered Reveals** (2-3 seconds)
   - Fade-in + slight upward slide (20-40px)
   - Implementation: Framer Motion `useInView` + `initial` → `animate`
   - Stagger child elements: `delay: 0.15-0.3s` between items
   - Use case: Feature cards, testimonials, sections

2. **Micro-Interactions** (200-400ms)
   - Button hover: Scale 0.98 (shrink slightly)
   - Link hover: Underline slides in, color shifts to accent
   - Form input focus: Border color + subtle shadow
   - Card hover: Lift effect (4px translateY) or color change
   - Impact: +12% click-through rates

3. **Product Demo Animation** (3-5 seconds)
   - Show researcher workflow: Paper → Annotation → Export
   - Use Lottie for lightweight, resolution-independent animations
   - Loop smoothly (no jarring resets)
   - Impact: 50% longer page dwell time

4. **Progressive Disclosure** (on interaction)
   - Multi-step forms break into digestible sections
   - Completion percentage indicator
   - Impact: +18% form completion rate

5. **Entrance Animations**
   - Slide-in from left/right (subtle, 300-400ms)
   - Fade-in from opacity 0
   - Pop-up effect (subtle scale 0.95 → 1)
   - Use for CTAs, key metrics, testimonials

### Performance Optimization

**GPU Acceleration:**
- Animate `transform` and `opacity` only
- Avoid: `width`, `height`, `top`, `left` (layout-triggering)
- Framer Motion handles this automatically

**Duration Guidelines:**
- Quick micro-interactions: <200ms (snappy)
- Standard animations: 300-400ms (natural)
- Storytelling/scroll animations: 2-3 seconds (can be longer)

### What Doesn't Work (Avoid)

- Parallax scrolling (increases perceived motion, harder to follow)
- Full-page scroll animations (slows navigation)
- Loud entrance animations (flying-in, spinning, bouncing)
- Looping animations on static elements (dancing CTAs, pulsing badges)
- More than 2-3 simultaneous animations per viewport

### Accessibility: `prefers-reduced-motion`

**Implementation:**
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

**Rule**: If users enable reduced motion, animations must turn off or simplify significantly.

### 2025 Trends in Animation

- AI-driven predictive interactions (animations respond to user behavior)
- Voice and gesture controls expanding animation triggers
- Increased personalization (animations adapt to user preferences)
- Micro-interactions becoming standard expectation (not nice-to-have)

**Sources:**
- [LandingPageFlow: Best Way to Use Animation](https://www.landingpageflow.com/post/best-way-to-use-animation-on-landing-pages)
- [Hyperspeed Pages: Animation Best Practices 2025](https://hyperspeedpages.com/best-practices-to-use-animation-on-landing-pages-a-2025-guide-for-ui-ux-designers)
- [Framer Blog: 11 Strategic Animation Techniques](https://www.framer.com/blog/website-animation-examples/)
- [Userpilot: 14 Micro-Interaction Examples](https://userpilot.com/blog/micro-interaction-examples/)

---

## 8. Color Psychology for Research Tools

### Core Principles

**General Color Associations:**
- Blue: Trust, calm, scholarly (best for research/finance)
- Teal/Cyan: Confidence, momentum, forward movement
- Violet/Purple: Curiosity, innovation, exploration
- Green: Growth, reliability, stability
- Mauve/Gray: Professional, neutral, organized

### For Research Tools Specifically

**Bibliography/Reference Module:**
- Color: Steel Blue (~205° hue)
- Psychology: Calm, trustworthy, scholarly
- Use case: Primary brand color
- Primary token: --blue-9 (buttons), --blue-11 (text)

**Writing/Manuscript Module:**
- Color: Teal (~163° hue)
- Psychology: Confident, creative, momentum
- Use case: Secondary accent
- Primary token: --teal-9 (buttons)

**Discovery/Exploration Module:**
- Color: Soft Violet (~278° hue)
- Psychology: Curious, innovative, expansive
- Use case: Tertiary accent
- Primary token: --violet-9 (buttons)

**Accessibility Rule:**
- Hue separation: 40°+ between modules (colorblind-safe)
- Test with deuteranopia, protanopia, tritanopia simulators
- Never rely on color alone (use icons + color, text + color)

### Landing Page Color Strategy

**Hero Section:**
- Primary color: Blue (most trusted, universal)
- Background: Dark (sand-1 dark mode) or light (sand-1 light mode)
- Avoid red CTAs (signals danger, not ideal for research)

**Secondary Elements:**
- Teal or violet for secondary CTAs (shows module without confusion)
- Warm neutrals (mauve, sand) for supporting content

**Social Proof Section:**
- Warm neutral backgrounds (sand-2, mauve-3)
- Text: mauve-12 (warm off-white in dark, dark gray in light)

### Contrast & Readability

**WCAG AA Minimums:**
- Body text: 4.5:1 contrast ratio
- Large text (18px+ bold): 3:1 ratio
- UI components (buttons, borders): 3:1 ratio
- Focus indicators: 3:1 ratio

**Verification Tools:**
- Browser DevTools (right-click → Inspect → Accessibility)
- WAVE (wave.webaim.org)
- axe DevTools (browser extension)

**Dark Mode Consideration:**
- Never use pure white (#FFFFFF) for text
- Use mauve-12 (warm off-white with slight brown tint)
- Never use pure black (#000000) for backgrounds
- Use sand-1 dark (#111110, OLED-friendly near-black)

**Sources:**
- [Unbounce: Color Theory and Conversion](https://unbounce.com/landing-pages/color-theory-and-conversion/)
- [ABMatic: Color Psychology for SaaS](https://abmatic.ai/blog/how-to-use-color-psychology-to-improve-your-saas-landing-page)
- [WizWebs: Landing Page Color Psychology Guide 2026](https://wizwebs.com/landing-page-color-psychology/)

---

## 9. Mobile-First Design (2025-2026)

### Traffic Distribution

- Mobile: 80-83% of landing page traffic
- Desktop: 15-17%
- Tablet: 2-5%

**Implication**: Design mobile first, enhance for desktop.

### Mobile-First Breakpoints (Tailwind Standard)

```
< 768px:  Single column, 16px padding, 28-32px headlines
768-1024: Two columns, 24px padding, 36-40px headlines
> 1024px: Multi-column, 40-60px padding, 40-48px headlines
```

### Mobile Optimization Checklist

**Speed:**
- Load time <2.5s on 4G (32% higher conversion vs. >3s)
- Compress images to WebP format
- Lazy-load video embeds (`loading="lazy"`)
- Defer non-critical JavaScript

**Touch Targets:**
- All buttons/links: 44x44px minimum (Apple HIG standard)
- Spacing between targets: 8px minimum
- Avoid hover-only interactions (mobile has no hover)
- Tap feedback: Visible visual change on touch

**Content Adaptation:**
- Single column layout (cards stack vertically)
- Headlines may wrap (2-3 lines acceptable)
- Feature descriptions: 1-2 sentences max
- Testimonials: Avatar + 1 line only
- Forms: Minimal fields, clear labels
- Navigation: Hamburger menu or slide-out drawer

**Typography:**
- Minimum 16px body text (readability + reduces auto-zoom on iOS)
- Headline: 28-32px (vs. 32-48px on desktop)
- Line-height: 1.5 (same as desktop, good spacing)
- Avoid narrow columns (<45 chars) and text overflow

### Responsive Image Strategy

```html
<!-- Use srcset for responsive images -->
<img
  src="feature-small.webp"
  srcset="feature-small.webp 600w, feature-large.webp 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Feature description"
/>

<!-- Use picture element for art direction -->
<picture>
  <source media="(max-width: 768px)" srcset="hero-mobile.webp">
  <source media="(max-width: 1024px)" srcset="hero-tablet.webp">
  <img src="hero-desktop.webp" alt="Hero section">
</picture>
```

### Sticky CTA Button (Mobile Pattern)

On mobile, add a fixed CTA button at bottom (or sticky header with CTA):
```css
.sticky-cta {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 40;
  padding: 12px;
  background: var(--accent);
  border-radius: 8px;
}

@media (min-width: 768px) {
  .sticky-cta {
    display: none; /* Hide on desktop, user scrolls to hero CTA */
  }
}
```

**Sources:**
- [Involve.me: How to Create a Mobile Landing Page](https://www.involve.me/blog/how-to-create-a-mobile-landing-page)
- [WebStacks: 10 Best Mobile Landing Page Design Examples](https://www.webstacks.com/blog/mobile-landing-page)

---

## 10. Bento Grid Layouts (2025-2026 Trend)

### Definition

Bento grids are flexible, modular layout systems that arrange content into distinct rectangular compartments of varying sizes, emphasizing visual hierarchy and adaptability.

**Why "Bento"?** Inspired by Japanese bento boxes—organized, compartmentalized, visually appealing.

### Design Advantages

1. **Visual Appeal**: Clean, organized structure combining minimalism with creative flair
2. **Mobile-Friendly**: Adapts seamlessly across devices (stacks on mobile)
3. **User Engagement**: Modular layout breaks content into digestible chunks
4. **Versatility**: Works for portfolios, blogs, e-commerce, landing pages
5. **Visual Hierarchy**: Varied sizes naturally guide attention

### Bento Grid for Feature Showcase

**Layout Pattern (4-6 cards):**
```
┌──────────────────────────────────────┐
│  Feature 1 (Large - Hero Feature)   │
│  Headline + description              │
│  2x2 grid span                       │
├──────────────────┬────────────────┤
│ Feature 2        │ Feature 3      │
│ (Normal)         │ (Small)        │
├──────────────────┴────────────────┤
│ Feature 4 (Large)                  │
│ Headline + description              │
│ 2x1 grid span                       │
└──────────────────────────────────────┘
```

**Mobile Adaptation:**
- All cards become single column (width: 100%)
- Maintains visual hierarchy through order

### Real-World Examples

**Apple Siri Page:**
- Uses bento grid to break down voice command features
- Clean, organized presentation of capabilities
- Visual icons + short descriptions

**Gravitates Landing Page:**
- Bento grid highlights: AI summaries, privacy, content sharing
- Each card is self-contained feature
- Icons provide visual interest

### Technical Implementation (Tailwind + React)

```tsx
import React from 'react'

const BentoGrid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    {children}
  </div>
)

const BentoGridItem = ({ title, description, icon, className }) => (
  <div className={`p-6 rounded-lg border border-mauve-6 hover:border-blue-6
                  transition-all ${className}`}>
    {icon && <div className="mb-4">{icon}</div>}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-mauve-11">{description}</p>
  </div>
)

export { BentoGrid, BentoGridItem }
```

### Sizing Strategy

**Large Cards (2x2 or 2x1 span):**
- Featured capabilities
- Most important features
- Should be 2-3 cards max

**Normal Cards (1x1 span):**
- Supporting features
- Standard size, most common

**Small Cards (optional):**
- Additional features
- Quick reference items

**Sources:**
- [Mockuuups: Best Bento Grid Design Examples 2026](https://mockuuups.studio/blog/post/best-bento-grid-design-examples/)
- [Tailwind CSS: Bento Grid Components](https://tailwindcss.com/plus/ui-blocks/marketing/sections/bento-grids)

---

## Key Takeaways for Landing Page Designer Agent

### Top 10 Rules (Non-Negotiable)

1. **One Primary CTA Per Section** - Multiple CTAs reduce conversions by 266%
2. **Hero Section Must Show Product** - Researchers want transparency, not hype
3. **Mobile-First Design** - 80% of traffic is mobile; design there first
4. **Load <2.5 Seconds** - Slow pages have 32% lower conversion
5. **4.5:1 Contrast Ratio Minimum** - WCAG AA required; test both themes
6. **Social Proof in First 3 Sections** - Institutions > user count for research tools
7. **16px+ Body Text on Mobile** - Readability non-negotiable
8. **Animations Have Purpose** - No decorative motion; every animation must guide or clarify
9. **Radix Colors Only** - Never hardcode hex; use semantic tokens
10. **Test on Real Mobile Device** - DevTools ≠ real devices

### High-Converting Component Hierarchy

**High Impact (Must-Have):**
1. Hero section with product demo
2. Value proposition (pain point + solution)
3. Feature grid or bento layout (4-6 features)
4. Social proof / testimonials
5. Clear CTA (primary + secondary)

**Medium Impact (Should-Have):**
1. Trust signals (institution logos, citations)
2. Micro-interactions (button hover, form focus)
3. Video walkthrough (15-30 seconds)
4. Comparison or before/after
5. Pricing or final CTA section

**Low Impact (Nice-to-Have):**
1. Testimonial carousel
2. Partner integrations showcase
3. Team photos
4. Blog/resource links
5. Newsletter signup

### Decision Tree for Quick Decisions

```
Need a hero layout?
  ├─ Have product video? → Hero with video background
  ├─ Have product screenshot? → Hero with split layout (text + image)
  └─ Need to show live demo? → Hero with embedded interactive iframe

Need to showcase features?
  ├─ 4-6 features? → Bento grid layout (varied sizes)
  ├─ 8+ features? → Bento grid (larger, with tabs or carousel)
  └─ Need comparison? → Feature cards in 2-3 column grid

Need to build trust?
  ├─ Have institution logos? → Logo wall (6-12 logos, fade on hover)
  ├─ Have researcher testimonials? → Testimonial cards (avatar + name + quote)
  └─ Have usage metrics? → Stats section ("Used by 50K+ researchers")

Need animations?
  ├─ Entering viewport? → Scroll-triggered fade-in + slide-up
  ├─ User interaction? → Micro-interaction (hover, focus, click)
  └─ Explaining workflow? → 3-5 second product animation (Lottie or Framer Motion)
```

---

## File Structure Recommendation

```
/landing-page/design/
├── /components/
│   ├── Hero.tsx
│   ├── ValueProposition.tsx
│   ├── FeatureBento.tsx
│   ├── Testimonials.tsx
│   ├── CTA.tsx
│   ├── Footer.tsx
│   └── /ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── avatar.tsx
├── /styles/
│   ├── globals.css
│   ├── radix-tokens.css
│   └── animations.css
├── /animations/
│   ├── scroll-reveal.ts
│   ├── hover-effects.ts
│   └── micro-interactions.ts
└── /utils/
    ├── cn.ts (class utilities)
    └── constants.ts (copy, tokens)
```

---

## Testing Checklist

- [ ] **Contrast**: All text ≥4.5:1 (WAVE, axe DevTools)
- [ ] **Mobile**: Responsive at 375px, 768px, 1920px
- [ ] **Performance**: <2.5s load time (DevTools throttle 4G)
- [ ] **Keyboard**: Fully navigable with Tab/Enter/Escape
- [ ] **Screen Reader**: VoiceOver/NVDA tested
- [ ] **Forms**: Labels associated, errors clear, submit accessible
- [ ] **Animations**: Respects prefers-reduced-motion
- [ ] **Links**: All CTAs go to correct destination
- [ ] **Images**: All have alt text, optimized (WebP)
- [ ] **Dark Theme**: All colors work in both light and dark
- [ ] **Lighthouse**: >90 on Performance, Accessibility, SEO

---

## Research Sources (Complete List)

### Core SaaS Design Practices
- [SaaSFrame: 10 SaaS Landing Page Trends for 2026](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples)
- [Design Studio UIUX: SaaS Landing Page Best Practices](https://www.designstudiouiux.com/blog/saas-landing-page-design/)
- [Unbounce: The State of SaaS Landing Pages](https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/)
- [Klientboost: 51 High-Converting SaaS Landing Pages](https://www.klientboost.com/landing-pages/saas-landing-page/)

### Conversion Optimization
- [HubSpot: Call-to-Action Statistics](https://blog.hubspot.com/marketing/personalized-calls-to-action-convert-better-data)
- [Unbounce: 15 High-Converting Landing Page Examples](https://unbounce.com/landing-page-examples/high-converting-landing-pages/)
- [VWO: High Converting CTA Button Examples](https://vwo.com/blog/high-converting-call-to-action-button-examples/)
- [SeedProd: Good Landing Page Conversion Rates 2026](https://www.seedprod.com/landing-page-conversion-rates/)

### Component Libraries
- [Magic UI: Official Site](https://magicui.design/)
- [Magic UI: SaaS Landing Page Best Practices](https://magicui.design/blog/saas-landing-page-best-practices)
- [Aceternity UI: Official Site](https://ui.aceternity.com/)
- [Aceternity UI: Components](https://ui.aceternity.com/components)

### Typography & Spacing
- [Unbounce: Landing Page Typography 101](https://unbounce.com/landing-page-typography/)
- [Learn UI: Font Size Guidelines](https://www.learnui.design/blog/mobile-desktop-website-font-size-guidelines.html)

### Animation Best Practices
- [LandingPageFlow: Best Way to Use Animation](https://www.landingpageflow.com/post/best-way-to-use-animation-on-landing-pages)
- [Hyperspeed Pages: Animation Best Practices 2025](https://hyperspeedpages.com/best-practices-to-use-animation-on-landing-pages-a-2025-guide-for-ui-ux-designers)
- [Framer: 11 Strategic Animation Techniques](https://www.framer.com/blog/website-animation-examples/)
- [Userpilot: 14 Micro-Interaction Examples](https://userpilot.com/blog/micro-interaction-examples/)

### Color & Accessibility
- [Unbounce: Color Theory and Conversion](https://unbounce.com/landing-pages/color-theory-and-conversion/)
- [ABMatic: Color Psychology for SaaS](https://abmatic.ai/blog/how-to-use-color-psychology-to-improve-your-saas-landing-page)
- [WizWebs: Color Psychology Guide 2026](https://wizwebs.com/landing-page-color-psychology/)

### Mobile & Responsive
- [Involve.me: Mobile Landing Page Guide](https://www.involve.me/blog/how-to-create-a-mobile-landing-page)
- [WebStacks: Mobile Landing Page Design Examples](https://www.webstacks.com/blog/mobile-landing-page)

### Layout Trends
- [Mockuuups: Bento Grid Design Examples 2026](https://mockuuups.studio/blog/post/best-bento-grid-design-examples/)
- [Tailwind CSS: Bento Grid Components](https://tailwindcss.com/plus/ui-blocks/marketing/sections/bento-grids)

### Premium Examples
- [SaaS Landing Page: Linear Analysis](https://saaslandingpage.com/linear/)
- [Vercel: SaaS Website Templates](https://vercel.com/templates/saas)

---

**Status**: Research Complete
**Date**: February 2025
**Focus**: Landing page design for researcher tools and academic SaaS

