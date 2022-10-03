import { IProfileStored } from "../profile";
import { IProgramBlockRunnerHydrated } from "./IProgramRunnerHydrated";

export interface IHistory
{
    rating?: number,
    cycle: IProgramBlockRunnerHydrated,
    profile: IProfileStored
}

export type IHistoryHydrated = IHistory & { id: string };