import { Tag } from '../../../src/models/Tag';

describe('Tag model schema', () => {
  it('defines usageCount defaults and validation', () => {
    const usagePath: any = Tag.schema.path('usageCount');

    expect(usagePath?.options?.default).toBe(0);
    expect(usagePath?.options?.min).toBe(0);
  });
});
