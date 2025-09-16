import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { createLogger } from "../../../shared/infrastructure/logging/LoggerFactory.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const logger = createLogger().withContext({ service: "FrontendRoutes" });

const frontendRoutes = new Hono();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to read HTML files
function serveHtmlFile(filePath: string) {
	try {
		const html = readFileSync(filePath, "utf-8");
		return html;
	} catch (error) {
		logger.error("Failed to read HTML file", { filePath, error });
		throw new Error(`HTML file not found: ${filePath}`);
	}
}

// Serve static files
frontendRoutes.use(
	"/static/*",
	serveStatic({
		root: join(process.cwd(), "src/apps/banks/frontend/public"),
		rewriteRequestPath: (path) => path.replace("/static", ""),
	}),
);

// Serve HTML views
frontendRoutes.get("/register", (c) => {
	logger.info("Serving registration page");
	const html = serveHtmlFile(join(__dirname, "views/auth/register.html"));
	return c.html(html);
});

frontendRoutes.get("/login", (c) => {
	logger.info("Serving login page");
	const html = serveHtmlFile(join(__dirname, "views/auth/login.html"));
	return c.html(html);
});

frontendRoutes.get("/dashboard", (c) => {
	logger.info("Serving dashboard page");
	const html = serveHtmlFile(join(__dirname, "views/auth/dashboard.html"));
	return c.html(html);
});

export default frontendRoutes;
