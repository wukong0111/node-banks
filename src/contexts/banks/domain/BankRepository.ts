import type { Bank, BankFilters, PaginatedApiResponse, BankWithEnvironments, Environment } from './Bank.js';

export interface BankRepository {
  findAll(filters: BankFilters): Promise<PaginatedApiResponse<Bank[]>>;
  findById(bankId: string, environment?: Environment): Promise<BankWithEnvironments | null>;
}