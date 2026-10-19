import { describe, it, expect } from 'vitest';
import { getTranslations, TRANSLATIONS, SupportedLanguage } from '../../src/i18n';

describe('i18n Localization Unit Tests', () => {
  const languages: SupportedLanguage[] = ['en', 'hi', 'mr'];

  it.each(languages)('provides complete translation bundle for language "%s"', (lang) => {
    const t = getTranslations(lang);
    expect(t.appName).toBeDefined();
    expect(t.tabs.today).toBeDefined();
    expect(t.tabs.calendar).toBeDefined();
    expect(t.tabs.diary).toBeDefined();
    expect(t.tabs.sanitary).toBeDefined();
    expect(t.tabs.insights).toBeDefined();
    expect(t.tabs.doctor).toBeDefined();
    expect(t.tabs.wellness).toBeDefined();
    expect(t.comfort.sosTitle).toBeDefined();
  });

  it('falls back to English when an unsupported language key is provided', () => {
    // @ts-expect-error Testing fallback behavior
    const t = getTranslations('fr');
    expect(t.appName).toBe('LunaFlow');
  });
});
