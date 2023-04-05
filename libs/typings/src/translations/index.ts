export declare interface Translations {

    /** Schema used by translation file */
    $schema: string;

    /** Containers translations */
    containers: {
        [key: string]: {
            /** Container name */
            name: string,

            /** Containers actions */
            actions?: TranslationGroupString,

            regulations?: TranslationGroupString
        }
    },

    /** Cycle translations */
    cycle: {
        /** Cycle names */
        names: TranslationGroupString,

        /** Cycle end reasons */
        end_reasons: TranslationGroupString,

        /** Cycle start conditions */
        run_conditions: TranslationGroupString,

        /** Cycle steps */
        steps: {
            [key: string]: {
                name: string, 
                desc: string
            }
        };
    }

    /** IO Gates translations */
    gates: {
        /** IO Gates categories */
        categories: TranslationGroupString
        /** IO Gates names (Includes full gate name with category such as `levels#act-min-n`) */
        names: TranslationGroupString
    },

    /** Maintenances translations */
    maintenance: {
        /** Task specific translation */
        tasks: {
            [key: string]: {
                name: string, 
                desc: string
            }
        };
    },

    /** Profiles translations */
    profile: {
        /** Premade profiles translations */
        premade: TranslationGroupString
        /** Profile categories translations */
        categories: TranslationGroupString
        /** Profile Rows translations */
        rows: TranslationGroupString
    }

    /** Toasts */
    toasts: {
        [key:string]: ToastTranslation
    },

    /** Addons */
    addons: TranslationGroupString
}

/** String keyed Translations group */
type TranslationGroupString = {
    [key: string]: string
}

/** Toast translation */
type ToastTranslation = {
    title: string,
    message: string,
    actions?: {
        [key: string]: string
    }
}