import { http, HttpResponse } from 'msw';
import { mockReferences, mockCollections, mockTags } from '../fixtures/mockData';

/**
 * MSW Handlers - Intercept API calls during tests
 * Used with setupServer() to mock all network requests
 */

// In tests, API client calls backend directly (no Vite proxy)
const API_BASE_URL = 'http://localhost:8005/api/bibliography';

export const handlers = [
  // References Endpoints
  http.get(`${API_BASE_URL}/references`, ({ request }) => {
    const url = new URL(request.url);
    const collectionId = url.searchParams.get('collectionId');
    const tags = url.searchParams.get('tags')?.split(',');
    const deleted = url.searchParams.get('deleted') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let filtered = deleted
      ? mockReferences.filter((r) => r.deleted)
      : mockReferences.filter((r) => !r.deleted);

    if (collectionId) {
      filtered = filtered.filter((r) => r.collectionIds.includes(collectionId));
    }

    if (tags && tags.length > 0) {
      filtered = filtered.filter((r) => tags.every((tag) => r.tags.includes(tag)));
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return HttpResponse.json({
      success: true,
      data: paginated,
      pagination: { total },
    });
  }),

  http.post(`${API_BASE_URL}/references`, async ({ request }) => {
    const data = await request.json();
    const newRef = {
      _id: `ref-${Date.now()}`,
      userId: 'test-user-123',
      ...data,
      citationKey: `key-${Date.now()}`,
      authors: data.authors || [],
      tags: data.tags || [],
      collectionIds: data.collectionIds || [],
      hasPdf: false,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newRef }, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/references/:id`, ({ params }) => {
    const ref = mockReferences.find((r) => r._id === params.id);
    if (!ref) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: ref });
  }),

  http.patch(`${API_BASE_URL}/references/:id`, async ({ params, request }) => {
    const ref = mockReferences.find((r) => r._id === params.id);
    if (!ref) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    const updates = await request.json();
    const updated = { ...ref, ...updates, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete(`${API_BASE_URL}/references/:id`, ({ params }) => {
    const ref = mockReferences.find((r) => r._id === params.id);
    if (!ref) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    ref.deleted = true;
    ref.deletedAt = new Date().toISOString();
    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  http.patch(`${API_BASE_URL}/references/:id/restore`, ({ params }) => {
    const ref = mockReferences.find((r) => r._id === params.id);
    if (!ref) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    ref.deleted = false;
    ref.deletedAt = null;
    return HttpResponse.json({ success: true });
  }),

  // Collections Endpoints
  http.get(`${API_BASE_URL}/collections`, () => {
    const nonDeleted = mockCollections.filter((c) => !c.deleted);
    return HttpResponse.json({ success: true, data: nonDeleted });
  }),

  http.post(`${API_BASE_URL}/collections`, async ({ request }) => {
    const data = await request.json();
    const newCollection = {
      _id: `col-${Date.now()}`,
      userId: 'test-user-123',
      ...data,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newCollection }, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/collections/:id`, ({ params }) => {
    const col = mockCollections.find((c) => c._id === params.id);
    if (!col) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: col });
  }),

  http.patch(`${API_BASE_URL}/collections/:id`, async ({ params, request }) => {
    const col = mockCollections.find((c) => c._id === params.id);
    if (!col) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    const updates = await request.json();
    const updated = { ...col, ...updates, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete(`${API_BASE_URL}/collections/:id`, ({ params }) => {
    const col = mockCollections.find((c) => c._id === params.id);
    if (!col) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    col.deleted = true;
    col.deletedAt = new Date().toISOString();
    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  http.patch(`${API_BASE_URL}/collections/:id/restore`, ({ params }) => {
    const col = mockCollections.find((c) => c._id === params.id);
    if (!col) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    col.deleted = false;
    col.deletedAt = null;
    return HttpResponse.json({ success: true });
  }),

  // Tags Endpoints
  http.get(`${API_BASE_URL}/tags`, () => {
    const nonDeleted = mockTags.filter((t) => !t.deleted);
    // Sort by usageCount descending
    const sorted = [...nonDeleted].sort((a, b) => b.usageCount - a.usageCount);
    return HttpResponse.json({ success: true, data: sorted });
  }),

  http.post(`${API_BASE_URL}/tags`, async ({ request }) => {
    const data = await request.json();
    const newTag = {
      _id: `tag-${Date.now()}`,
      userId: 'test-user-123',
      ...data,
      color: data.color || null,
      position: data.position || null,
      automatic: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newTag }, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/tags/:id`, ({ params }) => {
    const tag = mockTags.find((t) => t._id === params.id);
    if (!tag) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: tag });
  }),

  http.patch(`${API_BASE_URL}/tags/:id`, async ({ params, request }) => {
    const tag = mockTags.find((t) => t._id === params.id);
    if (!tag) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    const updates = await request.json();
    const updated = { ...tag, ...updates, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.patch(`${API_BASE_URL}/tags/:name/color`, async ({ params, request }) => {
    const tag = mockTags.find((t) => t.name === params.name);
    if (!tag) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    const { color, position } = await request.json();
    tag.color = color;
    tag.position = position;
    return HttpResponse.json({ success: true, data: tag });
  }),

  http.delete(`${API_BASE_URL}/tags/:id`, ({ params }) => {
    const tag = mockTags.find((t) => t._id === params.id);
    if (!tag) {
      return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    tag.deleted = true;
    tag.deletedAt = new Date().toISOString();
    return HttpResponse.json({ success: true }, { status: 204 });
  }),
];
