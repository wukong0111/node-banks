import type { BankRepository } from '../domain/BankRepository.js';
import type { Bank, PaginatedApiResponse } from '../domain/Bank.js';
import type { GetBanksRequest } from './dto/GetBanksRequest.js';
import { BankRequestValidator } from '../domain/services/BankRequestValidator.js';
import { Result, ResultBuilder } from '../domain/Result.js';

export class GetBanksUseCase {
  constructor(private readonly bankRepository: BankRepository) {}

  async execute(request: GetBanksRequest): Promise<Result<PaginatedApiResponse<Bank[]>>> {
    // Validate request parameters
    const validationResult = BankRequestValidator.validate(request);
    
    if (!validationResult.success) {
      return ResultBuilder.failure(validationResult.error);
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
      return ResultBuilder.success(result);
    } catch (error) {
      console.error('Error in GetBanksUseCase:', error);
      return ResultBuilder.failure('Internal server error');
    }
  }
}