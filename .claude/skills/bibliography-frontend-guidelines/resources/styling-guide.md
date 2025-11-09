# Styling Guide

Modern styling patterns for Tailwind CSS and Component Variant Authority (CVA) for bibliography frontend.

---

## Inline vs Separate Styles

### Decision Threshold

**Small Components (<100 lines total)**: Inline Tailwind classes

```typescript
export const MyComponent: React.FC = () => {
    return (
        <div className="flex flex-col p-4 gap-4">
            <div className="border-b pb-4">
                <h2>Title</h2>
            </div>
        </div>
    );
};
```

**Reusable/Complex Components (>100 lines)**: Separate with CVA

```typescript
// MyComponent.styles.ts
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/utils/cn';

export const containerVariants = cva('flex flex-col gap-4', {
    variants: {
        size: {
            sm: 'p-2',
            md: 'p-4',
            lg: 'p-6',
        },
    },
    defaultVariants: { size: 'md' },
});

export type ContainerVariants = VariantProps<typeof containerVariants>;

// MyComponent.tsx
import { containerVariants, type ContainerVariants } from './MyComponent.styles';

interface MyComponentProps extends ContainerVariants {}

export const MyComponent: React.FC<MyComponentProps> = ({ size }) => {
    return (
        <div className={containerVariants({ size })}>
            <h2>Title</h2>
        </div>
    );
};
```

---

## Tailwind Basics

### Spacing (4px = 1 unit)

```typescript
// Padding
<div className="p-4" />           // All sides: 16px
<div className="px-4" />          // Horizontal: 16px
<div className="py-2" />          // Vertical: 8px
<div className="pt-2 pr-1" />     // Specific sides

// Margin
<div className="m-4 mx-2 my-1" />

// Gap (flexbox/grid)
<div className="flex gap-4" />
```

### Colors

```typescript
// Using project colors
<div className="bg-blue-500 text-white" />
<div className="border border-gray-200" />
<div className="hover:bg-blue-600" />

// From CSS variables (tailwind.config)
<div className="bg-primary text-primary-foreground" />
```

### Responsive Prefixes

```typescript
// Mobile-first
<div className="p-2 md:p-4 lg:p-6" />        // Different padding per breakpoint
<div className="flex-col md:flex-row" />     // Column on mobile, row on desktop
<div className="hidden md:block" />          // Hide on mobile, show on desktop

// Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)
```

---

## Component Variant Authority (CVA)

### Basic Pattern

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

// Define variants
export const buttonVariants = cva(
    // Base styles (always applied)
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    {
        variants: {
            variant: {
                primary: 'bg-blue-600 text-white hover:bg-blue-700',
                secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
                ghost: 'text-gray-700 hover:bg-gray-100',
            },
            size: {
                sm: 'px-3 py-1 text-sm',
                md: 'px-4 py-2 text-base',
                lg: 'px-6 py-3 text-lg',
            },
            disabled: {
                true: 'opacity-50 cursor-not-allowed',
                false: 'cursor-pointer',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            disabled: false,
        },
    }
);

// Extract variant types
export type ButtonVariants = VariantProps<typeof buttonVariants>;

// Use in component
interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        ButtonVariants {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant, size, disabled, className, ...props }, ref) => (
        <button
            ref={ref}
            disabled={disabled}
            className={buttonVariants({ variant, size, disabled, className })}
            {...props}
        />
    )
);

Button.displayName = 'Button';
```

### Combining Classes (cn utility)

```typescript
// src/common/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Usage - safely combines and deduplicates Tailwind classes
<div className={cn('p-4 bg-blue-500', isActive && 'bg-blue-600')} />
```

---

## Common Patterns

### Flexbox Layouts

```typescript
// Row (horizontal)
<div className="flex gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
</div>

// Column (vertical)
<div className="flex flex-col gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
</div>

// Center content
<div className="flex items-center justify-center">
    Centered
</div>

// Space between
<div className="flex justify-between">
    <div>Left</div>
    <div>Right</div>
</div>
```

### Grid Layouts

```typescript
// Simple grid
<div className="grid grid-cols-3 gap-4">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map((item) => (
        <Card key={item.id}>{item.title}</Card>
    ))}
</div>

// Grid with span
<div className="grid grid-cols-4 gap-4">
    <div className="col-span-2">Wide item</div>
    <div>Normal</div>
</div>
```

### Card Component

```typescript
// cards/Card.styles.ts
import { cva } from 'class-variance-authority';

export const cardVariants = cva(
    'rounded-lg border border-gray-200 bg-white shadow-sm',
    {
        variants: {
            padding: {
                sm: 'p-3',
                md: 'p-4',
                lg: 'p-6',
            },
        },
        defaultVariants: { padding: 'md' },
    }
);

