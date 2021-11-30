import { IProfile } from "../models/Profile";
import { Cycle } from "./Cycle";
import { CycleStep } from "./CycleStep";

export class Metalfog2cycle extends Cycle
{
    constructor(profile: IProfile)
    {
        super(profile);

        this.steps = [
            new CycleStep(this, "test", {isEnabled: true, duration: 6000}, async () => {
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 6000);
                });
            }),
            new CycleStep(this, "test2", {isEnabled: true, duration: 8000, runAmount: 3}, async () => {
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 8000);
                });
            }),
            new CycleStep(this, "test3", {isEnabled: true, duration: 4000, runAmount: 3}, async () => {
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 4000);
                });
            }),
            new CycleStep(this, "test4", {isEnabled: true, duration: 2000}, async () => {
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 2000);
                });
            })
        ]
    }
}