import { appendFileSync, existsSync, mkdirSync, statSync, unlinkSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import type { LogTransport } from "../../../domain/logging/LogTransport.js";

export interface FileTransportOptions {
	filename: string;
	maxSize?: number; // in bytes
	maxFiles?: number;
	rotateDaily?: boolean;
}

export class FileTransport implements LogTransport {
	private readonly filename: string;
	private readonly maxSize: number;
	private readonly maxFiles: number;
	private readonly rotateDaily: boolean;

	constructor(options: FileTransportOptions) {
		this.filename = options.filename;
		this.maxSize = options.maxSize ?? 10 * 1024 * 1024; // 10MB default
		this.maxFiles = options.maxFiles ?? 5;
		this.rotateDaily = options.rotateDaily ?? false;

		this.ensureDirectoryExists();
	}

	write(formattedMessage: string): void {
		const logFilename = this.getCurrentLogFilename();

		try {
			if (this.shouldRotate(logFilename)) {
				this.rotateFile(logFilename);
			}

			appendFileSync(logFilename, `${formattedMessage}\n`, { encoding: "utf8" });
		} catch (error) {
			console.error("Failed to write log to file:", error);
		}
	}

	private getCurrentLogFilename(): string {
		if (!this.rotateDaily) {
			return this.filename;
		}

		const date = new Date().toISOString().split("T")[0];
		const dir = dirname(this.filename);
		const basename = this.filename.split("/").pop()?.replace(".log", "") ?? "app";

		return join(dir, `${basename}-${date}.log`);
	}

	private shouldRotate(filename: string): boolean {
		if (!existsSync(filename)) {
			return false;
		}

		const stats = statSync(filename);
		return stats.size > this.maxSize;
	}

	private rotateFile(filename: string): void {
		for (let i = this.maxFiles - 1; i > 0; i--) {
			const currentFile = i === 1 ? filename : `${filename}.${i}`;
			const nextFile = `${filename}.${i + 1}`;

			if (existsSync(currentFile)) {
				if (i === this.maxFiles - 1) {
					// Delete oldest file
					try {
						unlinkSync(nextFile);
					} catch {
						// Ignore if file doesn't exist
					}
				}
				try {
					renameSync(currentFile, nextFile);
				} catch (error) {
					console.error(`Failed to rotate log file ${currentFile}:`, error);
				}
			}
		}
	}

	private ensureDirectoryExists(): void {
		const dir = dirname(this.filename);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
	}
}