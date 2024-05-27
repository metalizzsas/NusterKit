import { test, expect, describe } from "vitest";
import { TurbineEventLoop } from "../../../events";
import { SleepProgramBlock } from "./SleepProgramBlock";

describe("SleepProgramBlock parameters validation", () => {

    const sleepTime = 2;
    const sleepProgramBlock = new SleepProgramBlock({ "sleep": sleepTime });
    
    test("SleepProgramBlock sleeps for the correct amount of time.", async () => {
    
        const timeStart = performance.now();
    
        await sleepProgramBlock.execute();
    
        const timeEnd = performance.now();
    
        const timeElapsed = timeEnd - timeStart;
    
        expect(timeElapsed).toBeGreaterThanOrEqual(sleepTime * 1000);
    
    }, sleepTime * 1500);

    test("SleepProgramBlock sleeps for the correct time even with a pause", async () => {

        const timeStart = performance.now();

        const pauseTime = 1;

        setTimeout(() => TurbineEventLoop.emit("pbr.pause"), 500);
        setTimeout(() => TurbineEventLoop.emit("pbr.resume"), 1000 + pauseTime * 1000);

        await new Promise<void>(resolve => {

            sleepProgramBlock.execute().then(() => {
                    
                const timeEnd = performance.now();
                const timeElapsed = timeEnd - timeStart;
        
                expect(timeElapsed).toBeGreaterThanOrEqual(sleepTime * 1000 + pauseTime * 1000);

                resolve();
        
            });
        })
    });

});

describe("SleepProgramBlock Events", () => {

    test("SleepProgramBlock listen for pbr stop event", () => {
    
        const pbrStopEventListened = TurbineEventLoop.emit('pbr.stop', "any");
        expect(pbrStopEventListened).toBe(true);
    
    });

    test("SleepProgramBlock listen for pbr pause event", () => {
        
        const pbrResumeEventListened = TurbineEventLoop.emit('pbr.pause');
        expect(pbrResumeEventListened).toBe(true);
    
    });

    test("SleepProgramBlock listen for pbr resume event", () => {
        
        const pbrResumeEventListened = TurbineEventLoop.emit('pbr.resume');
        expect(pbrResumeEventListened).toBe(true);
    
    });
    
    test("SleepProgramBlock listen for pbr status update event", () => {
        
        const pbrStatusUpdateEventListened = TurbineEventLoop.emit('pbr.status.update', "ended");
        expect(pbrStatusUpdateEventListened).toBe(true);
    
    });

});
