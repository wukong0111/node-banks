import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hash(password: string): Promise<string> {
	const salt = randomBytes(16).toString("hex");
	const buf = (await scryptAsync(password, salt, 64)) as Buffer;
	return `${buf.toString("hex")}.${salt}`;
}

export async function compare(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	const [hashedPasswordWithoutSalt, salt] = hashedPassword.split(".");
	const buf = (await scryptAsync(password, salt, 64)) as Buffer;
	return timingSafeEqual(buf, Buffer.from(hashedPasswordWithoutSalt, "hex"));
}
