import { faker } from "@faker-js/faker";

export const generateUuid = (): string => {
	return faker.string.uuid();
};

export const generateString = (length = 10): string => {
	return faker.string.alphanumeric(length);
};

export const generateBankName = (): string => {
	return `${faker.company.name()} Bank`;
};

export const generateBankCode = (): string => {
	return faker.string.numeric(4);
};

export const generateCountryCode = (): string => {
	return faker.location.countryCode();
};

export const generateUrl = (): string => {
	return faker.internet.url();
};

export const generateBic = (): string => {
	// BIC format: 4 chars bank code + 2 chars country + 2 chars location + optional 3 chars branch
	const bankCode = faker.string.alpha(4).toUpperCase();
	const countryCode = faker.location.countryCode();
	const locationCode = faker.string.alphanumeric(2).toUpperCase();
	return `${bankCode}${countryCode}${locationCode}`;
};

export const generateApiVersion = (): string => {
	const major = faker.number.int({ min: 1, max: 3 });
	const minor = faker.number.int({ min: 0, max: 9 });
	const patch = faker.number.int({ min: 0, max: 9 });
	return `${major}.${minor}.${patch}`;
};

export const generateBoolean = (): boolean => {
	return faker.datatype.boolean();
};

export const generateNumber = (min = 1, max = 100): number => {
	return faker.number.int({ min, max });
};

export const generateArrayOf = <T>(generator: () => T, count?: number): T[] => {
	const length = count || faker.number.int({ min: 1, max: 5 });
	return Array.from({ length }, generator);
};