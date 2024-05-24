/// <reference types="@sveltejs/kit" />

import type { Status } from "@metalizzsas/nuster-turbine/types";
import type { MachineData } from "@metalizzsas/nuster-turbine/types/hydrated/machine";

declare global {
    namespace App
    {
        interface Locals {
    
            /** Machine settings stored in turbine */
            settings: { dark: 1 | 0, lang: string }
    
            /** Is machine screen, in dev mode, will always be true */
            is_machine_screen: boolean;
            
            /** Actual machine configuration, read from TURBINE_ADDRESS API */
            machine_configuration: MachineData;
    
            /** Actual machine realtime data on page load, read from TURBINE_ADDRESS Realtime API */
            machine_status: Status; 
        }
        
        interface PageData {
    
            /** Machine settings stored in turbine */
            settings: { dark: 1 | 0, lang: string }
    
            /** Is machine screen, in dev mode, will always be true */
            is_machine_screen: boolean;
    
            /** Actual machine configuration, read from TURBINE_ADDRESS API */
            machine_configuration: MachineData;
    
            /** Actual machine realtime data on page load, read from TURBINE_ADDRESS Realtime API */
            machine_status: Status;
        }
    }
}