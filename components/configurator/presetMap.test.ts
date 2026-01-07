import { getPresetOverrides, isIndexableVariantSlug } from './presetMap';

describe('presetMap', () => {
  test('returns overrides for known preset', () => {
    const o = getPresetOverrides('accoya-black');
    expect(o).toEqual(
      expect.objectContaining({
        wood: 'accoya',
        color: 'black',
      })
    );
  });

  test('returns null for unknown preset', () => {
    expect(getPresetOverrides('does-not-exist')).toBeNull();
  });

  test('indexable variant slugs are validated', () => {
    expect(isIndexableVariantSlug('larch-carbon')).toBe(true);
    expect(isIndexableVariantSlug('spruce-natural')).toBe(true);
    expect(isIndexableVariantSlug('accoya-black')).toBe(true);
    expect(isIndexableVariantSlug('random')).toBe(false);
  });
});
