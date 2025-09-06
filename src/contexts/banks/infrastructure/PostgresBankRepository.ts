import type { BankRepository } from "../domain/BankRepository.js";
import type { Bank, BankFilters, PaginatedApiResponse } from "../domain/Bank.js";
import { DatabaseConnection } from "./database/DatabaseConnection.js";

interface BankRow {
	bank_id: string;
	name: string;
	bank_codes: string;
	api: string;
	api_version: string;
	aspsp: string;
	country: string;
	auth_type_choice_required: boolean;
	bic: string | null;
	real_name: string | null;
	product_code: string | null;
	bank_group_id: string | null;
	logo_url: string | null;
	documentation: string | null;
	keywords: object | null;
	attribute: object | null;
}

export class PostgresBankRepository implements BankRepository {
	private db: DatabaseConnection;

	constructor() {
		this.db = DatabaseConnection.getInstance();
	}

	public async findAll(filters: BankFilters): Promise<PaginatedApiResponse<Bank[]>> {
		const page = filters.page || 1;
		const limit = Math.min(filters.limit || 50, 100); // Max 100 items per page
		const offset = (page - 1) * limit;

		// Build WHERE conditions
		const conditions: string[] = [];
		const params: unknown[] = [];
		let paramIndex = 1;

		if (filters.name) {
			conditions.push(`b.name ILIKE $${paramIndex}`);
			params.push(`%${filters.name}%`);
			paramIndex++;
		}

		if (filters.api) {
			conditions.push(`b.api ILIKE $${paramIndex}`);
			params.push(`%${filters.api}%`);
			paramIndex++;
		}

		if (filters.country) {
			conditions.push(`b.country = $${paramIndex}`);
			params.push(filters.country.toUpperCase());
			paramIndex++;
		}

		const whereClause = conditions.length > 0 
			? `WHERE ${conditions.join(" AND ")}` 
			: "";

		// Count total records
		const countQuery = `
			SELECT COUNT(*) as total
			FROM banks b
			${whereClause}
		`;
		
		const countResult = await this.db.query<{ total: string }>(countQuery, params);
		const total = Number.parseInt(countResult.rows[0]?.total || "0", 10);

		// Get paginated results
		const dataQuery = `
			SELECT 
				b.bank_id,
				b.name,
				b.bank_codes,
				b.api,
				b.api_version,
				b.aspsp,
				b.country,
				b.auth_type_choice_required,
				b.bic,
				b.real_name,
				b.product_code,
				b.bank_group_id,
				b.logo_url,
				b.documentation,
				b.keywords,
				b.attribute
			FROM banks b
			${whereClause}
			ORDER BY b.name ASC
			LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
		`;

		params.push(limit, offset);
		
		const result = await this.db.query<BankRow>(dataQuery, params);

		// Transform rows to domain objects
		const banks: Bank[] = result.rows.map(this.mapRowToBank);

		const totalPages = Math.ceil(total / limit);

		return {
			success: true,
			data: banks,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
			timestamp: new Date().toISOString(),
		};
	}

	public async findById(bankId: string): Promise<Bank | null> {
		const query = `
			SELECT 
				b.bank_id,
				b.name,
				b.bank_codes,
				b.api,
				b.api_version,
				b.aspsp,
				b.country,
				b.auth_type_choice_required,
				b.bic,
				b.real_name,
				b.product_code,
				b.bank_group_id,
				b.logo_url,
				b.documentation,
				b.keywords,
				b.attribute
			FROM banks b
			WHERE b.bank_id = $1
		`;

		const result = await this.db.query<BankRow>(query, [bankId]);
		
		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToBank(result.rows[0]);
	}

	public async count(filters: Omit<BankFilters, 'page' | 'limit'>): Promise<number> {
		const conditions: string[] = [];
		const params: unknown[] = [];
		let paramIndex = 1;

		if (filters.name) {
			conditions.push(`b.name ILIKE $${paramIndex}`);
			params.push(`%${filters.name}%`);
			paramIndex++;
		}

		if (filters.api) {
			conditions.push(`b.api ILIKE $${paramIndex}`);
			params.push(`%${filters.api}%`);
			paramIndex++;
		}

		if (filters.country) {
			conditions.push(`b.country = $${paramIndex}`);
			params.push(filters.country.toUpperCase());
			paramIndex++;
		}

		const whereClause = conditions.length > 0 
			? `WHERE ${conditions.join(" AND ")}` 
			: "";

		const query = `
			SELECT COUNT(*) as total
			FROM banks b
			${whereClause}
		`;
		
		const result = await this.db.query<{ total: string }>(query, params);
		return Number.parseInt(result.rows[0]?.total || "0", 10);
	}

	private mapRowToBank(row: BankRow): Bank {
		return {
			bank_id: row.bank_id,
			name: row.name,
			bank_codes: JSON.parse(row.bank_codes || "[]") as string[],
			api: row.api,
			api_version: row.api_version,
			aspsp: row.aspsp,
			country: row.country,
			auth_type_choice_required: row.auth_type_choice_required,
			bic: row.bic,
			real_name: row.real_name,
			product_code: row.product_code,
			bank_group_id: row.bank_group_id,
			logo_url: row.logo_url,
			documentation: row.documentation,
			keywords: row.keywords,
			attribute: row.attribute,
		};
	}
}