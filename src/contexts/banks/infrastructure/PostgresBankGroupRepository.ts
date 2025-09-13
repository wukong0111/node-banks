import type { BankGroupRepository } from "../domain/BankGroupRepository.js";
import type { BankGroup } from "../domain/BankGroup.js";
import { DatabaseConnection } from "./database/DatabaseConnection.js";

interface BankGroupRow {
	group_id: string;
	name: string;
	description: string | null;
	logo_url: string | null;
	website: string | null;
	created_at: string;
	updated_at: string;
}

export class PostgresBankGroupRepository implements BankGroupRepository {
	private db: DatabaseConnection;

	constructor() {
		this.db = DatabaseConnection.getInstance();
	}

	public async findAll(): Promise<BankGroup[]> {
		const query = `
			SELECT
				group_id,
				name,
				description,
				logo_url,
				website,
				created_at,
				updated_at
			FROM bank_groups
			ORDER BY name ASC
		`;

		const result = await this.db.query<BankGroupRow>(query);

		// Transform rows to domain objects
		const bankGroups: BankGroup[] = result.rows.map(this.mapRowToBankGroup);

		return bankGroups;
	}

	public async findById(id: string): Promise<BankGroup | null> {
		const query = `
			SELECT
				group_id,
				name,
				description,
				logo_url,
				website,
				created_at,
				updated_at
			FROM bank_groups
			WHERE group_id = $1
		`;

		const result = await this.db.query<BankGroupRow>(query, [id]);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToBankGroup(result.rows[0]);
	}

	public async create(bankGroup: BankGroup): Promise<void> {
		const query = `
			INSERT INTO bank_groups (
				group_id,
				name,
				description,
				logo_url,
				website,
				created_at,
				updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7)
		`;

		await this.db.query(query, [
			bankGroup.group_id,
			bankGroup.name,
			bankGroup.description,
			bankGroup.logo_url,
			bankGroup.website,
			bankGroup.created_at,
			bankGroup.updated_at,
		]);
	}

	public async update(
		id: string,
		updates: Partial<BankGroup>,
	): Promise<BankGroup> {
		// Build dynamic SET clause based on provided updates
		const setClauses: string[] = [];
		const values: (string | null)[] = [];
		let paramIndex = 1;

		if (updates.name !== undefined) {
			setClauses.push(`name = $${paramIndex}`);
			values.push(updates.name);
			paramIndex++;
		}

		if (updates.description !== undefined) {
			setClauses.push(`description = $${paramIndex}`);
			values.push(updates.description);
			paramIndex++;
		}

		if (updates.logo_url !== undefined) {
			setClauses.push(`logo_url = $${paramIndex}`);
			values.push(updates.logo_url);
			paramIndex++;
		}

		if (updates.website !== undefined) {
			setClauses.push(`website = $${paramIndex}`);
			values.push(updates.website);
			paramIndex++;
		}

		// Always update updated_at timestamp
		setClauses.push(`updated_at = $${paramIndex}`);
		values.push(new Date().toISOString());
		paramIndex++;

		// Add WHERE clause parameter
		values.push(id);

		const query = `
			UPDATE bank_groups
			SET ${setClauses.join(", ")}
			WHERE group_id = $${paramIndex}
			RETURNING
				group_id,
				name,
				description,
				logo_url,
				website,
				created_at,
				updated_at
		`;

		const result = await this.db.query<BankGroupRow>(query, values);

		if (result.rows.length === 0) {
			throw new Error(`Bank group with id ${id} not found`);
		}

		return this.mapRowToBankGroup(result.rows[0]);
	}

	private mapRowToBankGroup(row: BankGroupRow): BankGroup {
		return {
			group_id: row.group_id,
			name: row.name,
			description: row.description,
			logo_url: row.logo_url,
			website: row.website,
			created_at: row.created_at,
			updated_at: row.updated_at,
		};
	}
}
