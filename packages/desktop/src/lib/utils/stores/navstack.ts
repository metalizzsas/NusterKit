import { writable } from "svelte/store";

type navBackFunction = () => void | Promise<void>

type navActionButton = {
    label: string,
    color?: string;
    class?: string,
    action: () => void | Promise<void>
}

export const navTitle = writable<string[]>([]);
export const navBackFunction = writable<navBackFunction | null>(null);
export const navActions = writable<navActionButton[] | null>(null);
export const navExpandBottom = writable<boolean>(false);
export const useNavContainer = writable<boolean>(true);