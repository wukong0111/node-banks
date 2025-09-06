import type { Bank, BankFilters, PaginatedApiResponse, BankWithEnvironments } from './Bank.js';

export interface BankRepository {
  findAll(filters: BankFilters): Promise<PaginatedApiResponse<Bank[]>>;
  findById(bankId: string): Promise<BankWithEnvironments | null>;
}