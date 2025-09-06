import type { LogLevel } from "./LogLevel.js";

export interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	context?: Record<string, unknown>;
	metadata?: {
		service?: string;
		requestId?: string;
		userId?: string;
		environment?: string;
		[key: string]: unknown;
	};
	error?: {
		name: string;
		message: string;
		stack?: string;
	};
}