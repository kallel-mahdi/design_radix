import { expect, afterEach, beforeAll, afterAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./src/test/mocks/server";

// Make expect available globally for @testing-library/jest-dom
global.expect = expect;

// Start MSW server before all tests
beforeAll(() => {
	server.listen({
		onUnhandledRequest: "warn",
	});
});

// Reset handlers and cleanup after each test
afterEach(() => {
	server.resetHandlers();
	cleanup();
});

// Stop server after all tests
afterAll(() => {
	server.close();
});

// Mock window.matchMedia (for responsive tests)
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	takeRecords() {
		return [];
	}
	unobserve() {}
} as any;

// Mock window.scrollTo
window.scrollTo = vi.fn();
