import type { BankGroup } from "./BankGroup.js";

export interface BankGroupRepository {
	findAll(): Promise<BankGroup[]>;
}
