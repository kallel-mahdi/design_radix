# Implementation Checklist — Sessions 01-05

**Last Updated**: 2025-11-09
**Version**: 2.1 (Unified Frontend + Backend + Infrastructure)
**Total Sessions**: 20+ (includes Sessions 3A-3E for infrastructure)
**Completed Sessions**: 3A, 3B, 3C, 3D, 3E (Zod Migration)

---

## ✅ Completed Sessions (Infrastructure & Bug Fixes)

### Session 3A: P0 Blockers (COMPLETE)
- Fixed auth store tests (token structure)
- Removed duplicate Reference type
- Fixed Date field types (JSON serialization)
- Created Toast components and mounted
- Verified builds passing

### Session 3B: Infrastructure & Utilities (COMPLETE)
- ErrorBoundary component with TypeScript override keywords
- React Query configuration optimization
- Panel width persistence hook
- Essential utility functions (formatDate, truncateText, debounce, formatAuthors)
- Application constants extraction

### Session 3C: Loading States (COMPLETE)
- Skeleton loading components (generic + domain-specific)
- Fixed hardcoded colors to use theme tokens
- All components now use design system properly

### Session 3D: Documentation (COMPLETE)
- CHANGELOG.md created and maintained
- STATUS.md simplified
- All magic numbers eliminated

### Session 3E: Full Zod Migration (COMPLETE) - 10 hours
**Motivation**: Single source of truth for types across frontend and backend

**Accomplished**:
1. **@bibliography/shared Package** Created monorepo shared package with:
   - All Zod schemas (Reference, Collection, Tag, etc.)
   - Input schemas (Create/Update for all entities)
   - 148 comprehensive tests covering all schemas
   - Type inference from Zod for TypeScript

2. **Workspace Setup**: pnpm workspaces configured
   - Root package.json and pnpm-workspace.yaml
   - Fixed TypeScript type annotations for Express routes
   - All 3 packages (frontend, backend, shared) in workspace

3. **Backend Migration**: Joi → Zod complete
   - New Zod validation middleware
   - All 7 route files migrated to Zod schemas
   - Removed Joi dependency completely
   - Backend builds successfully

4. **Frontend Integration**: Runtime validation added
   - React Query hooks validate all API responses with `.parse()`
   - Types re-exported from @bibliography/shared
   - Removed duplicate schemas.ts file
   - Frontend builds successfully

5. **Testing**: 247 total tests passing
   - Shared: 148/148 tests
   - Frontend: 99/99 tests (includes 23 new utility tests)
   - All builds passing

**Benefits Delivered**:
- Runtime validation catches backend bugs early
- Single source of truth for all data models
- Type safety guaranteed at both compile-time and runtime
- Shared schemas reduce duplication and sync issues

### Session 0.5: Infrastructure Recap (No Action Needed)

You already shipped Sessions 3A–3E ahead of this unified checklist (see above). Treat them as a pre-flight “Session 0.5”: don’t re-allocate time for Zod migration, skeleton states, or dev-tools wiring when planning future sessions—simply reference these notes whenever you need the context.

---

## Overview

This checklist provides a **unified session-by-session breakdown** combining frontend and backend development. Each session represents **2-4 hours of focused work** and follows a **feature-driven flow**: API → Service → Component → Integration → Test.

**Development Approach**:
- Work on **both frontend and backend in parallel** (one developer can do both sequentially, or two developers in parallel)
- Each session builds **end-to-end functionality** (from API to UI)
- Test **continuously** (not just at the end)

**Session Structure**:
- **Goal**: What you'll accomplish
- **Frontend Tasks**: React components, Zustand stores, React Query hooks
- **Backend Tasks**: Models, services, controllers, routes
- **Integration**: Wire frontend to backend API
- **Verification**: How to test it works
- **Estimated Time**: 2-4 hours

---

## Week 1: Foundation & Core CRUD

### Session 1: Project Setup & Infrastructure (2-3 hours)

**Goal**: Bootstrap both frontend and backend projects with all dependencies and infrastructure

#### Frontend Tasks (1-1.5 hours)

- [ ] Create Vite project:
  ```bash
  cd /home/mahdi/Desktop/bibliography
  npm create vite@latest bibliography_frontend -- --template react-ts
  cd bibliography_frontend
  ```

