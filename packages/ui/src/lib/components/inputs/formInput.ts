export type FormInput<T extends "blur" | "change"> = {
    name: string;
    validateOn?: undefined | T;
    formName?: string;
}