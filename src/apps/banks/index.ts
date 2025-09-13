import { Hono } from "hono";
import { serve } from "@hono/node-server";
import banksRoutes from "../../contexts/banks/presentation/BanksController.js";
import bankGroupsRoutes from "../../contexts/banks/presentation/BankGroupsController.js";
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

app.get("/health/jwt", (c) => {
	return c.json({
		jwt: {
			status: "healthy",
			secretProvider: "AWSSecretsProvider",
		},
		service: "healthy",
		timestamp: new Date().toISOString(),
	});
});

// Register banks routes
app.route("/api/banks", banksRoutes);

// Register bank groups routes
app.route("/api/bank-groups", bankGroupsRoutes);

const port = parseInt(process.env.PORT || "3000", 10);

logger.info("Bank Service API starting", {
	port,
	environment: process.env.NODE_ENV || "development",
	endpoints: [
		`http://localhost:${port}/health`,
		`http://localhost:${port}/health/jwt`,
		`http://localhost:${port}/api/banks`,
		`http://localhost:${port}/api/bank-groups`,
	],
});

serve({
	fetch: app.fetch,
	port,
});

export default app;
