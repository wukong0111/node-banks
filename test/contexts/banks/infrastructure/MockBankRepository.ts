import type { BankRepository } from "@contexts/banks/domain/BankRepository.js";
import type { Bank, BankFilters, PaginatedApiResponse, BankWithEnvironments } from "@contexts/banks/domain/Bank.js";

export class MockBankRepository implements BankRepository {
	private banks: Bank[] = [];
	private banksWithEnvironments: Map<string, BankWithEnvironments> = new Map();
	private shouldFail = false;
	private shouldFailOnFindByIdFlag = false;
	private errorMessage = "Repository error";
	private findByIdErrorMessage = "Repository error";

	// Configuration methods for testing
	public setBanks(banks: Bank[]): void {
		this.banks = banks;
	}

	public addBank(bank: Bank): void {
		this.banks.push(bank);
	}

	public clear(): void {
		this.banks = [];
	}

	public shouldFailOnFindAll(fail = true, errorMessage = "Repository error"): void {
		this.shouldFail = fail;
		this.errorMessage = errorMessage;
	}

	public shouldFailOnFindById(fail = true, errorMessage = "Repository error"): void {
		this.shouldFailOnFindByIdFlag = fail;
		this.findByIdErrorMessage = errorMessage;
	}

	public setBankWithEnvironments(bankId: string, bankWithEnvironments: BankWithEnvironments): void {
		this.banksWithEnvironments.set(bankId, bankWithEnvironments);
	}

	// Repository implementation
	public async findAll(filters: BankFilters): Promise<PaginatedApiResponse<Bank[]>> {
		if (this.shouldFail) {
			throw new Error(this.errorMessage);
		}

		let filteredBanks = [...this.banks];

		// Apply filters
		if (filters.name) {
			filteredBanks = filteredBanks.filter((bank) =>
				bank.name.toLowerCase().includes(filters.name?.toLowerCase() ?? "")
			);
		}

		if (filters.api) {
			filteredBanks = filteredBanks.filter((bank) =>
				bank.api.toLowerCase().includes(filters.api?.toLowerCase() ?? "")
			);
		}

		if (filters.country) {
			const countryFilter = filters.country.toLowerCase();
			filteredBanks = filteredBanks.filter((bank) =>
				bank.country.toLowerCase() === countryFilter
			);
		}

		// Apply pagination
		const page = filters.page || 1;
		const limit = filters.limit || 20;
		const total = filteredBanks.length;
		const totalPages = Math.ceil(total / limit);

		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const paginatedBanks = filteredBanks.slice(startIndex, endIndex);

		return {
			success: true,
			data: paginatedBanks,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
			timestamp: new Date().toISOString(),
		};
	}

	// Additional helper methods for testing
	public getBanksCount(): number {
		return this.banks.length;
	}

	public hasBank(bankId: string): boolean {
		return this.banks.some((bank) => bank.bank_id === bankId);
	}

	public getBankById(bankId: string): Bank | undefined {
		return this.banks.find((bank) => bank.bank_id === bankId);
	}

	public reset(): void {
		this.clear();
		this.banksWithEnvironments.clear();
		this.shouldFail = false;
		this.shouldFailOnFindByIdFlag = false;
		this.errorMessage = "Repository error";
		this.findByIdErrorMessage = "Repository error";
	}

	public async findById(bankId: string): Promise<BankWithEnvironments | null> {
		if (this.shouldFailOnFindByIdFlag) {
			throw new Error(this.findByIdErrorMessage);
		}

		return this.banksWithEnvironments.get(bankId) || null;
	}
}