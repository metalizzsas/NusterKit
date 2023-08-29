
const isRelease = import.meta.env.VITE_NUSTER_COMMIT === undefined;

export const version = `${import.meta.env.VITE_NUSTER_VERSION}${isRelease ? "" : "#" + String(import.meta.env.VITE_NUSTER_COMMIT).substring(0, 7)}`