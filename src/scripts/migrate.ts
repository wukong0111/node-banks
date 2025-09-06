#!/usr/bin/env tsx

import { MigrationRunner } from "../contexts/banks/infrastructure/database/MigrationRunner.js";

const COMMANDS = {
	up: "Run pending migrations",
	down: "Rollback last migration(s)",
	status: "Show migration status",
	reset: "Rollback all migrations",
} as const;

type Command = keyof typeof COMMANDS;

async function main(): Promise<void> {
	const command = process.argv[2] as Command;
	const param = process.argv[3];

	if (!command || !Object.keys(COMMANDS).includes(command)) {
		printUsage();
		process.exit(1);
	}

	const migrationRunner = new MigrationRunner();

	try {
		switch (command) {
			case "up":
				await migrationRunner.up(param);
				break;
			case "down": {
				const steps = param ? Number.parseInt(param, 10) : 1;
				if (Number.isNaN(steps) || steps < 1) {
					console.error("❌ Steps must be a positive number");
					process.exit(1);
				}
				await migrationRunner.down(steps);
				break;
			}
			case "status":
				await migrationRunner.status();
				break;
			case "reset":
				await migrationRunner.reset();
				break;
		}
	} catch (error) {
		console.error("❌ Migration failed:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

function printUsage(): void {
	console.log("\\n🎮 Database Migration CLI\\n");
	console.log("Usage: npm run db:migrate <command> [options]\\n");
	
	console.log("Commands:");
	for (const [cmd, description] of Object.entries(COMMANDS)) {
		console.log(`  ${cmd.padEnd(8)} ${description}`);
	}
	
	console.log("\\nExamples:");
	console.log("  npm run db:migrate up                    # Run all pending migrations");
	console.log("  npm run db:migrate up 002_create_banks   # Run migrations up to specific version");
	console.log("  npm run db:migrate down                  # Rollback last migration");
	console.log("  npm run db:migrate down 2                # Rollback last 2 migrations");
	console.log("  npm run db:migrate status                # Show migration status");
	console.log("  npm run db:migrate reset                 # Rollback all migrations");
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
	console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
	process.exit(1);
});

// Run the main function
main().catch((error) => {
	console.error("❌ Fatal error:", error);
	process.exit(1);
});