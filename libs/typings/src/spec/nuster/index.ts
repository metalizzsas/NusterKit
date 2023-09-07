type Nuster = {
    /** Connect popup is triggered when the user logs on for the first time */
    connectPopup?: Popup,

    /** Home screen informations, path of the data to be fetched, should only be reactive data such as io or containers */
    homeInformations?: Array<HomeInfo>
}

/** Call to action inteface */
type CallToAction = {
    /** Name of this CTA */
    name: string;
    /** API Endpoint to be reached by the CTA (NusterTurbine Endpoints) */
    APIEndpoint?: {
        /** URL Reached */
        url: string;
        /** HTTP Request Method */
        method: "get" | "put" | "post" | "delete";
        /**  */
        body?: unknown;
    },
    /** UIEndpoint reached by the CTA (NusterDesktop Endpoints)*/
    UIEndpoint?: string;
}

/** Popup message */
interface Popup {
    /** i18n text, title of this pop up */
    title: string;
    /** i18n message, body of this popup */
    message: string;

    /** Level of this popup */
    level: "info" | "warn" | "error";

    /** Call to actions of this popup. */
    callToActions?: CallToAction[],

    /** Translation payloads */
    payload?: Record<string, string>
}

type HomeInfoIO = {
    type: "io",
    path: string
}

type HomeInfoContainerRegulationState = {
    type: "container.regulation.state",
    path: [string, string]
};

type HomeInfoContainerRegulationTarget = {
    type: "container.regulation.target",
    path: [string, string]
}

type HomeInfo = HomeInfoIO | HomeInfoContainerRegulationState | HomeInfoContainerRegulationTarget;

export { Nuster, HomeInfo, CallToAction, Popup };