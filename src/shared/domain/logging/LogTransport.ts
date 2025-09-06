export interface LogTransport {
	write(formattedMessage: string): void | Promise<void>;
}