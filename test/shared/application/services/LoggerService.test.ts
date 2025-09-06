import { describe, it, expect, beforeEach, vi } from "vitest";
import { LoggerService } from "@shared/application/services/LoggerService.js";
import { LogLevel } from "@shared/domain/logging/LogLevel.js";
import type { LogTransport } from "@shared/domain/logging/LogTransport.js";
import type { LogFormatter } from "@shared/domain/logging/LogFormatter.js";
import type { LogEntry } from "@shared/domain/logging/LogEntry.js";

// Mock implementations
class MockTransport implements LogTransport {
	public messages: string[] = [];
	
	write(message: string): void {
		this.messages.push(message);
	}
}

class MockFormatter implements LogFormatter {
	format(entry: LogEntry): string {
		return JSON.stringify({
			level: entry.level,
			message: entry.message,
			timestamp: entry.timestamp,
			...entry.context,
			...entry.metadata,
			...(entry.error && { error: entry.error })
		});
	}
}

describe("LoggerService", () => {
	let mockTransport1: MockTransport;
	let mockTransport2: MockTransport;
	let mockFormatter: MockFormatter;
	let logger: LoggerService;

	beforeEach(() => {
		mockTransport1 = new MockTransport();
		mockTransport2 = new MockTransport();
		mockFormatter = new MockFormatter();
		
		logger = new LoggerService([
			{ transport: mockTransport1, formatter: mockFormatter },
			{ transport: mockTransport2, formatter: mockFormatter }
		], LogLevel.DEBUG);
	});

	describe("log level filtering", () => {
		it("should log messages at or above the configured level", () => {
			const logger = new LoggerService([
				{ transport: mockTransport1, formatter: mockFormatter }
			], LogLevel.WARN);

			logger.debug("Debug message");
			logger.info("Info message");
			logger.warn("Warn message");
			logger.error("Error message");

			expect(mockTransport1.messages).toHaveLength(2);
			expect(mockTransport1.messages[0]).toContain("Warn message");
			expect(mockTransport1.messages[1]).toContain("Error message");
		});
	});

	describe("multiple transports", () => {
		it("should write to all configured transports", () => {
			logger.info("Test message");

			expect(mockTransport1.messages).toHaveLength(1);
			expect(mockTransport2.messages).toHaveLength(1);
			expect(mockTransport1.messages[0]).toContain("Test message");
			expect(mockTransport2.messages[0]).toContain("Test message");
		});
	});

	describe("context handling", () => {
		it("should include context in log entries", () => {
			logger.info("Test with context", { userId: "123", action: "login" });

			const logMessage = JSON.parse(mockTransport1.messages[0]);
			expect(logMessage.userId).toBe("123");
			expect(logMessage.action).toBe("login");
		});

		it("should include default metadata", () => {
			const loggerWithMetadata = new LoggerService([
				{ transport: mockTransport1, formatter: mockFormatter }
			], LogLevel.INFO, { service: "TestService", version: "1.0" });

			loggerWithMetadata.info("Test message");

			const logMessage = JSON.parse(mockTransport1.messages[0]);
			expect(logMessage.service).toBe("TestService");
			expect(logMessage.version).toBe("1.0");
		});
	});

	describe("error handling", () => {
		it("should handle Error objects in context", () => {
			const testError = new Error("Test error");
			logger.error("Something went wrong", testError);

			const logMessage = JSON.parse(mockTransport1.messages[0]);
			expect(logMessage.error).toBeDefined();
			expect(logMessage.error.name).toBe("Error");
			expect(logMessage.error.message).toBe("Test error");
			expect(logMessage.error.stack).toBeDefined();
		});

		it("should handle transport failures gracefully", () => {
			const failingTransport: LogTransport = {
				write: () => { throw new Error("Transport failed"); }
			};

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			const loggerWithFailingTransport = new LoggerService([
				{ transport: failingTransport, formatter: mockFormatter },
				{ transport: mockTransport1, formatter: mockFormatter }
			]);

			loggerWithFailingTransport.info("Test message");

			// Should still write to working transport
			expect(mockTransport1.messages).toHaveLength(1);
			// Should log transport error
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Failed to write log via transport")
			);

			consoleSpy.mockRestore();
		});
	});

	describe("withContext", () => {
		it("should create new logger instance with additional context", () => {
			const contextLogger = logger.withContext({ requestId: "abc-123" });

			contextLogger.info("Test message");

			const logMessage = JSON.parse(mockTransport1.messages[0]);
			expect(logMessage.requestId).toBe("abc-123");
		});
	});

	describe("log methods", () => {
		it("should support all log levels", () => {
			logger.debug("Debug message");
			logger.info("Info message");
			logger.warn("Warn message");
			logger.error("Error message");
			logger.fatal("Fatal message");

			expect(mockTransport1.messages).toHaveLength(5);
			
			const messages = mockTransport1.messages.map(msg => JSON.parse(msg));
			expect(messages[0].level).toBe(LogLevel.DEBUG);
			expect(messages[1].level).toBe(LogLevel.INFO);
			expect(messages[2].level).toBe(LogLevel.WARN);
			expect(messages[3].level).toBe(LogLevel.ERROR);
			expect(messages[4].level).toBe(LogLevel.FATAL);
		});
	});
});