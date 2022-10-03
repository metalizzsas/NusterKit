/** Call to action inteface */
export interface ICallToAction
{
    /** Name of this CTA */
    name: string;
    /** API Endpoint to be reached by the CTA (NusterTurbine Endpoints) */
    APIEndpoint?: {
        /** URL Reached */
        url: string;
        /** HTTP Request Method */
        method: "get" | "put" | "post" | "delete";
    },
    /** UIEndpoint reached by the CTA (NusterDesktop Endpoints)*/
    UIEndpoint?: string;
}