- [ ] Install dependencies:
  ```bash
  npm install react@19 react-dom@19
  npm install @tanstack/react-router @tanstack/router-plugin @tanstack/router-devtools
  npm install @tanstack/react-query @tanstack/react-query-devtools
  npm install zustand
  npm install clsx tailwind-merge class-variance-authority
  npm install react-hook-form @hookform/resolvers zod
  npm install @tanstack/react-table @tanstack/react-virtual
  npm install @headlessui/react @heroicons/react
  npm install framer-motion react-resizable-panels react-pdf pdfjs-dist dayjs
  npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
  ```

- [ ] Install dev dependencies:
  ```bash
  npm install -D @types/node @types/react @types/react-dom typescript
  npm install -D @tailwindcss/vite postcss autoprefixer
  npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import eslint-plugin-jsx-a11y
  npm install -D prettier eslint-config-prettier eslint-plugin-prettier
  npm install -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
  npm install -D @playwright/test
  npm install -D storybook @storybook/react @storybook/addon-essentials @storybook/addon-interactions
  npm install -D @vitejs/plugin-react-swc
  npm install -D @total-typescript/ts-reset
  ```

- [ ] Initialize Tailwind v4 with CSS custom properties:
  ```bash
  npx tailwindcss init
  ```

- [ ] Configure `tailwind.config.js` (Tailwind v4 with CSS vars from editor):
  ```javascript
  export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          'sans': ['var(--font-family-sans)', 'system-ui', 'sans-serif'],
          'mono': ['var(--font-family-mono)', 'monospace'],
        },
        colors: {
          app: {
            bg: 'var(--color-app-bg)',
            'bg-secondary': 'var(--color-app-bg-secondary)',
            accent: 'var(--color-app-accent)',
            text: 'var(--color-app-text)',
            'text-muted': 'var(--color-app-text-muted)',
            border: 'var(--color-app-border)',
            'border-accent': 'var(--color-app-border-accent)',
          },
          primary: { 50: '#E6F5F2', 100: '#CCEBE5', 200: '#99D7CB', 300: '#66C3B1', 400: '#33AF97', 500: '#03624C', 600: '#024E3D', 700: '#023B2E', 800: '#01271F', 900: '#01140F' },
          secondary: { 50: '#F0FCF0', 100: '#E0F9E0', 200: '#C2F3C2', 300: '#A3EDA3', 400: '#85E785', 500: '#60DF60', 600: '#4DB24D', 700: '#3A863A', 800: '#265926', 900: '#132D13' },
        },
        boxShadow: {
          'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
        },
        keyframes: {
          fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
          slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        }
      }
    }
  }
  ```

- [ ] Create `src/styles/tailwind.css` with Tailwind v4 @theme block:
  ```css
  @import "tailwindcss";

  @theme {
    --font-family-sans: 'Josefin Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;

    --color-app-bg: #2E302F;
    --color-app-bg-secondary: #3A3C3B;
    --color-app-accent: #00DF82;
    --color-app-text: #FFFFFF;
    --color-app-text-muted: #CCCCCC;
    --color-app-border: #444444;
    --color-app-border-accent: #00DF82;
  }

  @layer base {
    html, body, #root {
      background-color: var(--color-app-bg);
      color: var(--color-app-text);
      min-height: 100vh;
      font-family: var(--font-family-sans);
      cursor: none;
    }

    *, *::before, *::after {
      cursor: none !important;
    }
  }
  ```

- [ ] Create folder structure:
  ```bash
  mkdir -p src/{components/{ui,layout},features/{library,search,projects,duplicates},routes,store,common/{api,types},styles}
  ```

- [ ] Configure ESLint & Prettier (copy from editor_frontend)
- [ ] Create `src/common/types.ts` with initial types (Reference, Collection, Tag)
- [ ] Set up `.env.local`:
  ```env
  VITE_API_BASE_URL=http://localhost:8005/api/bibliography
  ```

- [ ] Update `vite.config.ts` with all required plugins:
  ```typescript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react-swc'
  import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
  import tailwindcss from '@tailwindcss/vite'
  import path from 'path'

  export default defineConfig({
    plugins: [
      tailwindcss(),
      react(),
      TanStackRouterVite(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      strictPort: true,
    },
  })
  ```

- [ ] First commit: `git init && git add . && git commit -m "Initial frontend setup with Tailwind v4"`

#### Backend Tasks (1-1.5 hours)

- [ ] Navigate to backend:
  ```bash
  cd /home/mahdi/Desktop/bibliography/bibliography_backend
  ```

- [ ] Verify scaffolded structure exists (36 files already created)
- [ ] Install dependencies:
  ```bash
  npm install
  ```

