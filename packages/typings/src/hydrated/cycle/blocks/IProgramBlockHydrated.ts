import { IProgramBlocks } from "../../../spec/cycle/IProgramBlock";

export type IProgramBlockHydrated = IProgramBlocks & {
    executed: boolean;
}