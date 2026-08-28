import { type BodyEntry, type DBusMessage, type MessageBus, systemBus } from "@homebridge/dbus-native";
import { TurbineEventLoop } from "../events";

/**
 * `invoke` ne garantit pas de rappeler son callback. dbus-native empile les
 * messages dans un tableau tant que la poignée de main n'a pas émis 'connect'
 * (cf. `self.message` dans son index.js) : si l'authentification échoue, ce
 * 'connect' n'arrive jamais, rien n'est envoyé et aucun callback n'est rappelé.
 * Sans ce délai la promesse restait pendante pour toujours — /settings/network
 * chargeait indéfiniment avant de finir en 500 au timeout du client.
 */
const DBUS_CALL_TIMEOUT_MS = 10_000;

type BusConnection = { on?: (event: string, cb: (err?: unknown) => void) => void };

/**
 * L'erreur remontée n'est pas toujours une `Error` : quand la poignée de main
 * échoue, dbus-native renvoie la ligne de refus du démon telle quelle (un
 * Buffer). La journaliser brute masquait la cause derrière un « write EPIPE »,
 * qui n'est que le symptôme de la socket déjà fermée.
 */
function describe_error(err: unknown): string {
	if (err instanceof Error) return err.message;
	if (Buffer.isBuffer(err)) return err.toString("ascii").trim();
	return String(err);
}

export class DBusClient {
	/** `undefined` quand la connexion est morte : la prochaine requête en rouvre une. */
	private dbus?: MessageBus;

	constructor() {
		this.open();
	}

	/** Ouvre une connexion au bus système et la surveille. */
	private open(): void {
		const bus = systemBus();

		// La socket D-Bus peut émettre un 'error' (ex. EPIPE quand le bus ferme la
		// connexion). Sans listener 'error', Node transforme ça en exception non
		// gérée qui TUE tout le process. On l'attrape — mais on jette aussi la
		// connexion au lieu de la garder : une socket morte ne redevient jamais
		// vivante, et la conserver condamnait les fonctions réseau pour la durée de
		// vie du process, sans qu'aucune requête ultérieure ne puisse aboutir.
		const connection = (bus as unknown as { connection?: BusConnection }).connection;

		connection?.on?.("error", (err) => {
			TurbineEventLoop.emit("log", "error", `DBus: connection error, dropping the bus (${describe_error(err)})`);
			this.drop(bus);
		});

		connection?.on?.("end", () => {
			this.drop(bus);
		});

		this.dbus = bus;
	}

	/** N'oublie la connexion que si c'est bien celle qui est en cours. */
	private drop(bus: MessageBus): void {
		if (this.dbus === bus) this.dbus = undefined;
	}

	/** Promisified version of `dbus.invoke` */
	public async dbusInvoker<T extends BodyEntry>(message: DBusMessage): Promise<T> {
		if (this.dbus === undefined) this.open();

		const bus = this.dbus;

		if (bus === undefined) throw new Error("DBus: no connection to the system bus.");

		return new Promise<T>((resolve, reject) => {
			let settled = false;

			const timer = setTimeout(() => {
				if (settled) return;
				settled = true;
				// Un appel qui expire veut dire que la socket ne répond plus : la
				// jeter évite que les suivants attendent en vain sur la même.
				this.drop(bus);
				reject(new Error(`DBus: ${message.member} timed out after ${DBUS_CALL_TIMEOUT_MS}ms`));
			}, DBUS_CALL_TIMEOUT_MS);

			bus.invoke(message, (error, response) => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);

				if (error) reject(error);
				else resolve(response as T);
			});
		});
	}

	/** Get a property from the bus */
	public async getProperty<T extends BodyEntry>(service: string, object_path: string, object_interface: string, property: string): Promise<T> {
		const message: DBusMessage = {
			destination: service,
			path: object_path,
			interface: "org.freedesktop.DBus.Properties",
			member: "Get",
			signature: "ss",
			body: [object_interface, property],
		};

		return await this.dbusInvoker(message);
	}
}
