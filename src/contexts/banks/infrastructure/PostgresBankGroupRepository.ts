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
