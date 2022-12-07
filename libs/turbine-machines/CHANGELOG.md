# @metalizzsas/nuster-turbine-machines

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
