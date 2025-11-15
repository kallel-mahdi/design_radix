---
name: bibliography-frontend-guidelines
description: React 19/TypeScript frontend patterns for bibliography manager using Tailwind CSS, CVA variants, TanStack Router, Zustand state management, and modern data fetching. Use when creating components, pages, features, styling, routing, state management, or working with frontend code.
---

# Bibliography Frontend Development Guidelines

## Quick Reference

| Use this skill when… | Bring this input | You will deliver |
| --- | --- | --- |
| Building or refactoring React UI | Feature spec + affected files | Components that follow Suspense, Tailwind/CVA, TanStack Router patterns |
| Adding data fetching/state | API contract + store/query draft | Hooks/stores using TanStack Query + Zustand with project aliases |
| Styling or accessibility review | Design tokens from `docs/01-specification/frontend/DesignSystem.md` | Tailwind/CVA variants + Headless UI composition notes |

## Purpose

Comprehensive guide for modern React development emphasizing Suspense-based data fetching, Tailwind/CVA styling, lazy loading, proper file organization, and performance optimization.

---

## Tech Stack

- **React 19** - Modern UI library
- **TypeScript** - Type safety
- **TanStack Router** - Client-side routing
- **Zustand** - Global state management
- **TanStack React Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **CVA** - Component variant assertion (type-safe variants)
- **Headless UI** - Unstyled components
- **react-hook-form** - Form handling
- **Zod** - Schema validation

---

## When to Use This Skill

Automatically activates when working on:
- Creating new components or pages
- Building new features
- Fetching data with TanStack Query
- Setting up routing with TanStack Router
- Styling with Tailwind CSS + CVA
- Global state management with Zustand
- Performance optimization
- Organizing frontend code
- TypeScript best practices

---

## Quick Start

### New Component Checklist

Creating a component? Follow this checklist:

- [ ] Use `React.FC<Props>` pattern with TypeScript
- [ ] Lazy load if heavy component: `React.lazy(() => import())`
- [ ] Wrap in `<Suspense>` for loading states
- [ ] Use `useSuspenseQuery` for data fetching
- [ ] Import aliases: `@/`, `~types`, `~components`, `~features`
- [ ] Styles: Tailwind classes + CVA variants in className
- [ ] Use `useCallback` for event handlers passed to children
- [ ] Default export at bottom
- [ ] No early returns with loading spinners (use Suspense)
- [ ] Use toast/notifications for user feedback

### New Feature Checklist

Creating a feature? Set up this structure:

- [ ] Create `features/{feature-name}/` directory
- [ ] Create subdirectories: `api/`, `components/`, `hooks/`, `stores/`, `types/`
- [ ] Create API service file: `api/{feature}Api.ts`
- [ ] Set up TypeScript types in `types/`
- [ ] Create store: `stores/{feature}Store.ts` (if global state needed)
- [ ] Create route in `routes/{feature-name}/index.tsx`
- [ ] Lazy load feature components
- [ ] Use Suspense boundaries
- [ ] Export public API from feature `index.ts`

---

## Import Aliases Quick Reference

| Alias | Resolves To | Example |
|-------|-------------|---------|
| `@/` | `src/` | `import { apiClient } from '@/lib/apiClient'` |
| `~types` | `src/types` | `import type { Reference } from '~types/reference'` |
| `~components` | `src/components` | `import { Layout } from '~components/Layout'` |
| `~features` | `src/features` | `import { ReferenceCard } from '~features/library'` |

Defined in: `vite.config.ts` resolve aliases

---

## Common Imports Cheatsheet

```typescript
// React & Lazy Loading
import React, { useState, useCallback, useMemo, Suspense } from 'react';
const ReferenceCard = React.lazy(() => import('./ReferenceCard'));

// TanStack Query (Suspense)
import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query';

// TanStack Router
import { useNavigate, useParams, Link } from '@tanstack/react-router';

// Zustand
import { create } from 'zustand';

// Tailwind + CVA
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

// Headless UI
import { Dialog, Menu, Disclosure } from '@headlessui/react';

// react-hook-form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod
import { z } from 'zod';

// Project Components
import { SuspenseLoader } from '~components/SuspenseLoader';

// Types
import type { Reference } from '~types/reference';
```

---

## Core Patterns (7 Key Rules)

### 1. Use Suspense for Data Loading - No Spinners in JSX

