import { ICallToAction } from "./ICallToAction";

export interface INusterPopup 
{
    /** Unique identifier to prevent multiple pop ups */
    identifier: string;

    /** i18n text, title of this pop up */
    title: string;
    /** i18n message, body of this popup */
    message: string;

    /** Call to actions */
    callToAction?: ICallToAction[]
}