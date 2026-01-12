import { getCanonicalProductPath, getPresetRobotsMeta } from './seo';

describe('configurator seo helpers', () => {
  test('canonical product path uses /products', () => {
    expect(getCanonicalProductPath('shou-sugi-ban-wood', 'en')).toBe('https://yakiwood.lt/products/shou-sugi-ban-wood');
    expect(getCanonicalProductPath('shou-sugi-ban-wood', 'lt')).toBe('https://yakiwood.lt/lt/produktai/shou-sugi-ban-wood');
  });

  test('preset robots meta is noindex,follow when preset is present', () => {
    expect(getPresetRobotsMeta('accoya-black')).toEqual({ index: false, follow: true });
  });

  test('preset robots meta is undefined when no preset', () => {
    expect(getPresetRobotsMeta(null)).toBeUndefined();
    expect(getPresetRobotsMeta(undefined)).toBeUndefined();
  });
});
