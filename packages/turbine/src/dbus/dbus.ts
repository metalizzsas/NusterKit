import { systemBus, type Message, type Bus } from 'dbus-native';

export const dbus: Bus = systemBus();

export const dbusInvoker = (message: Message): Promise<any> => {

    return new Promise<any>((resolve, reject) => {
        return dbus.invoke(message, (error, response) => {
            if(error)
                reject(error)
            else
                resolve(response)
        });

    });
};

export const getProperty = async (service: string, objectPath: string, objectInterface: string, property: string): Promise<any> => {
    
	const message: Message = {
		destination: service,
		path: objectPath,
		interface: 'org.freedesktop.DBus.Properties',
		member: 'Get',
		signature: 'ss',
		body: [objectInterface, property] 
	}

	// eslint-disable-next-line no-empty-pattern
	const [[], [value]] = await dbusInvoker(message);
	return value;
};