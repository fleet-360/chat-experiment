AGENT Guidelines

Purpose

- Define rules to keep all user-visible text translated via `src/lib/i18n.ts`.
- Ensure full RTL and LTR support using logical start/end utilities.
- Standardize on shadcn/ui components and TailwindCSS for styling.

Source of Truth

- i18n module: `src/lib/i18n.ts:1`
- Supported languages: `en`, `he` (extendable)
- Namespaces to use: `app`, `common`, `nav`, `lang`, `pages`, `chat`, `consent`, `about`, `cta`

Non-Negotiable Rules

- All UI text: must come from i18n via `t('namespace.key')`. No hardcoded strings.
- Language parity: add each key to every supported language object in `resources`.
- Direction: UI must work in both RTL and LTR.
- Layout: prefer logical start/end utilities over left/right.
- Components: build using shadcn/ui primitives found under `src/components/ui/`.
- Styling: TailwindCSS only; use project design tokens (CSS variables) from `src/App.css`.

Language & Direction Bootstrapping

- The app sets `<html dir>` and `<html lang>` from i18next.
- Reference: `src/components/LanguageSwitcher.tsx:1` uses `i18n.dir()` and `i18n.changeLanguage()`.

Using Translations

- Import and call `useTranslation` from `react-i18next`.
- Example usages:
  - Page: `src/routes/prolific-required.tsx:1`
  - Chat list and input: `src/components/chat/Chat.tsx:1`
  - Message badge: `src/components/chat/MessageItem.tsx:1`
- Common keys available in `src/lib/i18n.ts:1`:
  - App: `app.title`
  - Common: `common.userArea`, `common.adminArea`, `common.goToAdmin`, `common.goToUser`
  - Navigation: `nav.home`, `nav.chat`, `nav.questions`, `nav.settings`, `nav.user`, `nav.admin`
  - Language UI: `lang.switchTo`, `lang.english`, `lang.hebrew`
  - Pages: `pages.userHome`, `pages.userChat`, `pages.userQuestions`, `pages.adminSettings`, `pages.adminChat`, `pages.prolificRequiredTitle`, `pages.prolificRequiredMessage`
  - Chat: `chat.noMessages`, `chat.placeholder`, `chat.send`, `chat.admin`, `chat.missingGroup`, `chat.noGroupOnUser`, `chat.groupTitle`
  - Consent/About/CTA: `consent.*`, `about.*`, `cta.accept`, `cta.decline`

Interpolations

- Do not hardcode dynamic text. Define keys with placeholders and pass values.
- Example: `chat.groupTitle: "Group {{id}}"` → `t('chat.groupTitle', { id: groupId })`.

RTL/LTR Directionality

- Global: the `<html dir>` attribute is the source of truth (from i18n).
- Prefer logical Tailwind utilities:
  - Spacing: `ms-*`/`me-*` (margin-inline-start/end), `ps-*`/`pe-*` (padding-inline-start/end)
  - Text alignment: `text-start` / `text-end`
  - Rounded corners: `rounded-s-*` / `rounded-e-*`
  - Borders: `border-s-*` / `border-e-*`
  - Positioning: `start-*` / `end-*` where available; otherwise use axis-neutral utilities like `inset-x-0` or flex/grid alignment
- Use `rtl:`/`ltr:` variants sparingly and only when a logical utility cannot express the intent.

shadcn/ui Components

- Existing primitives:
  - Button: `src/components/ui/button.tsx:1`
  - Card: `src/components/ui/card.tsx:1`
  - Textarea: `src/components/ui/textarea.tsx:1`
- Compose new UI from these. Keep CVA variants/styles consistent.
- Add additional components via shadcn CLI using the project config `components.json:1`.

TailwindCSS Guidelines

- Use logical spacing/layout utilities and axis-neutral patterns (`gap-*`, `flex`, `grid`).
- Align text and UI with `text-start/text-end` rather than `text-left/text-right`.
- Avoid `ml-*`, `mr-*`, `pl-*`, `pr-*` in favor of `ms-*`, `me-*`, `ps-*`, `pe-*`.
- Use design tokens defined in `src/App.css:1`. Do not hardcode colors.

Adding New Text

- Step 1: Add keys in `src/lib/i18n.ts:1` for ALL supported languages.
- Step 2: Use `t('namespace.key')` in components/pages.
- Step 3: For variables, add placeholders and pass via `t(key, { varName })`.
- Step 4: Validate in both `en` and `he` with both `dir="ltr"` and `dir="rtl"`.

Adding a New Language

- Step 1: Add the language code to `supportedLngs` in `src/lib/i18n.ts:1`.
- Step 2: Create a new `resources[<lng>]` object with full key parity.
- Step 3: Verify the LanguageSwitcher toggles `lang` and `dir` appropriately.

Adding shadcn Components

- Use the project’s shadcn config: `components.json:1`.
- Command: `npx shadcn@latest add <component>` (from project root).
- Place files under `src/components/ui/` and import via the configured alias.

QA Checklist

- Translations: every user-visible string uses `t(...)` and exists in all languages.
- Direction: UI remains correct in RTL and LTR.
- Logical utilities: no stray left/right classes except when wrapped with `rtl:`/`ltr:` and necessary.
- Components: built from shadcn/ui primitives; styled with Tailwind and project tokens.
- Accessibility: `<html lang>` and `<html dir>` set; interactive elements have accessible names sourced from i18n.

