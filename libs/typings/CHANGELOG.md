# @metalizzsas/nuster-typings

## 1.6.1

### Patch Changes

- [#480](https://github.com/metalizzsas/NusterKit/pull/480) [`b87da52a`](https://github.com/metalizzsas/NusterKit/commit/b87da52ac89122aa9e3780136c7c34ca77f9460e) Thanks [@Kworz](https://github.com/Kworz)! - feat: added dbus typings for network connectivity

## 1.6.0

### Minor Changes

- [#478](https://github.com/metalizzsas/NusterKit/pull/478) [`875fb150`](https://github.com/metalizzsas/NusterKit/commit/875fb150a91c442d67e48e07696b982dccd6a0bf) Thanks [@Kworz](https://github.com/Kworz)! - chore(deps): updated dependencies to latest versions

### Patch Changes

- [#478](https://github.com/metalizzsas/NusterKit/pull/478) [`eec96cbe`](https://github.com/metalizzsas/NusterKit/commit/eec96cbe028455748f5cd7952199f302249e051f) Thanks [@Kworz](https://github.com/Kworz)! - chore(deps): updated dependencies

- [#477](https://github.com/metalizzsas/NusterKit/pull/477) [`a8bae300`](https://github.com/metalizzsas/NusterKit/commit/a8bae300d31820052a926d927b4e792984da7898) Thanks [@Kworz](https://github.com/Kworz)! - feat: created wifi router endpoints

## 1.5.8

### Patch Changes

- [#471](https://github.com/metalizzsas/NusterKit/pull/471) [`4614a04d`](https://github.com/metalizzsas/NusterKit/commit/4614a04d1fc1d4751b6fb4029f60aaceaa99140a) Thanks [@Kworz](https://github.com/Kworz)! - feat: regulation max security target is now set in the machine configuration

## 1.5.7

### Patch Changes

- [#467](https://github.com/metalizzsas/NusterKit/pull/467) [`a83bf8d8`](https://github.com/metalizzsas/NusterKit/commit/a83bf8d8d4e2a874f244fc6ad95f0e550990643e) Thanks [@Kworz](https://github.com/Kworz)! - feat: cycles can now be paused

## 1.5.6

### Patch Changes

- [#444](https://github.com/metalizzsas/NusterKit/pull/444) [`59c2d0fe`](https://github.com/metalizzsas/NusterKit/commit/59c2d0fef7bbd3c2bc6c107f721a02736acd96e2) Thanks [@Kworz](https://github.com/Kworz)! - feat: container regulation messages now supply additional information about which security condition is responsible of the regulation shutdown

- [#444](https://github.com/metalizzsas/NusterKit/pull/444) [`1123235b`](https://github.com/metalizzsas/NusterKit/commit/1123235b82fa1bf1f193902d70d707b6908b69cb) Thanks [@Kworz](https://github.com/Kworz)! - feat: container regulation can now have a security gate with a different value required

- [#465](https://github.com/metalizzsas/NusterKit/pull/465) [`8cbe98d1`](https://github.com/metalizzsas/NusterKit/commit/8cbe98d12cb320b24004112d8cbbcee41cc48671) Thanks [@Kworz](https://github.com/Kworz)! - feat: early exited steps are now displayed with a great UI

## 1.5.5

### Patch Changes

- chore: updated deps ([#422](https://github.com/metalizzsas/NusterKit/pull/422))

## 1.5.4

### Patch Changes

- feat: created variables to hide multilayer and profile non-selected fields ([#415](https://github.com/metalizzsas/NusterKit/pull/415))

- feat: realtime maintenance ([#407](https://github.com/metalizzsas/NusterKit/pull/407))

- feat: updated product series ([#414](https://github.com/metalizzsas/NusterKit/pull/414))

- feat: created Incremental profile field type ([#415](https://github.com/metalizzsas/NusterKit/pull/415))

## 1.5.3

### Patch Changes

- feat: maintenance status can now only return a warning state maximum ([#381](https://github.com/metalizzsas/NusterKit/pull/381))

## 1.5.2

### Patch Changes

- chore: generating schemas on the fly ([#332](https://github.com/metalizzsas/NusterKit/pull/332))

## 1.5.1

### Patch Changes

- chore: modified exports ([#329](https://github.com/metalizzsas/NusterKit/pull/329))

## 1.5.0

### Minor Changes

- feat: PBR can now end using 2 scenarios: ([#314](https://github.com/metalizzsas/NusterKit/pull/314))

  - Soft ending stops a step then goes to another step then the cycle ends.
  - Hard ending was the default behavior before, it is stoping the cycle directly.

### Patch Changes

- feat: replaced startConditions with runConditions ([#314](https://github.com/metalizzsas/NusterKit/pull/314))

## 1.4.7

### Patch Changes

- chore: updated packages ([#291](https://github.com/metalizzsas/NusterKit/pull/291))

## 1.4.6

### Patch Changes

- chore: trigger a rebuild ([#272](https://github.com/metalizzsas/NusterKit/pull/272))

## 1.4.5

### Patch Changes

- chore: updated mono repo structure ([#270](https://github.com/metalizzsas/NusterKit/pull/270))

## 1.4.4

### Patch Changes

- fix: typings were used in production ([#268](https://github.com/metalizzsas/NusterKit/pull/268))

## 1.4.3

### Patch Changes

- chore: updated tsconfig ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- feat: Additional machine informations can be displayed on landing page of desktop, configurable in machine specs.json ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

## 1.4.2

### Patch Changes

- chore: added addons translations ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

- fix: made profile in cycle premade optional ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

## 1.4.1

### Patch Changes

- fix: Github action now builds projects using NODE_ENV=production ([#194](https://github.com/metalizzsas/NusterKit/pull/194))

## 1.4.0

### Minor Changes

- feat: Refactored typings to be more readable ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

### Patch Changes

- fix: updated i18n ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

- feat: new pbr definitions ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

## 1.3.4

### Patch Changes

- chore: updated dependencies ([#176](https://github.com/metalizzsas/NusterKit/pull/176))

## 1.3.3

### Patch Changes

- feat: created UART IOController ([#168](https://github.com/metalizzsas/NusterKit/pull/168))

## 1.3.2

### Patch Changes

- feat: start conditions can now be disabled programatically ([#151](https://github.com/metalizzsas/NusterKit/pull/151))

## 1.3.1

### Patch Changes

- feat: addons can now change only 1 value from an object ([#120](https://github.com/metalizzsas/NusterKit/pull/120))

## 1.3.0

### Minor Changes

- feat: added sensor maintenance tasks ([#106](https://github.com/metalizzsas/NusterKit/pull/106))

## 1.2.6

### Patch Changes

- added ioScannerInterval for modbus controllers to extends interval between io reads over the network ([#94](https://github.com/metalizzsas/NusterKit/pull/94))

## 1.2.5

### Patch Changes

- - AnalogScale manuals can now be negative ([#87](https://github.com/metalizzsas/NusterKit/pull/87))
  - Manuals modes now have `emergency-stop` gate always on their security chain

## 1.2.4

### Patch Changes

- added cycle additional informations ([#80](https://github.com/metalizzsas/NusterKit/pull/80))

## 1.2.3

### Patch Changes

- fix: histories id is now \_id ([#75](https://github.com/metalizzsas/NusterKit/pull/75))

## 1.2.2

### Patch Changes

- Added isNotTimeTracked settings ofr machines that do not have a RTC clock module ([#59](https://github.com/metalizzsas/NusterKit/pull/59))

## 1.2.1

### Patch Changes

- Migrated from id to \_id on mongoose documents ([#54](https://github.com/metalizzsas/NusterKit/pull/54))

## 1.2.0

### Minor Changes

- Removed passives ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

- Passives are now Slots Regulation ([#49](https://github.com/metalizzsas/NusterKit/pull/49))
  Slots loading is now able to choose product series to be loaded

### Patch Changes

- Removed duplicated program & parameter blocks ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

## 1.1.4

### Patch Changes

- Added Configuration screen ([#21](https://github.com/metalizzsas/NusterKit/pull/21))

## 1.1.3

### Patch Changes

- Replaced enums with types instead ([#19](https://github.com/metalizzsas/NusterKit/pull/19))

- now using nuster-typings only as types only for dev ([#19](https://github.com/metalizzsas/NusterKit/pull/19))

## 1.1.2

### Patch Changes

- updated typings for all packages ([#17](https://github.com/metalizzsas/NusterKit/pull/17))

## 1.1.1

### Patch Changes

- passives logData type change ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

## 1.1.0

### Minor Changes

- First Changeset release ([#2](https://github.com/metalizzsas/NusterKit/pull/2))

### Patch Changes

- Added linting ([#2](https://github.com/metalizzsas/NusterKit/pull/2))
