# Bibliography Manager — Unified Implementation Checklist

**Last Updated**: 2025-01-08
**Version**: 2.0 (Unified Frontend + Backend)
**Total Sessions**: 20 (4 weeks, ~10-15 hours/week)

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
  npm install @tanstack/react-router @tanstack/react-router-vite-plugin @tanstack/router-devtools
  npm install @tanstack/react-query @tanstack/react-query-devtools
  npm install zustand
  npm install clsx tailwind-merge class-variance-authority
  npm install react-hook-form @hookform/resolvers zod
  npm install @tanstack/react-table @tanstack/react-virtual
  npm install @headlessui/react @heroicons/react
  npm install axios dayjs
  npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
  ```

- [ ] Install dev dependencies:
  ```bash
  npm install -D @types/node typescript
  npm install -D tailwindcss@next postcss autoprefixer
  npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  npm install -D prettier eslint-config-prettier eslint-plugin-prettier
  npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
  npm install -D @playwright/test
  ```

- [ ] Initialize Tailwind:
  ```bash
  npx tailwindcss init -p
  ```

- [ ] Configure `tailwind.config.js` (copy colors from DesignSystem.md):
  ```javascript
  export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          accent: { DEFAULT: '#04E39E', hover: '#2AF4B4' },
          bg: { dark: '#0F1115', surface: '#171A21', hover: '#1F2330' },
          text: { primary: '#E6E8EC', secondary: '#9CA3AF', muted: '#6B7280' }
        }
      }
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

- [ ] Update `vite.config.ts` with TanStack Router plugin
- [ ] First commit: `git init && git add . && git commit -m "Initial frontend setup"`

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
  import axios from 'axios';

  export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/bibliography',
    timeout: 30000
  });

  // Request interceptor (add auth token when implemented)
  apiClient.interceptors.request.use((config) => {
    // TODO: Add auth token
    return config;
  });

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );
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

### Session 6: DOI Import & Crossref Integration (2-3 hours)

**Goal**: Import references from DOI using Crossref API

#### Backend Tasks (1-1.5 hours)

**Create CrossrefService**:

- [ ] `src/services/CrossrefService.ts`:
  - Fetch metadata from `https://api.crossref.org/works/{doi}`
  - Map Crossref JSON to Reference schema
  - Handle errors (404, rate limits)

**Add Import Route**:

- [ ] `POST /references/import-doi` in ReferenceController

#### Frontend Tasks (1-1.5 hours)

**Create ImportModal**:

- [ ] `src/features/library/components/ImportModal.tsx`:
  - Tabs: DOI | File Upload
  - DOI tab: Input + Fetch button → Preview → Add button
  - Show loading state during fetch
  - Error handling (invalid DOI, not found)

**Create Import Mutation**:

- [ ] `src/features/library/api/import.queries.ts`

#### Verification

- [ ] Import DOI `10.1145/3411764.3445518` successfully
- [ ] Preview shows correct metadata
- [ ] Add to library creates reference
- [ ] Reference appears in table

**Estimated Time**: 2-3 hours

---

### Session 7: BibTeX Import & Export (3-4 hours)

**Goal**: Import BibTeX files and export to .bib format

#### Backend Tasks (1.5-2 hours)

**Create BibTeXParser**:

- [ ] Simple regex-based parser (or use library like `bibtex-parse-js`)
- [ ] Map BibTeX fields to Reference schema
- [ ] Handle errors (malformed entries)

**Create BibTeXExporter**:

- [ ] Template-based formatting
- [ ] LaTeX escaping for special characters

**Add Routes**:

- [ ] `POST /references/import-bibtex`
- [ ] `POST /export/bibtex`

#### Frontend Tasks (1.5-2 hours)

**Extend ImportModal**:

- [ ] File Upload tab with drag-drop zone
- [ ] Paste textarea for BibTeX text
- [ ] Preview table with select all/none
- [ ] Progress indicator for large imports

