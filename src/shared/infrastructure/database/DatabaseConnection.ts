import {
	Pool,
	type PoolClient,
	type QueryResult,
	type QueryResultRow,
} from "pg";
import { databaseConfig } from "./config.js";
import { createLogger } from "../logging/LoggerFactory.js";

export class DatabaseConnection {
	private static instance: DatabaseConnection;
	private pool: Pool;
	private logger = createLogger().withContext({
		service: "DatabaseConnection",
	});

	private constructor() {
		this.pool = new Pool(databaseConfig);

		// Handle pool errors
		this.pool.on("error", (err) => {
			this.logger.fatal("Unexpected error on idle client", err);
			process.exit(-1);
		});
	}

	public static getInstance(): DatabaseConnection {
		if (!DatabaseConnection.instance) {
			DatabaseConnection.instance = new DatabaseConnection();
		}
		return DatabaseConnection.instance;
	}

	public async query<T extends QueryResultRow = QueryResultRow>(
		text: string,
		params?: unknown[],
	): Promise<QueryResult<T>> {
		const start = Date.now();
		try {
			const result = await this.pool.query<T>(text, params);
			const duration = Date.now() - start;
			this.logger.debug("Query executed successfully", {
				text,
				duration: `${duration}ms`,
				rows: result.rowCount,
				params: params?.length || 0,
			});
			return result;
		} catch (error) {
			const duration = Date.now() - start;
			this.logger.error("Query execution failed", {
				text,
				duration: `${duration}ms`,
				params: params?.length || 0,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	public async transaction<T>(
		callback: (client: PoolClient) => Promise<T>,
	): Promise<T> {
		const client = await this.pool.connect();
		try {
			await client.query("BEGIN");
			const result = await callback(client);
			await client.query("COMMIT");
			return result;
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	public async getClient(): Promise<PoolClient> {
		return await this.pool.connect();
	}

	public async close(): Promise<void> {
		await this.pool.end();
	}

	public async ping(): Promise<boolean> {
		try {
			await this.query("SELECT 1");
			this.logger.debug("Database ping successful");
			return true;
		} catch (error) {
			this.logger.error("Database ping failed", {
				error: error instanceof Error ? error.message : String(error),
			});
			return false;
		}
	}
}
