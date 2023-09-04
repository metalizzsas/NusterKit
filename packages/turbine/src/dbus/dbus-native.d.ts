declare module "@homebridge/dbus-native" {

	import { EventEmitter } from "events";
	import type { Socket } from "net";

	type SignalEventNames = `{"path":"${string}","interface":"${string}","member":"${string}"}`;

	export interface SignalsEventEmitter<T extends string> extends EventEmitter
	{
		on(event: T, listener: (body: BodyEntry, signature: string) => void): this;
		once(event: T, listener: (body: BodyEntry, signature: string) => void): this;

		emit(event: T, body: BodyEntry, signature: string): boolean
	}

	/** Data sent */
	export type BodyEntry = string | number | boolean | Buffer | null | Array<BodyEntry> | { [x: string]: BodyEntry };

	/** Messages sent using `invoke()` */
	export type DBusMessage = {

		/**
		 * Service name, elements separated by a `.` in the format `[A-Z][a-z][0-9]_`.
		 * @example `org.freedesktop.DBus`
		 */
		destination: string;

		/**
		 * Object path, elements separated by a `/` in the format `[A-Z][a-z][0-9]_`.
		 * @example `/org/freedesktop/DBus`
		 */
		path: string;

		/**
		 * Interface name, elements separated by a `.` in the format `[A-Z][a-z][0-9]_`.
		 * @example `org.freedesktop.DBus.Properties`
		 */
		interface: string;

		/**
		 * Method name or Signal name in the format `[A-Z][a-z][0-9]_`.
		 */
		member: string;

		/**
		 * Data signature of the sent body, read https://www.alteeve.com/w/List_of_DBus_data_types to get all the informations needed.
		 * @example `ay` is an array of bytes
		 */
		signature?: string;

		/**
		 * Data sent on the bus
		 */
		body?: BodyEntry[];
	}

	/** Creates a DBus connection to the system bus */
	function systemBus(): MessageBus;

	/** Creates a DBus connection to the session bus */
	function sessionBus(): MessageBus;

	export class MessageBus
	{
		/** Mais Dbus connection */
		connection: BusConnection;

		/** Signals EventEmitter */
		signals: SignalsEventEmitter<SignalEventNames>;

		/** Message Serial ID */
		serial: number;

		/** 
		 * MethodReturnHandlers, temporary callback storage
		 */
		cookies: Record<number, (error: { name: string, message: unknown } | undefined, response: BodyEntry) => void>;

		methodCallHandlers: Record<string, unknown>;
		exportedObjects: Record<string, unknown>;

		/**
		 * Sends a message to the bus and calls the callback when a response is received.
		 * @param message message to be sent
		 * @param callback Callback function
		 */
		public invoke(message: DBusMessage, callback: (error: { name: string, message: unknown } | undefined, response: BodyEntry) => void): void;

		/**
		 * Shorthand of `invoke()` with default values for `destination`, `path` and `interface`.
		 * @param message.destination set to `org.freedesktop.DBus` if empty
		 * @param message.path set to `/org/freedesktop/DBus` if empty
		 * @param message.interface set to `org.freedesktop.DBus` if empty
		 */
		public invokeDbus(message: Partial<DBusMessage>, callback: (error: { name: string, message: unknown } | undefined, response: BodyEntry) => void): void;

		
		/**
		 * Reduce the path or DBusmessage
		 * @param path or DBusMessage to be serialized
		 * @param interface Signal interface name, elements separated by a `.` in the format `[A-Z][a-z][0-9]_`.
		 * @param member Signal name in the format `[A-Z][a-z][0-9]_`.
		 * @returns JSON object strigified
		 */
		public mangle(path: string | DBusMessage, interface?: string, member?: string): string

		/**
		 * Sends a signal over the DBus
		 * @param path Signal path, elements separated by a `/` in the format `[A-Z][a-z][0-9]_`
		 * @param interface Signal interface name, elements separated by a `.` in the format `[A-Z][a-z][0-9]_`.
		 * @param name Signal name in the format `[A-Z][a-z][0-9]_`.
		 * @param signature Signal Body data signature, read https://www.alteeve.com/w/List_of_DBus_data_types to get all the informations needed.
		 * @param args Signal Body data
		 */
		public sendSignal(path: string, interface: string, name: string, signature?: string, args?: BodyEntry): void;

		/**
		 * Get the service object for the given name.
		 * @param name service name
		 */
		public getService(name: string): DBusService;

		/**
		 * Get the object for the given name.
		 * @param path
		 * @param name
		 * @param callback
		 */
		public getObject(path: string, name: string, callback: (error: null | Error, obj?: DBusObject) => void): void;
	}

	export class BusConnection extends EventEmitter
	{
		public stream: Socket;
	}

	export class DBusService
	{
		/** Service name */
		public name: string;
		/** Bus connection */
		public bus: MessageBus;

		// the dbus object has additional properties `proxy` and `nodes´ added to it!
		public getObject(name: string, callback: (error: null | Error, obj?: DBusObject) => void): void;

		/**
		 * Gets the interface associated with the given object.
		 * @param object Object name
		 * @param interface interface name
		 * @param callback callback function
		 */
		public getInterface(object: string, interface: string, callback: (error: null | Error, interface?: DBusInterface) => void): void;
	}

	export class DBusObject
	{
		/** Dbus object name */
		public name: string;
		/** Dbus service */
		public service: DBusService;

		public as(name: string): DBusInterface;
	}

	export class DBusInterfaceClass extends EventEmitter implements SignalsEventEmitter<string>
	{
		/** Parent object */
		public $parent: DBusObject;
		/** Interface name */
		public $name: string;

		/** Dictionnary of methods, stores Method Data signatures */
		public $methods: Record<string, string>;

		public $properties: Record<string, { type: string, access: string }>;

		public $callbacks: Array<unknown>;

		/** Signal handlers,  */
		public $sigHandlers: Array<(error: null | Error, data: unknown) => void>;

		public $getSigHandler (callback: (error: null | Error, data: unknown) => void): void;

		public $createMethod (methodName: string, signature: string): void;
		public $callMethod (methodName: string, args: Array<unknown | ((error: { name: string, message: unknown } | undefined, response: BodyEntry) => void)>): void;

		public $createProp (propName: string, propType: string, propAccess: string): void;
		public $readProp (propName: string, callback: (error: null | Error, value?: BodyEntry) => void): void;
		public $writeProp (propName: string, value: string | number | Buffer): void;
		
	}

	export type DBusInterface = DBusInterfaceClass & { 
		[key: string]: (...args: Array<string | number | Buffer | ((error: { name: string, message: unknown } | undefined, response: BodyEntry) => void)>) => void;
	}


}