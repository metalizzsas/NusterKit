import { IProfileStored } from "../profile";
import { IProgramBlockRunnerHydrated } from "./IProgramBlockRunnerHydrated";

export interface IHistory
{
    rating?: number,
    cycle: IProgramBlockRunnerHydrated,
    profile: IProfileStored
}

export type IHistoryHydrated = IHistory & { _id: string };