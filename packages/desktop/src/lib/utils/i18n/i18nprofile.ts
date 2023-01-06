import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated";

export const translateProfileName = (translatorKey: (arg0: string) => string, profile: ProfileHydrated): string => {
    if(profile.isPremade)
        if(translatorKey('cycle.types.' + profile.name).startsWith("cycle.types"))
            return profile.name;
        else
            return translatorKey('cycle.types.' + profile.name);
    else if(profile.name == "defaultProfileName")
        return translatorKey('profile.defaultName')
    else if(profile.name == "lastRuntProfile")
        return translatorKey('profile.lastRuntName')
    else
        return profile.name
};