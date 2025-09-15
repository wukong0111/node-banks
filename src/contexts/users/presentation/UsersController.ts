import type { Hono } from "hono";
import type { RegisterUserRequest } from "../application/dto/RegisterUserRequest.js";
import type { LoginUserRequest } from "../application/dto/LoginUserRequest.js";
import type { UpdateUserProfileRequest } from "../application/dto/UpdateUserProfileRequest.js";
import { deps } from "./dependencies.js";

export default function registerUserRoutes(app: Hono) {
	// Register user
	app.post("/app/users/register", async (c) => {
		try {
			const requestBody = await c.req.json();
			const request: RegisterUserRequest = requestBody;

			const result = await deps.registerUserUseCase.execute(request);

			if (!result.success) {
				return c.json(
					{
						success: false,
						error: result.error,
						timestamp: new Date().toISOString(),
					},
					400,
				);
			}

			return c.json(result.data, 201);
		} catch (error) {
			deps.logger.error("Error registering user", {
				error: error instanceof Error ? error.message : String(error),
			});
			return c.json(
				{
					success: false,
					error: "Internal server error",
					timestamp: new Date().toISOString(),
				},
				500,
			);
		}
	});

	// Login user
	app.post("/app/users/login", async (c) => {
		try {
			const requestBody = await c.req.json();
			const request: LoginUserRequest = requestBody;

			const result = await deps.loginUserUseCase.execute(request);

			if (!result.success) {
				return c.json(
					{
						success: false,
						error: result.error,
						timestamp: new Date().toISOString(),
					},
					401,
				);
			}

			return c.json(result.data, 200);
		} catch (error) {
			deps.logger.error("Error logging in user", {
				error: error instanceof Error ? error.message : String(error),
			});
			return c.json(
				{
					success: false,
					error: "Internal server error",
					timestamp: new Date().toISOString(),
				},
				500,
			);
		}
	});

	// Get user profile
	app.get("/app/users/profile", async (c) => {
		try {
			// TODO: Add JWT middleware to extract user ID from token
			const userId =
				c.req.header("Authorization")?.replace("Bearer ", "") || "temp-user-id";

			const result = await deps.getUserProfileUseCase.execute(userId);

			if (!result.success) {
				return c.json(
					{
						success: false,
						error: result.error,
						timestamp: new Date().toISOString(),
					},
					404,
				);
			}

			return c.json(result.data, 200);
		} catch (error) {
			deps.logger.error("Error getting user profile", {
				error: error instanceof Error ? error.message : String(error),
			});
			return c.json(
				{
					success: false,
					error: "Internal server error",
					timestamp: new Date().toISOString(),
				},
				500,
			);
		}
	});

	// Update user profile
	app.put("/app/users/profile", async (c) => {
		try {
			// TODO: Add JWT middleware to extract user ID from token
			const userId =
				c.req.header("Authorization")?.replace("Bearer ", "") || "temp-user-id";
			const requestBody = await c.req.json();
			const request: UpdateUserProfileRequest = requestBody;

			const result = await deps.updateUserProfileUseCase.execute(
				userId,
				request,
			);

			if (!result.success) {
				return c.json(
					{
						success: false,
						error: result.error,
						timestamp: new Date().toISOString(),
					},
					400,
				);
			}

			return c.json(result.data, 200);
		} catch (error) {
			deps.logger.error("Error updating user profile", {
				error: error instanceof Error ? error.message : String(error),
			});
			return c.json(
				{
					success: false,
					error: "Internal server error",
					timestamp: new Date().toISOString(),
				},
				500,
			);
		}
	});

	// Delete user account
	app.delete("/app/users/profile", async (c) => {
		try {
			// TODO: Add JWT middleware to extract user ID from token
			const userId =
				c.req.header("Authorization")?.replace("Bearer ", "") || "temp-user-id";

			const user = await deps.getUserProfileUseCase.execute(userId);
			if (!user.success) {
				return c.json(
					{
						success: false,
						error: "User not found",
						timestamp: new Date().toISOString(),
					},
					404,
				);
			}

			// TODO: Implement delete use case
			return c.json(
				{
					success: true,
					message: "User account deleted successfully",
					timestamp: new Date().toISOString(),
				},
				200,
			);
		} catch (error) {
			deps.logger.error("Error deleting user account", {
				error: error instanceof Error ? error.message : String(error),
			});
			return c.json(
				{
					success: false,
					error: "Internal server error",
					timestamp: new Date().toISOString(),
				},
				500,
			);
		}
	});
}
