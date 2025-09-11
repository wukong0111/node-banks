# AGENTS.md - Banking API Service

## Commands
- **Build**: `npm run build` (TypeScript compilation)
- **Dev**: `npm run dev` (tsx watch with hot reload)
- **Test**: `npm test` (all), `npm run test:watch` (watch mode), `npm run test:ui` (UI), `npm run test:coverage`
- **Single test**: `npx vitest run path/to/test.ts`
- **Lint**: `npx biome lint`, `npx biome lint --write` (auto-fix)
- **Typecheck**: `npm run typecheck` (tsc --noEmit)
- **Check**: `npm run check` (lint + typecheck), `npm run check:fix` (auto-fix)

## Code Style
- **Formatting**: Tab indentation, double quotes, Biome formatter
- **Imports**: `import type` for types, path aliases: `@/`, `@contexts/`, `@shared/`, `@test/`
- **Types**: Strict TypeScript (ES2022), PascalCase interfaces/classes, camelCase variables
- **Error Handling**: Use `Result<T>` pattern, no exceptions (createSuccess/createFailure)
- **Architecture**: DDD + Hexagonal (domain → application → infrastructure → presentation)
- **Testing**: Vitest + Object Mother pattern, Arrange-Act-Assert structure
- **Controllers**: < 20 lines, extract params → call use case → map response
- **Validation**: Always in domain services, never in controllers
- **Comments**: None unless absolutely necessary