import type { BankGroupRepository } from "@contexts/banks/domain/BankGroupRepository.js";
import type { BankGroup } from "@contexts/banks/domain/BankGroup.js";

export class MockBankGroupRepository implements BankGroupRepository {
	private bankGroups: BankGroup[] = [];
	private shouldFail = false;
	private errorMessage = "Repository error";

	// Configuration methods for testing
	public setBankGroups(bankGroups: BankGroup[]): void {
		this.bankGroups = bankGroups;
	}

	public addBankGroup(bankGroup: BankGroup): void {
		this.bankGroups.push(bankGroup);
	}

	public clear(): void {
		this.bankGroups = [];
	}

	public shouldFailOnFindAll(
		fail = true,
		errorMessage = "Repository error",
	): void {
		this.shouldFail = fail;
		this.errorMessage = errorMessage;
	}

	public async findAll(): Promise<BankGroup[]> {
		if (this.shouldFail) {
			throw new Error(this.errorMessage);
		}
		return [...this.bankGroups];
	}
}
