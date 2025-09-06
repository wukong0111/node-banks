import type { BankRepository } from '../domain/BankRepository.js';
import type { Bank, PaginatedApiResponse } from '../domain/Bank.js';
import type { GetBanksRequest } from './dto/GetBanksRequest.js';
import { validateBankRequest } from '../domain/services/BankRequestValidator.js';
import { type Result, createSuccess, createFailure } from '../domain/Result.js';
import type { LoggerService } from '../../../shared/application/services/LoggerService.js';

export class GetBanksUseCase {
  constructor(
    private readonly bankRepository: BankRepository,
    private readonly logger: LoggerService
  ) {}

  async execute(request: GetBanksRequest): Promise<Result<PaginatedApiResponse<Bank[]>>> {
    // Validate request parameters
    const validationResult = validateBankRequest(request);
    
    if (!validationResult.success) {
      return createFailure(validationResult.error);
    }

    const validatedFilters = validationResult.data;

    // Apply default values for pagination
    const finalFilters = {
      ...validatedFilters,
      page: validatedFilters.page || 1,
      limit: validatedFilters.limit || 20
    };

    try {
      const result = await this.bankRepository.findAll(finalFilters);
      this.logger.info('Banks retrieved successfully', { 
        count: result.data?.length || 0, 
        total: result.pagination.total,
        filters: finalFilters 
      });
      return createSuccess(result);
    } catch (error) {
      this.logger.error('Failed to retrieve banks', {
        filters: finalFilters,
        error: error instanceof Error ? error.message : String(error)
      });
      return createFailure('Internal server error');
    }
  }
}