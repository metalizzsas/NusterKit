# **NusterTurbine 💨**

[![Packing Nuster Turbine for balena](https://github.com/metalizzsas/NusterTurbine/actions/workflows/package.yaml/badge.svg)](https://github.com/metalizzsas/NusterTurbine/actions/workflows/package.yaml)

Nuster Turbine is the core of our machines. It runs on NodeJS. Written in TypeScript. Tested using Jest.
The goal of this project is to manage user inputs from NusterDesktop and handle IO Controllers such as Modbus or EthernetIP IO Controllers.

This project also manage:

* Profiles
* Cycles, and histories
* Passives regulations
* Preventive maintenances tasks
* Manual & Advanced IO Management

## **Data management 🗂️**

To handle machine specifications and `info.json` file is required at the `/data` folder (local to project when NODE_ENV is set to development or empty).
This info file, helps NusterTurbine to find the accurate `specs.json` file in [NusterTurbineMachines repo](https://github.com/metalizzsas/NusterTurbineMachines).

## **Environment Vars 🏠**

* `DISABLE_AUTH` when set to anything disable Auth module to access any route without being authentified.
* `DISABLE_TRACE_LOG` when set to anything disable Trace level logs.
* `DISABLE_HANDLERS` when set to true, disables io controllers handlers.
* `NODE_ENV` when set to 'production' it enables Cycle watchdog and EthernetIP controller tests.
