import type { UserRepository } from "../domain/UserRepository.js";
import type {
	User,
	CreateUserRequest,
	UpdateUserRequest,
} from "../domain/User.js";
import { DatabaseConnection } from "../../../shared/infrastructure/database/DatabaseConnection.js";

interface UserRow {
	user_id: string;
	email: string;
	password_hash: string;
	first_name: string;
	last_name: string;
	is_active: boolean;
	email_verified: boolean;
	created_at: Date;
	updated_at: Date;
}

export class PostgresUserRepository implements UserRepository {
	private db: DatabaseConnection;

	constructor() {
		this.db = DatabaseConnection.getInstance();
	}

	public async findByEmail(email: string): Promise<User | null> {
		const query = `
      SELECT 
        user_id, email, password_hash, first_name, last_name, 
        is_active, email_verified, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;

		const result = await this.db.query<UserRow>(query, [email]);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToUser(result.rows[0]);
	}

	public async findById(userId: string): Promise<User | null> {
		const query = `
      SELECT 
        user_id, email, password_hash, first_name, last_name, 
        is_active, email_verified, created_at, updated_at
      FROM users 
      WHERE user_id = $1
    `;

		const result = await this.db.query<UserRow>(query, [userId]);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToUser(result.rows[0]);
	}

	public async create(request: CreateUserRequest): Promise<User> {
		const query = `
      INSERT INTO users (
        email, password_hash, first_name, last_name, 
        is_active, email_verified, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, 
        true, false, NOW(), NOW()
      )
      RETURNING 
        user_id, email, password_hash, first_name, last_name, 
        is_active, email_verified, created_at, updated_at
    `;

		const result = await this.db.query<UserRow>(query, [
			request.email,
			request.password,
			request.firstName,
			request.lastName,
		]);

		return this.mapRowToUser(result.rows[0]);
	}

	public async update(
		userId: string,
		updates: UpdateUserRequest,
	): Promise<User | null> {
		const updateFields: string[] = [];
		const values: unknown[] = [];
		let paramIndex = 1;

		if (updates.firstName !== undefined) {
			updateFields.push(`first_name = $${paramIndex}`);
			values.push(updates.firstName);
			paramIndex++;
		}

		if (updates.lastName !== undefined) {
			updateFields.push(`last_name = $${paramIndex}`);
			values.push(updates.lastName);
			paramIndex++;
		}

		if (updateFields.length === 0) {
			return await this.findById(userId);
		}

		updateFields.push(`updated_at = NOW()`);
		values.push(userId);

		const query = `
      UPDATE users 
      SET ${updateFields.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING 
        user_id, email, password_hash, first_name, last_name, 
        is_active, email_verified, created_at, updated_at
    `;

		const result = await this.db.query<UserRow>(query, values);

		if (result.rows.length === 0) {
			return null;
		}

		return this.mapRowToUser(result.rows[0]);
	}

	public async delete(userId: string): Promise<boolean> {
		const query = "DELETE FROM users WHERE user_id = $1";
		const result = await this.db.query(query, [userId]);
		return (result.rowCount || 0) > 0;
	}

	public async existsByEmail(email: string): Promise<boolean> {
		const query = "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)";
		const result = await this.db.query<{ exists: boolean }>(query, [email]);
		return result.rows[0]?.exists || false;
	}

	private mapRowToUser(row: UserRow): User {
		return {
			userId: row.user_id,
			email: row.email,
			passwordHash: row.password_hash,
			firstName: row.first_name,
			lastName: row.last_name,
			isActive: row.is_active,
			emailVerified: row.email_verified,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	}
}
