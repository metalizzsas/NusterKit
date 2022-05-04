import pino from "pino";
import lockFile from "lockfile";

export class UpdateLocker
{
    private lockfilePath: string;
    private logger: pino.Logger;

    private updatesLocked: boolean;

    constructor(lockfilePath: string, logger: pino.Logger)
    {
        this.lockfilePath = lockfilePath;
        this.logger = logger;

        this.updatesLocked = false;
    }

    /**
     * Lock the updated to force balena to not update
     * @returns true if the lockfile was created, false if it already existed
     */
    async lockUpdates(): Promise<boolean>
    {
        return new Promise<boolean>((resolve) => {
            lockFile.lock(this.lockfilePath, (err) => {
                if(err)
                {
                    resolve(false);
                    this.logger.error("Updates locking failed", err);
                }
                else
                {
                    resolve(true);
                    this.updatesLocked = true;
                }
            })

        });
    }

    /**
     * Unlock updates to allow balena to updated the software
     * @returns true if the lock was released, false if it was not locked
     */
    async unlockUpdates(): Promise<boolean>
    {
        return new Promise<boolean>((resolve) => {
            lockFile.unlock(this.lockfilePath, (err) => {
                if(err)
                {
                    resolve(false);
                    this.logger.error("Updates unlocking failed", err);
                }
                else
                {
                    resolve(true);
                    this.updatesLocked = false;
                }
            })
        });
    }

    get updateable(): boolean
    {
        return !this.updatesLocked;
    }
}