// components/Card.tsx
import { cardVariants, type CardVariants } from './Card.styles';

interface CardProps extends CardVariants, React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ padding, className, ...props }, ref) => (
        <div
            ref={ref}
            className={cardVariants({ padding, className })}
            {...props}
        />
    )
);

Card.displayName = 'Card';

// Usage
<Card padding="lg" className="hover:shadow-md">
    <h3>Card Title</h3>
    <p>Card content</p>
</Card>
```

### Interactive States

```typescript
// Hover
<button className="bg-blue-600 hover:bg-blue-700">Hover me</button>

// Focus (keyboard navigation)
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
    Focus me
</button>

// Disabled
<button disabled className="opacity-50 cursor-not-allowed">
    Disabled
</button>

// Active/selected
<div className={cn(
    'p-4 cursor-pointer transition-colors',
    isActive ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-200'
)}>
    Selectable item
</div>
```

### Responsive Positioning

```typescript
// Fixed header
<header className="fixed top-0 left-0 right-0 bg-white shadow">
    Navigation
</header>

// Sticky sidebar
<aside className="sticky top-20 h-[calc(100vh-80px)] overflow-auto">
    Sidebar
</aside>

// Absolute positioning
<div className="relative">
    <button>Open</button>
    <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded">
        Dropdown
    </div>
</div>
```

---

## HeadlessUI Integration

### Dialog/Modal

```typescript
import { Dialog } from '@headlessui/react';

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
    isOpen,
    onClose,
}) => (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

        {/* Content */}
        <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="max-w-md rounded-lg bg-white p-6 shadow-xl">
                <Dialog.Title className="text-lg font-bold">
                    Confirm Action
                </Dialog.Title>
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Close
                </button>
            </Dialog.Panel>
        </div>
    </Dialog>
);
```

### Popover

```typescript
import { Popover } from '@headlessui/react';

export const HelpButton: React.FC = () => (
    <Popover className="relative">
        <Popover.Button className="px-3 py-2 rounded hover:bg-gray-100">
            ?
        </Popover.Button>
        <Popover.Panel className="absolute top-full mt-2 w-64 bg-white rounded shadow-lg p-4 z-50">
            <p>Help text goes here</p>
        </Popover.Panel>
    </Popover>
);
```

---

## What NOT to Use

### ❌ Inline Style Objects

```typescript
// ❌ AVOID - Inline styles
<div style={{ padding: '16px', backgroundColor: 'blue' }}>
    Content
</div>

// ✅ USE - Tailwind classes
<div className="p-4 bg-blue-600">Content</div>
```

### ❌ Global CSS Files

```typescript
// ❌ AVOID - Separate CSS files for component styles
// styles.css
.my-component { padding: 16px; }

// ✅ USE - Tailwind classes in JSX
<div className="p-4">Content</div>
```

### ❌ CSS-in-JS (emotion, styled-components)

```typescript
// ❌ AVOID
import styled from 'styled-components';
const StyledDiv = styled.div` padding: 16px; `;

// ✅ USE - Tailwind + CVA
export const cardVariants = cva('p-4 ...');
```

---

## Code Style Standards

### Indentation

**4 spaces** (project standard)

```typescript
export const buttonVariants = cva(
    'inline-flex items-center justify-center',
    {
        variants: {
            variant: {
                primary: 'bg-blue-600 text-white',
            },
        },
    }
);
```

### Quotes

**Single quotes** for strings

```typescript
// ✅ CORRECT
const className = 'flex flex-col gap-4';

// ❌ WRONG
const className = "flex flex-col gap-4";
```

### Trailing Commas

**Always use trailing commas**

```typescript
// ✅ CORRECT
export const cardVariants = cva('p-4', {
    variants: {
        size: {
            sm: 'p-2',
            md: 'p-4',  // Trailing comma
        },
    },
});

// ❌ WRONG
export const cardVariants = cva('p-4', {
    variants: {
        size: {
            sm: 'p-2',
            md: 'p-4'  // No trailing comma
        }
    }
});
```

---

## Summary

**Styling Checklist:**
- ✅ Use Tailwind classes in JSX
- ✅ Use CVA for reusable/complex components
- ✅ Use `cn()` utility to safely merge classes
- ✅ Mobile-first responsive design
- ✅ Leverage HeadlessUI for accessible components
- ✅ 4 space indentation
- ✅ Single quotes
- ✅ Trailing commas
- ❌ No inline styles
- ❌ No separate CSS files for components
- ❌ No CSS-in-JS solutions

**See Also:**
- [common-patterns.md](common-patterns.md) - Component patterns and examples
- [complete-examples.md](complete-examples.md) - Full component examples
