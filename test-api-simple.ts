import { SignJWT } from "jose";

// JWT Configuration from .env
const secret = "your-super-secret-jwt-key-at-least-32-characters-long";
const secretKey = new TextEncoder().encode(secret);

async function generateServiceJWT() {
	const jwt = new SignJWT({
		sub: "service-auth",
		service_type: "internal",
		permissions: ["banks:read", "banks:write"],
		environment: "development",
	})
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setIssuer("bank-service")
		.setExpirationTime("24h")
		.setAudience("bank-api");

	const token = await jwt.sign(secretKey);
	console.log(token);
}

generateServiceJWT().catch(console.error);
