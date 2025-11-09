# Common Patterns

Frequently used patterns for forms, authentication, dialogs, and other common UI elements.

---

## Authentication with useAuth Hook

### Getting Current User

```typescript
import { useAuth } from '@/hooks/useAuth';

export const MyComponent: React.FC = () => {
    const { user, isLoading, logout } = useAuth();

    if (isLoading) {
        return <div className="p-4">Loading...</div>;
    }

    // Available properties:
    // - user.id: string
    // - user.email: string
    // - user.username: string
    // - user.roles: string[]

    return (
        <div className="space-y-4">
            <p>Logged in as: {user.email}</p>
            <p>Username: {user.username}</p>
            <p>Roles: {user.roles.join(', ')}</p>
            <button
                onClick={logout}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
                Logout
            </button>
        </div>
    );
};
```

**NEVER make direct API calls for auth** - always use `useAuth` hook.

---

## Forms with React Hook Form + Zod

### Basic Form Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define Zod schema
const formSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    age: z.number().min(18, 'Must be 18 or older'),
});

type FormData = z.infer<typeof formSchema>;

interface MyFormProps {
    onSuccess?: () => void;
}

export const MyForm: React.FC<MyFormProps> = ({ onSuccess }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            email: '',
            age: 18,
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            await api.submitForm(data);
            onSuccess?.();
        } catch (error) {
            console.error('Form submission failed:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            {/* Username Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Username
                </label>
                <input
                    {...register('username')}
                    type="text"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
            </div>

            {/* Email Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    {...register('email')}
                    type="email"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
            </div>

            {/* Age Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Age
                </label>
                <input
                    {...register('age', { valueAsNumber: true })}
                    type="number"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 ${
                        errors.age ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
};
```

### Form Field Component

```typescript
interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    error,
    required,
    children,
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-600">*</span>}
        </label>
        <div className="mt-1">{children}</div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

// Usage
<FormField label="Username" error={errors.username?.message} required>
    <input {...register('username')} type="text" className="..." />
</FormField>
```

---

## Modal/Dialog with HeadlessUI

### Basic Dialog

```typescript
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isPending?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isPending = false,
}) => {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

            {/* Dialog */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-sm rounded-lg bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-gray-200 p-6">
                        <div>
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="mt-2 text-sm text-gray-600">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 justify-end border-t border-gray-200 p-6">
                        <button
                            onClick={onClose}
                            disabled={isPending}
                            className="rounded-md px-4 py-2 text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isPending}
                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isPending ? 'Loading...' : 'Confirm'}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};
```

---

## Search / Filter Patterns

### Search Input

```typescript
import { useCallback, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchableListProps {
    items: { id: string; title: string }[];
}

export const SearchableList: React.FC<SearchableListProps> = ({ items }) => {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);

    const filtered = items.filter((item) =>
        item.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div>
                <input
                    type="text"
                    placeholder="Search items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <p className="text-center text-gray-600">No items found</p>
            ) : (
                <div className="space-y-2">
                    {filtered.map((item) => (
                        <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                            {item.title}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
```

### Filter Buttons

```typescript
type FilterOption = 'all' | 'active' | 'completed';

export const FilterButtons: React.FC<{
    activeFilter: FilterOption;
    onFilterChange: (filter: FilterOption) => void;
}> = ({ activeFilter, onFilterChange }) => {
    const filters: FilterOption[] = ['all', 'active', 'completed'];

    return (
        <div className="flex gap-2">
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`rounded-md px-4 py-2 font-medium transition-colors ${
                        activeFilter === filter
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
            ))}
        </div>
    );
};
```

---

## Loading and Error States

### Suspense Loader

```typescript
/**
 * Displays a loading spinner while content suspends
 */
export const SuspenseLoader: React.FC = () => (
    <div className="flex items-center justify-center p-8">
        <div className="space-y-4 text-center">
            {/* Spinner */}
            <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Loading...</p>
        </div>
    </div>
);
```

### Error Boundary

```typescript
import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error) {
        console.error('Error caught by boundary:', error);
    }

    reset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback?.(this.state.error!, this.reset) ?? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                        <h2 className="text-lg font-bold text-red-900">Something went wrong</h2>
                        <p className="mt-2 text-sm text-red-700">
                            {this.state.error?.message}
                        </p>
                        <button
                            onClick={this.reset}
                            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Try again
                        </button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
```

---

## Tooltip Pattern

```typescript
import { Popover } from '@headlessui/react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => (
    <Popover className="relative">
        <Popover.Button className="inline-block">
            {children}
        </Popover.Button>
        <Popover.Panel className="absolute z-50 w-max rounded-md bg-gray-900 px-2 py-1 text-sm text-white">
            {content}
        </Popover.Panel>
    </Popover>
);

// Usage
<Tooltip content="Click to edit">
    <button>Edit</button>
</Tooltip>
```

---

## Empty State Pattern

```typescript
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 px-6">
        {icon && <div className="mb-4 text-4xl text-gray-400">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        {action && (
            <button
                onClick={action.onClick}
                className="mt-4 rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
                {action.label}
            </button>
        )}
    </div>
);

// Usage
<EmptyState
    title="No results found"
    description="Try adjusting your search filters"
    action={{
        label: 'Clear filters',
        onClick: () => setFilters({}),
    }}
/>
```

---

## Pagination Pattern

```typescript
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => (
    <div className="flex items-center justify-between">
        <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
            Previous
        </button>

        <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
        </span>

        <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
            Next
        </button>
    </div>
);
```

---

**Related Files:**
- [styling-guide.md](styling-guide.md) - Tailwind and CVA patterns
- [complete-examples.md](complete-examples.md) - Full working component examples
