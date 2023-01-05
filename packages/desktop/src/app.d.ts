declare namespace App
{
    interface Locals {
        /** Nuster api base endpoint */
        nuster_api_host: string;
        /** Nuster api base websocket endpoint */
        nuster_ws_host: string;
        /** Is machine screen, in dev mode, will always be true */
        is_machine_screen: boolean;
    }
    
    interface PageData {
        /** Nuster api base endpoint */
        nuster_api_host: string;
        /** Nuster api base websocket endpoint */
        nuster_ws_host: string;
        /** Is machine screen, in dev mode, will always be true */
        is_machine_screen: boolean;
    }
}