- [ ] Create `.env` file:
  ```bash
  cp .env.example .env
  ```

- [ ] Edit `.env`:
  ```env
  PORT=8005
  MONGODB_URL=mongodb://localhost:27017/bibliography
  NODE_ENV=development
  UPLOAD_PATH=./data/uploads
  TRUST_GATEWAY_AUTH=true
  ```

- [ ] Create upload directory:
  ```bash
  mkdir -p data/uploads
  ```

- [ ] Verify MongoDB running:
  ```bash
  # If using Docker:
  docker run -d -p 27017:27017 --name mongodb mongo:7

  # Or check local MongoDB:
  systemctl status mongod
  ```

- [ ] Build and run:
  ```bash
  npm run build
  npm run dev
  ```

- [ ] Test health endpoint:
  ```bash
  curl http://localhost:8005/health
  # Expected: {"status":"ok","service":"bibliography-service","version":"1.0.0"}
  ```

- [ ] Review core infrastructure:
  - Winston logger (`src/utils/logger.ts`)
  - Error handler (`src/middleware/errorHandler.ts`)
  - Trust gateway auth (`src/middleware/trustGateway.ts`)
  - Inversify container (`src/config/container.ts`)

#### Verification

- [ ] Frontend: `npm run dev` starts on http://localhost:5173
- [ ] Frontend: Tailwind classes work (test with simple div)
- [ ] Backend: Health endpoint returns 200 OK
- [ ] Backend: MongoDB connection successful (check logs)
- [ ] Both: TypeScript compiles without errors

**Estimated Time**: 2-3 hours

---

### Session 2: Data Models & AppLayout (2-3 hours)

**Goal**: Create all Mongoose models and the frontend 4-column layout shell

#### Backend Tasks (1-1.5 hours)

**Create Mongoose Models**:

- [ ] `src/models/Reference.ts`:
  ```typescript
  import mongoose, { Schema, Document } from 'mongoose';

  export interface IReference extends Document {
    _id: mongoose.Types.ObjectId;
    userId: string;
    type: 'article' | 'book' | 'chapter' | 'conference' | 'thesis' | 'other';
    title: string; // REQUIRED
    authors: Array<{ given: string; family: string; full: string }>;
    year: number | null;
    venue: string | null;
    doi: string | null;
    isbn: string | null;
    url: string | null;
    abstract: string | null;
    tags: string[];
    collectionIds: mongoose.Types.ObjectId[];
    citationKey: string;
    hasPdf: boolean;
    pdf: {
      storedPath: string;
      originalName: string;
      size: number;
      mimeType: string;
      uploadedAt: Date;
    } | null;
    sourceRaw: {
      provider: 'doi' | 'bibtex' | 'csl-json' | 'ris' | 'manual';
      payload: any;
    };
    deleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }

  const ReferenceSchema = new Schema<IReference>({
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['article', 'book', 'chapter', 'conference', 'thesis', 'other'], required: true },
    title: { type: String, required: true },
    authors: [{
      given: String,
      family: String,
      full: String
    }],
    year: Number,
    venue: String,
    doi: String,
    isbn: String,
    url: String,
    abstract: String,
    tags: [String],
    collectionIds: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
    citationKey: { type: String, required: true, unique: true },
    hasPdf: { type: Boolean, default: false },
    pdf: {
      storedPath: String,
      originalName: String,
      size: Number,
      mimeType: String,
      uploadedAt: Date
    },
    sourceRaw: {
      provider: { type: String, enum: ['doi', 'bibtex', 'csl-json', 'ris', 'manual'], required: true },
      payload: Schema.Types.Mixed
    },
    deleted: { type: Boolean, default: false, index: true },
    deletedAt: Date
  }, { timestamps: true });

  // Indexes
  ReferenceSchema.index({ userId: 1, deleted: 1 });
  ReferenceSchema.index({ userId: 1, collectionIds: 1 });
  ReferenceSchema.index({ userId: 1, tags: 1 });
  ReferenceSchema.index({ doi: 1 });
  ReferenceSchema.index({ isbn: 1 });
  ReferenceSchema.index({ citationKey: 1 }, { unique: true });
  ReferenceSchema.index({ title: 'text', abstract: 'text' });

  export const Reference = mongoose.model<IReference>('Reference', ReferenceSchema);
  ```

- [ ] Create similar models for:
  - `Collection.ts` (name, parentId, position, color, deleted, deletedAt)
  - `Tag.ts` (name, color, position, automatic, usageCount)
  - `ProjectLink.ts` (projectId, referenceId, collectionId with validation)
  - `DuplicateCandidate.ts` (existingReferenceId, duplicateReferenceId, matchReason, confidence, resolved, resolution)