**Create Export Functionality**:

- [ ] Export dropdown in toolbar
- [ ] Generate Blob and trigger download
- [ ] Right-click menu integration (Phase 1)

#### Verification

- [ ] Import sample .bib file with 10+ entries
- [ ] Preview shows all entries
- [ ] Import creates all references
- [ ] Export generates valid BibTeX file
- [ ] Exported file can be re-imported

**Estimated Time**: 3-4 hours

---

### Session 8: Search Service & SearchPage (3-4 hours)

**Goal**: Full-text search with MongoDB aggregation pipeline

#### Backend Tasks (1.5-2 hours)

**Create SearchService**:

- [ ] MongoDB aggregation pipeline
- [ ] $text operator for title/abstract search
- [ ] $match for filters (authors, year range, venues, tags)
- [ ] Facet counts (authors, venues, years)
- [ ] Pagination

**Add Search Route**:

- [ ] `GET /search?q=...&authors=...&yearMin=...&yearMax=...`

#### Frontend Tasks (1.5-2 hours)

**Create SearchPage**:

- [ ] Layout: FilterPanel | SearchResults
- [ ] SearchBar with debounced input (300ms)
- [ ] Result count display
- [ ] Empty state

**Create FilterPanel**:

- [ ] AuthorFilter (checkbox list)
- [ ] YearRangeFilter (dual-thumb slider or inputs)
- [ ] VenueFilter (checkbox list)
- [ ] TagFilter (checkbox list)
- [ ] Clear All Filters button

**Create Search Store**:

- [ ] Query, debouncedQuery, filters state
- [ ] Debounce hook

#### Verification

- [ ] Search by keyword updates results
- [ ] Filters narrow results
- [ ] Clear filters resets
- [ ] Pagination works

**Estimated Time**: 3-4 hours

---

### Session 9: Project Links & LinkedProjectsPage (2-3 hours)

**Goal**: Link collections to projects (prep for editor integration)

#### Backend Tasks (1-1.5 hours)

**Create ProjectLinkService**:

- [ ] Link/unlink collection to project
- [ ] Get all references from linked collections
- [ ] Many-to-many queries

**Add Routes**:

- [ ] `POST /projects/:id/link-collection`
- [ ] `DELETE /projects/:id/unlink-collection/:collectionId`
- [ ] `GET /projects/:id/references`

#### Frontend Tasks (1-1.5 hours)

**Create ProjectsPage**:

- [ ] ProjectList (left sidebar)
- [ ] LinkedCollections (collection toggles)
- [ ] ProjectReferences (read-only reference preview)

**Create Projects Store and Queries**

#### Verification

- [ ] Link collection to project
- [ ] Toggle ON/OFF updates backend
- [ ] ProjectReferences shows correct references

**Estimated Time**: 2-3 hours

---

### Session 10: Duplicate Detection Implementation (4-5 hours)

**Goal**: Implement 3-stage duplicate detection algorithm

#### Backend Tasks (2.5-3 hours)

**Create DuplicateService**:

- [ ] Stage 1: ISBN match (exact, normalized)
- [ ] Stage 2: DOI match (case-insensitive)
- [ ] Stage 3: Title + Creator match:
  - Normalize title (remove diacritics, punctuation, lowercase)
  - Match if exact title + ≥1 creator (lastName + firstInitial)
  - Verify years within ±1
  - Verify no conflicting DOIs
- [ ] Use `fastest-levenshtein` for fuzzy title matching
- [ ] Use `modern-diacritics` for normalization
- [ ] Create DuplicateCandidate records
- [ ] Confidence scoring (1.0 for ISBN/DOI, 0.85-1.0 for title+creator)

**Wire to ReferenceService**:

- [ ] Inject DuplicateService
- [ ] Trigger async detection on create
- [ ] Don't block reference creation

**Add Routes**:

- [ ] `GET /duplicates` (list pending)
- [ ] `POST /duplicates/resolve` (keep-existing, merge, keep-both)
- [ ] `POST /duplicates/refresh` (manual trigger)

