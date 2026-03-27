# Feature Keeper Frontend — Development Rules

## Stack
- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Fonts: Bricolage Grotesque (headings), Figtree (body)
- Testing: Jest, React Testing Library
- Design system: components in src/components/ui/

## Testing Requirements

- **NEVER commit code without tests.** Every new page, component, context, or utility must have a corresponding test.
- **Use TDD:** Write the failing test FIRST, then implement.
- **Before committing:** Run `npm test -- --watchAll=false` and verify all tests pass. Do not commit with failing tests.
- **Test types required:**
  - Component tests: render, user interactions, state changes
  - Context tests: state management, side effects
  - API client tests: correct URLs, params, error handling (mock fetch)
  - Page tests: key user flows, form submissions, redirects
- **Coverage target:** 85%+ line coverage. Run `npm run test:coverage` to check.
- **Use the superpowers:test-driven-development skill** for all feature work.

## Code Quality

- Use the design system components from `@/components/ui` — do NOT write inline HTML for buttons, inputs, cards, etc.
- All dashboard pages use `useProject()` from `@/contexts/ProjectContext` for current project.
- All admin API calls take `projectId` as parameter: `adminIdeas.list(token, projectId, params)`.
- Public pages use slug-based routing and `publicBoard` API.
- Use the design tokens from globals.css: `bg-cream`, `text-ink`, `text-subtle`, `text-accent`, `border-edge`, etc.
- Font hierarchy: `font-serif` for headings only, `font-sans` (default) for everything else.

## Contexts

- `useAuth()` — user, token, hasSubscription, projectCount, login, logout
- `useProject()` — currentProject, projects, selectProject, refreshProjects (only inside dashboard)

## Running

```bash
source ~/.nvm/nvm.sh && nvm use 22
npm run dev                           # dev server on port 4000
npm test                              # run tests (watch mode)
npm test -- --watchAll=false          # run tests once
npm run test:coverage                 # coverage report
npm run build                         # production build
```
