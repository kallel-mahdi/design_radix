# Bibliography Manager - Frontend

Modern React + TypeScript bibliography management application. Part of the Overleaf + Zotero combined ecosystem.

## Tech Stack

- **React 19** + **TypeScript 5.8**
- **Vite 6** (build tool)
- **TanStack Router** (file-based routing)
- **TanStack React Query** (server state)
- **Zustand** (UI state)
- **TanStack React Table** (tables)
- **Tailwind CSS 4** + **CVA** (styling)
- **react-hook-form** + **Zod** (forms)
- **@headlessui/react** (accessible components)
- **Vitest** + **Playwright** (testing)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Development

```bash
# Development
npm run dev          # Start dev server with HMR

# Building
npm run build        # TypeScript check + Vite build
npm run preview      # Preview production build

# Testing
npm run test         # Run all tests
npm run test:unit    # Unit tests only (Vitest)
npm run test:e2e     # E2E tests only (Playwright)

# Linting
npm run lint         # Check for issues
npm run lint:fix     # Auto-fix issues
npm run format       # Format with Prettier
```

## Project Structure

```
src/
├── features/              # Feature-based organization
│   ├── library/          # Main library view
│   ├── search/           # Search functionality
│   ├── projects/         # Linked projects
│   └── duplicates/       # Duplicate detection
├── components/
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI primitives
├── store/                # Zustand stores (UI state)
├── routes/               # TanStack Router routes
├── common/
│   ├── api/              # API client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── styles/
    └── tailwind.css      # Global styles
```

## Environment Variables

See `.env.example` for configuration. Key variables:

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8005/api/bibliography)

## Design System

- **Colors**: Custom dark theme with neon green accent (#04E39E)
- **Typography**: Inter font family, 8px spacing grid
- **Components**: See `src/components/ui/` for reusable primitives

## Implementation Plan

Follow the **20-session implementation checklist** in `bibliography_plan/frontend_plan/ImplementationChecklist.md`

## Code Patterns

### API Calls (React Query)

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';

const { data, isLoading } = useQuery({
  queryKey: ['references'],
  queryFn: () => apiClient.get('/references'),
});
```

### State Management (Zustand)

```typescript
import { useUIStore } from '@/store/ui.store';

function Component() {
  const { openModal, closeModal } = useUIStore();
  // ...
}
```

### Forms (react-hook-form + Zod)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  year: z.number().min(1000).max(2100).optional(),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

## Related Documentation

- **Backend**: `../bibliography_backend/README.md`
- **Planning Docs**: `../bibliography_plan/`
- **Editor Reference**: `../editor_frontend/` (copy patterns from here)

## Contributing

This is part of the bibliography manager MVP. See `../bibliography_plan/frontend_plan/Spec.md` for full specifications.