```typescript
// ❌ NEVER: Conditional loading spinners
export const ReferenceCard: React.FC<Props> = ({ refId }) => {
    const { data, isLoading } = useQuery(...);
    if (isLoading) return <LoadingSpinner />;
    return <div>{data.title}</div>;
};

// ✅ ALWAYS: Suspense boundary + useSuspenseQuery
export const ReferenceCard: React.FC<Props> = ({ refId }) => {
    const { data } = useSuspenseQuery({...});
    return <div>{data.title}</div>;
};

export const LibraryPage = () => (
    <Suspense fallback={<ReferenceCardSkeleton />}>
        <ReferenceCard refId="123" />
    </Suspense>
);
```

### 2. Style with Tailwind + CVA, Never Hardcode Variants

```typescript
// ❌ NEVER: Hardcoded conditional classes
const buttonClasses = isActive
    ? 'bg-blue-500 text-white px-4 py-2 rounded'
    : 'bg-gray-200 text-black px-4 py-2 rounded';

// ✅ ALWAYS: CVA for variant safety
const buttonVariants = cva(
    'px-4 py-2 rounded font-medium transition-colors',
    {
        variants: {
            variant: {
                primary: 'bg-blue-500 text-white hover:bg-blue-600',
                secondary: 'bg-gray-200 text-black hover:bg-gray-300',
                danger: 'bg-red-500 text-white hover:bg-red-600'
            },
            size: {
                sm: 'px-2 py-1 text-sm',
                md: 'px-4 py-2 text-base',
                lg: 'px-6 py-3 text-lg'
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md'
        }
    }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant, size, className, ...props }, ref) => (
        <button
            ref={ref}
            className={twMerge(buttonVariants({ variant, size }), className)}
            {...props}
        />
    )
);
```

### 3. Component Variant Pattern (Not MUI Grid)

```typescript
// ❌ NEVER: MUI Grid with size props
<Grid container spacing={2}>
    <Grid item xs={12} md={6}>
        <ReferenceCard />
    </Grid>
</Grid>

// ✅ ALWAYS: Tailwind grid classes
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <ReferenceCard />
</div>
```

### 4. Lazy Load Heavy Components

```typescript
const CollectionExplorer = React.lazy(() =>
    import('./CollectionExplorer').then(mod => ({
        default: mod.CollectionExplorer
    }))
);

export const LibraryPage = () => (
    <div>
        <h1>Library</h1>
        <Suspense fallback={<div>Loading explorer...</div>}>
            <CollectionExplorer />
        </Suspense>
    </div>
);
```

### 5. Use Zustand for Global State (Not Context)

```typescript
import { create } from 'zustand';

interface LibraryStore {
    selectedCollectionId: string | null;
    filters: { archived: boolean };
    setSelectedCollection: (id: string) => void;
    setFilters: (filters: Partial<LibraryStore['filters']>) => void;
}

export const useLibraryStore = create<LibraryStore>((set) => ({
    selectedCollectionId: null,
    filters: { archived: false },
    setSelectedCollection: (id) => set({ selectedCollectionId: id }),
    setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } }))
}));

// In component
export const ReferenceList = () => {
    const { filters } = useLibraryStore();
    const { data } = useSuspenseQuery({...});
    return <div>{/* render */}</div>;
};
```

### 6. Data Fetching with useSuspenseQuery

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';

const referencesQueryOptions = {
    queryKey: ['references'],
    queryFn: async () => {
        const res = await fetch('/api/bibliography/references');
        return res.json();
    }
};

export const ReferenceList = () => {
    const { data: references } = useSuspenseQuery(referencesQueryOptions);
    return (
        <div className="space-y-2">
            {references.map((ref) => (
                <ReferenceCard key={ref.id} reference={ref} />
            ))}
        </div>
    );
};
```

### 7. Type-Safe Form Handling

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createReferenceSchema = z.object({
    title: z.string().min(1, 'Title required'),
    authors: z.array(z.string()).min(1, 'At least one author required'),
    doi: z.string().optional()
});

type CreateReferenceInput = z.infer<typeof createReferenceSchema>;

export const ReferenceForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateReferenceInput>({
        resolver: zodResolver(createReferenceSchema)
    });

    const onSubmit = (data: CreateReferenceInput) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <input
                    {...register('title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Title"
                />
                {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            </div>
        </form>
    );
};
```

---

## Tailwind + CVA Pattern Examples

### Button Component

