# Landing Page Component Checklist

Use this document to validate each landing page component before deployment.

---

## Hero Section Checklist

### Content & Copy
- [ ] Headline is specific, not generic ("Manage 500+ papers" vs. "Streamline workflow")
- [ ] Headline addresses a pain point researchers actually face
- [ ] Subheading adds credibility (e.g., "Loved by 50K+ researchers at MIT, Stanford...")
- [ ] CTA copy uses action verb + outcome ("Start Free Trial", not "Click Here")
- [ ] CTA is visible and contrasts with background
- [ ] Hero section loads in <2 seconds
- [ ] Trust signal visible (institution logos or user count)

### Design & Layout
- [ ] Background visual (video, animation, or screenshot) is high quality
- [ ] Hero height is appropriate (not too tall on mobile)
- [ ] Text is centered or left-aligned (readable on all widths)
- [ ] Visual component scales responsively (full width on mobile, constrained on desktop)
- [ ] Proper spacing between headline, subheading, and CTA
- [ ] Works on mobile (text stacks above visual, not beside)

### Accessibility & Performance
- [ ] Headline size: 32-48px on desktop, 28-32px on mobile
- [ ] Body text size: 16px minimum
- [ ] Contrast ratio: ≥4.5:1 (dark text on light, light text on dark)
- [ ] Focus indicator visible on CTA button (3px ring, 3:1 contrast)
- [ ] Keyboard navigable (Tab to CTA, Enter to activate)
- [ ] Alt text on images/videos (if applicable)
- [ ] Video autoplay is muted (no sound in open offices)
- [ ] Video has no sound design (optional captions for accessibility)

