import type { Environment, BankFilters } from '../Bank.js';
import type { GetBanksRequest } from '../../application/dto/GetBanksRequest.js';
import { type Result, createSuccess, createFailure } from '../Result.js';

const VALID_ENVIRONMENTS = ['production', 'test', 'sandbox', 'development', 'all'] as const;

export function validateBankRequest(request: GetBanksRequest): Result<BankFilters> {
  const errors: string[] = [];
  
  // Validate environment parameter
  let env: Environment | 'all' | undefined ;
  if (request.env !== undefined) {
    if (!VALID_ENVIRONMENTS.includes(request.env as typeof VALID_ENVIRONMENTS[number])) {
      errors.push(`Invalid environment parameter. Must be one of: ${VALID_ENVIRONMENTS.join(', ')}`);
    } else {
      env = request.env as Environment | 'all';
    }
  }

  // Validate and parse page parameter
  let page: number | undefined ;
  if (request.page !== undefined) {
    const parsedPage = parseInt(request.page, 10);
    if (Number.isNaN(parsedPage) || parsedPage < 1) {
      errors.push('Page parameter must be a positive integer');
    } else {
      page = parsedPage;
    }
  }

  // Validate and parse limit parameter
  let limit: number | undefined ;
  if (request.limit !== undefined) {
    const parsedLimit = parseInt(request.limit, 10);
    if (Number.isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      errors.push('Limit parameter must be a positive integer between 1 and 100');
    } else {
      limit = parsedLimit;
    }
  }

  // Return first error if any validation failed
  if (errors.length > 0) {
    return createFailure(errors[0]);
  }

  // Build validated filters
  const validatedFilters: BankFilters = {
    env,
    name: request.name,
    api: request.api,
    country: request.country,
    page,
    limit
  };

  return createSuccess(validatedFilters);
}