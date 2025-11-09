import { expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

// Make expect available globally for @testing-library/jest-dom
global.expect = expect;

// Cleanup after each test
afterEach(() => {
	cleanup();
});
