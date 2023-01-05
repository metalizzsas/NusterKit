type Nuster = {
    /** Connect popup is triggered when the user logs on for the first time */
    connectPopup: Popup
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
    callToActions?: CallToAction[]
}

export { Nuster, CallToAction, Popup };