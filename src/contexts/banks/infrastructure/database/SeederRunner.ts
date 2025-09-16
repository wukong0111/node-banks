import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseConnection } from "../../../../shared/infrastructure/database/DatabaseConnection.js";
import type { PoolClient } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class SeederRunner {
	private db: DatabaseConnection;
	private seedersPath: string;

	constructor() {
		this.db = DatabaseConnection.getInstance();
		this.seedersPath = join(__dirname, "seeders");
	}

	public async getAvailableSeeders(): Promise<string[]> {
		const files = await readdir(this.seedersPath);
		const seeders = files.filter((file) => file.endsWith(".sql")).sort(); // This will sort them numerically: 001_, 002_, 003_
		return seeders;
	}

	public async run(options: { truncate?: boolean } = {}): Promise<void> {
		const seeders = await this.getAvailableSeeders();

		if (seeders.length === 0) {
			console.log("No seeders found");
			return;
		}

		console.log(`Running ${seeders.length} seeder(s)...`);

		if (options.truncate) {
			await this.truncateTables();
		}

		for (const seederFile of seeders) {
			await this.runSeeder(seederFile);
		}

		console.log("✅ All seeders completed successfully!");
	}

	public async runSpecific(seederName: string): Promise<void> {
		const seeders = await this.getAvailableSeeders();
		const seeder = seeders.find(
			(s) => s === seederName || s.includes(seederName),
		);

		if (!seeder) {
			throw new Error(`Seeder "${seederName}" not found`);
		}

		console.log(`Running specific seeder: ${seeder}`);
		await this.runSeeder(seeder);
		console.log("✅ Seeder completed successfully!");
	}

	private async runSeeder(seederFile: string): Promise<void> {
		const seederPath = join(this.seedersPath, seederFile);
		const sql = await readFile(seederPath, "utf-8");

		await this.db.transaction(async (client: PoolClient) => {
			console.log(`🌱 Running seeder: ${seederFile}`);

			// Split SQL by semicolons and execute each statement
			const statements = sql
				.split(";")
				.map((stmt) => stmt.trim())
				.filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

			for (const statement of statements) {
				if (statement.trim()) {
					await client.query(statement);
				}
			}

			console.log(`✅ Seeder ${seederFile} completed`);
		});
	}

	private async truncateTables(): Promise<void> {
		console.log("🧹 Truncating tables before seeding...");

		// Get all user tables (excluding system tables and schema_migrations)
		const result = await this.db.query<{ table_name: string }>(`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_type = 'BASE TABLE'
			AND table_name != 'schema_migrations'
			ORDER BY table_name
		`);

		const tableNames = result.rows.map(
			(row: { table_name: string }) => row.table_name,
		);

		if (tableNames.length === 0) {
			console.log("No tables to truncate");
			return;
		}

		await this.db.transaction(async (client: PoolClient) => {
			// Disable foreign key checks temporarily
			await client.query("SET session_replication_role = replica");

			// Truncate all tables
			for (const tableName of tableNames) {
				await client.query(
					`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`,
				);
				console.log(`   Truncated: ${tableName}`);
			}

			// Re-enable foreign key checks
			await client.query("SET session_replication_role = DEFAULT");
		});

		console.log(`✅ Truncated ${tableNames.length} table(s)`);
	}

	public async list(): Promise<void> {
		const seeders = await this.getAvailableSeeders();

		console.log("\\n🌱 Available seeders:");
		if (seeders.length === 0) {
			console.log("   No seeders found");
			return;
		}

		for (const seeder of seeders) {
			console.log(`   - ${seeder}`);
		}
	}
}
