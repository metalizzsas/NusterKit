export type AccessPoint = {
	ssid: string;
	strength: number;
	frenquency: number;
	active: boolean;
};

export type NetworkDevice = {
	iface: string;
	path: string;
	address?: string;
	gateway?: string;
	subnet?: string;
};

export function string_to_array_of_bytes(str: string) {
	return str.split("").map((c) => c.charCodeAt(0));
}

export function compute_subnet(prefix_length: number): string {
	if (prefix_length < 0 || prefix_length > 32) {
		throw new Error("Prefix length must be between 0 and 32.");
	}

	const subnet_mask = new Array(4).fill(0);

	for (let i = 0; i < prefix_length; i++) {
		subnet_mask[Math.floor(i / 8)] |= 1 << (7 - (i % 8));
	}

	return subnet_mask.join(".");
}