### Animation (If Applicable)
- [ ] Animation duration: <1 second for entrance (or 3-5s for storytelling)
- [ ] Animation has purpose (explains workflow, not decorative)
- [ ] Respects `prefers-reduced-motion` (disables or simplifies)
- [ ] Animation uses GPU-accelerated transforms (opacity, transform only)
- [ ] No looping animations (doesn't repeat indefinitely)

---

## Value Proposition Section Checklist

### Content
- [ ] Section addresses a specific problem (not vague benefits)
- [ ] Problem statement is relatable ("90% of researchers waste time managing references")
- [ ] Solution is clearly stated
- [ ] Proof is included (statistic, example, or visual demo)
- [ ] 2-3 key pain points clearly articulated
- [ ] Each pain point has a visual (screenshot, icon, or GIF)

### Design
- [ ] Section headline: 24-28px, clear hierarchy
- [ ] Body text: 16px, 1.5 line-height, max 75 characters wide
- [ ] Whitespace around section (60-100px gap from hero)
- [ ] Card layout is responsive (1 column mobile, 2-3 column desktop)
- [ ] Icons are consistent in size (32-40px) and color (use Radix token)
- [ ] Visual assets (screenshots, GIFs) are compressed and optimized

### Accessibility
- [ ] All text ≥4.5:1 contrast ratio
- [ ] Icons have semantic meaning or alt text
- [ ] Heading hierarchy: h1 (hero) > h2 (section) > h3 (subsections)
- [ ] No color-only information (icon + color, text + color)
- [ ] Links/buttons accessible via keyboard

---

## Feature Grid / Bento Layout Checklist

### Layout & Structure
- [ ] Grid is 2-3 columns on desktop, 1 column on mobile
- [ ] Cards have consistent padding (24-32px)
- [ ] Gap between cards: 16-24px
- [ ] Bento layout (if used): Varied card sizes create visual rhythm
- [ ] Largest cards (2x2 or 2x1) are hero features
- [ ] Normal cards (1x1) are supporting features
- [ ] All cards are equal priority visually (except by size)

### Card Content
- [ ] Each card has: Icon + Headline (16-18px) + Description (14px)
- [ ] Description is 1-2 lines maximum
- [ ] Each card describes outcome, not just capability
- [ ] Icons are from Radix color palette (--blue-9, --teal-9, etc.)
- [ ] Icon size consistent: 32x32 or 40x40
- [ ] Headlines use title case or bold sans-serif

### Interactive States
- [ ] Hover effect is subtle (lift, border color, or background shift)
- [ ] Hover effect works on mobile (visible on focus, not hover)
- [ ] Focus state has visible ring (3px, 3:1 contrast)
- [ ] Transition is smooth (150-200ms)
- [ ] No performance lag on scroll or interaction

### Accessibility
- [ ] Cards are semantic (div, section, or article)
- [ ] All text ≥4.5:1 contrast
- [ ] Icons have alt text or semantic meaning
- [ ] Keyboard accessible (Tab through all cards)
- [ ] No dynamic content changes without focus management

---

## Social Proof / Testimonials Checklist

### Testimonial Cards
- [ ] Avatar: 32-40px, rounded, loaded from optimized source
- [ ] Name: 12-14px, bold, researcher/professor
- [ ] Title/Institution: 12px, gray (mauve-11 or mauve-10)
- [ ] Quote: 14-16px, max 2-3 lines, italicized
- [ ] Star rating (if included): 5 stars, visible at 3:1 contrast
- [ ] Research area badge (optional): "Philosophy", "Biology", etc.
- [ ] Layout responsive: Single column mobile, row on desktop

### Placement & Section Design
- [ ] Testimonials appear within sections 3-4 (after value prop, before/after features)
- [ ] Positioned near primary CTA (above or below)
- [ ] Section headline: "Trusted by researchers" or similar
- [ ] Spacing: 60-100px gap from previous section
- [ ] On mobile: Single testimonial visible, swipe/scroll to see more
- [ ] On desktop: 3-5 testimonials in a row (or scrollable carousel)

### Social Proof Alternatives
- [ ] If no testimonials: Logo wall (6-12 institution logos)
- [ ] Logo styling consistent (all same size or proportional)
- [ ] Logo fade effect on hover (to 70% opacity)
- [ ] Logo alignment: centered, in a grid

### Content Quality
- [ ] Quotes are authentic (not marketing-speak)
- [ ] Quotes are specific (mention measurable outcome)
- [ ] Researcher credentials are credible (MIT, Stanford, etc.)
- [ ] Research area matches landing page context
- [ ] No generic praise ("Great product!")
- [ ] Metrics included if possible ("Saves 5 hours/week")

### Accessibility
- [ ] Avatars have alt text (if images)
- [ ] All text ≥4.5:1 contrast
- [ ] Quotes are readable (not just visual)
- [ ] If carousel: Keyboard navigable (arrow keys or tab)
- [ ] Screen reader announces current testimonial

---

## Call-to-Action (CTA) Button Checklist

### Visual Design
- [ ] Button size: 44px minimum height (touch-friendly)
- [ ] Button width: Full width on mobile, auto on desktop
- [ ] Padding: 12px vertical, 24-28px horizontal
- [ ] Border-radius: 6-8px (slight rounding, not pill)
- [ ] Background color: Primary accent (--blue-9)
- [ ] Text color: White or mauve-12 (warm off-white)
- [ ] Font size: 14-16px, semi-bold
- [ ] Font weight: 600 (semi-bold)

### Interaction States
- [ ] Default state: Solid background, white text, clear
- [ ] Hover state: Slightly darker background OR 4px lift effect
- [ ] Active state: Pressed appearance (darker, slight inset shadow)
- [ ] Focus state: Visible 3px ring (--blue-6 or accent-6)
- [ ] Disabled state: 50% opacity, `cursor: not-allowed`
- [ ] Loading state: Loading spinner or text change

### Copy & Placement
- [ ] Copy is action-oriented: "Start Free Trial", "Request Demo", "Explore"
- [ ] Copy includes outcome if possible: "Get Started — No Card Required"
- [ ] Primary CTA appears in hero (above fold)
- [ ] Secondary CTA appears in value prop or features section
- [ ] Final CTA appears before footer
- [ ] Max 2-3 distinct CTAs per page (prevent decision paralysis)

### Accessibility
- [ ] Button has visible focus indicator (keyboard users)
- [ ] Color contrast ≥3:1 (button text on background)
- [ ] Button is keyboard accessible (Tab + Enter)
- [ ] Button has clear label (no icon-only buttons without text)
- [ ] If loading: Loading text or spinner is announced
- [ ] Disabled buttons not keyboard accessible (`disabled` attribute)

### Technical
- [ ] Link/button semantic HTML (`<button>` or `<a role="button">`)
- [ ] Proper `onClick` or `href` handlers
- [ ] No JavaScript errors on interaction
- [ ] Analytics tracked (if applicable)
- [ ] UTM parameters included (if needed)

---

## Typography & Spacing Checklist

### Font Sizes
- [ ] Hero headline: 32-48px on desktop, 28-32px on mobile
- [ ] Section headline: 24-28px on desktop, 20-24px on mobile
- [ ] Card headline: 16-18px consistent
- [ ] Body text: 16px on web, consistent on all sections
- [ ] Button text: 14-16px, semi-bold
- [ ] Small/meta text: 12-14px for labels, captions
- [ ] Line-height: 1.5 for body, 1.3 for headlines

### Spacing & Line Length
- [ ] Body text max-width: 65-75 characters (use `max-w-2xl` or similar)
- [ ] Headlines: No width constraint (fill container)
- [ ] Section gaps: 60-100px (gap-16 to gap-24 in Tailwind)
- [ ] Card padding: 24-32px (p-6 to p-8)
- [ ] Grid gaps: 16-24px (gap-4 to gap-6)
- [ ] Padding sides: 24px on mobile, 40-60px on desktop

### Typography Consistency
- [ ] Font stack is consistent (max 2 typefaces)
- [ ] Font weights used: regular (400), semi-bold (600), bold (700)
- [ ] Letter-spacing: Normal for body, -0.02em for large headlines (optional)
- [ ] All headings use same typeface
- [ ] All body text uses same size and weight

### Responsive Typography
- [ ] Headlines scale down proportionally on mobile
- [ ] Body text remains 16px minimum on mobile
- [ ] Line-length maintained on mobile (<75 chars)
- [ ] No text overflow or awkward breaking
- [ ] Padding reduces on mobile (24px vs. 40-60px)

---

## Color & Contrast Checklist

### Contrast Verification
- [ ] Body text: ≥4.5:1 on all backgrounds
- [ ] Headlines: ≥3:1 on all backgrounds
- [ ] UI components (buttons, borders): ≥3:1
- [ ] Focus indicators: ≥3:1
- [ ] Verified in both light AND dark themes
- [ ] Tools used: WAVE, axe DevTools, or browser contrast checker

### Color Palette
- [ ] Primary accent: --blue-9 (buttons, primary CTAs)
- [ ] Secondary accent: --teal-9 or --violet-9 (secondary buttons)
- [ ] Text color light bg: --mauve-12 or --slate-12
- [ ] Text color dark bg: --mauve-12 (warm off-white, never #FFFFFF)
- [ ] Border color: --mauve-6 or --blue-6
- [ ] Background: --sand-1 or --mauve-1 (light mode)
- [ ] Background: --sand-1-dark (#111110, dark mode)
- [ ] Tints (card bg): --blue-3, --teal-3, --mauve-3

### Dark Mode Testing
- [ ] All colors defined with CSS variables (no hardcoded hex)
- [ ] Dark mode toggle works correctly
- [ ] Contrast maintained in dark mode
- [ ] No pure white text (use --mauve-12)
- [ ] No pure black backgrounds (use --sand-1-dark)
- [ ] Images/screenshots visible in dark mode (not too bright)

### Colorblind Accessibility
- [ ] Primary color: Blue (safest, most colorblind-friendly)
- [ ] Hue separation: 40°+ between different module colors
- [ ] Icons used alongside colors (not color alone)
- [ ] Tested with colorblind simulator (deuteranopia, protanopia, tritanopia)

---

## Mobile Responsiveness Checklist

### Layout
- [ ] Single column on mobile (<768px)
- [ ] Two columns on tablet (768-1024px)
- [ ] Multi-column on desktop (>1024px)
- [ ] Cards stack vertically on mobile
- [ ] No horizontal scroll on any viewport
- [ ] Text doesn't overflow containers

### Touch-Friendly Design
- [ ] All buttons: ≥44x44px touch target
- [ ] All links: ≥44x44px touch target
- [ ] Spacing between targets: ≥8px minimum
- [ ] No hover-only interactions (mobile has no hover)
- [ ] Focus state visible on touch (for accessibility)
- [ ] Double-tap zoom disabled (if appropriate)

### Content Adaptation
- [ ] Headlines stack on mobile (2-3 lines OK)
- [ ] Feature descriptions: 1-2 sentences max on mobile
- [ ] Images scale properly (100% width on mobile)
- [ ] Videos are responsive (aspect ratio preserved)
- [ ] Testimonials: Avatar + 1 line only on mobile
- [ ] Forms simplified on mobile (fewer fields visible)

### Performance on Mobile
- [ ] Load time: <2.5 seconds on 4G (DevTools throttle)
- [ ] Images compressed to WebP format
- [ ] Lazy-load images below fold
- [ ] Lazy-load video embeds
- [ ] JavaScript deferred (not blocking render)
- [ ] No large libraries unnecessarily loaded

### Viewport & Scaling
- [ ] Viewport meta tag present: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] Responsive images use `srcset` or `<picture>` element
- [ ] No fixed widths (use 100%, max-width instead)
- [ ] Breakpoints match design (375px, 768px, 1024px, 1920px)

---

## Animation & Motion Checklist

### Animation Implementation
- [ ] All animations use GPU-accelerated properties (opacity, transform only)
- [ ] No animations on layout properties (width, height, top, left)
- [ ] Scroll-triggered reveals: 200-400ms fade-in + 20-40px slide-up
- [ ] Micro-interactions: 150-200ms button/link hover effects
- [ ] Product demo animation: 3-5 seconds, loops smoothly
- [ ] Total animation duration: <1 second (except scroll-triggered)

### Accessibility & Performance
- [ ] `prefers-reduced-motion` honored (animations disabled or simplified)
- [ ] No animations disable if user enables reduced motion setting
- [ ] No infinite loops (except scroll-triggered content reveal)
- [ ] Animations use `will-change: transform` sparingly
- [ ] No animation lag detected (smooth 60fps)
- [ ] Mobile: Animations work smoothly on lower-end devices

### Purpose & UX
- [ ] Every animation serves a function (guide, explain, or delight)
- [ ] No purely decorative animations
- [ ] Entrance animations don't distract from content
- [ ] Hover effects provide visual feedback (not overdone)
- [ ] Animation timing matches browser capabilities
- [ ] Lottie or SVG animations are lightweight (<50KB)

---

## Forms & Input Fields Checklist

### Structure & Accessibility
- [ ] All inputs have associated labels (`<label for="id">`)
- [ ] Labels are visible (not hidden via CSS)
- [ ] Form fields are properly grouped (`<fieldset>` if needed)
- [ ] Required fields marked with asterisk or "required" text
- [ ] Error messages are linked to inputs (`aria-describedby`)
- [ ] Form validates on submit (not live)

### Design
- [ ] Input height: 44px minimum (touch-friendly)
- [ ] Input padding: 8-12px (internal spacing)
- [ ] Input border: 1px, --mauve-6 (subtle but visible)
- [ ] Input focus: Border color shifts to --blue-6, subtle shadow appears
- [ ] Placeholder text: mauve-11 (legible but distinct from value)
- [ ] Input font size: 16px (prevents iOS auto-zoom)

### Validation & Feedback
- [ ] Error state: Red border (--red-9 or similar) with error message
- [ ] Error message: 12-14px, clear language (not technical jargon)
- [ ] Success state: Green border (--green-9) optional
- [ ] Loading state: Disabled button with spinner text
- [ ] Submit button: Primary color, 44px height, full width on mobile
- [ ] Form doesn't submit on Enter if validation fails

### Accessibility
- [ ] Form is keyboard navigable (Tab order logical)
- [ ] Focus indicators visible (3px ring)
- [ ] Error messages announced by screen readers
- [ ] Submit button has clear label (not generic "Submit")
- [ ] Form reset is optional (confirmation if destructive)
- [ ] ARIA attributes used: `aria-label`, `aria-describedby`, `aria-invalid`

---

## Performance & Technical Checklist

### Page Speed
- [ ] Load time: <2.5 seconds on 4G (DevTools throttle)
- [ ] First Contentful Paint (FCP): <1.5 seconds
- [ ] Largest Contentful Paint (LCP): <2.5 seconds
- [ ] Cumulative Layout Shift (CLS): <0.1
- [ ] Time to Interactive (TTI): <3.5 seconds
- [ ] Lighthouse Performance score: >90

### Asset Optimization
- [ ] Images: Compressed, WebP format, responsive (srcset)
- [ ] Videos: Compressed, lazy-loaded, autoplay muted
- [ ] Fonts: System fonts preferred, or WOFF2 subset only needed glyphs
- [ ] CSS: Minified, unused styles purged
- [ ] JavaScript: Minified, split by route, deferred loading

### Technical Implementation
- [ ] No console errors or warnings
- [ ] No 404s (missing images, scripts, stylesheets)
- [ ] All external resources loaded over HTTPS
- [ ] CSP headers configured (if applicable)
- [ ] Robots.txt and sitemap.xml present
- [ ] Meta tags: title, description, og:* tags present

### Browser & Device Testing
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] iPhone 12 (375px), iPhone 14 Pro Max (430px)
- [ ] Samsung Galaxy S10 (360px), iPad (768px)
- [ ] Desktop 1920x1080, Ultra-wide 2560x1440

---

## SEO & Metadata Checklist

### Meta Tags
- [ ] Title tag: <60 characters, includes primary keyword
- [ ] Meta description: <160 characters, compelling CTA
- [ ] Canonical URL: Set if duplicate content possible
- [ ] Open Graph tags: og:title, og:description, og:image
- [ ] Twitter Card tags (if applicable)
- [ ] Viewport meta tag: `width=device-width, initial-scale=1.0`

### Structured Data
- [ ] Schema.org JSON-LD for Organization, Product, or LocalBusiness
- [ ] FAQPage schema (if FAQ section present)
- [ ] BreadcrumbList schema (if needed)
- [ ] Validated at schema.org validator

### Content
- [ ] H1 present (only one, matches title tag)
- [ ] Heading hierarchy: H1 > H2 > H3 (no skips)
- [ ] Alt text on all images (descriptive, not keyword-stuffed)
- [ ] Links have descriptive text (not "click here")
- [ ] Internal links to related resources (if applicable)

---

## Deployment & Launch Checklist

### Before Launch
- [ ] All links tested (internal & external)
- [ ] Forms tested (submit, validation, redirect)
- [ ] Email collection tested (if applicable)
- [ ] Analytics installed and tracking correctly
- [ ] Lighthouse audit: Performance >90, Accessibility >95, SEO >95
- [ ] WAVE audit: No errors, <10 warnings

### Final Review
- [ ] Design review by designer
- [ ] Copy review by product/marketing
- [ ] QA testing on mobile and desktop
- [ ] Accessibility testing (keyboard, screen reader)
- [ ] Load testing (simulate traffic spike)
- [ ] Backup and rollback plan documented

### Post-Launch Monitoring
- [ ] Monitor performance metrics for 24 hours
- [ ] Check error logs for any issues
- [ ] Monitor conversion rate
- [ ] Set up alerts for traffic anomalies
- [ ] Plan for A/B testing (future iterations)

---

## Quick Win Checklist (High Impact, Low Effort)

Implement these first for maximum conversion improvement:

1. **Institution Logos** (+15-25%)
   - [ ] Gathered 6-12 institution logos
   - [ ] Logos displayed in hero or first section
   - [ ] Fade effect on hover

2. **Testimonials** (+68%)
   - [ ] Collected 3-5 researcher testimonials
   - [ ] Formatted: Avatar + Name + Title + Quote
   - [ ] Positioned near CTAs

3. **CTA Visibility** (+12%)
   - [ ] Primary CTA contrasts with background
   - [ ] 44px minimum height
   - [ ] Action verb copy ("Start Free Trial")

4. **Video Demo** (+50% dwell time)
   - [ ] 15-30 second product workflow video
   - [ ] Autoplay, muted, loops seamlessly

5. **Page Speed** (+32%)
   - [ ] Images compressed to WebP
   - [ ] Videos lazy-loaded
   - [ ] <2.5 second load time verified

6. **Mobile Optimization** (80% traffic)
   - [ ] Single column layout
   - [ ] Full-width buttons
   - [ ] 16px+ body text

7. **Contrast Verification** (Accessibility)
   - [ ] 4.5:1 contrast verified
   - [ ] Light AND dark theme tested
   - [ ] WAVE/axe DevTools audit passed

8. **Focus Indicators** (Keyboard users)
   - [ ] 3px ring visible on focus
   - [ ] 3:1 contrast ratio on ring
   - [ ] All interactive elements have indicator

---

**Status**: Ready to use
**Last Updated**: February 2025
**Focus**: Comprehensive validation for high-converting, accessible landing pages

