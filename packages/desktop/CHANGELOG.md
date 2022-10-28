# @metalizzsas/nuster-desktop

## 1.7.9

### Patch Changes

- - AnalogScale manuals can now be negative ([#87](https://github.com/metalizzsas/NusterKit/pull/87))
  - Manuals modes now have `emergency-stop` gate always on their security chain

- add: mapped gates are now scale aware ([#87](https://github.com/metalizzsas/NusterKit/pull/87))

## 1.7.8

### Patch Changes

- updated package json to stick to latest sveltekit & vite versions ([#84](https://github.com/metalizzsas/NusterKit/pull/84))

## 1.7.7

### Patch Changes

- added cycle additional informations ([#80](https://github.com/metalizzsas/NusterKit/pull/80))

- fix: Quickstart cycle failed to send profile to CycleController ([#80](https://github.com/metalizzsas/NusterKit/pull/80))

## 1.7.6

### Patch Changes

- config is now editable when machine is running ([#75](https://github.com/metalizzsas/NusterKit/pull/75))

- updated code readability & removed useless goto calls ([#73](https://github.com/metalizzsas/NusterKit/pull/73))

- properties class was spreading undefined ([#75](https://github.com/metalizzsas/NusterKit/pull/75))

## 1.7.5

### Patch Changes

- fix: retry & return buttons were not working on connect layout ([#71](https://github.com/metalizzsas/NusterKit/pull/71))

## 1.7.4

### Patch Changes

- fix: Italian was mixed with French translations ([#66](https://github.com/metalizzsas/NusterKit/pull/66))

- i18n: lang files were not formated correctly ([#66](https://github.com/metalizzsas/NusterKit/pull/66))

- i18n: finalized Italian translations ([#66](https://github.com/metalizzsas/NusterKit/pull/66))

- removed: passive components ([#66](https://github.com/metalizzsas/NusterKit/pull/66))

- fix: expanded Ws connection from 10s to 30s ([#66](https://github.com/metalizzsas/NusterKit/pull/66))

## 1.7.3

### Patch Changes

- fix: maintenance tasks images were not displayed ([#64](https://github.com/metalizzsas/NusterKit/pull/64))

## 1.7.2

### Patch Changes

- Added italiano as an available language. Still needs some work. ([#61](https://github.com/metalizzsas/NusterKit/pull/61))

- Added a warning on slot product for non time tracked machines ([#59](https://github.com/metalizzsas/NusterKit/pull/59))

## 1.7.1

### Patch Changes

- Made profiles work again ([#54](https://github.com/metalizzsas/NusterKit/pull/54))

## 1.7.0

### Minor Changes

- Removed passives ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

- Passives are now Slots Regulation ([#49](https://github.com/metalizzsas/NusterKit/pull/49))
  Slots loading is now able to choose product series to be loaded

### Patch Changes

- Adjusted translation ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

- Inputkb disable input arrows for numeric inputs ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

- Layout adjustment ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

- adjusted slots list order ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

- Externalized call to action execution ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

- Moved modals to separate div instead of stacking them on body tag ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

## 1.6.5

### Patch Changes

- Network mac address filter should be more reliable ([#42](https://github.com/metalizzsas/NusterKit/pull/42))

- Disabled kiosk translation with meta and html tags ([#42](https://github.com/metalizzsas/NusterKit/pull/42))

## 1.6.4

### Patch Changes

- Websocket are handled more properly ([#40](https://github.com/metalizzsas/NusterKit/pull/40))

- Machine list fetchs ar enow handled more properly ([#40](https://github.com/metalizzsas/NusterKit/pull/40))

- Load Indicator should not appear randomly now ([#40](https://github.com/metalizzsas/NusterKit/pull/40))

## 1.6.3

### Patch Changes

- Right top corner buttons works correctly now ([#34](https://github.com/metalizzsas/NusterKit/pull/34))

## 1.6.2

### Patch Changes

- Websocket connexion now handles timeouts ([#31](https://github.com/metalizzsas/NusterKit/pull/31))

## 1.6.1

### Patch Changes

- Passive chart automatically updates now ([#24](https://github.com/metalizzsas/NusterKit/pull/24))

## 1.6.0

### Minor Changes

- Added Configuration screen ([#21](https://github.com/metalizzsas/NusterKit/pull/21))

## 1.5.2

### Patch Changes

- now using nuster-typings only as types only for dev ([#19](https://github.com/metalizzsas/NusterKit/pull/19))

## 1.5.1

### Patch Changes

- updated typings for all packages ([#17](https://github.com/metalizzsas/NusterKit/pull/17))

- updated dockerfile to match file paths ([#17](https://github.com/metalizzsas/NusterKit/pull/17))

## 1.5.0

### Minor Changes

- changed the way the Websocket connection is established ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

### Patch Changes

- passives logData type change ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

- changlelog is now copied to static files ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

- changelogs are now displayed correctly ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

- profile are now displayed correctly ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

## 1.4.1

### Patch Changes

- lint: Linting progress ([#13](https://github.com/metalizzsas/NusterKit/pull/13))

- pkg: updated dependencies ([#13](https://github.com/metalizzsas/NusterKit/pull/13))

- lint: migrated from eslint-plugin-svelte3 to eslint-plugin-svelte ([#13](https://github.com/metalizzsas/NusterKit/pull/13))

## 1.4.0

### Minor Changes

- First Changeset release ([#2](https://github.com/metalizzsas/NusterKit/pull/2))
