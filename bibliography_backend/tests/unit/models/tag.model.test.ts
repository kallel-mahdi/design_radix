import { Tag } from '../../../src/models/Tag';

describe('Tag model schema', () => {
  it('defines position validation (1-9 for colored tags)', () => {
    const positionPath: any = Tag.schema.path('position');

    expect(positionPath?.options?.min).toBe(1);
    expect(positionPath?.options?.max).toBe(9);
  });

  it('has unique compound index on userId and name', () => {
    const indexes = Tag.schema.indexes();
    const uniqueIndex = indexes.find((index: any) => {
      const keys = index[0];
      return keys.userId === 1 && keys.name === 1;
    });

    expect(uniqueIndex).toBeDefined();
    expect(uniqueIndex?.[1]?.unique).toBe(true);
  });
});
