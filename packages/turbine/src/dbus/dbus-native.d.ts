declare module 'dbus-native' {

	export type BodyEntry = null | string | number | Array<BodyEntry>;

	export interface Message {
		destination: string;
		path: string;
		interface: string;
		member: string;
		signature?: string;
		body?: BodyEntry[];
	}

	export interface Bus {
		invoke: (
			message: Message,
			callback: (error: Error, response: BodyEntry) => void,
		) => void;
	}

	export function systemBus(): Bus;

}