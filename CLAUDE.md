# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
# Development
npm run dev                                        # Start server with hot reload
curl -s "http://localhost:3000/health" | jq       # Test health endpoint
curl -s "http://localhost:3000/api/banks?limit=2" | jq  # Test banks endpoint

# Code Quality
npm run check                                      # Complete validation (types + linting - MANDATORY)
npx biome lint                                     # Check for linting warnings (MUST be 0)
npx biome lint --write                             # Auto-fix linting issues
npm run typecheck                                  # Check TypeScript errors (MUST be 0)
```

## What Goes Where

**Banking API service built with Domain-Driven Design (DDD) + Hexagonal Architecture:**

- **New endpoint** → `src/contexts/banks/presentation/BanksController.ts`
- **Business logic** → `src/contexts/banks/application/*UseCase.ts`
- **Validation** → `src/contexts/banks/domain/services/*Validator.ts`
- **Data access** → `src/contexts/banks/infrastructure/*Repository.ts`
- **Types/entities** → `src/contexts/banks/domain/Bank.ts`

## Common Tasks

### Add a new endpoint
1. Create UseCase in `application/` folder
2. Add validation in `domain/services/` if needed
3. Add route in `presentation/BanksController.ts`
4. Test: `curl http://localhost:3000/api/your-endpoint`

### Fix validation error
1. Check `BankRequestValidator.ts` for validation logic
2. Update validation rules in domain service
3. Test with invalid data to verify error handling

### Add new bank data
1. Update hardcoded data in `HardcodedBankRepository.ts`
2. Follow existing bank object structure
3. Test with filters: `curl "http://localhost:3000/api/banks?name=newbank"`

## Important Patterns

- **Always validate in domain services, not controllers**
- **Use Result<T> for errors, don't throw exceptions**
- **Controllers should be < 20 lines (extract params → call use case → map response)**
- **One use case = one file**
- **Import types with `import type` when possible**
- **MANDATORY: Complete code validation before any commit**
  - Run `npm run check` - must pass completely (0 errors, 0 warnings)
  - TypeScript: `npm run typecheck` must show 0 errors
  - Linting: `npx biome lint` must show 0 warnings  
  - Use `npm run check:fix` for auto-fixes first
  - No code is acceptable with type errors or linting warnings

## Current Status & Limitations

### ✅ Working
- GET /api/banks (pagination, filtering, validation)
- Health checks (/health, /health/jwt)
- PostgreSQL database with migrations and seeders
- Unit tests with Vitest (GetBanksUseCase - 15 tests passing)
- Complete TypeScript type safety

### ❌ Not Implemented Yet
- JWT authentication middleware
- POST/PUT bank operations
- Bank groups endpoints (/api/bank-groups)
- Integration tests with real database
- End-to-end tests

### 🛠️ Tech Stack
- **Framework**: Hono.js + Node.js 22+
- **Language**: TypeScript 5.9+ (strict mode)
- **Database**: PostgreSQL with pg driver
- **Testing**: Vitest + Object Mother pattern
- **Linting**: Biome (tab indentation, double quotes)
- **Dev**: tsx for hot reload

## Testing

```bash
# Unit Tests
npm test                                          # Run all tests 
npm run test:watch                                # Watch mode
npm run test:coverage                             # Coverage report
npm run test:ui                                   # Visual test UI

# Database Operations  
npm run db:setup                                  # Create DB + migrate + seed
npm run db:migrate                                # Run pending migrations
npm run db:seed                                   # Run seeders
```

**Testing Philosophy:**
- Unit tests use **Object Mother pattern** with functions (not classes)
- Tests are **DB-independent** using mocks and type-safe Result patterns
- Follow **Arrange-Act-Assert** structure with clear type guards
- **15/15 tests passing** for GetBanksUseCase with complete coverage

## Request Flow
```
HTTP Request → Controller (extract params) → UseCase (business logic + validation) → Repository (data) → Response
```