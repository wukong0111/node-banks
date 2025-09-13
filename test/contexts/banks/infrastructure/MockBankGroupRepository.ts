import type { BankGroupRepository } from "@contexts/banks/domain/BankGroupRepository.js";
import type { BankGroup } from "@contexts/banks/domain/BankGroup.js";

export class MockBankGroupRepository implements BankGroupRepository {
	private bankGroups: BankGroup[] = [];
	private shouldFailFindAll = false;
	private shouldFailFindById = false;
	private shouldFailCreate = false;
	private shouldFailUpdate = false;
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
		this.shouldFailFindAll = fail;
		this.errorMessage = errorMessage;
	}

	public shouldFailOnFindById(
		fail = true,
		errorMessage = "Repository error",
	): void {
		this.shouldFailFindById = fail;
		this.errorMessage = errorMessage;
	}

	public shouldFailOnCreate(
		fail = true,
		errorMessage = "Repository error",
	): void {
		this.shouldFailCreate = fail;
		this.errorMessage = errorMessage;
	}

	public shouldFailOnUpdate(
		fail = true,
		errorMessage = "Repository error",
	): void {
		this.shouldFailUpdate = fail;
		this.errorMessage = errorMessage;
	}

	public async findAll(): Promise<BankGroup[]> {
		if (this.shouldFailFindAll) {
			throw new Error(this.errorMessage);
		}
		return [...this.bankGroups];
	}

	public async findById(id: string): Promise<BankGroup | null> {
		if (this.shouldFailFindById) {
			throw new Error(this.errorMessage);
		}
		return this.bankGroups.find((group) => group.group_id === id) ?? null;
	}

	public async create(bankGroup: BankGroup): Promise<void> {
		if (this.shouldFailCreate) {
			throw new Error(this.errorMessage);
		}
		this.bankGroups.push(bankGroup);
	}

	public async update(
		id: string,
		updates: Partial<BankGroup>,
	): Promise<BankGroup> {
		if (this.shouldFailUpdate) {
			throw new Error(this.errorMessage);
		}

		const index = this.bankGroups.findIndex((group) => group.group_id === id);
		if (index === -1) {
			throw new Error(`Bank group with id ${id} not found`);
		}

		const updatedBankGroup = {
			...this.bankGroups[index],
			...updates,
			updated_at: new Date().toISOString(),
		};

		this.bankGroups[index] = updatedBankGroup;
		return updatedBankGroup;
	}
}