#### Frontend Tasks (1.5-2 hours)

**Create DuplicatesPage**:

- [ ] Sidebar: Duplicate groups count, rules, history
- [ ] Main: DuplicatesList

**Create DuplicateCard**:

- [ ] Two-column comparison (Existing | New)
- [ ] Warning header
- [ ] Diff highlighting (blue text for differences)
- [ ] Actions: Keep Existing | Merge Fields | Keep Both

**Create Duplicates Queries**

#### Verification

- [ ] Import duplicate reference (same DOI)
- [ ] Duplicate candidate created automatically
- [ ] DuplicatesPage shows pair
- [ ] "Keep Existing" resolves duplicate
- [ ] Duplicate removed from list

**Estimated Time**: 4-5 hours

---

## Week 3: Polish, Trash, Testing

### Session 11: PDF Upload & Viewer (3-4 hours)

**Goal**: Single PDF upload per reference with iframe viewer

#### Backend Tasks (1.5-2 hours)

**Configure Multer**:

- [ ] `src/utils/fileUpload.ts`:
  - Single file upload
  - .pdf MIME type filter
  - Max 10MB size limit
  - Store at `UPLOAD_PATH/{uuid}.pdf`

**Add PDF Routes**:

- [ ] `POST /references/:id/pdf` (multipart upload)
- [ ] `GET /references/:id/pdf` (download)
- [ ] `DELETE /references/:id/pdf` (remove)

**Update ReferenceService**:

- [ ] Save PDF metadata (storedPath, originalName, size, mimeType)
- [ ] Set `hasPdf: true`

#### Frontend Tasks (1.5-2 hours)

**Extend ReferenceModal**:

- [ ] File input for PDF upload
- [ ] Show filename when selected
- [ ] Upload on save

**Create PdfTab**:

- [ ] If PDF attached: iframe with `src={pdfUrl}`
- [ ] Download button
- [ ] "Open in new tab" button
- [ ] If no PDF: EmptyState with "Upload PDF" button

**Create PDF Upload Mutation**

#### Verification

- [ ] Upload PDF via ReferenceModal
- [ ] `hasPdf: true` in reference
- [ ] PdfTab shows PDF in iframe
- [ ] Download button works
- [ ] Can remove PDF

**Estimated Time**: 3-4 hours

---

### Session 12: Trash & Restore (2-3 hours)

**Goal**: Soft delete with trash view and restore

#### Backend Tasks (30 minutes)

- [ ] Soft delete already implemented (Session 3)
- [ ] Add `PATCH /references/:id/restore` route
- [ ] Add `DELETE /references/:id?force=true` (permanent delete)

#### Frontend Tasks (1.5-2 hours)

**Create TrashView**:

- [ ] Special view when Trash selected in ActivityBar
- [ ] Reuses ReferenceTable with "Restore" action column
- [ ] "Empty Trash" button (permanent delete all)

**Add Confirmation Dialogs**:

- [ ] Move to trash: "Move X item(s) to trash?"
- [ ] Permanent delete: "Permanently delete X item(s)? This cannot be undone."

**Update ActivityBar**:

- [ ] Trash icon shows full/empty state

#### Verification

- [ ] Delete reference → appears in trash
- [ ] Restore from trash → appears in library
- [ ] Empty trash → permanent delete all

**Estimated Time**: 2-3 hours

---

### Session 13: MergeModal & Resolution (2-3 hours)

**Goal**: Field-by-field merge UI for duplicates

#### Frontend Tasks (2-3 hours)

**Create MergeModal**:

- [ ] `src/features/duplicates/components/MergeModal.tsx`:
  - Two-column field comparison
  - Radio buttons to select which value for each field
  - Preview of merged result (bottom)
  - "Merge & Save" button

**Implement Merge Logic**:

