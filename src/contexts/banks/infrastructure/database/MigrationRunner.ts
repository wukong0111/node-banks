import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseConnection } from "./DatabaseConnection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Migration {
	version: string;
	executedAt: Date;
}

export class MigrationRunner {
	private db: DatabaseConnection;
	private migrationsPath: string;

	constructor() {
		this.db = DatabaseConnection.getInstance();
		this.migrationsPath = join(__dirname, "migrations");
	}

	public async ensureMigrationsTable(): Promise<void> {
		const createTableSQL = `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;

		await this.db.query(createTableSQL);
	}

	public async getExecutedMigrations(): Promise<string[]> {
		await this.ensureMigrationsTable();
		const result = await this.db.query<Migration>(
			"SELECT version FROM schema_migrations ORDER BY version",
		);
		return result.rows.map((row) => row.version);
	}

	public async getAvailableMigrations(): Promise<string[]> {
		const files = await readdir(this.migrationsPath);
		const upMigrations = files
			.filter((file) => file.endsWith(".up.sql"))
			.map((file) => file.replace(".up.sql", ""))
			.sort();
		return upMigrations;
	}

	public async getPendingMigrations(): Promise<string[]> {
		const executed = await this.getExecutedMigrations();
		const available = await this.getAvailableMigrations();
		return available.filter((migration) => !executed.includes(migration));
	}

	public async up(targetVersion?: string): Promise<void> {
		let pending = await this.getPendingMigrations();

		if (targetVersion) {
			const targetIndex = pending.indexOf(targetVersion);
			if (targetIndex === -1) {
				throw new Error(`Migration ${targetVersion} not found or already executed`);
			}
			pending = pending.slice(0, targetIndex + 1);
		}

		if (pending.length === 0) {
			console.log("No pending migrations to run");
			return;
		}

		console.log(`Running ${pending.length} migration(s)...`);

		for (const version of pending) {
			await this.runMigrationUp(version);
		}

		console.log("✅ All migrations completed successfully!");
	}

	public async down(steps = 1): Promise<void> {
		const executed = await this.getExecutedMigrations();
		const toRollback = executed.slice(-steps).reverse();

		if (toRollback.length === 0) {
			console.log("No migrations to rollback");
			return;
		}

		console.log(`Rolling back ${toRollback.length} migration(s)...`);

		for (const version of toRollback) {
			await this.runMigrationDown(version);
		}

		console.log("✅ Rollback completed successfully!");
	}

	public async reset(): Promise<void> {
		const executed = await this.getExecutedMigrations();
		
		if (executed.length === 0) {
			console.log("No migrations to rollback");
			return;
		}

		console.log(`Rolling back all ${executed.length} migration(s)...`);

		for (const version of executed.reverse()) {
			await this.runMigrationDown(version);
		}

		console.log("✅ Database reset completed!");
	}

	public async status(): Promise<void> {
		const executed = await this.getExecutedMigrations();
		const available = await this.getAvailableMigrations();
		const pending = await this.getPendingMigrations();

		console.log("\\n🗂️  Migration Status:");
		console.log(`   Total migrations: ${available.length}`);
		console.log(`   Executed: ${executed.length}`);
		console.log(`   Pending: ${pending.length}`);

		if (pending.length > 0) {
			console.log("\\n⏳ Pending migrations:");
			for (const migration of pending) {
				console.log(`   - ${migration}`);
			}
		}

		if (executed.length > 0) {
			console.log("\\n✅ Executed migrations:");
			for (const migration of executed) {
				console.log(`   - ${migration}`);
			}
		}
	}

	private async runMigrationUp(version: string): Promise<void> {
		const upFile = join(this.migrationsPath, `${version}.up.sql`);
		const sql = await readFile(upFile, "utf-8");

		await this.db.transaction(async (client) => {
			console.log(`⬆️  Running migration: ${version}`);
			
			// Execute the migration SQL
			await client.query(sql);
			
			// Record the migration as executed
			await client.query(
				"INSERT INTO schema_migrations (version) VALUES ($1)",
				[version],
			);
			
			console.log(`✅ Migration ${version} completed`);
		});
	}

	private async runMigrationDown(version: string): Promise<void> {
		const downFile = join(this.migrationsPath, `${version}.down.sql`);
		const sql = await readFile(downFile, "utf-8");

		await this.db.transaction(async (client) => {
			console.log(`⬇️  Rolling back migration: ${version}`);
			
			// Execute the rollback SQL
			await client.query(sql);
			
			// Remove the migration from executed list
			await client.query(
				"DELETE FROM schema_migrations WHERE version = $1",
				[version],
			);
			
			console.log(`✅ Migration ${version} rolled back`);
		});
	}
}