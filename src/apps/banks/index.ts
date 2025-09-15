import { Hono } from "hono";
import { serve } from "@hono/node-server";
import registerBankRoutes from "../../contexts/banks/presentation/BanksController.js";
import registerBankGroupRoutes from "../../contexts/banks/presentation/BankGroupsController.js";
import registerUserRoutes from "../../contexts/users/presentation/UsersController.js";
import { createLogger } from "../../shared/infrastructure/logging/LoggerFactory.js";

const logger = createLogger().withContext({ service: "BankServiceAPI" });
const app = new Hono();

// Health check endpoints (as per API documentation)
app.get("/health", (c) => {
	return c.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		version: "1.0.0",
		environment: process.env.NODE_ENV || "development",
	});
});

// Register banks routes
registerBankRoutes(app);

// Register bank groups routes
registerBankGroupRoutes(app);

// Register users routes
registerUserRoutes(app);

const port = parseInt(process.env.PORT || "3000", 10);

logger.info("Bank Service API starting", {
	port,
	environment: process.env.NODE_ENV || "development",
	endpoints: [
		`http://localhost:${port}/health`,
		`http://localhost:${port}/api/banks`,
		`http://localhost:${port}/api/bank-groups`,
		`http://localhost:${port}/app/users/register`,
		`http://localhost:${port}/app/users/login`,
	],
});

serve({
	fetch: app.fetch,
	port,
});

export default app;
