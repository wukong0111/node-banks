import type { GetBanksRequest } from "@contexts/banks/application/dto/GetBanksRequest.js";
import { generateBankName, generateCountryCode, generateNumber } from "@test/shared/domain/RandomDataGenerator.js";

export const createRandomBankRequest = (): GetBanksRequest => {
	return {
		env: "production",
		name: generateBankName(),
		api: "berlin_group",
		country: generateCountryCode(),
		page: generateNumber(1, 10).toString(),
		limit: generateNumber(10, 50).toString(),
	};
};

export const createEmptyBankRequest = (): GetBanksRequest => {
	return {};
};

export const createBankRequestWithPage = (page: number): GetBanksRequest => {
	return {
		...createEmptyBankRequest(),
		page: page.toString(),
	};
};

export const createBankRequestWithLimit = (limit: number): GetBanksRequest => {
	return {
		...createEmptyBankRequest(),
		limit: limit.toString(),
	};
};

export const createBankRequestWithPagination = (page: number, limit: number): GetBanksRequest => {
	return {
		page: page.toString(),
		limit: limit.toString(),
	};
};

export const createBankRequestWithName = (name: string): GetBanksRequest => {
	return {
		...createEmptyBankRequest(),
		name,
	};
};

export const createBankRequestWithCountry = (country: string): GetBanksRequest => {
	return {
		...createEmptyBankRequest(),
		country,
	};
};

export const createBankRequestWithApi = (api: string): GetBanksRequest => {
	return {
		...createEmptyBankRequest(),
		api,
	};
};

export const createBankRequestWithEnv = (env: string): GetBanksRequest => {
	return {
		...createEmptyBankRequest(),
		env,
	};
};

export const createSpanishBankRequest = (): GetBanksRequest => {
	return {
		country: "ES",
		page: "1",
		limit: "20",
	};
};

export const createFirstPageRequest = (): GetBanksRequest => {
	return {
		page: "1",
		limit: "20",
	};
};

export const createInvalidPageRequest = (): GetBanksRequest => {
	return {
		page: "invalid",
		limit: "20",
	};
};

export const createInvalidLimitRequest = (): GetBanksRequest => {
	return {
		page: "1",
		limit: "invalid",
	};
};

export const createNegativePageRequest = (): GetBanksRequest => {
	return {
		page: "-1",
		limit: "20",
	};
};

export const createZeroLimitRequest = (): GetBanksRequest => {
	return {
		page: "1",
		limit: "0",
	};
};

export const createExcessiveLimitRequest = (): GetBanksRequest => {
	return {
		page: "1",
		limit: "1000",
	};
};