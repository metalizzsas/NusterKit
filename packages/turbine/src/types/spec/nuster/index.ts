type Nuster = {
    /** Connect popup is triggered when the user logs on for the first time */
    connectPopup?: Popup<CallToAction>,

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

type CallToActionFront = {

    /** Name of the call to action */
    name: string;

    /** Id of the call to action to be executed on the frontend */
    id: string;
}

/** Popup message */
interface Popup<T extends CallToAction | CallToActionFront> {
    /** i18n text, title of this pop up */
    title: string;
    /** i18n message, body of this popup */
    message: string;

    /** Level of this popup */
    level: "info" | "warn" | "error";

    /** Call to actions of this popup. */
    callToActions?: T[],

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

export { Nuster, HomeInfo, CallToAction, CallToActionFront, Popup };