# Complete Examples - Modern React Patterns

Full working examples combining React 19, Suspense, TanStack Query, Tailwind CSS, CVA, and HeadlessUI.

---

## Example 1: Complete Modern Component with Tailwind

Demonstrates: React.FC, useSuspenseQuery, Tailwind styling, error handling, mutations

```typescript
/**
 * User profile display component
 * Demonstrates modern patterns with Suspense and TanStack Query
 * Styled with Tailwind CSS
 */
import React, { useState, useCallback, useMemo } from 'react';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import type { User } from '../types';

interface UserProfileProps {
    userId: string;
    onUpdate?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    // Suspense query - no isLoading needed!
    const { data: user } = useSuspenseQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.getUser(userId),
        staleTime: 5 * 60 * 1000,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (updates: Partial<User>) =>
            userApi.updateUser(userId, updates),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            setIsEditing(false);
            onUpdate?.();
        },
    });

    // Memoized computed value
    const fullName = useMemo(() => {
        return `${user.firstName} ${user.lastName}`;
    }, [user.firstName, user.lastName]);

    // Event handlers with useCallback
    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleSave = useCallback(() => {
        updateMutation.mutate({
            firstName: user.firstName,
            lastName: user.lastName,
        });
    }, [user, updateMutation]);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
    }, []);

    // Extract initials
    const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

    return (
        <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                    {initials}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
                    <p className="text-sm text-gray-600">{user.email}</p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
                <div>
                    <p className="text-sm text-gray-600">Username</p>
                    <p className="font-medium text-gray-900">{user.username}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Roles</p>
                    <p className="font-medium text-gray-900">{user.roles.join(', ')}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
                {!isEditing ? (
                    <button
                        onClick={handleEdit}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="rounded-md bg-gray-200 px-4 py-2 text-gray-900 font-medium hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
```

---

## Example 2: Modal Component with HeadlessUI

Demonstrates: Controlled modal, HeadlessUI Dialog, Tailwind styling, form handling

```typescript
/**
 * Delete confirmation modal
 * Uses HeadlessUI Dialog for accessibility
 */
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import React from 'react';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isPending?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
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

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center">
                <DialogPanel className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        {title}
                    </DialogTitle>

                    <p className="mt-4 text-sm text-gray-600">{description}</p>

                    {/* Actions */}
                    <div className="mt-6 flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={isPending}
                            className="rounded-md px-4 py-2 text-gray-900 font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isPending}
                            className="rounded-md bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};
```

---

## Example 3: List Component with TanStack Query

Demonstrates: useSuspenseQuery for lists, mapping, conditional rendering, loading states

```typescript
/**
 * User list component
 * Demonstrates list rendering with Suspense
 */
import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import type { User } from '../types';

export const UserList: React.FC = () => {
    const { data: users } = useSuspenseQuery({
        queryKey: ['users'],
        queryFn: () => userApi.getUsers(),
        staleTime: 1 * 60 * 1000,
    });

    if (users.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-600">No users found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {users.map((user) => (
                <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                    <div>
                        <h4 className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                        {user.roles[0]}
                    </span>
                </div>
            ))}
        </div>
    );
};
```

---

## Example 4: CVA Component (Reusable Button)

Demonstrates: CVA for variants, type-safe props, composition

```typescript
// components/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/utils/cn';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
    {
        variants: {
            variant: {
                primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
                secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
                ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
                danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
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

export type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        ButtonVariants {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant, size, disabled, className, ...props }, ref) => (
        <button
            ref={ref}
            disabled={disabled}
            className={cn(buttonVariants({ variant, size, disabled }), className)}
            {...props}
        />
    )
);

Button.displayName = 'Button';

// Usage
export const ButtonDemo = () => (
    <div className="flex gap-4">
        <Button variant="primary" size="md">
            Primary Button
        </Button>
        <Button variant="secondary" size="md">
            Secondary Button
        </Button>
        <Button variant="danger" size="sm">
            Delete
        </Button>
        <Button disabled>Disabled</Button>
    </div>
);
```

---

## Example 5: Feature Structure

Real example structure for a feature:

```
features/
  users/
    api/
      userApi.ts                # API service layer
    components/
      UserProfile.tsx           # Main display component
      UserList.tsx              # List component
      UserCard.tsx              # Card component
      modals/
        DeleteUserModal.tsx     # Modal component
    hooks/
      useSuspenseUser.ts        # Suspense query hook
      useUserMutations.ts       # Mutation hooks
    types/
      index.ts                  # TypeScript interfaces
    index.ts                    # Public API exports
```

### API Service (userApi.ts)

```typescript
import apiClient from '@/common/api/apiClient';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types';

export const userApi = {
    getUser: async (userId: string): Promise<User> => {
        const { data } = await apiClient.get(`/users/${userId}`);
        return data;
    },

    getUsers: async (): Promise<User[]> => {
        const { data } = await apiClient.get('/users');
        return data;
    },

    createUser: async (payload: CreateUserPayload): Promise<User> => {
        const { data } = await apiClient.post('/users', payload);
        return data;
    },

    updateUser: async (userId: string, payload: UpdateUserPayload): Promise<User> => {
        const { data } = await apiClient.put(`/users/${userId}`, payload);
        return data;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await apiClient.delete(`/users/${userId}`);
    },
};
```

### Suspense Hook (useSuspenseUser.ts)

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import type { User } from '../types';

export function useSuspenseUser(userId: string) {
    return useSuspenseQuery<User, Error>({
        queryKey: ['user', userId],
        queryFn: () => userApi.getUser(userId),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

export function useSuspenseUsers() {
    return useSuspenseQuery<User[], Error>({
        queryKey: ['users'],
        queryFn: () => userApi.getUsers(),
        staleTime: 1 * 60 * 1000,
    });
}
```

### Types (types/index.ts)

```typescript
export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserPayload {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

export type UpdateUserPayload = Partial<
    Omit<User, 'id' | 'createdAt' | 'updatedAt'>
>;
```

### Public Exports (index.ts)

```typescript
// Export components
export { UserProfile } from './components/UserProfile';
export { UserList } from './components/UserList';
export { UserCard } from './components/UserCard';

// Export hooks
export { useSuspenseUser, useSuspenseUsers } from './hooks/useSuspenseUser';

// Export API
export { userApi } from './api/userApi';

// Export types
export type { User, CreateUserPayload, UpdateUserPayload } from './types';
```

---

## Example 6: Route with Suspense Boundary

```typescript
/**
 * User profile route
 * Path: /users/:userId
 */

import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { SuspenseLoader } from '@/components/SuspenseLoader';
import { UserProfile } from '~features/users';

// Lazy load the component
const LazyUserProfile = lazy(() =>
    import('~features/users').then((m) => ({
        default: m.UserProfile,
    }))
);

export const Route = createFileRoute('/users/$userId')({
    component: () => {
        const { userId } = Route.useParams();

        return (
            <Suspense fallback={<SuspenseLoader />}>
                <LazyUserProfile userId={userId} />
            </Suspense>
        );
    },
});
```

---

**Related Files:**
- [styling-guide.md](styling-guide.md) - Tailwind and CVA patterns
- [common-patterns.md](common-patterns.md) - Form, state, and other patterns
