/** Size of an IO operation on a handler */
type IOSize = "bit" | "word" | "dword";

/** Base IOHandler interface */
interface IOHandler {
	/** Type of the IO Handler */
	type: string;
	/** IP Address on the local network (required for network-based handlers) */
	ip?: string;

	/** IOScannerInterval */
	ioScannerInterval?: number;
}

interface EX260Sx extends IOHandler {
	type: "ex260sx";
	ip: string;
	/** Corresponding size of the EX260 (either 16 outputs or 32 outputs) */
	size: 16 | 32;
}

interface WAGO extends IOHandler {
	type: "wago";
	ip: string;
}

interface RevolutionPi extends IOHandler {
	type: "revolutionpi";
	/** Path to the piControl process image. Defaults to /dev/piControl0 */
	devicePath?: string;
}

type IOHandlers = (WAGO | EX260Sx | RevolutionPi) & IOHandler;

/** IOPhysicalController Boilerplate */
interface IOBase extends IOHandler {
	/** Is the controller connected */
	connected: boolean;

	/** Is the controller unreachable */
	unreachable: boolean;

	/** Function to connect to the controller */
	connect(): Promise<boolean>;

	/**
	 * Writes data on the controller
	 * @param address Address to write data to
	 * @param data Data to write
	 * @param size Size of the operation — "bit", "word" (16-bit) or "dword" (32-bit). Defaults to "bit".
	 */
	writeData(address: number, data: number, size?: IOSize): Promise<void>;

	/**
	 * Reads data from the controller
	 * @param address Address to read data from
	 * @param size Size of the operation — "bit", "word" (16-bit) or "dword" (32-bit). Defaults to "bit".
	 */
	readData(address: number, size?: IOSize): Promise<number>;
}

export type { EX260Sx, IOBase, IOHandlers, IOSize, RevolutionPi, WAGO };
