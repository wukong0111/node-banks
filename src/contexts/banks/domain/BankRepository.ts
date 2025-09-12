import type {
	Bank,
	BankFilters,
	PaginatedApiResponse,
	BankWithEnvironments,
	BankEnvironmentConfig,
	Environment,
} from "./Bank.js";

export interface BankRepository {
	findAll(filters: BankFilters): Promise<PaginatedApiResponse<Bank[]>>;
	findById(bankId: string): Promise<BankWithEnvironments | null>;
	insertBank(bankData: {
		bankData: BankWithEnvironments;
		environmentConfigs: Record<Environment, BankEnvironmentConfig>;
	}): Promise<BankWithEnvironments | null>;
	update(
		bankId: string,
		updateData: {
			bankData: Partial<BankWithEnvironments>;
			environmentConfigs: Record<Environment, BankEnvironmentConfig>;
		},
	): Promise<BankWithEnvironments | null>;
}