- [ ] Generate merged reference object from selections
- [ ] Call resolve mutation with `action: 'merge'` and merged data
- [ ] Delete duplicate reference
- [ ] Update existing reference with merged data

#### Verification

- [ ] Open merge modal from DuplicateCard
- [ ] Select values for each field
- [ ] Preview updates dynamically
- [ ] "Merge & Save" creates correct merged reference
- [ ] Duplicate removed from list

**Estimated Time**: 2-3 hours

---

### Session 14: CSL JSON & RIS Import (2-3 hours)

**Goal**: Additional import formats for Zotero compatibility

#### Backend Tasks (1.5-2 hours)

**Create Parsers**:

- [ ] CSL JSON parser (JSON.parse + validation)
- [ ] RIS parser (line-by-line: `TY  -`, `AU  -`, `TI  -`, etc.)

**Add Routes**:

- [ ] `POST /references/import-csl-json`
- [ ] `POST /references/import-ris`

#### Frontend Tasks (30 minutes)

**Extend ImportModal**:

- [ ] Auto-detect format by extension (.json, .ris)
- [ ] Add format selector dropdown if ambiguous

#### Verification

- [ ] Import Zotero CSL JSON export
- [ ] Import RIS from PubMed/Web of Science
- [ ] All fields map correctly

**Estimated Time**: 2-3 hours

---

### Session 15: ReferenceModal with Full Form (3-4 hours)

**Goal**: Complete create/edit reference modal with all fields

#### Frontend Tasks (3-4 hours)

**Extend ReferenceModal**:

- [ ] `src/features/library/components/ReferenceModal.tsx`:
  - Full form with react-hook-form + Zod validation
  - Fields:
    - Type dropdown (article, book, chapter, conference, thesis, other)
    - Title (required)
    - Authors (dynamic array with add/remove buttons)
    - Year (number input, 1000-2100)
    - Venue (text input with autocomplete from existing venues)
    - DOI (with format validation)
    - URL (with URL validation)
    - Tags (multi-select autocomplete)
    - PDF upload
  - Create vs Edit mode
  - Footer: Cancel (ghost) | Save (green primary)
  - Loading state when submitting

**Create Zod Schema**:

- [ ] `src/features/library/types/schemas.ts`:
  ```typescript
  const ReferenceSchema = z.object({
    type: z.enum(['article', 'book', 'chapter', 'conference', 'thesis', 'other']),
    title: z.string().min(1, "Title is required"),
    authors: z.array(z.object({
      given: z.string().optional(),
      family: z.string().optional()
    })).optional(),
    year: z.number().int().min(1000).max(2100).optional(),
    venue: z.string().optional(),
    doi: z.string().regex(/^10\.\d{4,}\/\S+$/).optional(),
    url: z.string().url().optional(),
    tags: z.array(z.string()).optional()
  })
  ```

**Wire Mutations**:

- [ ] useCreateReferenceMutation
- [ ] useUpdateReferenceMutation

#### Verification

- [ ] Can create reference with title only (minimal)
- [ ] Can create reference with all fields
- [ ] Validation errors show correctly
- [ ] Authors can be added/removed
- [ ] PDF upload works
- [ ] Edit mode pre-fills all fields

**Estimated Time**: 3-4 hours

---

### Session 16: DetailsPane Implementation (2-3 hours)

**Goal**: Right panel with tabs (Info, PDF, Notes)

#### Frontend Tasks (2-3 hours)

**Create InfoTab**:

- [ ] Display all reference metadata (read-only MVP)
- [ ] Edit button opens ReferenceModal
- [ ] Tags section (pills with remove button)
- [ ] Collections section
- [ ] Metadata footer (dates, source)

**Create PdfTab** (already partially done in Session 11):

- [ ] Polish implementation
- [ ] Add zoom/page controls (Phase 1)

**Create NotesTab**:

- [ ] EmptyState: "Notes coming in Phase 2"

**Wire DetailsPane**:

