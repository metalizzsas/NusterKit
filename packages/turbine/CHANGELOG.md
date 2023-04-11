# @metalizzsas/nuster-turbine

## 1.10.15

### Patch Changes

- Updated dependencies [[`38fb7e60`](https://github.com/metalizzsas/NusterKit/commit/38fb7e60512d54e005249bf0dae21006685c4ae5)]:
  - @metalizzsas/nuster-turbine-machines@1.6.5

## 1.10.14

### Patch Changes

- fix: check if IOWrite block was executed before toggleing the timeout ([#349](https://github.com/metalizzsas/NusterKit/pull/349))

## 1.10.13

### Patch Changes

- feat: added AbortSignal support for IOWrite Block ([#347](https://github.com/metalizzsas/NusterKit/pull/347))

- feat: added a gate timeout on IOWriteGate Program Block ([#347](https://github.com/metalizzsas/NusterKit/pull/347))

- Updated dependencies [[`075d6373`](https://github.com/metalizzsas/NusterKit/commit/075d6373a932615418c9241536e30bfe0c2d18d5)]:
  - @metalizzsas/nuster-turbine-machines@1.6.4

## 1.10.12

### Patch Changes

- fix: abort signal was not set when ending step via PBR ([#345](https://github.com/metalizzsas/NusterKit/pull/345))

- feat: enhanced cycle step progress bar ([#345](https://github.com/metalizzsas/NusterKit/pull/345))

- chore: updated packages ([#345](https://github.com/metalizzsas/NusterKit/pull/345))

- Updated dependencies [[`fabc9faa`](https://github.com/metalizzsas/NusterKit/commit/fabc9faa3c0189a6b7dd352955893bd9efc55c4b)]:
  - @metalizzsas/nuster-turbine-machines@1.6.3

## 1.10.11

### Patch Changes

- fix: PBR Runconditions could still end cycle even if the flag startOnly was set to true ([#343](https://github.com/metalizzsas/NusterKit/pull/343))

## 1.10.10

### Patch Changes

- fix: status blocks would end cycle at any state ([#340](https://github.com/metalizzsas/NusterKit/pull/340))

## 1.10.9

### Patch Changes

- feat: io gates supports float values ([#338](https://github.com/metalizzsas/NusterKit/pull/338))

## 1.10.8

### Patch Changes

- Updated dependencies [[`9f7b1b5c`](https://github.com/metalizzsas/NusterKit/commit/9f7b1b5c724f54f355e3be8881268600d087be14)]:
  - @metalizzsas/nuster-turbine-machines@1.6.2

## 1.10.7

### Patch Changes

- chore: fixed mongodb to 4.2.21 ([#334](https://github.com/metalizzsas/NusterKit/pull/334))

## 1.10.6

### Patch Changes

- Updated dependencies [[`9294f8dd`](https://github.com/metalizzsas/NusterKit/commit/9294f8dd1e835f05d8fc52338b67690864ae20d3)]:
  - @metalizzsas/nuster-turbine-machines@1.6.1

## 1.10.5

### Patch Changes

- ci: install packages with node_env set to devlopment ([#327](https://github.com/metalizzsas/NusterKit/pull/327))

## 1.10.4

### Patch Changes

- ci: force no cache use on balena build ([#324](https://github.com/metalizzsas/NusterKit/pull/324))

## 1.10.3

### Patch Changes

- ci: build test 3 ([#322](https://github.com/metalizzsas/NusterKit/pull/322))

## 1.10.2

### Patch Changes

- ci: build test 2 ([#320](https://github.com/metalizzsas/NusterKit/pull/320))

## 1.10.1

### Patch Changes

- ci: test build features ([#318](https://github.com/metalizzsas/NusterKit/pull/318))

## 1.10.0

### Minor Changes

- feat: PBR can now end using 2 scenarios: ([#314](https://github.com/metalizzsas/NusterKit/pull/314))

  - Soft ending stops a step then goes to another step then the cycle ends.
  - Hard ending was the default behavior before, it is stoping the cycle directly.

### Patch Changes

- feat: replaced startConditions with runConditions ([#314](https://github.com/metalizzsas/NusterKit/pull/314))

- feat: some program blocks admits an `AbortSignal` to early exit. ([#314](https://github.com/metalizzsas/NusterKit/pull/314))

- fix: Mapped gate could write negative data to fieldbus ([#314](https://github.com/metalizzsas/NusterKit/pull/314))
  fix: ReadMachineVariableBlock was crashing the NusterTurbine
- Updated dependencies [[`6ad7222`](https://github.com/metalizzsas/NusterKit/commit/6ad72222aade50cacb7d0a4db81bbb363118ed82), [`2ec18c6`](https://github.com/metalizzsas/NusterKit/commit/2ec18c6a6f5968cec5b7497e4c4246e3bc888e37), [`be6a29f`](https://github.com/metalizzsas/NusterKit/commit/be6a29f06b7a5efef0da6000041f32273535c1ad), [`73e3858`](https://github.com/metalizzsas/NusterKit/commit/73e385892edef0104af20db887c17f8ca88afaa4)]:
  - @metalizzsas/nuster-turbine-machines@1.6.0

## 1.9.27

### Patch Changes

- Updated dependencies [[`97bd169`](https://github.com/metalizzsas/NusterKit/commit/97bd169e1e4070dab76ad2e5acb629691a9218de), [`0a1ee42`](https://github.com/metalizzsas/NusterKit/commit/0a1ee4257dd284d31b425087450acde406d8ace6), [`4f7990b`](https://github.com/metalizzsas/NusterKit/commit/4f7990bcb189db14662c2f8e7676e8e1a78da7c6), [`a1b3a89`](https://github.com/metalizzsas/NusterKit/commit/a1b3a89fcf9b0d9e65143745900423c39afa7438)]:
  - @metalizzsas/nuster-turbine-machines@1.5.0

## 1.9.26

### Patch Changes

- chore: updated lockfile build strategy ([#296](https://github.com/metalizzsas/NusterKit/pull/296))

## 1.9.25

### Patch Changes

- chore: force-build ([#293](https://github.com/metalizzsas/NusterKit/pull/293))

## 1.9.24

### Patch Changes

- chore: updated packages ([#291](https://github.com/metalizzsas/NusterKit/pull/291))

- Updated dependencies [[`ee671fd`](https://github.com/metalizzsas/NusterKit/commit/ee671fd145e3511559137aadec44224c01baca82)]:
  - @metalizzsas/nuster-turbine-machines@1.4.8

## 1.9.23

### Patch Changes

- feat: added udev rules for arduino devices ([#289](https://github.com/metalizzsas/NusterKit/pull/289))

- Updated dependencies [[`6d1fed1`](https://github.com/metalizzsas/NusterKit/commit/6d1fed18e7dc8f5f90fb563e7d58ac4d2c767559)]:
  - @metalizzsas/nuster-turbine-machines@1.4.7

## 1.9.22

### Patch Changes

- fix: turbine would fail to fetch hypervisor data ([#281](https://github.com/metalizzsas/NusterKit/pull/281))

## 1.9.21

### Patch Changes

- fix: production docker-compose used draft dockerfiles ([#279](https://github.com/metalizzsas/NusterKit/pull/279))

## 1.9.20

### Patch Changes

- fix: updated base Path ([#276](https://github.com/metalizzsas/NusterKit/pull/276))

## 1.9.19

### Patch Changes

- fix: turbine was still using typings src exports ([#274](https://github.com/metalizzsas/NusterKit/pull/274))

## 1.9.18

### Patch Changes

- chore: trigger a rebuild ([#272](https://github.com/metalizzsas/NusterKit/pull/272))

- Updated dependencies [[`1d202c4`](https://github.com/metalizzsas/NusterKit/commit/1d202c4fbd9c01abe950bf2d7ebebc9358ee1519)]:
  - @metalizzsas/nuster-turbine-machines@1.4.6

## 1.9.17

### Patch Changes

- chore: updated mono repo structure ([#270](https://github.com/metalizzsas/NusterKit/pull/270))

- Updated dependencies [[`f93c1bd`](https://github.com/metalizzsas/NusterKit/commit/f93c1bd591278264e4da37ae8dede0d758f42469)]:
  - @metalizzsas/nuster-turbine-machines@1.4.5

## 1.9.16

### Patch Changes

- fix: typings were used in production ([#268](https://github.com/metalizzsas/NusterKit/pull/268))

## 1.9.15

### Patch Changes

- feat: ui settings are now stored on turbine instead of desktop localeStorage ([#266](https://github.com/metalizzsas/NusterKit/pull/266))

## 1.9.14

### Patch Changes

- fix: pbr cycles could be ended while not started yet ([#257](https://github.com/metalizzsas/NusterKit/pull/257))

- fix: security condition was not removing event listener due to binding ([#257](https://github.com/metalizzsas/NusterKit/pull/257))

## 1.9.13

### Patch Changes

- fix: maintenances tasks were not updated on cycle end ([#253](https://github.com/metalizzsas/NusterKit/pull/253))

- feat: containers no longer use a network_mode of `host` ([#253](https://github.com/metalizzsas/NusterKit/pull/253))

- Updated dependencies [[`1b14ee5`](https://github.com/metalizzsas/NusterKit/commit/1b14ee5539db63d3d2cca427c4a56ae6ef51b7dd), [`7da82d5`](https://github.com/metalizzsas/NusterKit/commit/7da82d5adf7eb017e9334d19a264a4baa235070e)]:
  - @metalizzsas/nuster-turbine-machines@1.4.4

## 1.9.12

### Patch Changes

- feat: enhanced progress computation and progress display ([#249](https://github.com/metalizzsas/NusterKit/pull/249))

- Updated dependencies [[`11c0359`](https://github.com/metalizzsas/NusterKit/commit/11c0359df8cd9cf0e8f85569f79665ed7140d297)]:
  - @metalizzsas/nuster-turbine-machines@1.4.3

## 1.9.11

### Patch Changes

- Updated dependencies [[`0490759`](https://github.com/metalizzsas/NusterKit/commit/049075904076c1f9796a865712bfc103eb179ab6)]:
  - @metalizzsas/nuster-turbine-machines@1.4.2

## 1.9.10

### Patch Changes

- Updated dependencies [[`73abfb8`](https://github.com/metalizzsas/NusterKit/commit/73abfb8870867b606a7b0dad963098b37f158c7d)]:
  - @metalizzsas/nuster-turbine-machines@1.4.1

## 1.9.9

### Patch Changes

- feat: Additional machine informations can be displayed on landing page of desktop, configurable in machine specs.json ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- chore: cleaned up app.ts ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- fix: updated regulation modals i18n keys ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- chore: now using nuster-turbine Machines export ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- Updated dependencies [[`ecd24e8`](https://github.com/metalizzsas/NusterKit/commit/ecd24e80bdab795827a88a508419c57329e157d8), [`1fcc0e9`](https://github.com/metalizzsas/NusterKit/commit/1fcc0e971b66254950c08ff5a97bb2401daa195e), [`adf08f9`](https://github.com/metalizzsas/NusterKit/commit/adf08f9a4b1153d332f062eb9e0f1e46dc5ab9cf), [`8aba4be`](https://github.com/metalizzsas/NusterKit/commit/8aba4bea60a80ff7b3fc9ec1ce142057b9e961c1), [`7f01ea8`](https://github.com/metalizzsas/NusterKit/commit/7f01ea80d1085e7c909ac37f3666b7ab637ddbf8), [`8aba4be`](https://github.com/metalizzsas/NusterKit/commit/8aba4bea60a80ff7b3fc9ec1ce142057b9e961c1)]:
  - @metalizzsas/nuster-typings@1.4.3
  - @metalizzsas/nuster-turbine-machines@1.4.0

## 1.9.8

### Patch Changes

- fix: io.resetAll was not awaiting each gate write ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

- feat: Status blocks are subscribeable to check for change ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

- fix: TurbineEventLoop is now used correctly ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

- fix: addons not supported by machine were crashing the app ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

- chore: cleaned up api routes ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

- chore: removed Authmanager ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

- Updated dependencies [[`d1b13b2`](https://github.com/metalizzsas/NusterKit/commit/d1b13b23fdf3a3a96844767eb05aca7f59bd8a50)]:
  - @metalizzsas/nuster-turbine-machines@1.3.6

## 1.9.7

### Patch Changes

- fix: multiple steps estimated runtimes are now calculated correclty ([#230](https://github.com/metalizzsas/NusterKit/pull/230))

- fix: pbr stop timer block had no effect ([#230](https://github.com/metalizzsas/NusterKit/pull/230))

- fix: updated simulation server port to 4082 ([#230](https://github.com/metalizzsas/NusterKit/pull/230))

- fix: iogate value was assignated after `io.updated` event was sent ([#228](https://github.com/metalizzsas/NusterKit/pull/228))

- Updated dependencies [[`77af338`](https://github.com/metalizzsas/NusterKit/commit/77af3385b2f6574240347175fe1e88a480dc559d)]:
  - @metalizzsas/nuster-turbine-machines@1.3.5

## 1.9.6

### Patch Changes

- Updated dependencies [[`70e2697`](https://github.com/metalizzsas/NusterKit/commit/70e2697b43a56540e8fe24009acde4355e5d0ee7)]:
  - @metalizzsas/nuster-turbine-machines@1.3.4

## 1.9.5

### Patch Changes

- Updated dependencies [[`9318365`](https://github.com/metalizzsas/NusterKit/commit/93183653cf7b215c2b139271983d84fce04fb7c0), [`7ebebea`](https://github.com/metalizzsas/NusterKit/commit/7ebebeab0457111f62ede1f109cf39661ba6d984)]:
  - @metalizzsas/nuster-turbine-machines@1.3.3
  - @metalizzsas/nuster-typings@1.4.2

## 1.9.4

### Patch Changes

- fix: removed /api redirect on turbine & on handleFetch ([#212](https://github.com/metalizzsas/NusterKit/pull/212))

## 1.9.3

### Patch Changes

- Updated dependencies [[`e7b4791`](https://github.com/metalizzsas/NusterKit/commit/e7b4791ffc230d79b92a6714752650938a4ff372)]:
  - @metalizzsas/nuster-turbine-machines@1.3.2

## 1.9.2

### Patch Changes

- fix: Github action now builds projects using NODE_ENV=production ([#194](https://github.com/metalizzsas/NusterKit/pull/194))

- Updated dependencies [[`658c755`](https://github.com/metalizzsas/NusterKit/commit/658c7554df74e2d1ae6735a58fa8e4c9163b1d8d)]:
  - @metalizzsas/nuster-turbine-machines@1.3.1
  - @metalizzsas/nuster-typings@1.4.1

## 1.9.1

### Patch Changes

- chore: went back to using browser block, wpe need investigation ([#190](https://github.com/metalizzsas/NusterKit/pull/190))

## 1.9.0

### Minor Changes

- feat: Refactored Turbine, now using Turbine Event Loop, new PBR ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

### Patch Changes

- fix: ProfileHydrated type was imported from wrong path ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

- feat: new pbr definitions ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

- chore: updated test suites ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

- feat: now using WPE instead of Chromium ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

- Updated dependencies [[`1c06dad`](https://github.com/metalizzsas/NusterKit/commit/1c06dad2d9dd0b30ecac8cdbabab56d5604ded7a), [`d6d9e82`](https://github.com/metalizzsas/NusterKit/commit/d6d9e82cc60a0f4f3f67bff64bdaf10bc43a742c), [`6e580c6`](https://github.com/metalizzsas/NusterKit/commit/6e580c60bec7cb82b73846d59a702d8469c67ef1), [`6a3439f`](https://github.com/metalizzsas/NusterKit/commit/6a3439feab7629454f11ef10c5e3f13522115265), [`0fb07f9`](https://github.com/metalizzsas/NusterKit/commit/0fb07f947e5d9e7c1956ab70202570b9d30c744d), [`96b424a`](https://github.com/metalizzsas/NusterKit/commit/96b424ac6648540ec9f6ddc32ce5c529d7a61a43), [`3ab8b1c`](https://github.com/metalizzsas/NusterKit/commit/3ab8b1c8b87268186c4fe5f8b786e3670de04d41), [`270f54f`](https://github.com/metalizzsas/NusterKit/commit/270f54fd4654cfe8103cc69470ca0f0f707a95f2)]:
  - @metalizzsas/nuster-turbine-machines@1.3.0
  - @metalizzsas/nuster-typings@1.4.0

## 1.8.18

### Patch Changes

- fix: changed udev assignment mode ([#178](https://github.com/metalizzsas/NusterKit/pull/178))

## 1.8.17

### Patch Changes

- feat: when turbine is in dev mode, tells the simulation server what configuration is used ([#176](https://github.com/metalizzsas/NusterKit/pull/176))

- fix: multiple steps could sometime be missconfigurated by PBR ([#176](https://github.com/metalizzsas/NusterKit/pull/176))

- fix: Count maintenance had no rounding mechanism ([#176](https://github.com/metalizzsas/NusterKit/pull/176))

- Updated dependencies [[`8f66222`](https://github.com/metalizzsas/NusterKit/commit/8f662220c450d5bf9327ef070ae40610c83d88f6), [`90ca7e9`](https://github.com/metalizzsas/NusterKit/commit/90ca7e922f8599ab1452060a29d1d44b747f750a)]:
  - @metalizzsas/nuster-typings@1.3.4
  - @metalizzsas/nuster-turbine-machines@1.2.15

## 1.8.16

### Patch Changes

- Updated dependencies [[`fbd5534`](https://github.com/metalizzsas/NusterKit/commit/fbd553450d07fbc473ed7c40ee527dd8c63adbd9), [`fbd5534`](https://github.com/metalizzsas/NusterKit/commit/fbd553450d07fbc473ed7c40ee527dd8c63adbd9)]:
  - @metalizzsas/nuster-turbine-machines@1.2.14

## 1.8.15

### Patch Changes

- fix: Core was not able to reach Serial ([#172](https://github.com/metalizzsas/NusterKit/pull/172))

- Updated dependencies [[`b51f0f6`](https://github.com/metalizzsas/NusterKit/commit/b51f0f66e1756916a803767bb56cc88fc6422c95)]:
  - @metalizzsas/nuster-turbine-machines@1.2.13

## 1.8.14

### Patch Changes

- feat: added new smoothit R3 ([#168](https://github.com/metalizzsas/NusterKit/pull/168))

- dev: removed environment check for EthernetIP Controllers ([#169](https://github.com/metalizzsas/NusterKit/pull/169))

- feat: created UART IOController ([#168](https://github.com/metalizzsas/NusterKit/pull/168))

- fix: io gates woudl not export their types ([#168](https://github.com/metalizzsas/NusterKit/pull/168))

- Updated dependencies [[`4a8a07e`](https://github.com/metalizzsas/NusterKit/commit/4a8a07e9a9e79d4e28ea2441c477c6d24faa6d94), [`079e010`](https://github.com/metalizzsas/NusterKit/commit/079e01037269ae53b7a57b46c6bce35e07194cdf), [`03e0757`](https://github.com/metalizzsas/NusterKit/commit/03e075770e79f553b9a66f00ea37ba34effaa003)]:
  - @metalizzsas/nuster-turbine-machines@1.2.12
  - @metalizzsas/nuster-typings@1.3.3

## 1.8.13

### Patch Changes

- fix: Docker images were using workspace label on packages version ([#165](https://github.com/metalizzsas/NusterKit/pull/165))

## 1.8.12

### Patch Changes

- fix: Increased EX260x write interval timer ([#164](https://github.com/metalizzsas/NusterKit/pull/164))

- feat: logs are now stored in a log file ([#162](https://github.com/metalizzsas/NusterKit/pull/162))

- chore: updated dependecies ([#162](https://github.com/metalizzsas/NusterKit/pull/162))

- dev: now using new simulation tools ([#164](https://github.com/metalizzsas/NusterKit/pull/164))

## 1.8.11

### Patch Changes

- fix: PBR was not disposed if canceled before start. ([#152](https://github.com/metalizzsas/NusterKit/pull/152))

## 1.8.10

### Patch Changes

- feat: start conditions can now be disabled programatically ([#151](https://github.com/metalizzsas/NusterKit/pull/151))

- fix: slots could not force load on slots with product data already ([#149](https://github.com/metalizzsas/NusterKit/pull/149))

- fix: maintenances tasks were not correctly tracked. ([#151](https://github.com/metalizzsas/NusterKit/pull/151))
  fix: PBR which used maintenance tasks was not able to end successfully.
- Updated dependencies [[`48f4b81`](https://github.com/metalizzsas/NusterKit/commit/48f4b81fb2babb7e3cca12d9e87165ef05e719f7)]:
  - @metalizzsas/nuster-turbine-machines@1.2.11
  - @metalizzsas/nuster-typings@1.3.2

## 1.8.9

### Patch Changes

- fix: profile could miss some fields due to skeleton updates. ([#145](https://github.com/metalizzsas/NusterKit/pull/145))

## 1.8.8

### Patch Changes

- Updated dependencies [[`c7dbb5c`](https://github.com/metalizzsas/NusterKit/commit/c7dbb5c71d8297ed086ff913f4329220cc31a5cd)]:
  - @metalizzsas/nuster-turbine-machines@1.2.10

## 1.8.7

### Patch Changes

- Updated dependencies [[`47d5505`](https://github.com/metalizzsas/NusterKit/commit/47d5505d8d18c96533d53318bdd110f94e60c35e), [`e710844`](https://github.com/metalizzsas/NusterKit/commit/e7108447271c03329cb3030ad16705436ef1da09)]:
  - @metalizzsas/nuster-turbine-machines@1.2.9

## 1.8.6

### Patch Changes

- fix: forgot to add on main release docker compose file ([#132](https://github.com/metalizzsas/NusterKit/pull/132))

## 1.8.5

### Patch Changes

- fix: wifi-connect had new splited arch docker image ([#130](https://github.com/metalizzsas/NusterKit/pull/130))

## 1.8.4

### Patch Changes

- fix: balena-blocks has changed owner name ([#127](https://github.com/metalizzsas/NusterKit/pull/127))

## 1.8.3

### Patch Changes

- fix: USCleaner with temperature control had an undefined maintenance task ([#120](https://github.com/metalizzsas/NusterKit/pull/120))

- feat: addons can now change only 1 value from an object ([#120](https://github.com/metalizzsas/NusterKit/pull/120))

- Updated dependencies [[`bcad643`](https://github.com/metalizzsas/NusterKit/commit/bcad6430a7d75792e3d048626b4ec46d24c5ee69), [`bcad643`](https://github.com/metalizzsas/NusterKit/commit/bcad6430a7d75792e3d048626b4ec46d24c5ee69)]:
  - @metalizzsas/nuster-turbine-machines@1.2.8
  - @metalizzsas/nuster-typings@1.3.1

## 1.8.2

### Patch Changes

- fix: Maintenance sensor values were inverted ([#111](https://github.com/metalizzsas/NusterKit/pull/111))

## 1.8.1

### Patch Changes

- Updated dependencies [[`f5b9447`](https://github.com/metalizzsas/NusterKit/commit/f5b9447addad5b116d8b730a1230e12480940d24), [`725c31b`](https://github.com/metalizzsas/NusterKit/commit/725c31b06cbc7de2770874d8068baa9ea26ab3b3)]:
  - @metalizzsas/nuster-turbine-machines@1.2.7

## 1.8.0

### Minor Changes

- feat: added sensor maintenance tasks ([#106](https://github.com/metalizzsas/NusterKit/pull/106))

### Patch Changes

- fix: PBS overtime of ended steps should not trigger now ([#102](https://github.com/metalizzsas/NusterKit/pull/102))

- feat: will fetch last Quickstart profile used and add it to the list ([#107](https://github.com/metalizzsas/NusterKit/pull/107))

- feat: manual modes are disabled at cycle start then re-enabled at cycle end ([#108](https://github.com/metalizzsas/NusterKit/pull/108))

- Updated dependencies [[`15fb9d6`](https://github.com/metalizzsas/NusterKit/commit/15fb9d659c3561ebd283c55e64e18f1bcd68e93b), [`1f68195`](https://github.com/metalizzsas/NusterKit/commit/1f6819533ab7cdba036d316113aba56b38024584), [`9b461e1`](https://github.com/metalizzsas/NusterKit/commit/9b461e10140b00b56baa92d8d0fadff83a613994)]:
  - @metalizzsas/nuster-turbine-machines@1.2.6
  - @metalizzsas/nuster-typings@1.3.0

## 1.7.9

### Patch Changes

- fix: Action Modal do not have a closing button, but was required for some views ([#98](https://github.com/metalizzsas/NusterKit/pull/98))
  fix: Renamed modals to be more clear
  fix: Quickstart modals & rows now have translated profile name
  fix: Quickstart profiles now display correct buttons for profiles
  feat: Select new profile when created using Quickstart

  fix: ProfileController now uses `toJSON()` instead of `toObject()`

## 1.7.8

### Patch Changes

- feat: ioScanner now awaits for gate read ([#95](https://github.com/metalizzsas/NusterKit/pull/95))

## 1.7.7

### Patch Changes

- fix: mapped gates now only return 10^-2 digits ([#92](https://github.com/metalizzsas/NusterKit/pull/92))

- added ioScannerInterval for modbus controllers to extends interval between io reads over the network ([#94](https://github.com/metalizzsas/NusterKit/pull/94))

- add: re-added support for legacy Metalfog hardware ([#94](https://github.com/metalizzsas/NusterKit/pull/94))

- Updated dependencies [[`12e6dc4`](https://github.com/metalizzsas/NusterKit/commit/12e6dc446c1a1f46803cf05fbfdaed46edbcb7bd), [`102c66d`](https://github.com/metalizzsas/NusterKit/commit/102c66d0d5dd938997c67751549c65314096f049)]:
  - @metalizzsas/nuster-typings@1.2.6
  - @metalizzsas/nuster-turbine-machines@1.2.5

## 1.7.6

### Patch Changes

- - AnalogScale manuals can now be negative ([#87](https://github.com/metalizzsas/NusterKit/pull/87))
  - Manuals modes now have `emergency-stop` gate always on their security chain

- add: mapped gates are now scale aware ([#87](https://github.com/metalizzsas/NusterKit/pull/87))

- Updated dependencies [[`1707423`](https://github.com/metalizzsas/NusterKit/commit/1707423605e230b716ef92df9ebfaf31d2dc98ae), [`aebe1e1`](https://github.com/metalizzsas/NusterKit/commit/aebe1e10faa7f0875e688754094ae6ab39564b64)]:
  - @metalizzsas/nuster-typings@1.2.5
  - @metalizzsas/nuster-turbine-machines@1.2.4

## 1.7.5

### Patch Changes

- added cycle additional informations ([#80](https://github.com/metalizzsas/NusterKit/pull/80))

- Updated dependencies [[`2ed8316`](https://github.com/metalizzsas/NusterKit/commit/2ed83166ad594dfa53b1a8a1ac74d2ba83442e32), [`d568806`](https://github.com/metalizzsas/NusterKit/commit/d568806fa736052516ec478f7ab286934e394791), [`22efdf0`](https://github.com/metalizzsas/NusterKit/commit/22efdf02c42ef954e90e89fa99715b9b84337968)]:
  - @metalizzsas/nuster-turbine-machines@1.2.3
  - @metalizzsas/nuster-typings@1.2.4

## 1.7.4

### Patch Changes

- config is now editable when machine is running ([#75](https://github.com/metalizzsas/NusterKit/pull/75))

- Updated dependencies [[`726ff02`](https://github.com/metalizzsas/NusterKit/commit/726ff0288cd6317dcfac29b64ff5e6b6e8e2a486)]:
  - @metalizzsas/nuster-typings@1.2.3

## 1.7.3

### Patch Changes

- Updated dependencies [[`930cb62`](https://github.com/metalizzsas/NusterKit/commit/930cb6257985f2fc4a325151f5fd001040b140d1), [`545d2b3`](https://github.com/metalizzsas/NusterKit/commit/545d2b34bcfb0aa011f1fe9763cb387648b982c3)]:
  - @metalizzsas/nuster-turbine-machines@1.2.2
  - @metalizzsas/nuster-typings@1.2.2

## 1.7.2

### Patch Changes

- Fixed regulation loop condition ([#57](https://github.com/metalizzsas/NusterKit/pull/57))

## 1.7.1

### Patch Changes

- Migrated from id to \_id on mongoose documents ([#54](https://github.com/metalizzsas/NusterKit/pull/54))

- Made profiles work again ([#54](https://github.com/metalizzsas/NusterKit/pull/54))

- Updated dependencies [[`6017991`](https://github.com/metalizzsas/NusterKit/commit/6017991b59927a913307b3badf7ff23608710e90)]:
  - @metalizzsas/nuster-turbine-machines@1.2.1
  - @metalizzsas/nuster-typings@1.2.1

## 1.7.0

### Minor Changes

- Removed passives ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

- Passives are now Slots Regulation ([#49](https://github.com/metalizzsas/NusterKit/pull/49))
  Slots loading is now able to choose product series to be loaded

### Patch Changes

- Addons merging now works on objects ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

- Added Regulation programblock ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

- Updated dependencies [[`9ab2380`](https://github.com/metalizzsas/NusterKit/commit/9ab2380ecc5bc1521657976b4eea2dc3e8b3d406), [`a8f628f`](https://github.com/metalizzsas/NusterKit/commit/a8f628f9b77c7a3558ed46bf5e95fd827fba6e85), [`37d65dd`](https://github.com/metalizzsas/NusterKit/commit/37d65ddfcccc3e98f90832d957aa13dcfd9460ec), [`4a7c7fb`](https://github.com/metalizzsas/NusterKit/commit/4a7c7fb39dfdcaf9a4a3d4977f54c74f62e8ffcb)]:
  - @metalizzsas/nuster-typings@1.2.0
  - @metalizzsas/nuster-turbine-machines@1.2.0

## 1.6.3

### Patch Changes

- pbr was ended earlier than expected due to while loop being stopped ([#47](https://github.com/metalizzsas/NusterKit/pull/47))

- Cycle history would fail to save profile and start conditions result due to typing ([#47](https://github.com/metalizzsas/NusterKit/pull/47))

- Updated dependencies [[`93e25e6`](https://github.com/metalizzsas/NusterKit/commit/93e25e6f8ddbd013e3c4446c7ecc24018b8dc6cc)]:
  - @metalizzsas/nuster-turbine-machines@1.1.6

## 1.6.2

### Patch Changes

- Updated dependencies [[`c4c96a8`](https://github.com/metalizzsas/NusterKit/commit/c4c96a85b6e39bfc4d68d69f1490fdacc2f763de)]:
  - @metalizzsas/nuster-turbine-machines@1.1.5

## 1.6.1

### Patch Changes

- - Passive log points are now not stored on passive document ([#24](https://github.com/metalizzsas/NusterKit/pull/24))
  - Passive actuators are now disabled on state change
- Updated dependencies [[`b34ac11`](https://github.com/metalizzsas/NusterKit/commit/b34ac11ea88dd97e9f77e66e9884bc70f93ad0cb)]:
  - @metalizzsas/nuster-turbine-machines@1.1.4

## 1.6.0

### Minor Changes

- Added Configuration screen ([#21](https://github.com/metalizzsas/NusterKit/pull/21))

### Patch Changes

- Updated dependencies [[`ce44c4c`](https://github.com/metalizzsas/NusterKit/commit/ce44c4c4d4587d099118216f519efca21f1a2bb5)]:
  - @metalizzsas/nuster-typings@1.1.4

## 1.5.3

### Patch Changes

- now using nuster-typings only as types only for dev ([#19](https://github.com/metalizzsas/NusterKit/pull/19))

- Updated dependencies [[`4433fe6`](https://github.com/metalizzsas/NusterKit/commit/4433fe642002a5295577e51a05c02f6171d40bd9), [`fca5fd9`](https://github.com/metalizzsas/NusterKit/commit/fca5fd9ad203c9652d90b32b8a3ebbb56ce66f12)]:
  - @metalizzsas/nuster-typings@1.1.3
  - @metalizzsas/nuster-turbine-machines@1.1.3

## 1.5.2

### Patch Changes

- updated typings for all packages ([#17](https://github.com/metalizzsas/NusterKit/pull/17))

- updated dockerfile to match file paths ([#17](https://github.com/metalizzsas/NusterKit/pull/17))

- Updated dependencies [[`f103cff`](https://github.com/metalizzsas/NusterKit/commit/f103cffe1910673d108a7021eee29d7d3fac8833)]:
  - @metalizzsas/nuster-turbine-machines@1.1.2

## 1.5.1

### Patch Changes

- passives logData type change ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

- changelogs are now displayed correctly ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

- profile are now displayed correctly ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

- Updated scripts ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

- Updated dependencies [[`ba59ea4`](https://github.com/metalizzsas/NusterKit/commit/ba59ea4f136284456aff7e409de18a6cf2460be1), [`0833f7e`](https://github.com/metalizzsas/NusterKit/commit/0833f7e26cea4ca58ec86b8aa7982bb94fdc670b)]:
  - @metalizzsas/nuster-turbine-machines@1.1.1

## 1.5.0

### Minor Changes

- First Changeset release ([#2](https://github.com/metalizzsas/NusterKit/pull/2))

### Patch Changes

- dependecies: now using @metalizzsas/ts-enip instead of github branch ts-enip ([#8](https://github.com/metalizzsas/NusterKit/pull/8))

- Removed Schema scripts ([#2](https://github.com/metalizzsas/NusterKit/pull/2))

- Updated dependencies [[`4a01b4e`](https://github.com/metalizzsas/NusterKit/commit/4a01b4e30f67ddb76af16e69090b906e6a250a0c), [`b3ada56`](https://github.com/metalizzsas/NusterKit/commit/b3ada5642854f3bf462649d4a230643ee26480bb)]:
  - @metalizzsas/nuster-turbine-machines@1.1.0
