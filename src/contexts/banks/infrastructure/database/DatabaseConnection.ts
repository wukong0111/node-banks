import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { databaseConfig } from "./config.js";

export class DatabaseConnection {
	private static instance: DatabaseConnection;
	private pool: Pool;

	private constructor() {
		this.pool = new Pool(databaseConfig);

		// Handle pool errors
		this.pool.on("error", (err) => {
			console.error("Unexpected error on idle client", err);
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
			console.log("Executed query", { text, duration, rows: result.rowCount });
			return result;
		} catch (error) {
			const duration = Date.now() - start;
			console.error("Query error", { text, duration, error });
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
			return true;
		} catch (error) {
			console.error("Database ping failed:", error);
			return false;
		}
	}
}