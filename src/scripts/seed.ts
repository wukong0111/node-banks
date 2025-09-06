#!/usr/bin/env tsx

import { SeederRunner } from "../contexts/banks/infrastructure/database/SeederRunner.js";

const COMMANDS = {
	run: "Run all seeders in order",
	fresh: "Truncate tables and run all seeders",
	list: "List available seeders",
	specific: "Run a specific seeder",
} as const;

type Command = keyof typeof COMMANDS;

async function main(): Promise<void> {
	const command = process.argv[2] as Command;
	const param = process.argv[3];

	if (!command || !Object.keys(COMMANDS).includes(command)) {
		printUsage();
		process.exit(1);
	}

	const seederRunner = new SeederRunner();

	try {
		switch (command) {
			case "run":
				await seederRunner.run();
				break;
			case "fresh":
				await seederRunner.run({ truncate: true });
				break;
			case "list":
				await seederRunner.list();
				break;
			case "specific":
				if (!param) {
					console.error("❌ Seeder name is required for 'specific' command");
					printUsage();
					process.exit(1);
				}
				await seederRunner.runSpecific(param);
				break;
		}
	} catch (error) {
		console.error("❌ Seeding failed:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

function printUsage(): void {
	console.log("\\n🌱 Database Seeder CLI\\n");
	console.log("Usage: npm run db:seed <command> [options]\\n");
	
	console.log("Commands:");
	for (const [cmd, description] of Object.entries(COMMANDS)) {
		console.log(`  ${cmd.padEnd(10)} ${description}`);
	}
	
	console.log("\\nExamples:");
	console.log("  npm run db:seed run                         # Run all seeders");
	console.log("  npm run db:seed fresh                       # Truncate tables and run all seeders");
	console.log("  npm run db:seed list                        # List available seeders");
	console.log("  npm run db:seed specific 001_bank_groups    # Run specific seeder");
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