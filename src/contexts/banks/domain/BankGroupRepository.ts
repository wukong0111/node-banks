import type { BankGroup } from "./BankGroup.js";

export interface BankGroupRepository {
	findAll(): Promise<BankGroup[]>;
	findById(id: string): Promise<BankGroup | null>;
	create(bankGroup: BankGroup): Promise<void>;
}
