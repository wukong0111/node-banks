import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class PasswordHasher {
	static async hash(password: string): Promise<string> {
		const salt = randomBytes(16).toString("hex");
		const buf = (await scryptAsync(password, salt, 64)) as Buffer;
		return `${buf.toString("hex")}.${salt}`;
	}

	static async compare(
		password: string,
		hashedPassword: string,
	): Promise<boolean> {
		const [hashedPasswordWithoutSalt, salt] = hashedPassword.split(".");
		const buf = (await scryptAsync(password, salt, 64)) as Buffer;
		return timingSafeEqual(buf, Buffer.from(hashedPasswordWithoutSalt, "hex"));
	}
}
