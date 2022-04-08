import pino from "pino";
import lockFile from "lockfile";

export class UpdateLocker
{
    private lockfilePath: string;
    private automaticUpdatesEnabled: boolean;

    private timer?: NodeJS.Timeout;

    private currentLockTime: number;

    private logger: pino.Logger;

    constructor(lockFilePath: string, logger: pino.Logger)
    {
        this.lockfilePath = lockFilePath;
        this.automaticUpdatesEnabled = false;
        this.currentLockTime = 0;
        this.logger = logger;
    }

    public lockFor(time: number)
    {
        if(this.automaticUpdatesEnabled === true)
        {
            if(this.currentLockTime > time)
            {
                this.logger.warn("Lock time is less than current lock time, ignoring.");
                return;
            }
    
            this.currentLockTime = time;
    
            if(this.timer !== undefined)
            {
                clearTimeout(this.timer);
            }
    
            lockFile.lock(this.lockfilePath, (err) => {
                if(err)
                {
                    this.logger.error("Failed to lock file: " + err);
                    return;
                }
                else
                {
                    this.automaticUpdatesEnabled = false;
                    this.timer = setTimeout(this.unlock, time);
                    this.logger.info("Locked automatic updated for " + time + "ms");
                }
            });
        }
        else
        {
            this.logger.trace("Skipping locking, it is already locked");
        }
    }

    public unlock()
    {
        lockFile.unlock(this.lockfilePath, (err) => {
            if(err)
            {
                this.logger.error("Failed to unlock lockfile" + err);
            }
            this.automaticUpdatesEnabled = true;
        });
    }

    get isLocked()
    {
        return !this.automaticUpdatesEnabled;
    }
}