# BiblioMockup Improvement Agent Prompt

## Your Task

Improve the `BiblioMockup` component to accurately represent the real Citable Bibliography interface. The current implementation is rushed and doesn't match the actual app. You need to study the real frontend code and create a polished, accurate mockup.

---

## Context

**What this is for:** Landing page feature showcase. The mockup appears inside the "Alternating Features" layout at `design_radix/sandbox/src/ui/components/landing/AlternatingFeatures.tsx`. It demonstrates the Bibliography module to potential users.

**Current state:** The mockup exists but has problems:
- Proportions don't match the real app
- Spacing and sizing feel off
- The PDF annotation view is too cramped
- Overall polish is lacking

**Aspect ratio constraint:** The mockup renders in a `16:10` aspect ratio container (see AlternatingFeatures.tsx line with `aspect-[16/10]`).

---

## Files to Study (READ THESE THOROUGHLY)

### 1. Real App Layout Structure
```
/home/mahdi/Desktop/bibliography/frontend-v2/src/components/AppLayout/index.tsx
```
- Understand the `AppLayout` component structure
- Note: Activity Bar + Optional Sidebar + Main Content + Optional Right Panel

### 2. Activity Bar
```
/home/mahdi/Desktop/bibliography/frontend-v2/src/components/shared/ActivityBar.tsx
```
- Study the real activity bar dimensions and styling
- Note the icon sizes, spacing, active states

### 3. Collection Sidebar (if it exists)
```bash
find /home/mahdi/Desktop/bibliography/frontend-v2/src -name "*Collection*" -o -name "*Sidebar*" | grep -v node_modules
```
- Find and study how collections are displayed
- Note the tree structure, indentation, typography

### 4. Reference Table
```bash
find /home/mahdi/Desktop/bibliography/frontend-v2/src -name "*Reference*" -o -name "*Table*" | grep -v node_modules
```
- Study table column structure, widths, typography
- Look at `/home/mahdi/Desktop/bibliography/frontend-v2/src/container/BibliographyContentLayout/` if it exists

### 5. Old Landing Page Mockup (the good one)
```
/home/mahdi/Desktop/bibliography/landing-page/src/components/showcase/OrganizeView/index.tsx
/home/mahdi/Desktop/bibliography/landing-page/src/components/showcase/OrganizeView/ReferenceTable.tsx
/home/mahdi/Desktop/bibliography/landing-page/src/components/showcase/OrganizeView/PDFViewer.tsx
```
- This had a 4-step animation: upload → tagging → pdf-open → taking-notes
- Study the visual proportions that worked
- Note the PDF viewer layout and annotation UX

### 6. Design Tokens
```
/home/mahdi/Desktop/bibliography/design_radix/sandbox/src/styles/shared-tokens.css
/home/mahdi/Desktop/bibliography/frontend-v2/src/index.css
```
- Understand spacing tokens (--spacing-*, --height-*)
- Use correct semantic color tokens (--biblio, --text-primary, etc.)

### 7. Current Mockup Implementation
```
/home/mahdi/Desktop/bibliography/design_radix/sandbox/src/ui/components/landing/mockups/BiblioMockup.tsx
/home/mahdi/Desktop/bibliography/design_radix/sandbox/src/ui/components/landing/mockups/MockAppShell.tsx
/home/mahdi/Desktop/bibliography/design_radix/sandbox/src/ui/components/landing/mockups/MockSidebar.tsx
```

---

## Requirements

### Visual Accuracy
1. **Match the real app's proportions** - Activity bar width, sidebar width, spacing
2. **Use correct typography** - Font sizes, weights, line heights from the real app
3. **Proper spacing rhythm** - Don't guess, use the actual spacing values

### Animation Flow (3 steps, ~9.5s total loop)
1. **Upload (2.5s)** - PDFs dropping in with bounce animation
2. **Tagging (3s)** - Table view with papers, tags animate in
3. **Annotate (4s)** - Full PDF view with text selection → highlight → note taking

### PDF Annotation View Requirements
- Should take FULL main content area (sidebar can hide or stay)
- PDF document should be ~60% width, notes panel ~40%
- Show realistic paper content (title, authors, abstract snippet, body text)
- Animation: text gets highlighted → color picker appears → note starts typing

### Component Reusability
The user wants these mockup components reusable for Manuscripts and Discover mockups later:
- `MockAppShell` - The outer container with activity bar
- `MockSidebar` - Collection tree (different content per module)
- Activity bar should show which module is active

---

## Quality Checklist

Before finishing, verify:

- [ ] Activity bar width matches real app (~44-56px typically)
- [ ] Sidebar width is reasonable (~180-220px)
- [ ] Table rows have proper height (not too cramped, not too spacious)
- [ ] PDF view is actually readable (not tiny text)
- [ ] Animations are smooth and purposeful
- [ ] Colors use CSS variables, not hardcoded hex
- [ ] The mockup looks like a real app, not a wireframe
- [ ] Borders are subtle, not harsh
- [ ] All three animation steps work and loop properly

---

## How to Test

1. Start dev server:
```bash
cd /home/mahdi/Desktop/bibliography/design_radix/sandbox && npm run dev
```

2. Open http://localhost:5174/

3. Click "B: Alternating" in the layout toggle

4. Scroll to the Bibliography section

5. Watch the full animation loop (upload → tagging → annotate → repeat)

6. Compare visually to the real app if possible

---

## Anti-Patterns to Avoid

- **Don't guess proportions** - Read the actual CSS/code
- **Don't use arbitrary pixel values** - Use tokens or relative units
- **Don't make text too small** - It should be readable in the mockup
- **Don't rush** - Quality over speed
- **Don't ignore the old mockup** - It had good ideas worth preserving

---

## Deliverables

1. Updated `BiblioMockup.tsx` that accurately represents the app
2. Updated `MockAppShell.tsx` and `MockSidebar.tsx` if needed
3. Any new CSS animations in `index.css` if needed
4. Brief summary of what you changed and why

---

## Starting Point

Begin by reading ALL the files listed in "Files to Study" section. Take notes on:
- Exact pixel/rem values for widths, heights, spacing
- Typography specs (font sizes, weights)
- Color token usage
- Layout structure

Only after you understand the real app should you start modifying the mockup.