```typescript
const buttonVariants = cva(
    'font-medium transition-colors rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed',
    {
        variants: {
            variant: {
                primary: 'bg-blue-500 text-white hover:bg-blue-600',
                secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
                ghost: 'hover:bg-gray-100 text-gray-900'
            },
            size: {
                sm: 'px-2 py-1 text-sm',
                md: 'px-4 py-2',
                lg: 'px-6 py-3 text-lg'
            }
        },
        defaultVariants: { variant: 'primary', size: 'md' }
    }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant, size, className, ...props }, ref) => (
        <button
            ref={ref}
            className={twMerge(buttonVariants({ variant, size }), className)}
            {...props}
        />
    )
);
```

### Card Component

```typescript
const cardVariants = cva(
    'rounded-lg border transition-shadow',
    {
        variants: {
            variant: {
                outlined: 'border-gray-200 shadow-sm hover:shadow-md',
                elevated: 'border-none shadow-md hover:shadow-lg',
                flat: 'border-gray-100 shadow-none'
            }
        },
        defaultVariants: { variant: 'outlined' }
    }
);

type CardProps = React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof cardVariants>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ variant, className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={twMerge(cardVariants({ variant }), className)}
            {...props}
        >
            {children}
        </div>
    )
);
```

---

## File Organization (features/ pattern)

```
src/
├── features/
│   ├── library/                # Feature: Reference library
│   │   ├── api/
│   │   │   └── referencesApi.ts
│   │   ├── components/
│   │   │   ├── ReferenceCard.tsx
│   │   │   ├── ReferenceList.tsx
│   │   │   └── ReferenceModal.tsx
│   │   ├── stores/
│   │   │   └── libraryStore.ts
│   │   ├── types/
│   │   │   └── reference.ts
│   │   ├── hooks/
│   │   │   ├── useReferences.ts
│   │   │   └── useReferenceFilter.ts
│   │   ├── index.ts              # Public API
│   │   └── routes.tsx            # Feature routes
│   ├── search/                 # Feature: Search
│   ├── projects/               # Feature: Projects
│   └── duplicates/             # Feature: Duplicate detection
├── components/                 # Shared UI components
├── lib/                        # Utilities
├── types/                      # Global types
└── routes/                     # Router configuration
```

---

## Quick Reference

### Responsive Classes

```html
<!-- Mobile-first -->
<div class="text-sm md:text-base lg:text-lg">
    Responsive text sizing
</div>

<!-- Grid -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {items.map(item => <Item key={item.id} />)}
</div>

<!-- Flexbox -->
<div class="flex flex-col md:flex-row gap-4">
    <Sidebar />
    <Main />
</div>
```

### Common Tailwind Utilities

```html
<!-- Spacing -->
<div class="p-4 m-2 gap-3">Content</div>

<!-- Colors -->
<div class="bg-blue-500 text-white border-red-200">Content</div>

<!-- Display -->
<div class="hidden md:block">Only visible on medium screens</div>

<!-- Hover/Active -->
<button class="hover:bg-blue-600 active:scale-95">Button</button>
```

---

## Anti-Patterns to Avoid

❌ Inline styles instead of Tailwind classes
❌ Hardcoded component variants without CVA
❌ Loading state spinners in JSX (use Suspense)
❌ Direct process.env access (use vite.env imports)
❌ Props drilling (use Zustand for global state)
❌ MUI Grid and sx props
❌ Untyped components and props

---

## Navigation Guide

| Need to... | Read this |
|------------|-----------|
| Style components | [styling-guide.md](styling-guide.md) |
| Common patterns | [common-patterns.md](common-patterns.md) |
| See examples | [complete-examples.md](complete-examples.md) |

---

## Resource Files

### [styling-guide.md](styling-guide.md)
Tailwind CSS, CVA variants, responsive design, HeadlessUI integration, component styling

### [common-patterns.md](common-patterns.md)
Authentication, forms with react-hook-form, dialogs, modals, search/filter patterns

### [complete-examples.md](complete-examples.md)
Full working features, Suspense patterns, TanStack Query with Tailwind styling, real-world scenarios

---

## Related Skills

- **bibliography-backend-guidelines** - Backend API patterns
- **bibliography-planning-docs** - Architecture and feature specifications
- **skill-developer** - Meta-skill for creating and managing skills

---

**Skill Status**: COMPLETE ✅
**Line Count**: < 500 ✅
**Progressive Disclosure**: 11 resource files ✅
