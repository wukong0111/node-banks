import { LogLevel } from "../../domain/logging/LogLevel.js";
import type { LogEntry } from "../../domain/logging/LogEntry.js";
import type { LogFormatter } from "../../domain/logging/LogFormatter.js";
import type { LogTransport } from "../../domain/logging/LogTransport.js";

export interface TransportConfig {
	transport: LogTransport;
	formatter: LogFormatter;
}

export class LoggerService {
	private readonly transportConfigs: TransportConfig[];
	private readonly level: LogLevel;
	private readonly defaultMetadata: Record<string, unknown>;

	constructor(
		transportConfigs: TransportConfig[],
		level: LogLevel = LogLevel.INFO,
		defaultMetadata: Record<string, unknown> = {}
	) {
		this.transportConfigs = transportConfigs;
		this.level = level;
		this.defaultMetadata = defaultMetadata;
	}

	debug(message: string, context?: Record<string, unknown>): void {
		this.log(LogLevel.DEBUG, message, context);
	}

	info(message: string, context?: Record<string, unknown>): void {
		this.log(LogLevel.INFO, message, context);
	}

	warn(message: string, context?: Record<string, unknown>): void {
		this.log(LogLevel.WARN, message, context);
	}

	error(message: string, context?: Record<string, unknown> | Error): void {
		if (context instanceof Error) {
			this.log(LogLevel.ERROR, message, undefined, context);
		} else {
			this.log(LogLevel.ERROR, message, context);
		}
	}

	fatal(message: string, context?: Record<string, unknown> | Error): void {
		if (context instanceof Error) {
			this.log(LogLevel.FATAL, message, undefined, context);
		} else {
			this.log(LogLevel.FATAL, message, context);
		}
	}

	private log(
		level: LogLevel,
		message: string,
		context?: Record<string, unknown>,
		error?: Error
	): void {
		if (!this.shouldLog(level)) {
			return;
		}

		const entry = this.createLogEntry(level, message, context, error);

		this.transportConfigs.forEach(({ transport, formatter }) => {
			try {
				const formattedMessage = formatter.format(entry);
				transport.write(formattedMessage);
			} catch (transportError) {
				console.error(
					`Failed to write log via transport: ${transportError instanceof Error ? transportError.message : transportError}`
				);
			}
		});
	}

	private shouldLog(level: LogLevel): boolean {
		return level >= this.level;
	}

	private createLogEntry(
		level: LogLevel,
		message: string,
		context?: Record<string, unknown>,
		error?: Error
	): LogEntry {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			message,
			metadata: {
				...this.defaultMetadata,
			},
		};

		if (context) {
			entry.context = context;
		}

		if (error) {
			entry.error = {
				name: error.name,
				message: error.message,
				stack: error.stack,
			};
		}

		return entry;
	}

	withContext(context: Record<string, unknown>): LoggerService {
		return new LoggerService(
			this.transportConfigs,
			this.level,
			{ ...this.defaultMetadata, ...context }
		);
	}
}