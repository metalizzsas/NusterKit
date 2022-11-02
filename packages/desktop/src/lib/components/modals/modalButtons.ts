export type buttonOption = {
    text: string;
    color: string;
    /** If callback return true, the modal is not closed */
    callback?: (val?: string) => boolean | void | Promise<boolean | void>;
    textColor?: string;
}