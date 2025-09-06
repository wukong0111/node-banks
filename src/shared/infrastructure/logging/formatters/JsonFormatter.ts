import type { LogFormatter } from "../../../domain/logging/LogFormatter.js";
import type { LogEntry } from "../../../domain/logging/LogEntry.js";
import { LogLevelNames } from "../../../domain/logging/LogLevel.js";

export class JsonFormatter implements LogFormatter {
	format(entry: LogEntry): string {
		const jsonObject = {
			timestamp: entry.timestamp,
			level: LogLevelNames[entry.level],
			message: entry.message,
			...entry.context,
			...entry.metadata,
			...(entry.error && { error: entry.error }),
		};

		return JSON.stringify(jsonObject);
	}
}