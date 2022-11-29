import type { writable } from "svelte/store"

export type NavStackContext = {
    navTitle: ReturnType<typeof writable<string[]>>,
    navBackFunction: ReturnType<typeof writable<NavBackFunction | null>>,
    navActions: ReturnType<typeof writable<NavActionButton[]>>,
}

export type NavBackFunction = () => void | Promise<void>

export type NavActionButton = {
    label: string,
    color?: string;
    class?: string,
    action: () => void | Promise<void>
}