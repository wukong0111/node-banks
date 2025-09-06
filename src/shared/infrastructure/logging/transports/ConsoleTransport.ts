import type { LogTransport } from "../../../domain/logging/LogTransport.js";

export interface ConsoleTransportOptions {
	useStderr?: boolean;
}

export class ConsoleTransport implements LogTransport {
	constructor(private options: ConsoleTransportOptions = {}) {}

	write(formattedMessage: string): void {
		if (this.options.useStderr) {
			console.error(formattedMessage);
		} else {
			console.log(formattedMessage);
		}
	}
}