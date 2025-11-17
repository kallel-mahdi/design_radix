import { config } from '../../src/config/environment';

describe('Crossref Configuration', () => {
  it('should read CROSSREF_API_URL from environment', () => {
    // Verify the config module exports the crossrefApiUrl
    expect(config).toHaveProperty('crossrefApiUrl');
    expect(typeof config.crossrefApiUrl).toBe('string');
    expect(config.crossrefApiUrl).toBeTruthy();
  });

  it('should default to official Crossref API if not specified', () => {
    // Save original value
    const originalValue = process.env.CROSSREF_API_URL;

    // Remove env var
    delete process.env.CROSSREF_API_URL;

    // Import fresh config
    jest.resetModules();
    const { config: freshConfig } = require('../../src/config/environment');

    // Should have default value
    expect(freshConfig.crossrefApiUrl).toBe('https://api.crossref.org');

    // Restore original value
    if (originalValue) {
      process.env.CROSSREF_API_URL = originalValue;
    }
    jest.resetModules();
  });

  it('should allow custom Crossref API URL via environment', () => {
    // Set custom URL
    process.env.CROSSREF_API_URL = 'http://localhost:9999';

    // Import fresh config
    jest.resetModules();
    const { config: freshConfig } = require('../../src/config/environment');

    expect(freshConfig.crossrefApiUrl).toBe('http://localhost:9999');

    // Cleanup
    delete process.env.CROSSREF_API_URL;
    jest.resetModules();
  });
});
