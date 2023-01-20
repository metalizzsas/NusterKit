import type { Record } from "pocketbase";
import type { PageServerLoad } from "./$types";

import { getSdk, type Device } from "balena-sdk";

export const load = (async ({ locals }) => {

    const machineList = await locals.pb.collection("machines").getFullList(undefined, { expand: "sold_by,parent_organization"});

    const sdk = getSdk({ "apiUrl": "https://api.balena-cloud.com/" });
    await sdk.auth.loginWithToken("pDSwvnPRjaeJqazTxchAlH3Gjsgx6R7G");

    const machineListHydrated = await Promise.all(machineList.map(async k => {
        return {
            ...k,
            balenaDevice: await sdk.models.device.get(k.balenaSerial)
        }
    })) as Array<Record & { balenaDevice: Device}>;

    return {
        devices: structuredClone(machineListHydrated)
    }

}) satisfies PageServerLoad;