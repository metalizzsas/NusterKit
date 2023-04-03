# @metalizzsas/nuster-turbine-machines

## 1.5.0

### Minor Changes

- feat: Created Metalfog M R2 ([#312](https://github.com/metalizzsas/NusterKit/pull/312))

### Patch Changes

- tests: updated tests ([#312](https://github.com/metalizzsas/NusterKit/pull/312))

- feat: smoothit m r3 no longer uses 3way valve ([#309](https://github.com/metalizzsas/NusterKit/pull/309))

- fix: USCleaner M R1 now uses Duration instead of a sensor based filter duration ([#311](https://github.com/metalizzsas/NusterKit/pull/311))

## 1.4.8

### Patch Changes

- chore: updated packages ([#291](https://github.com/metalizzsas/NusterKit/pull/291))

## 1.4.7

### Patch Changes

- chore: updated serial path for smoothit m r 3 ([#289](https://github.com/metalizzsas/NusterKit/pull/289))

## 1.4.6

### Patch Changes

- chore: trigger a rebuild ([#272](https://github.com/metalizzsas/NusterKit/pull/272))

## 1.4.5

### Patch Changes

- chore: updated mono repo structure ([#270](https://github.com/metalizzsas/NusterKit/pull/270))

## 1.4.4

### Patch Changes

- tests: profil is now checked if all fields are present ([#253](https://github.com/metalizzsas/NusterKit/pull/253))

- feat: added activation-wash for mf-m-0 ([#253](https://github.com/metalizzsas/NusterKit/pull/253))

## 1.4.3

### Patch Changes

- fix: smoothit m r2 was not opening uv#cache & closing nozzle#cache if only uv-curing was enabled ([#249](https://github.com/metalizzsas/NusterKit/pull/249))

## 1.4.2

### Patch Changes

- fix: when uv-curing smoothit m r2 did not enabled uv lamp ventilation ([#237](https://github.com/metalizzsas/NusterKit/pull/237))

## 1.4.1

### Patch Changes

- chore: updated machine specs after tests ehancements ([#235](https://github.com/metalizzsas/NusterKit/pull/235))

## 1.4.0

### Minor Changes

- feat: changed folder structure for turbine-machines ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

### Patch Changes

- feat: Additional machine informations can be displayed on landing page of desktop, configurable in machine specs.json ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- fix: updated translations ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- chore: updated tests ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- feat: added dedicated TSConfig file for ES6 module generation ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

## 1.3.6

### Patch Changes

- fix: metalfog m r1 addons were extending wrong properties ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

## 1.3.5

### Patch Changes

- fix: updated smoothit m r3 ([#230](https://github.com/metalizzsas/NusterKit/pull/230))

## 1.3.4

### Patch Changes

- fix: smoothit mr3 updated serial /dev address ([#226](https://github.com/metalizzsas/NusterKit/pull/226))

## 1.3.3

### Patch Changes

- chore: added addons translations ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

- fix: made profile in cycle premade optional ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

## 1.3.2

### Patch Changes

- feat: added over-heat security on USC M R1 ([#202](https://github.com/metalizzsas/NusterKit/pull/202))

## 1.3.1

### Patch Changes

- fix: Github action now builds projects using NODE_ENV=production ([#194](https://github.com/metalizzsas/NusterKit/pull/194))

## 1.3.0

### Minor Changes

- feat: made machine specs match new typings ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

### Patch Changes

- fix: updated i18n ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

- fix: removed circular reference to Turbine from Turbine-Machines ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

- feat: updated specs to match new pbr format ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

- chore: updated test suites ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

- feat: added over-heat sensor ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

## 1.2.15

### Patch Changes

- feat: smoothit mr 2, removed ir-curing ([#176](https://github.com/metalizzsas/NusterKit/pull/176))

## 1.2.14

### Patch Changes

- fix: uv overheat start condition had wrong value ([#174](https://github.com/metalizzsas/NusterKit/pull/174))

- fix: nozzle-low had overlapping address with uv-cache ([#174](https://github.com/metalizzsas/NusterKit/pull/174))

## 1.2.13

### Patch Changes

- fix: Smoothit m r3 had wrong gates ([#172](https://github.com/metalizzsas/NusterKit/pull/172))

## 1.2.12

### Patch Changes

- fix: Disabled motor rotation on cycle startup ([#171](https://github.com/metalizzsas/NusterKit/pull/171))

- feat: added new smoothit R3 ([#168](https://github.com/metalizzsas/NusterKit/pull/168))

## 1.2.11

### Patch Changes

- feat: start conditions can now be disabled programatically ([#151](https://github.com/metalizzsas/NusterKit/pull/151))

## 1.2.10

### Patch Changes

- fix: metalfog-se had worng gate names for llc met-wash ([#142](https://github.com/metalizzsas/NusterKit/pull/142))

## 1.2.9

### Patch Changes

- feat: Metalfog SE now uses WAGO controllers instead of EM4 ([#136](https://github.com/metalizzsas/NusterKit/pull/136))

- feat: metallization can now be washed after each layer. ([#140](https://github.com/metalizzsas/NusterKit/pull/140))

## 1.2.8

### Patch Changes

- fix: USCleaner with temperature control had an undefined maintenance task ([#120](https://github.com/metalizzsas/NusterKit/pull/120))

## 1.2.7

### Patch Changes

- fix: metalfog SE crash at vapors extraction due to misspell value ([#109](https://github.com/metalizzsas/NusterKit/pull/109))

- fix: 5 min profile was 10 minute long ([#109](https://github.com/metalizzsas/NusterKit/pull/109))
  feat: uscleaner m 1 motor change direction at half the cycle

## 1.2.6

### Patch Changes

- add: Metalfog SE maintenance tasks ([#102](https://github.com/metalizzsas/NusterKit/pull/102))

- feat: added product series for Metalfog SE ([#102](https://github.com/metalizzsas/NusterKit/pull/102))

- feat: added sensor maintenance tasks ([#106](https://github.com/metalizzsas/NusterKit/pull/106))

## 1.2.5

### Patch Changes

- add: re-added support for legacy Metalfog hardware ([#94](https://github.com/metalizzsas/NusterKit/pull/94))

## 1.2.4

### Patch Changes

- - uscleaner m r1: ([#87](https://github.com/metalizzsas/NusterKit/pull/87))
    - negative manual modes
    - mapped io gate adjustments
    - addons adjusted
  - metalfog m r1:
    - negative manual modes

## 1.2.3

### Patch Changes

- uscleaner: added clover closed security check ([#78](https://github.com/metalizzsas/NusterKit/pull/78))

- added cycle additional informations ([#80](https://github.com/metalizzsas/NusterKit/pull/80))

- uscleaner: reduced maximum speed to preserve mechanics ([#81](https://github.com/metalizzsas/NusterKit/pull/81))

## 1.2.2

### Patch Changes

- Added italiano as an available language. Still needs some work. ([#61](https://github.com/metalizzsas/NusterKit/pull/61))

## 1.2.1

### Patch Changes

- Migrated from id to \_id on mongoose documents ([#54](https://github.com/metalizzsas/NusterKit/pull/54))

## 1.2.0

### Minor Changes

- Passives are now Slots Regulation ([#49](https://github.com/metalizzsas/NusterKit/pull/49))
  Slots loading is now able to choose product series to be loaded

### Patch Changes

- Adjusted tests & translations ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

## 1.1.6

### Patch Changes

- Cleaning is now pulsed ([#47](https://github.com/metalizzsas/NusterKit/pull/47))

## 1.1.5

### Patch Changes

- nozzle cleaning is enabled oly if metalization step is enabled ([#44](https://github.com/metalizzsas/NusterKit/pull/44))

## 1.1.4

### Patch Changes

- USC-M-R1: Removed pump-drain ([#24](https://github.com/metalizzsas/NusterKit/pull/24))

## 1.1.3

### Patch Changes

- now using nuster-typings only as types only for dev ([#19](https://github.com/metalizzsas/NusterKit/pull/19))

## 1.1.2

### Patch Changes

- updated typings for all packages ([#17](https://github.com/metalizzsas/NusterKit/pull/17))

## 1.1.1

### Patch Changes

- migrated temperature control to spec file ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

- premade profile adjusted translation & name ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

## 1.1.0

### Minor Changes

- First Changeset release ([#2](https://github.com/metalizzsas/NusterKit/pull/2))

### Patch Changes

- Next ([#2](https://github.com/metalizzsas/NusterKit/pull/2))
