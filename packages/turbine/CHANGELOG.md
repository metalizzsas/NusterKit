# @metalizzsas/nuster-turbine

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
