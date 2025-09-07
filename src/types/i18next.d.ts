import 'i18next';
import type { resources } from '../lib/i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    // Infer keys from our resources for strong typing + autocomplete
    resources: {
      translation: (typeof resources)['en']['translation'];
    };
  }
}

