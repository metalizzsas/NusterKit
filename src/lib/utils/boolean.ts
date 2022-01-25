export {}

declare global {
    interface Boolean {
        toggle: () => boolean;
    }
}

Boolean.prototype.toggle = (): boolean => {
    return !this;
};