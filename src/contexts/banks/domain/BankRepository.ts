import type { Bank, BankFilters, PaginatedApiResponse } from './Bank.js';

export interface BankRepository {
  findAll(filters: BankFilters): Promise<PaginatedApiResponse<Bank[]>>;
}