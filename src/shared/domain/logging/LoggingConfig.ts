export interface TransportConfigData {
	driver: "console" | "file";
	formatter: "json";
	stderr?: boolean;
	path?: string;
	maxSize?: string | number;
	maxFiles?: number;
	daily?: boolean;
}

export interface LoggingChannelConfig {
	level: string;
	metadata: Record<string, unknown>;
	transports: TransportConfigData[];
}

export interface LoggingConfigData {
	default: string;
	channels: Record<string, LoggingChannelConfig>;
}