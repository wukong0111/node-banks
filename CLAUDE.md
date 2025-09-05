# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
# Development
npm run dev                                        # Start server with hot reload
curl -s "http://localhost:3000/health" | jq       # Test health endpoint
curl -s "http://localhost:3000/api/banks?limit=2" | jq  # Test banks endpoint

# Code Quality
npx biome lint                                     # Check for linting warnings (MUST be 0)
npx biome lint --write                             # Auto-fix linting issues
npx tsc --noEmit                                  # Check TypeScript errors
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
- **MANDATORY: All Biome linting warnings must be fixed before any commit**
  - Run `npx biome lint` - must show 0 warnings
  - Use `npx biome lint --write` for auto-fixes first
  - No code is acceptable with linting warnings

## Current Status & Limitations

### ✅ Working
- GET /api/banks (pagination, filtering, validation)
- Health checks (/health, /health/jwt)
- 8 hardcoded Spanish banks

### ❌ Not Implemented Yet
- Database (uses hardcoded data)
- JWT authentication middleware
- POST/PUT bank operations
- Bank groups endpoints (/api/bank-groups)
- Tests

### 🛠️ Tech Stack
- **Framework**: Hono.js + Node.js 22+
- **Language**: TypeScript 5.9+
- **Linting**: Biome (tab indentation, double quotes)
- **Dev**: tsx for hot reload

## Request Flow
```
HTTP Request → Controller (extract params) → UseCase (business logic + validation) → Repository (data) → Response
```