- [ ] Test models with script:
  ```typescript
  // src/scripts/testModels.ts
  import mongoose from 'mongoose';
  import { Reference } from '../models/Reference';
  import { logger } from '../utils/logger';

  async function test() {
    await mongoose.connect(process.env.MONGODB_URL!);

    const ref = await Reference.create({
      userId: 'test-user',
      type: 'article',
      title: 'Test Paper',
      citationKey: 'test2024abc',
      sourceRaw: { provider: 'manual', payload: {} },
      deleted: false
    });

    logger.info('Reference created', { id: ref._id });

    await Reference.deleteMany({ userId: 'test-user' });
    await mongoose.disconnect();
  }

  test().catch(err => logger.error('Test failed', err));
  ```

- [ ] Run test: `npx ts-node src/scripts/testModels.ts`

#### Frontend Tasks (1-1.5 hours)

**Create Layout Components**:

- [ ] `src/components/layout/AppLayout.tsx`:
  ```typescript
  import { Outlet } from '@tanstack/react-router';
  import { ActivityBar } from './ActivityBar';
  import { Sidebar } from './Sidebar';
  import { DetailsPane } from './DetailsPane';

  export function AppLayout() {
    return (
      <div className="flex h-screen bg-bg-dark text-text-primary">
        <ActivityBar />
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
        <DetailsPane />
      </div>
    );
  }
  ```

