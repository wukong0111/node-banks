import { JWTService } from "../shared/infrastructure/auth/JWTService.js";
import { Permission } from "../shared/domain/auth/Permission.js";

// This script generates JWT tokens for testing purposes
async function generateTestTokens() {
	try {
		// Set test JWT secret if not provided
		if (!process.env.JWT_SECRET) {
			process.env.JWT_SECRET = "test-secret-key-for-development-only-never-use-in-production";
		}

		const jwtService = JWTService.getInstance();

		// Token with read-only permissions
		const readOnlyToken = await jwtService.generateToken({
			iss: "bank-service",
			sub: "test-service-readonly",
			service_type: "internal",
			permissions: [Permission.BANKS_READ],
			environment: "development"
		});

		// Token with full permissions
		const fullAccessToken = await jwtService.generateToken({
			iss: "bank-service", 
			sub: "test-service-full",
			service_type: "internal",
			permissions: [Permission.BANKS_READ, Permission.BANKS_WRITE],
			environment: "development"
		});

		// Token for production environment
		const productionToken = await jwtService.generateToken({
			iss: "bank-service",
			sub: "production-service",
			service_type: "internal",
			permissions: [Permission.BANKS_READ, Permission.BANKS_WRITE],
			environment: "production"
		});

		console.log("🔐 Generated JWT Tokens for Testing");
		console.log("=====================================");
		console.log();
		
		console.log("📖 READ ONLY TOKEN (banks:read):");
		console.log(`Authorization: Bearer ${readOnlyToken}`);
		console.log();
		
		console.log("🔓 FULL ACCESS TOKEN (banks:read + banks:write):");
		console.log(`Authorization: Bearer ${fullAccessToken}`);
		console.log();
		
		console.log("🏭 PRODUCTION TOKEN (banks:read + banks:write):");
		console.log(`Authorization: Bearer ${productionToken}`);
		console.log();
		
		console.log("💡 Usage Examples:");
		console.log(`curl -H "Authorization: Bearer ${readOnlyToken}" http://localhost:3000/api/banks`);
		console.log(`curl -H "Authorization: Bearer ${fullAccessToken}" http://localhost:3000/api/banks/santander_es/details`);

	} catch (error) {
		console.error("❌ Error generating tokens:", error);
		process.exit(1);
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	generateTestTokens();
}

export { generateTestTokens };