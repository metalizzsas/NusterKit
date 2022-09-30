import { IProgramRunner } from "../../spec/cycle/IProgramBlockRunner";
import { IProfile } from "../../spec/profile";

export interface IHistory
{
    rating?: number,
    cycle: IProgramRunner,
    profile: IProfile
}