- [ ] Opens when activeReferenceId set (library store)
- [ ] Auto-open on reference click in table
- [ ] Resizable width (drag left edge, persist to localStorage)
- [ ] ESC key closes

#### Verification

- [ ] Click reference → DetailsPane opens
- [ ] Info tab shows all metadata
- [ ] PDF tab shows iframe
- [ ] Tabs switch correctly
- [ ] Can resize width (persists)
- [ ] ESC closes pane

**Estimated Time**: 2-3 hours

---

### Session 17: ReferenceTable with TanStack Table (3-4 hours)

**Goal**: Full-featured reference table with sorting and multi-select

#### Frontend Tasks (3-4 hours)

**Create ReferenceTable**:

- [ ] `src/features/library/components/ReferenceTable.tsx`:
  - TanStack React Table setup
  - Columns: Checkbox | Title | Authors | Year | Venue | Tags | Files | DOI
  - Sortable headers (click to toggle asc/desc)
  - Multi-select:
    - Checkbox column (header: select all)
    - Normal click: Select single, open details
    - Cmd/Ctrl+Click: Toggle individual
    - Shift+Click: Range selection
  - CVA row variants (default, selected, hasPdf)
  - Keyboard navigation (Arrow keys)
  - Double-click opens edit modal

**Define Columns**:

```typescript
const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    )
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue()}</span>
    )
  },
  // ... more columns
];
```

**Wire to Library Store**:

- [ ] Selection state from useLibraryStore
- [ ] Active reference from activeReferenceId

