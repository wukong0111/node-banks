import type { Bank } from "@contexts/banks/domain/Bank.js";
import {
	generateUuid,
	generateBankName,
	generateBankCode,
	generateApiVersion,
	generateString,
	generateCountryCode,
	generateBoolean,
	generateBic,
	generateUrl,
	generateArrayOf,
} from "@test/shared/domain/RandomDataGenerator.js";

export const createRandomBank = (): Bank => {
	return {
		bank_id: generateUuid(),
		name: generateBankName(),
		bank_codes: generateArrayOf(() => generateBankCode(), 1),
		api: "berlin_group",
		api_version: generateApiVersion(),
		aspsp: generateString(8).toLowerCase(),
		country: generateCountryCode(),
		auth_type_choice_required: generateBoolean(),
		bic: generateBic(),
		real_name: `${generateBankName()}, S.A.`,
		product_code: generateString(6).toUpperCase(),
		bank_group_id: generateUuid(),
		logo_url: generateUrl(),
		documentation: generateUrl(),
		keywords: { category: "retail", features: ["psd2", "instant_payments"] },
		attribute: { region: "europe", tier: "tier1" },
	};
};

export const createBankWithId = (bankId: string): Bank => {
	return {
		...createRandomBank(),
		bank_id: bankId,
	};
};

export const createBankWithName = (name: string): Bank => {
	return {
		...createRandomBank(),
		name,
	};
};

export const createSpanishBank = (): Bank => {
	return {
		...createRandomBank(),
		country: "ES",
		bic: "BSCHESMM",
	};
};

export const createGermanBank = (): Bank => {
	return {
		...createRandomBank(),
		country: "DE",
		bic: "DEUTDEFF",
	};
};

export const createBankWithCode = (bankCode: string): Bank => {
	return {
		...createRandomBank(),
		bank_codes: [bankCode],
	};
};

export const createBankWithApi = (api: string): Bank => {
	return {
		...createRandomBank(),
		api,
	};
};

export const createSantanderBank = (): Bank => {
	return {
		bank_id: "santander_es",
		name: "Banco Santander España",
		bank_codes: ["0049"],
		api: "berlin_group",
		api_version: "1.3.6",
		aspsp: "santander",
		country: "ES",
		auth_type_choice_required: true,
		bic: "BSCHESMM",
		real_name: "Banco Santander, S.A.",
		product_code: "SAN_ES",
		bank_group_id: null,
		logo_url: "https://cdn.nordigen.com/ais/santander_BSCHESMM.png",
		documentation: "Santander Open Banking API documentation",
		keywords: null,
		attribute: null,
	};
};

export const createBbvaBank = (): Bank => {
	return {
		bank_id: "bbva_es",
		name: "BBVA España",
		bank_codes: ["0182"],
		api: "berlin_group",
		api_version: "1.3.6",
		aspsp: "bbva",
		country: "ES",
		auth_type_choice_required: false,
		bic: "BBVAESMM",
		real_name: "Banco Bilbao Vizcaya Argentaria, S.A.",
		product_code: "BBVA_ES",
		bank_group_id: null,
		logo_url: "https://cdn.nordigen.com/ais/bbva_BBVAESMM.png",
		documentation: "BBVA Open Banking API documentation",
		keywords: null,
		attribute: null,
	};
};

export const createBankList = (count: number): Bank[] => {
	return generateArrayOf(() => createRandomBank(), count);
};

export const createSpanishBankList = (count: number): Bank[] => {
	return generateArrayOf(() => createSpanishBank(), count);
};