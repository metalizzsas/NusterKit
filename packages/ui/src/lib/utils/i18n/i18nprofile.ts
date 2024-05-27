import type { ProfileHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";

export const translateProfileName = (translatorKey: (arg0: string) => string, profile: ProfileHydrated): string => {
    if(profile.isPremade === true)
            return translatorKey('profile.premade.' + profile.name);
    else if(profile.name == "defaultProfileName")
        return translatorKey('profile.defaultName')
    else if(profile.name == "lastRuntProfile")
        return translatorKey('profile.lastRuntName')
    else
        return profile.name
};