**Add Keyboard Navigation**:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      // Select next reference
    } else if (e.key === 'ArrowUp') {
      // Select previous reference
    } else if (e.key === 'Enter') {
      // Open details pane
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedReferenceIds]);
```

#### Verification

- [ ] Table renders with all columns
- [ ] Sorting works (click headers)
- [ ] Multi-select works (all 3 modes)
- [ ] Details pane opens on click
- [ ] Keyboard navigation works
- [ ] Double-click opens edit modal

**Estimated Time**: 3-4 hours

---

### Session 18: Keyboard Shortcuts (Essential Set) (1-2 hours)

**Goal**: Implement essential keyboard shortcuts for MVP

#### Frontend Tasks (1-2 hours)

**Create Keyboard Handler**:

- [ ] `src/common/hooks/useKeyboardShortcuts.ts`:
  ```typescript
  export function useKeyboardShortcuts() {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const isMac = navigator.platform.includes('Mac');
        const modKey = isMac ? e.metaKey : e.ctrlKey;

        if (modKey && e.key === 'n') {
          e.preventDefault();
          // Open create reference modal
        } else if (modKey && e.key === 'f') {
          e.preventDefault();
          // Focus search box
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          // Move to trash
        } else if (e.key === 'Escape') {
          // Close modal/pane
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
  }
  ```

**Essential Shortcuts** (MVP):
- Cmd/Ctrl+N: New Reference
- Cmd/Ctrl+F: Focus Search
- Delete: Move to Trash
- Cmd/Ctrl+Delete: Force delete (no confirmation)
- Cmd/Ctrl+A: Select All
- Arrows: Navigate selection
- Enter: Open details
- ESC: Close modal/pane

**Wire to AppLayout**

#### Verification

- [ ] All shortcuts work
- [ ] Cmd vs Ctrl detected correctly (Mac vs Windows)
- [ ] Shortcuts don't conflict with browser defaults
- [ ] Focus management works (search box, modals)

**Estimated Time**: 1-2 hours

---

## Week 4: Testing & Polish

### Session 19: Unit & Integration Tests (4-5 hours)

**Goal**: Comprehensive test coverage for critical paths

#### Backend Tests (2-2.5 hours)

**Unit Tests** (Vitest):

- [ ] `tests/unit/services/ReferenceService.test.ts`:
  - Citation key generation (with fixtures)
  - Create reference (all fields, minimal fields)
  - List with filters (collection, tags, deleted)
  - Update reference
  - Soft delete and restore

- [ ] `tests/unit/services/DuplicateService.test.ts`:
  - ISBN match (normalized)
  - DOI match (case-insensitive)
  - Title + Creator match (fixtures with diacritics)
  - Confidence scoring

- [ ] `tests/unit/utils/normalizeTitle.test.ts`:
  - Remove diacritics
  - Remove punctuation
  - Lowercase and trim

**Integration Tests** (Supertest):

- [ ] `tests/integration/references.test.ts`:
  - POST /references (201 created)
  - POST /references (400 validation error)
  - GET /references (200 with data)
  - GET /references?collectionId=... (filtered)
  - PATCH /references/:id (200 updated)
  - DELETE /references/:id (200 soft deleted)

- [ ] `tests/integration/duplicates.test.ts`:
  - Create reference → duplicate candidate created
  - GET /duplicates (pending list)
  - POST /duplicates/resolve (keep-existing)

#### Frontend Tests (2-2.5 hours)

**Unit Tests** (Vitest):

- [ ] `tests/unit/utils/validateDOI.test.ts`
- [ ] `tests/unit/hooks/useDebounce.test.ts`
- [ ] `tests/unit/stores/library.store.test.ts`:
  - selectReference, deselectReference, toggleSelection
  - selectAll, clearSelection

**Integration Tests** (React Testing Library):

- [ ] `tests/integration/ReferenceModal.test.tsx`:
  - Render modal
  - Fill form (title required, others optional)
  - Submit
  - Verify mutation called
  - Verify modal closed

- [ ] `tests/integration/ReferenceTable.test.tsx`:
  - Render table with data
  - Click row → selection updated
  - Cmd+Click → toggle selection
  - Shift+Click → range selection

- [ ] `tests/integration/ImportModal.test.tsx`:
  - Upload BibTeX file (mock file input)
  - Preview table shows parsed entries
  - Click "Import Selected"
  - Verify mutation called

**Run Coverage**:

```bash
# Backend
npm run test:coverage
# Target: >80% for services, controllers

# Frontend
npm run test -- --coverage
# Target: >80% for utils, hooks, stores
```

#### Verification

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Coverage reports show >80% for critical paths
- [ ] No test failures in CI (if set up)

**Estimated Time**: 4-5 hours

---

### Session 20: E2E Tests & Final Polish (3-4 hours)

**Goal**: End-to-end tests, bug fixes, MVP complete

#### E2E Tests (Playwright) (2-2.5 hours)

**Critical User Journeys**:

- [ ] `tests/e2e/import-and-export.spec.ts`:
  ```typescript
  test('import DOI and export BibTeX', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Import DOI
    await page.click('button:has-text("Import")');
    await page.fill('input[placeholder*="DOI"]', '10.1145/3411764.3445518');
    await page.click('button:has-text("Fetch")');
    await page.click('button:has-text("Add to Library")');

    // Verify in table
    await expect(page.locator('table')).toContainText('CHI');

    // View details
    await page.click('table tr:first-child');
    await expect(page.locator('[data-testid="details-pane"]')).toBeVisible();

    // Add to collection
    // ... (TODO)

    // Export BibTeX
    await page.click('button:has-text("Export")');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Export All')
    ]);
    expect(download.suggestedFilename()).toContain('.bib');
  });
  ```

- [ ] `tests/e2e/duplicate-detection.spec.ts`:
  - Import reference
  - Import same reference (different source)
  - Navigate to Duplicates page
  - Verify duplicate card shown
  - Resolve as "Keep Existing"
  - Verify removed from list

- [ ] `tests/e2e/trash-and-restore.spec.ts`:
  - Delete reference
  - Navigate to Trash
  - Verify reference shown
  - Restore reference
  - Verify back in library

**Run E2E Tests**:

```bash
npx playwright test
npx playwright test --ui  # With UI
```

#### Final Polish (1-1.5 hours)

**UI Polish**:

- [ ] Review all empty states (text, icons, CTAs)
- [ ] Review all loading states (spinners, skeletons)
- [ ] Review all error states (toasts, inline errors)
- [ ] Consistent spacing (8px grid)
- [ ] Consistent colors (from DesignSystem.md)

**Bug Fixes**:

- [ ] Fix any bugs discovered during testing
- [ ] Test cross-browser (Chrome, Firefox, Safari)
- [ ] Test responsive (tablet, desktop)

**Accessibility Audit**:

- [ ] Run Lighthouse (target: 90+ accessibility score)
- [ ] Run axe DevTools (0 violations)
- [ ] Keyboard navigation test (Tab through all elements)
- [ ] Screen reader test (VoiceOver or NVDA)

**Performance**:

- [ ] Lighthouse performance score (target: 90+)
- [ ] Bundle size analysis (vite-bundle-visualizer)
- [ ] React Query cache optimization

**Documentation**:

- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Add sample .env files
- [ ] Document API endpoints (Postman collection or OpenAPI)

#### Verification

- [ ] All E2E tests pass
- [ ] All unit and integration tests pass
- [ ] Lighthouse scores >90 (all categories)
- [ ] No accessibility violations
- [ ] No console errors or warnings
- [ ] README accurate and complete

**Final Checklist** (MVP Complete):

- [ ] Can import references (DOI, BibTeX, CSL JSON, RIS)
- [ ] Can manually create/edit references
- [ ] Can organize in nested collections
- [ ] Can tag references with colored tags (9 max)
- [ ] Automatic duplicate detection on import
- [ ] Can search and filter references
- [ ] Can export to BibTeX
- [ ] Can upload and view PDFs (iframe)
- [ ] Can link collections to projects
- [ ] Soft delete (trash/restore)
- [ ] Responsive UI
- [ ] Accessible (keyboard, screen readers)
- [ ] Tested (>80% coverage)
- [ ] Deployed (or ready to deploy)

**Estimated Time**: 3-4 hours

---

## Summary: Total Time Estimate

| Week | Sessions | Focus | Backend | Frontend | Total |
|------|----------|-------|---------|----------|-------|
| 1 | 1-5 | Setup & CRUD | 8-12h | 10-14h | 18-26h |
| 2 | 6-10 | Import/Search/Duplicates | 10-14h | 8-12h | 18-26h |
| 3 | 11-15 | PDF/Trash/Forms | 6-10h | 10-14h | 16-24h |
| 4 | 16-20 | Table/Testing/Polish | 4-6h | 12-16h | 16-22h |
| **Total** | **20** | **MVP Complete** | **28-42h** | **40-56h** | **68-98h** |

**Realistic Timeline**: 4-6 weeks part-time (10-15 hours/week)

---

## Next Steps After MVP

**Phase 1** (Enhanced UX & Security):
- Comprehensive keyboard shortcuts
- Context menus (right-click)
- Drag-drop functionality
- Bulk operations
- Manual reference ordering
- Light theme
- Security hardening (helmet, rate limiting, Zod migration prep)

**Phase 2** (Advanced Features & Collaboration):
- Collaboration/sharing UI
- Notes CRUD with rich text editor
- Advanced PDF viewer (react-pdf)
- Copy citation in formatted styles
- Auto-fetch PDFs from OA sources
- Offline support
- Multiple PDF attachments
- Saved searches
- Full-text PDF search
- Zod migration (unified validation)

**Phase 3** (Production Polish):
- Settings screens
- i18n (French, German, Spanish)
- Advanced accessibility (WCAG AAA)
- Performance optimization
- Monitoring and observability
- Documentation and user guides

---

**Document Metadata**:
- Version: 2.0 (Unified)
- Date: 2025-01-08
- Author: Claude (Anthropic)
- Status: Ready for implementation
- Related: Spec.md, Roadmap.md, ComponentsSpec.md, DesignSystem.md

---

**End of Unified Implementation Checklist**
