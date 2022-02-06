import { IProfile } from "./Profile";

/**
 * Class used to explore Profiles generated by nuster
 * theese profile are stored in a mongoose database
 * or are premades profiles
 */
export class ProfileExplorer
{
    profile?: IProfile;

    constructor(profile?: IProfile)
    {
        this.profile = profile;
    }
    /**
     * Find a profile key in the profile object
     * @param key profile key
     * @returns result of this find, if result is undefined, the key mught be wrongly written or do not exists in the profile
     */
    public explore(key: string): number | undefined
    {
        key = key.replace(".", "#"); //replace . with # for the profile key
        if(this.profile)
        {
            return this.profile.values[key];
        }
        return undefined;
    }   
}

