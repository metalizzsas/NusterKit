# NusterTurbine

Nuster Turbine is a complete rewrite of NusterEngine in Typescript.
This was done to ehance stability of the Nuster global ecosystem.

## Environment Vars

* `
DISABLE_AUTH
`
when set to anything disable Auth module to access any route without being authentified

* `DISABLE_TRACE_LOG` when set to anything disable Trace level logs
* `DISABLE_HANDLERS` when set to true, disables handlers
* `NODE_ENV` when set to 'production' it enables Cycle watchdog and EthernetIP controller tests