- [ ] `src/components/layout/ActivityBar.tsx`:
  ```typescript
  import { useLocation, useNavigate } from '@tanstack/react-router';
  import {
    HomeIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    ExclamationTriangleIcon,
    TrashIcon
  } from '@heroicons/react/24/outline';

  export function ActivityBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
      <div className="w-16 bg-bg-surface flex flex-col items-center py-4 gap-4">
        <button
          onClick={() => navigate({ to: '/library' })}
          className={`p-3 rounded ${isActive('/library') ? 'bg-accent text-black' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <HomeIcon className="w-6 h-6" />
        </button>
        {/* More buttons for search, projects, duplicates, trash */}
      </div>
    );
  }
  ```

- [ ] Create `src/components/layout/Sidebar.tsx` (resizable container)
- [ ] Create `src/components/layout/DetailsPane.tsx` (tabs, resizable)

**Create Zustand Stores**:

- [ ] `src/store/ui.store.ts`:
  ```typescript
  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';

  interface UIState {
    activeView: 'library' | 'search' | 'projects' | 'duplicates';
    sidebarWidth: number;
    detailsPaneOpen: boolean;
    detailsPaneWidth: number;
    detailsPaneTab: 'info' | 'pdf' | 'notes';
    theme: 'dark' | 'light' | 'system';

    setActiveView: (view: UIState['activeView']) => void;
    setSidebarWidth: (width: number) => void;
    setDetailsPaneOpen: (open: boolean) => void;
    setDetailsPaneWidth: (width: number) => void;
    setDetailsPaneTab: (tab: UIState['detailsPaneTab']) => void;
  }

  export const useUIStore = create<UIState>()(
    persist(
      (set) => ({
        activeView: 'library',
        sidebarWidth: 280,
        detailsPaneOpen: false,
        detailsPaneWidth: 360,
        detailsPaneTab: 'info',
        theme: 'dark',

        setActiveView: (view) => set({ activeView: view }),
        setSidebarWidth: (width) => set({ sidebarWidth: width }),
        setDetailsPaneOpen: (open) => set({ detailsPaneOpen: open }),
        setDetailsPaneWidth: (width) => set({ detailsPaneWidth: width }),
        setDetailsPaneTab: (tab) => set({ detailsPaneTab: tab })
      }),
      { name: 'ui-storage' }
    )
  );
  ```

**Setup Routing**:

- [ ] Create `src/routes/__root.tsx`:
  ```typescript
  import { createRootRoute, Outlet } from '@tanstack/react-router';
  import { AppLayout } from '@/components/layout/AppLayout';

  export const Route = createRootRoute({
    component: () => (
      <AppLayout>
        <Outlet />
      </AppLayout>
    )
  });
  ```

- [ ] Create placeholder routes:
  - `src/routes/index.tsx` (redirects to /library)
  - `src/routes/library.tsx`
  - `src/routes/search.tsx`
  - `src/routes/projects.tsx`
  - `src/routes/duplicates.tsx`

#### Verification

- [ ] Backend: All models compile without errors
- [ ] Backend: Test script creates reference successfully
- [ ] Backend: MongoDB indexes show in `db.references.getIndexes()`
- [ ] Frontend: Layout renders with 4 columns
- [ ] Frontend: ActivityBar navigation works
- [ ] Frontend: Sidebar is resizable
- [ ] Frontend: TypeScript has no errors

**Estimated Time**: 2-3 hours

---

### Session 3: Reference Service & ReferenceCard (3-4 hours)

**Goal**: Implement backend Reference CRUD and frontend ReferenceCard component

#### Backend Tasks (1.5-2 hours)

**Create ReferenceService**:

- [ ] `src/services/ReferenceService.ts`:
  ```typescript
  import { injectable } from 'inversify';
  import { Reference, IReference } from '../models/Reference';
  import { logger } from '../utils/logger';
  import mongoose from 'mongoose';

  export interface CreateReferenceInput {
    type: IReference['type'];
    title: string;
    authors?: Array<{ given?: string; family?: string }>;
    year?: number;
    venue?: string;
    doi?: string;
    isbn?: string;
    url?: string;
    tags?: string[];
    collectionIds?: string[];
    sourceRaw: IReference['sourceRaw'];
  }

  @injectable()
  export class ReferenceService {
    async create(userId: string, data: CreateReferenceInput): Promise<IReference> {
      // Build full names for authors
      const authors = data.authors?.map(a => ({
        given: a.given || '',
        family: a.family || '',
        full: `${a.family || ''}, ${a.given || ''}`.trim()
      })) || [];

      // Generate citation key
      const citationKey = await this.generateCitationKey(userId, data);

      const reference = await Reference.create({
        ...data,
        userId,
        authors,
        citationKey,
        deleted: false,
        hasPdf: false
      });

      logger.info('Reference created', { userId, referenceId: reference._id.toString() });
      return reference;
    }

    async list(userId: string, filters?: {
      collectionId?: string;
      tags?: string[];
      deleted?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<IReference[]> {
      const query: any = { userId };

      if (filters?.deleted !== undefined) {
        query.deleted = filters.deleted;
      }

      if (filters?.collectionId) {
        query.collectionIds = filters.collectionId;
      }

      if (filters?.tags && filters.tags.length > 0) {
        query.tags = { $all: filters.tags };
      }

      return await Reference.find(query)
        .limit(filters?.limit || 100)
        .skip(filters?.offset || 0)
        .sort({ createdAt: -1 })
        .exec();
    }

    async getById(userId: string, id: string): Promise<IReference | null> {
      return await Reference.findOne({ _id: id, userId });
    }

    async update(userId: string, id: string, updates: Partial<CreateReferenceInput>): Promise<IReference | null> {
      const reference = await Reference.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true }
      );

      if (reference) {
        logger.info('Reference updated', { userId, referenceId: id });
      }

      return reference;
    }

    async softDelete(userId: string, id: string): Promise<IReference | null> {
      return await Reference.findOneAndUpdate(
        { _id: id, userId },
        { $set: { deleted: true, deletedAt: new Date() } },
        { new: true }
      );
    }

    async restore(userId: string, id: string): Promise<IReference | null> {
      return await Reference.findOneAndUpdate(
        { _id: id, userId },
        { $set: { deleted: false, deletedAt: null } },
        { new: true }
      );
    }

    private async generateCitationKey(userId: string, data: CreateReferenceInput): Promise<string> {
      const lastName = data.authors?.[0]?.family || 'unknown';
      const year = data.year || new Date().getFullYear();
      const titleWords = data.title.toLowerCase().split(' ');
      const firstWord = titleWords.find(w => !['a', 'an', 'the'].includes(w)) || titleWords[0];

      // Generate random 3-char suffix
      const suffix = Math.random().toString(36).substring(2, 5);
      const key = `${lastName}${year}${firstWord}${suffix}`.toLowerCase();

      // Check uniqueness, retry if collision
      const existing = await Reference.findOne({ citationKey: key });
      if (existing) {
        return this.generateCitationKey(userId, data);
      }

      return key;
    }
  }
  ```

**Create ReferenceController**:

- [ ] `src/controllers/ReferenceController.ts`:
  ```typescript
  import { Request, Response, NextFunction } from 'express';
  import { injectable, inject } from 'inversify';
  import { ReferenceService } from '../services/ReferenceService';
  import { TYPES } from '../config/types';

  @injectable()
  export class ReferenceController {
    constructor(
      @inject(TYPES.ReferenceService) private referenceService: ReferenceService
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.headers['x-user-id'] as string;
        const reference = await this.referenceService.create(userId, req.body);

        res.status(201).json({
          success: true,
          data: reference,
          message: 'Reference created successfully'
        });
      } catch (error) {
        next(error);
      }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.headers['x-user-id'] as string;
        const filters = {
          collectionId: req.query.collectionId as string,
          tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
          deleted: req.query.deleted === 'true',
          limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
          offset: req.query.offset ? parseInt(req.query.offset as string) : 0
        };

        const references = await this.referenceService.list(userId, filters);

        res.json({
          success: true,
          data: references
        });
      } catch (error) {
        next(error);
      }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.headers['x-user-id'] as string;
        const reference = await this.referenceService.getById(userId, req.params.id);

        if (!reference) {
          return res.status(404).json({
            success: false,
            message: 'Reference not found'
          });
        }

        res.json({
          success: true,
          data: reference
        });
      } catch (error) {
        next(error);
      }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.headers['x-user-id'] as string;
        const reference = await this.referenceService.update(userId, req.params.id, req.body);

        if (!reference) {
          return res.status(404).json({
            success: false,
            message: 'Reference not found'
          });
        }

        res.json({
          success: true,
          data: reference,
          message: 'Reference updated successfully'
        });
      } catch (error) {
        next(error);
      }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.headers['x-user-id'] as string;
        const reference = await this.referenceService.softDelete(userId, req.params.id);

        if (!reference) {
          return res.status(404).json({
            success: false,
            message: 'Reference not found'
          });
        }

        res.json({
          success: true,
          data: reference,
          message: 'Reference moved to trash'
        });
      } catch (error) {
        next(error);
      }
    };
  }
  ```

**Wire Routes**:

- [ ] Update `src/routes/references.ts`:
  ```typescript
  import { Router } from 'express';
  import { container } from '../config/container';
  import { ReferenceController } from '../controllers/ReferenceController';
  import { TYPES } from '../config/types';

  const router = Router();
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);

  export { router as referencesRouter };
  ```

- [ ] Register in Inversify container (`src/config/container.ts`)

#### Frontend Tasks (1.5-2 hours)

**Create UI Primitives**:

- [ ] `src/components/ui/Button.tsx` (with CVA variants)
- [ ] `src/components/ui/Tag.tsx` (pill component)
- [ ] `src/components/ui/EmptyState.tsx`

**Create ReferenceCard**:

- [ ] `src/features/library/components/ReferenceCard.tsx`:
  ```typescript
  import { cva, type VariantProps } from 'class-variance-authority';
  import { Tag } from '@/components/ui/Tag';
  import { Reference } from '@/common/types';

  const cardVariants = cva(
    "p-4 rounded border cursor-pointer transition-all",
    {
      variants: {
        selected: {
          true: "border-l-4 border-l-accent bg-accent/5",
          false: "border-gray-700 hover:bg-bg-hover"
        },
        hasPdf: {
          true: "border-r-2 border-r-green-500",
          false: ""
        }
      },
      defaultVariants: {
        selected: false,
        hasPdf: false
      }
    }
  );

  interface ReferenceCardProps extends VariantProps<typeof cardVariants> {
    reference: Reference;
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
  }

  export function ReferenceCard({ reference, selected, onClick, onEdit, onDelete }: ReferenceCardProps) {
    return (
      <div className={cardVariants({ selected, hasPdf: reference.hasPdf })} onClick={onClick}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-text-primary">{reference.title}</h3>
            <p className="text-sm text-text-secondary mt-1">
              {reference.authors.map(a => a.full).join(', ')}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-text-muted">{reference.year}</span>
              {reference.venue && (
                <span className="text-sm text-text-muted">• {reference.venue}</span>
              )}
            </div>
            {reference.tags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {reference.tags.slice(0, 3).map(tag => (
                  <Tag key={tag} label={tag} size="sm" />
                ))}
                {reference.tags.length > 3 && (
                  <span className="text-xs text-text-muted">+{reference.tags.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  ```

**Create Library Store**:

- [ ] `src/features/library/store/library.store.ts`:
  ```typescript
  import { create } from 'zustand';

  interface LibraryState {
    selectedReferenceIds: Set<string>;
    activeReferenceId: string | null;

    selectReference: (id: string) => void;
    deselectReference: (id: string) => void;
    toggleSelection: (id: string) => void;
    selectAll: (ids: string[]) => void;
    clearSelection: () => void;
    setActiveReference: (id: string | null) => void;
  }

  export const useLibraryStore = create<LibraryState>((set) => ({
    selectedReferenceIds: new Set(),
    activeReferenceId: null,

    selectReference: (id) => set((state) => {
      const newSet = new Set(state.selectedReferenceIds);
      newSet.add(id);
      return { selectedReferenceIds: newSet };
    }),

    deselectReference: (id) => set((state) => {
      const newSet = new Set(state.selectedReferenceIds);
      newSet.delete(id);
      return { selectedReferenceIds: newSet };
    }),

    toggleSelection: (id) => set((state) => {
      const newSet = new Set(state.selectedReferenceIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedReferenceIds: newSet };
    }),

    selectAll: (ids) => set({ selectedReferenceIds: new Set(ids) }),
    clearSelection: () => set({ selectedReferenceIds: new Set() }),
    setActiveReference: (id) => set({ activeReferenceId: id })
  }));
  ```

#### Integration

**Create API Client**:

- [ ] `src/common/api/client.ts`:
  ```typescript
  import { useAuthStore } from '@/store/auth.store';

  // Fetch-based API client (NOT axios) - matches editor pattern
  export class ApiClient {
    private baseURL: string;
    private timeout: number = 30000;

    constructor() {
      this.baseURL =
        import.meta.env.VITE_API_BASE_URL ||
        'http://localhost:8005/api/bibliography';
    }

    private async request<T>(
      url: string,
      options: RequestInit = {}
    ): Promise<T> {
      const authStore = useAuthStore.getState();
      const accessToken = authStore.tokens.accessToken;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(`${this.baseURL}${url}`, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 401) {
            // Handle token refresh if needed
            authStore.logout();
          }
          throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json() as Promise<T>;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('API Error:', error);
        throw error;
      }
    }

    async get<T>(url: string): Promise<T> {
      return this.request<T>(url, { method: 'GET' });
    }

    async post<T>(url: string, data?: unknown): Promise<T> {
      return this.request<T>(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    }

    async put<T>(url: string, data?: unknown): Promise<T> {
      return this.request<T>(url, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    }

    async delete<T>(url: string): Promise<T> {
      return this.request<T>(url, { method: 'DELETE' });
    }
  }

  export const apiClient = new ApiClient();
  ```

**Create React Query Hooks**:

- [ ] `src/features/library/api/references.queries.ts`:
  ```typescript
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { apiClient } from '@/common/api/client';
  import { Reference } from '@/common/types';

  export const referenceKeys = {
    all: ['references'] as const,
    lists: () => [...referenceKeys.all, 'list'] as const,
    list: (filters: any) => [...referenceKeys.lists(), filters] as const,
    details: () => [...referenceKeys.all, 'detail'] as const,
    detail: (id: string) => [...referenceKeys.details(), id] as const
  };

  export function useReferencesQuery(params?: {
    collectionId?: string;
    tags?: string[];
    deleted?: boolean;
    limit?: number;
    offset?: number;
  }) {
    return useQuery({
      queryKey: referenceKeys.list(params || {}),
      queryFn: async () => {
        const response = await apiClient.get<{ data: Reference[] }>('/references', { params });
        return response.data;
      }
    });
  }

  export function useCreateReferenceMutation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiClient.post<{ data: Reference }>('/references', data);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
      }
    });
  }
  ```

**Wire to Component**:

- [ ] Create `src/features/library/components/LibraryPage.tsx` that uses ReferenceCard with query

#### Verification

- [ ] Backend: Create reference via Postman/curl
  ```bash
  curl -X POST http://localhost:8005/api/bibliography/references \
    -H "Content-Type: application/json" \
    -H "x-user-id: test-user" \
    -d '{"type":"article","title":"Test Paper","sourceRaw":{"provider":"manual","payload":{}}}'
  ```
- [ ] Backend: List references returns created reference
- [ ] Backend: Citation key is unique and auto-generated
- [ ] Frontend: ReferenceCard renders with all fields
- [ ] Frontend: Selection state updates on click
- [ ] Frontend: useReferencesQuery fetches from API
- [ ] Integration: Create reference in backend, see it in frontend

**Estimated Time**: 3-4 hours

---

### Session 4: Collection Service & TreeView (3-4 hours)

**Goal**: Implement nested collections (backend) and TreeView component (frontend)

#### Backend Tasks (1-1.5 hours)

**Create CollectionService**:

- [ ] `src/services/CollectionService.ts`:
  - CRUD operations (create, list, update, move, delete)
  - Tree building (sort by position, parentId)
  - Position management (auto-increment within parent)
  - Cascade delete (delete children when parent deleted)

**Create CollectionController**:

- [ ] `src/controllers/CollectionController.ts`:
  - Handle HTTP requests
  - Call service methods
  - Return JSON responses

**Wire Routes**:

- [ ] Update `src/routes/collections.ts`

#### Frontend Tasks (1.5-2 hours)

**Create TreeView Components**:

- [ ] `src/features/library/components/TreeNode.tsx`:
  ```typescript
  import { useState } from 'react';
  import { ChevronRightIcon, FolderIcon } from '@heroicons/react/24/outline';
  import { Collection } from '@/common/types';

  interface TreeNodeProps {
    collection: Collection;
    children?: Collection[];
    level: number;
    isActive: boolean;
    onSelect: (id: string) => void;
  }

  export function TreeNode({ collection, children, level, isActive, onSelect }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-bg-hover ${
            isActive ? 'bg-accent/10 border-l-2 border-l-accent' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelect(collection.id)}
        >
          {children && children.length > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
              <ChevronRightIcon
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          )}
          <FolderIcon className="w-4 h-4 text-text-secondary" />
          <span className="flex-1 truncate text-sm">{collection.name}</span>
          <span className="text-xs text-text-muted">{collection.itemCount || 0}</span>
        </div>

        {isExpanded && children && children.length > 0 && (
          <div>
            {children.map(child => (
              <TreeNode
                key={child.id}
                collection={child}
                children={/* child's children */}
                level={level + 1}
                isActive={false}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] `src/features/library/components/TreeView.tsx`:
  - Build tree from flat collection array
  - Recursive rendering with TreeNode
  - Persist expand/collapse state to localStorage

**Create Collection Queries**:

- [ ] `src/features/library/api/collections.queries.ts`:
  ```typescript
  export function useCollectionsQuery() {
    return useQuery({
      queryKey: ['collections'],
      queryFn: async () => {
        const response = await apiClient.get<{ data: Collection[] }>('/collections');
        return response.data;
      }
    });
  }
  ```

#### Integration

- [ ] Wire TreeView to library store (activeCollectionId)
- [ ] Filter references by selected collection
- [ ] Test nested collections (3-4 levels deep)

#### Verification

- [ ] Backend: Create nested collections (parent/child)
- [ ] Backend: List returns tree structure
- [ ] Backend: Position ordering works
- [ ] Frontend: TreeView renders nested structure
- [ ] Frontend: Expand/collapse works
- [ ] Frontend: Active collection highlighted
- [ ] Frontend: Clicking collection filters references

**Estimated Time**: 3-4 hours

---

### Session 5: Tag Service & TagSelector (3-4 hours)

**Goal**: Tag CRUD with color assignment and tag selector UI

#### Backend Tasks (1.5-2 hours)

**Create TagService**:

- [ ] `src/services/TagService.ts`:
  - CRUD operations
  - Max 9 colored tags enforcement
  - Rename cascade (update all references)
  - Usage count calculation

**Create TagController** and wire routes

**Test Max 9 Enforcement**:
```bash
# Create 10 tags with colors - 10th should fail
for i in {1..10}; do
  curl -X PATCH http://localhost:8005/api/bibliography/tags/tag$i/color \
    -H "x-user-id: test-user" \
    -d '{"color":"#FF0000","position":'$i'}'
done
```

#### Frontend Tasks (1.5-2 hours)

**Create TagSelector**:

- [ ] `src/features/library/components/TagSelector.tsx`:
  - Search box for filtering tags
  - Tag list with counts and colors
  - Click tag to filter references
  - Settings menu (Headless UI Menu)
  - Color picker integration

**Create TagColorPicker Modal**:

- [ ] Show 9 color swatches
- [ ] Position labels (1-9)
- [ ] "Remove Color" button
- [ ] Disable if max 9 reached

#### Integration

- [ ] Wire tag filtering to library store
- [ ] Refetch references when tag filter changes
- [ ] Test color assignment and max 9 limit

#### Verification

- [ ] Backend: Max 9 colored tags enforced
- [ ] Frontend: TagSelector renders with colors
- [ ] Frontend: Click tag filters references
- [ ] Frontend: Color picker opens and assigns color
- [ ] Integration: Color persists to backend

**Estimated Time**: 3-4 hours

---

## Week 2: Import/Export, Search, Projects
