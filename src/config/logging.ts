export default {
	default: process.env.LOG_CHANNEL || "development",

	channels: {
		development: {
			level: "debug",
			metadata: {
				environment: "development",
				service: process.env.SERVICE_NAME || "bank-service",
			},
			transports: [
				{
					driver: "console",
					formatter: "json",
					stderr: false,
				},
			],
		},

		production: {
			level: "info",
			metadata: {
				environment: "production",
				service: process.env.SERVICE_NAME || "bank-service",
			},
			transports: [
				{
					driver: "console",
					formatter: "json",
					stderr: false,
				},
				{
					driver: "file",
					formatter: "json",
					path: process.env.LOG_PATH || "logs/app.log",
					maxSize: process.env.LOG_MAX_SIZE || "10MB",
					maxFiles: Number.parseInt(process.env.LOG_MAX_FILES || "5", 10),
					daily: process.env.LOG_DAILY === "true",
				},
			],
		},

		test: {
			level: "warn",
			metadata: {
				environment: "test",
				service: process.env.SERVICE_NAME || "bank-service",
			},
			transports: [],
		},

		silent: {
			level: "fatal",
			metadata: {
				environment: process.env.NODE_ENV || "development",
				service: process.env.SERVICE_NAME || "bank-service",
			},
			transports: [],
		},
	},
};