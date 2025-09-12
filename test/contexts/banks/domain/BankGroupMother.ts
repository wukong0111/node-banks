import type { BankGroup } from "@contexts/banks/domain/BankGroup.js";
import {
	generateUuid,
	generateString,
	generateUrl,
} from "@test/shared/domain/RandomDataGenerator.js";

export const createRandomBankGroup = (): BankGroup => {
	return {
		group_id: generateUuid(),
		name: `${generateString(10)} Bank Group`,
		description: generateString(50),
		logo_url: generateUrl(),
		website: generateUrl(),
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};
};

export const createBankGroup = (
	overrides: Partial<BankGroup> = {},
): BankGroup => {
	const defaultGroup: BankGroup = {
		group_id: generateUuid(),
		name: "Test Bank Group",
		description: "Test description",
		logo_url: "https://example.com/logo.png",
		website: "https://example.com",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	return { ...defaultGroup, ...overrides };
};

export const createBankGroupWithId = (groupId: string): BankGroup => {
	return createBankGroup({ group_id: groupId });
};

export const createBankGroupWithName = (name: string): BankGroup => {
	return createBankGroup({ name });
};
