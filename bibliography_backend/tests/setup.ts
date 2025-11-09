import { jest } from '@jest/globals';

jest.setTimeout(40_000);

afterEach(() => {
  jest.clearAllMocks();
});
