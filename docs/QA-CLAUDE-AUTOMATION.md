# Claude QA Automation Guide

**Version**: 1.0
**Status**: Future Reference (Post-Beta)

---

## Table of Contents

1. [Overview](#1-overview)
2. [TDD Workflow with Claude](#2-tdd-workflow-with-claude)
3. [Test Case Generation Prompts](#3-test-case-generation-prompts)
4. [Playwright MCP Integration](#4-playwright-mcp-integration)
5. [E2E Test Examples](#5-e2e-test-examples)
6. [Best Practices](#6-best-practices)
7. [Useful Resources](#7-useful-resources)

---

## 1. Overview

This document provides guidance for using Claude to automate QA testing in future development phases. It includes:

- Test-Driven Development (TDD) workflows
- Prompts for generating test cases
- Playwright MCP integration for E2E testing
- Best practices from Anthropic's recommendations

**When to Use**: After beta launch, when transitioning from manual QA to automated testing.

---

## 2. TDD Workflow with Claude

### Anthropic's Recommended Approach

From [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices):

> "Test-Driven Development (TDD) is an Anthropic-favorite workflow for changes that are easily verifiable with unit, integration, or end-to-end tests."

### The Workflow

```
1. Define test cases → 2. Claude writes tests → 3. Verify tests fail → 4. Claude implements → 5. Verify tests pass
```

### Step-by-Step

#### Step 1: Define Test Cases

Create a specification of expected behavior:

```markdown
## Feature: PDF Import

### Test Cases:
1. Upload PDF with DOI → metadata extracted from CrossRef
2. Upload PDF without DOI → metadata extracted from PDF content
3. Upload corrupt PDF → error message shown
4. Upload non-PDF file → rejected with error
```

#### Step 2: Claude Writes Tests

**Prompt Template**:

```
I'm doing TDD. Write tests for the following feature specification.
DO NOT write any implementation code - only tests.

Feature: [Feature Name]

Test Cases:
1. [Case 1]
2. [Case 2]

Use: [Vitest/Jest/Playwright]
File: [test file path]

After writing the tests, run them to confirm they fail.
```

#### Step 3: Claude Implements

**Prompt Template**:

```
Now implement the feature to make all tests pass.

Requirements:
- Only write code necessary to pass the tests
- Don't add extra functionality
- Run tests after implementation to verify

Feature: [Feature Name]
Test File: [path to test file]
```

### Dual-Claude Strategy

From Anthropic's recommendations:

> "Have one Claude write code while another reviews or tests it."

**Workflow**:
1. **Claude A**: Writes tests based on specification
2. **Claude B**: Implements code to pass tests
3. **Claude A**: Reviews implementation and adds edge case tests

This prevents the bias of a single Claude writing easy-to-pass tests.

---

## 3. Test Case Generation Prompts

### Unit Test Generation

```
Generate comprehensive unit tests for the following function:

File: [path/to/file.ts]
Function: [functionName]

Requirements:
- Test happy path
- Test edge cases (null, undefined, empty)
- Test error conditions
- Use Vitest with describe/it blocks
- Mock external dependencies

Output tests only, no implementation changes.
```

### Integration Test Generation

```
Generate integration tests for this API endpoint:

Endpoint: [METHOD] /api/[path]
Controller: [path/to/controller.ts]

Test scenarios:
1. Successful request with valid data
2. Validation errors (missing/invalid fields)
3. Authentication required
4. Resource not found
5. Server error handling

Use: Supertest + Jest/Vitest
Include: Request/response assertions, database state verification
```

### Component Test Generation

```
Generate React Testing Library tests for this component:

Component: [path/to/Component.tsx]

Test scenarios:
1. Initial render state
2. User interactions (click, type, select)
3. Loading states
4. Error states
5. Conditional rendering

Requirements:
- Use @testing-library/react
- Test accessibility (getByRole preferred)
- Mock API calls with MSW or vi.mock
- Avoid implementation details
```

### E2E Test Generation

```
Generate Playwright E2E tests for this user workflow:

Workflow: [Workflow Name]
Starting URL: [URL]

Steps:
1. [Step 1]
2. [Step 2]
...

Requirements:
- Use Playwright test syntax
- Use locators (getByRole, getByLabel, getByTestId)
- Add assertions after each action
- Handle loading states
- Take screenshots on failure
```

---

## 4. Playwright MCP Integration

### Overview

The Playwright MCP (Model Context Protocol) allows Claude to directly interact with browsers for testing.

From [Building an AI QA Engineer with Claude Code and Playwright MCP](https://alexop.dev/posts/building_ai_qa_engineer_claude_code_playwright/):

> "Build an automated QA engineer using Claude Code and Playwright MCP that tests your web app like a real user, runs on every pull request, and writes detailed bug reports."

### Setup

1. **Install Playwright MCP**:

```bash
npm install -g @anthropic-ai/claude-code
# Playwright MCP is included with Claude Code
```

2. **Configure in `.claude/settings.json`**:

```json
{
  "mcpServers": {
    "playwright": {
      "enabled": true
    }
  }
}
```

### Usage Prompts

**Navigate and Test**:

```
Use Playwright to:
1. Navigate to http://localhost:5173/bibliography
2. Click "Add Reference"
3. Fill in title: "Test Paper"
4. Click Save
5. Verify the reference appears in the list

Report any issues found.
```

**Visual Regression**:

```
Use Playwright to:
1. Navigate to the Bibliography page
2. Take a screenshot
3. Compare with the baseline screenshot
4. Report visual differences
```

**Form Testing**:

```
Use Playwright to test the login form:
1. Navigate to /login
2. Try empty form submission - verify error
3. Try invalid email - verify error
4. Try valid credentials - verify redirect
5. Take screenshots of each state
```

---

## 5. E2E Test Examples

### Example: Bibliography Import Flow

```typescript
// e2e/bibliography-import.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Bibliography Import', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should import PDF and extract metadata', async ({ page }) => {
    // Navigate to bibliography
    await page.goto('/bibliography');

    // Upload PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('fixtures/sample-paper.pdf');

    // Wait for processing
    await expect(page.locator('.toast-success')).toBeVisible();

    // Verify metadata extracted
    const refCard = page.locator('.reference-card').first();
    await expect(refCard).toContainText('Sample Paper Title');
    await expect(refCard).toContainText('Author Name');
  });

  test('should show error for corrupt PDF', async ({ page }) => {
    await page.goto('/bibliography');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('fixtures/corrupt.pdf');

    await expect(page.locator('.toast-error')).toBeVisible();
    await expect(page.locator('.toast-error')).toContainText('Failed to process PDF');
  });
});
```

### Example: LaTeX Compilation Flow

```typescript
// e2e/latex-compile.spec.ts
import { test, expect } from '@playwright/test';

test.describe('LaTeX Compilation', () => {
  test('should compile and show PDF preview', async ({ page }) => {
    await page.goto('/projects/123');

    // Type LaTeX content
    const editor = page.locator('.monaco-editor');
    await editor.click();
    await page.keyboard.type('\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}');

    // Click compile
    await page.click('[data-testid="compile-button"]');

    // Wait for PDF
    await expect(page.locator('.pdf-preview')).toBeVisible();
    await expect(page.locator('.pdf-preview')).not.toContainText('Error');
  });

  test('should show errors for invalid LaTeX', async ({ page }) => {
    await page.goto('/projects/123');

    const editor = page.locator('.monaco-editor');
    await editor.click();
    await page.keyboard.type('\\invalid{command}');

    await page.click('[data-testid="compile-button"]');

    // Verify error panel shows
    await expect(page.locator('.error-panel')).toBeVisible();
    await expect(page.locator('.error-panel')).toContainText('Undefined control sequence');
  });
});
```

### Example: Citation Insertion Flow

```typescript
// e2e/citation-insert.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Citation Insertion', () => {
  test('should insert citation from linked bibliography', async ({ page }) => {
    await page.goto('/projects/123');

    // Open bibliography sidebar
    await page.click('[data-testid="bibliography-sidebar-toggle"]');

    // Wait for references to load
    await expect(page.locator('.reference-list')).toBeVisible();

    // Double-click to insert citation
    await page.dblclick('.reference-item:first-child');

    // Verify citation inserted in editor
    const editor = page.locator('.monaco-editor');
    await expect(editor).toContainText('\\cite{');

    // Compile and verify
    await page.click('[data-testid="compile-button"]');
    await expect(page.locator('.pdf-preview')).toContainText('[1]');
  });
});
```

---

## 6. Best Practices

### From Anthropic's Research

1. **Be Explicit About TDD**
   > "Being explicit that you're doing test-driven development so Claude avoids creating mock implementations."

2. **Verify Test Failure First**
   > "Tell Claude to run the tests and confirm they fail, and explicitly instruct it not to write any implementation code at this stage."

3. **Provide Good Context**
   > "Share the stack trace, file names, and test file" when tests fail.

4. **Use Dual-Claude for Quality**
   > "Have one Claude write tests, then have another Claude write code to make the tests pass."

### Test Writing Guidelines

1. **Test Behavior, Not Implementation**
   ```typescript
   // Good
   expect(result).toBe('expected output');

   // Bad - testing internal state
   expect(service._internalCache).toHaveLength(1);
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   test('should extract DOI from PDF metadata');

   // Bad
   test('test1');
   ```

3. **One Assertion Per Concept**
   ```typescript
   // Good - focused test
   test('should extract title from PDF', async () => {
     const result = await extractMetadata(pdf);
     expect(result.title).toBe('Expected Title');
   });

   // Bad - testing too much
   test('should extract metadata', async () => {
     const result = await extractMetadata(pdf);
     expect(result.title).toBe('Expected Title');
     expect(result.authors).toHaveLength(2);
     expect(result.doi).toBeDefined();
     expect(result.year).toBe(2024);
   });
   ```

4. **Isolate Tests**
   - Each test should be independent
   - Use beforeEach for setup
   - Clean up after tests

5. **Use Fixtures**
   - Store test PDFs in `fixtures/`
   - Use factories for test data
   - Don't rely on production data

### CI Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## 7. Useful Resources

### Official Documentation

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Community Resources

- [Building an AI QA Engineer with Claude Code and Playwright MCP](https://alexop.dev/posts/building_ai_qa_engineer_claude_code_playwright/)
- [Claude QA System - Automated Testing](https://lobehub.com/mcp/dylanredfield-claude-qa-system)
- [ClaudeCodeAgents - QA Agents](https://github.com/darcyegb/ClaudeCodeAgents)
- [Claude AI for Test Case Generation](https://www.secondtalent.com/resources/claude-ai-for-test-case-generation-and-qa-automation/)

### Tools

- **Playwright MCP**: Browser automation via Claude
- **MSW (Mock Service Worker)**: API mocking for tests
- **Faker.js**: Generate realistic test data
- **Percy/Chromatic**: Visual regression testing

---

## Quick Reference: Claude Prompts

### Generate Unit Tests
```
Generate unit tests for [file]. Test happy paths, edge cases, and errors. Use Vitest.
```

### Generate E2E Tests
```
Generate Playwright E2E tests for [workflow]. Include assertions and screenshots.
```

### Fix Failing Test
```
This test is failing:
[paste test code and error]

Fix the implementation to make it pass. Don't modify the test.
```

### Add Test Coverage
```
Analyze [file] and add tests for uncovered edge cases. Current coverage: [X]%
```

---

**Document End**

*This guide will help transition from manual QA to automated testing with Claude assistance.*
