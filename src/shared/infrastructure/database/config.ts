import { config } from "dotenv";
import type { PoolConfig } from "pg";

// Load environment variables
config();

export interface DatabaseConfig extends PoolConfig {
	host: string;
	port: number;
	database: string;
	user: string;
	password: string;
	ssl: boolean;
}

export const databaseConfig: DatabaseConfig = {
	host: process.env.DB_HOST || "localhost",
	port: Number.parseInt(process.env.DB_PORT || "5432", 10),
	database: process.env.DB_NAME || "banks_db",
	user: process.env.DB_USER || "postgres",
	password: process.env.DB_PASSWORD || "password",
	ssl: process.env.DB_SSL === "true",
	max: Number.parseInt(process.env.DB_MAX_CONNECTIONS || "20", 10),
	idleTimeoutMillis: Number.parseInt(
		process.env.DB_IDLE_TIMEOUT || "30000",
		10,
	),
	connectionTimeoutMillis: Number.parseInt(
		process.env.DB_CONNECTION_TIMEOUT || "2000",
		10,
	),
};
