import type { LoggerService } from "@shared/application/services/LoggerService.js";

interface LogEntry {
	message: string;
	context?: Record<string, unknown>;
}

export const createMockLogger = () => {
	const debugLogs: LogEntry[] = [];
	const infoLogs: LogEntry[] = [];
	const warnLogs: LogEntry[] = [];
	const errorLogs: LogEntry[] = [];
	const fatalLogs: LogEntry[] = [];

	const mock = {
		debug: (message: string, context?: Record<string, unknown>) => {
			debugLogs.push({ message, context });
		},
		info: (message: string, context?: Record<string, unknown>) => {
			infoLogs.push({ message, context });
		},
		warn: (message: string, context?: Record<string, unknown>) => {
			warnLogs.push({ message, context });
		},
		error: (message: string, context?: Record<string, unknown> | Error) => {
			if (context instanceof Error) {
				errorLogs.push({ message, context: { error: context.message } });
			} else {
				errorLogs.push({ message, context });
			}
		},
		fatal: (message: string, context?: Record<string, unknown> | Error) => {
			if (context instanceof Error) {
				fatalLogs.push({ message, context: { error: context.message } });
			} else {
				fatalLogs.push({ message, context });
			}
		},
		withContext: () => createMockLogger(),
		getDebugLogs: () => debugLogs,
		getInfoLogs: () => infoLogs,
		getWarnLogs: () => warnLogs,
		getErrorLogs: () => errorLogs,
		getFatalLogs: () => fatalLogs,
		clearLogs: () => {
			debugLogs.length = 0;
			infoLogs.length = 0;
			warnLogs.length = 0;
			errorLogs.length = 0;
			fatalLogs.length = 0;
		},
	};
	return mock as unknown as LoggerService & {
		getDebugLogs: () => LogEntry[];
		getInfoLogs: () => LogEntry[];
		getWarnLogs: () => LogEntry[];
		getErrorLogs: () => LogEntry[];
		getFatalLogs: () => LogEntry[];
		clearLogs: () => void;
	};
};
