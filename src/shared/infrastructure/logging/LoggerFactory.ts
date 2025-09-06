import { LogLevel } from "../../domain/logging/LogLevel.js";
import { LoggerService, type TransportConfig } from "../../application/services/LoggerService.js";
import { JsonFormatter } from "./formatters/JsonFormatter.js";
import { ConsoleTransport } from "./transports/ConsoleTransport.js";
import { FileTransport } from "./transports/FileTransport.js";
import type { LoggingConfigData, TransportConfigData } from "../../domain/logging/LoggingConfig.js";
import loggingConfig from "../../../config/logging.js";

function parseLogLevel(level: string): LogLevel {
	switch (level.toLowerCase()) {
		case "debug":
			return LogLevel.DEBUG;
		case "info":
			return LogLevel.INFO;
		case "warn":
			return LogLevel.WARN;
		case "error":
			return LogLevel.ERROR;
		case "fatal":
			return LogLevel.FATAL;
		default:
			return LogLevel.INFO;
	}
}

function parseMaxSize(maxSize: string | number): number {
	if (typeof maxSize === "number") {
		return maxSize;
	}
	
	const match = maxSize.match(/^(\d+)(MB|KB|GB)?$/i);
	if (!match) {
		return 10 * 1024 * 1024; // Default 10MB
	}
	
	const size = Number.parseInt(match[1], 10);
	const unit = (match[2] || "").toUpperCase();
	
	switch (unit) {
		case "KB":
			return size * 1024;
		case "MB":
			return size * 1024 * 1024;
		case "GB":
			return size * 1024 * 1024 * 1024;
		default:
			return size;
	}
}

function createTransportFromConfig(transportConfig: TransportConfigData): TransportConfig {
	const jsonFormatter = new JsonFormatter();

	switch (transportConfig.driver) {
		case "console":
			return {
				transport: new ConsoleTransport({
					useStderr: transportConfig.stderr || false,
				}),
				formatter: jsonFormatter,
			};
		
		case "file":
			return {
				transport: new FileTransport({
					filename: transportConfig.path || "logs/app.log",
					maxSize: parseMaxSize(transportConfig.maxSize || "10MB"),
					maxFiles: transportConfig.maxFiles || 5,
					rotateDaily: transportConfig.daily || false,
				}),
				formatter: jsonFormatter,
			};
		
		default:
			throw new Error(`Unknown transport driver: ${transportConfig.driver}`);
	}
}

export function createLogger(channel?: string): LoggerService {
	const config = loggingConfig as LoggingConfigData;
	const channelName = channel || config.default;
	const channelConfig = config.channels[channelName];

	if (!channelConfig) {
		throw new Error(`Unknown logging channel: ${channelName}`);
	}

	const level = parseLogLevel(channelConfig.level);
	const defaultMetadata = channelConfig.metadata;
	
	const transportConfigs: TransportConfig[] = channelConfig.transports.map(
		createTransportFromConfig
	);

	return new LoggerService(transportConfigs, level, defaultMetadata);
}

// Convenience functions for specific channels
export function createDevelopmentLogger(): LoggerService {
	return createLogger("development");
}

export function createProductionLogger(): LoggerService {
	return createLogger("production");
}

export function createTestLogger(): LoggerService {
	return createLogger("test");
}

export function createSilentLogger(): LoggerService {
	return createLogger("silent");
}