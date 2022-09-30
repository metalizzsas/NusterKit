import { writable } from "svelte/store";

type navBackFunction = () => void | Promise<void>

type navActionButton = {
    label: string,
    color?: string;
    class?: string,
    action: () => void | Promise<void>
}

export var navTitle = writable<string[]>([]);
export var navBackFunction = writable<navBackFunction | null>(null);
export var navActions = writable<navActionButton[] | null>(null);
export var navExpandBottom = writable<boolean>(false);
export var useNavContainer = writable<boolean>(true);