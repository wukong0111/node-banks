import type { LoggerService } from "@shared/application/services/LoggerService.js";

export const createMockLogger = (): LoggerService => {
	const mock = {
		debug: () => {},
		info: () => {},
		warn: () => {},
		error: () => {},
		fatal: () => {},
		withContext: () => createMockLogger(),
	};
	return mock as unknown as LoggerService;
};