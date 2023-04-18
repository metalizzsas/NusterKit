# @metalizzsas/nuster-desktop

## 1.11.12

### Patch Changes

- fix: compute the maintenance state correctly ([#381](https://github.com/metalizzsas/NusterKit/pull/381))

- feat: display a warning if some of the safety conditions are in a warning state ([#381](https://github.com/metalizzsas/NusterKit/pull/381))

## 1.11.11

### Patch Changes

- fix: maintenances images are now displayed correctly ([#351](https://github.com/metalizzsas/NusterKit/pull/351))

- fix: help image could crash the app ([#351](https://github.com/metalizzsas/NusterKit/pull/351))

- fix: help Indexes were not found due to wrong path ([#351](https://github.com/metalizzsas/NusterKit/pull/351))

## 1.11.10

### Patch Changes

- feat: show wifi button in any case ([#374](https://github.com/metalizzsas/NusterKit/pull/374))

- feat: progressbar indefinite if value is set to -1 ([#374](https://github.com/metalizzsas/NusterKit/pull/374))

- fix: container product translation key was off ([#374](https://github.com/metalizzsas/NusterKit/pull/374))

## 1.11.9

### Patch Changes

- feat: toggle now has a background with stripes when locked ([#369](https://github.com/metalizzsas/NusterKit/pull/369))

- feat: cycle displays a resume when ended ([#369](https://github.com/metalizzsas/NusterKit/pull/369))

## 1.11.8

### Patch Changes

- fix: cycle now shows correct icons and colors ([#365](https://github.com/metalizzsas/NusterKit/pull/365))
  fix: multiple steps now works as intended
  fix: skipped multiple step no longer skip itself at the next iteration

## 1.11.7

### Patch Changes

- fix: clicking on input inside keyboard will not re-open keyboard ([#360](https://github.com/metalizzsas/NusterKit/pull/360))

- feat: password field can now show text typed if asked ([#360](https://github.com/metalizzsas/NusterKit/pull/360))

- feat: keyboard will now be 65% screen wide ([#360](https://github.com/metalizzsas/NusterKit/pull/360))

## 1.11.6

### Patch Changes

- feat: Settings can now display array of strings ([#355](https://github.com/metalizzsas/NusterKit/pull/355))

- feat: changed iframe url to windows host ([#355](https://github.com/metalizzsas/NusterKit/pull/355))

## 1.11.5

### Patch Changes

- feat: enhanced cycle step progress bar ([#345](https://github.com/metalizzsas/NusterKit/pull/345))

## 1.11.4

### Patch Changes

- fix: run conditions had wrong translations keys namespace ([#340](https://github.com/metalizzsas/NusterKit/pull/340))

- feat: can access wifi setup using settings page ([#340](https://github.com/metalizzsas/NusterKit/pull/340))

- fix: display cycle events only if dev mode ([#340](https://github.com/metalizzsas/NusterKit/pull/340))

## 1.11.3

### Patch Changes

- feat: io gates supports float values ([#338](https://github.com/metalizzsas/NusterKit/pull/338))

## 1.11.2

### Patch Changes

- fix: desktop reditects to / if turbine in unreachable ([#336](https://github.com/metalizzsas/NusterKit/pull/336))

## 1.11.1

### Patch Changes

- feat: detect if machine is configured, if not, redirect to configuration screen ([#332](https://github.com/metalizzsas/NusterKit/pull/332))

## 1.11.0

### Minor Changes

- feat: PBR can now end using 2 scenarios: ([#314](https://github.com/metalizzsas/NusterKit/pull/314))

  - Soft ending stops a step then goes to another step then the cycle ends.
  - Hard ending was the default behavior before, it is stoping the cycle directly.

### Patch Changes

- feat: adaptaed ui to use new run Conditions, added Cycle events ([#314](https://github.com/metalizzsas/NusterKit/pull/314))

## 1.10.12

### Patch Changes

- fix: improved select field display ([#307](https://github.com/metalizzsas/NusterKit/pull/307))

- feat: new help files folders structure ([#307](https://github.com/metalizzsas/NusterKit/pull/307))

## 1.10.11

### Patch Changes

- fix: localhost was used in server hook instead of nuster-turbine due to NODE_ENV being `development` ([#298](https://github.com/metalizzsas/NusterKit/pull/298))

## 1.10.10

### Patch Changes

- chore: updated packages ([#291](https://github.com/metalizzsas/NusterKit/pull/291))

## 1.10.9

### Patch Changes

- chore: trigger a rebuild ([#272](https://github.com/metalizzsas/NusterKit/pull/272))

## 1.10.8

### Patch Changes

- chore: updated mono repo structure ([#270](https://github.com/metalizzsas/NusterKit/pull/270))

## 1.10.7

### Patch Changes

- feat: ui settings are now stored on turbine instead of desktop localeStorage ([#266](https://github.com/metalizzsas/NusterKit/pull/266))

- fix: timefields units could overflow on other units ([#266](https://github.com/metalizzsas/NusterKit/pull/266))

## 1.10.6

### Patch Changes

- fix: various input fields changes ([#255](https://github.com/metalizzsas/NusterKit/pull/255))

- fix: when cycle is patched it is now unselected correctly ([#255](https://github.com/metalizzsas/NusterKit/pull/255))

- fix: profile copy is now translated correctly ([#255](https://github.com/metalizzsas/NusterKit/pull/255))

## 1.10.5

### Patch Changes

- fix: containers would not unload product ([#253](https://github.com/metalizzsas/NusterKit/pull/253))

- feat: containers no longer use a network_mode of `host` ([#253](https://github.com/metalizzsas/NusterKit/pull/253))

- fix: only show runAmout when set to more than 1 ([#253](https://github.com/metalizzsas/NusterKit/pull/253))

## 1.10.4

### Patch Changes

- fix: simple-keyboard-layout were imported on server side ([#251](https://github.com/metalizzsas/NusterKit/pull/251))

## 1.10.3

### Patch Changes

- fix: would not show install update button ([#247](https://github.com/metalizzsas/NusterKit/pull/247))

- feat: enhanced progress computation and progress display ([#249](https://github.com/metalizzsas/NusterKit/pull/249))

## 1.10.2

### Patch Changes

- fix: IO gates now have a numeric input instead of a slider ([#243](https://github.com/metalizzsas/NusterKit/pull/243))

- feat: ehanced websocket connection screen ([#243](https://github.com/metalizzsas/NusterKit/pull/243))

## 1.10.1

### Patch Changes

- fix: profile time field was not taking enabledTimes in account ([#237](https://github.com/metalizzsas/NusterKit/pull/237))

## 1.10.0

### Minor Changes

- feat: moved documentation to @metalizzsas/nuster-misc ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

### Patch Changes

- feat: Additional machine informations can be displayed on landing page of desktop, configurable in machine specs.json ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- fix: updated markdown styles ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- feat: now using nuster-misc as source for i18n files & documentation files ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- fix: updated translations ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- feat: added vite plugin to copy documentation files to static folder ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

- fix: When loading product the first productseries is selected ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

## 1.9.20

### Patch Changes

- feat: Maintenance & Help images are zoomable now ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

- fix: new api routes ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

- fix: http method was PATCH instead of patch ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

- fix: now installing OTA updates ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

## 1.9.19

### Patch Changes

- fix: updated time field using numField instead of select ([#230](https://github.com/metalizzsas/NusterKit/pull/230))

- feat: cycle now display runCounts / runAmouts of multiple steps ([#230](https://github.com/metalizzsas/NusterKit/pull/230))

## 1.9.18

### Patch Changes

- fix: disabled internal keyboard of weston ([#226](https://github.com/metalizzsas/NusterKit/pull/226))

- fix: select field is not handled correctly by safari ([#226](https://github.com/metalizzsas/NusterKit/pull/226))

- fix: updated UA check for internal keyboard ([#226](https://github.com/metalizzsas/NusterKit/pull/226))

## 1.9.17

### Patch Changes

- chore: revert 3e350d8e8ac5f4b4fa996527775a3e056a75c07d ([#224](https://github.com/metalizzsas/NusterKit/pull/224))

## 1.9.16

### Patch Changes

- fix: window size was not set properly ([#222](https://github.com/metalizzsas/NusterKit/pull/222))

## 1.9.15

### Patch Changes

- fix: float profile rows had no label ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

- feat: locking realtimeData if keyboard is open ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

- fix: re-add tohora as it was mandatory ([#219](https://github.com/metalizzsas/NusterKit/pull/219))

- chore: added addons translations ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

- chore: updated translations for french & italian ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

- fix: made profile in cycle premade optional ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

## 1.9.14

### Patch Changes

- chore: disabled tohora, network mode to host ([#216](https://github.com/metalizzsas/NusterKit/pull/216))

## 1.9.13

### Patch Changes

- feat: using weston & webkit wpe instead of kiosk ([#214](https://github.com/metalizzsas/NusterKit/pull/214))

## 1.9.12

### Patch Changes

- fix: removed /api redirect on turbine & on handleFetch ([#212](https://github.com/metalizzsas/NusterKit/pull/212))

## 1.9.11

### Patch Changes

- fix: bypass fetch url to locahost url ([#210](https://github.com/metalizzsas/NusterKit/pull/210))

## 1.9.10

### Patch Changes

- chore: updated simple-keyboard-layout ([#208](https://github.com/metalizzsas/NusterKit/pull/208))

## 1.9.9

### Patch Changes

- fix: proxy was listening on port 8080 ([#206](https://github.com/metalizzsas/NusterKit/pull/206))

## 1.9.8

### Patch Changes

- fix: wrong path for mime types on proxy ([#204](https://github.com/metalizzsas/NusterKit/pull/204))

## 1.9.7

### Patch Changes

- fix: api routes are now relative to client webapp ([#202](https://github.com/metalizzsas/NusterKit/pull/202))

- fix: WS url is now determined by client side ([#202](https://github.com/metalizzsas/NusterKit/pull/202))

## 1.9.6

### Patch Changes

- fix: forgot base /api/ on 1 file ([#200](https://github.com/metalizzsas/NusterKit/pull/200))

## 1.9.5

### Patch Changes

- fix: removed base url on prod ([#198](https://github.com/metalizzsas/NusterKit/pull/198))

## 1.9.4

### Patch Changes

- fix: url was sometimes not prefixed by /api/ for api endpoints ([#196](https://github.com/metalizzsas/NusterKit/pull/196))

## 1.9.3

### Patch Changes

- fix: Github action now builds projects using NODE_ENV=production ([#194](https://github.com/metalizzsas/NusterKit/pull/194))

## 1.9.2

### Patch Changes

- fix: nginx removed Host header ([#192](https://github.com/metalizzsas/NusterKit/pull/192))

## 1.9.1

### Patch Changes

- fix: url is now computed using Host header ([#190](https://github.com/metalizzsas/NusterKit/pull/190))

## 1.9.0

### Minor Changes

- feat: refactored desktop with a brand new look and is now using new typings ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

### Patch Changes

- fix: updated i18n ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

- feat: new pbr definitions ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

## 1.8.10

### Patch Changes

- chore: updated dependencies ([#176](https://github.com/metalizzsas/NusterKit/pull/176))

## 1.8.9

### Patch Changes

- fix: profiles would not have a background ([#168](https://github.com/metalizzsas/NusterKit/pull/168))
  fix: profiles would not display rows with "enabled" in their name

## 1.8.8

### Patch Changes

- fix: Docker images were using workspace label on packages version ([#165](https://github.com/metalizzsas/NusterKit/pull/165))

## 1.8.7

### Patch Changes

- chore: now using context instead of stores for navStack data, removed useContainer store ([#160](https://github.com/metalizzsas/NusterKit/pull/160))

## 1.8.6

### Patch Changes

- feat: start conditions can now be disabled programatically ([#151](https://github.com/metalizzsas/NusterKit/pull/151))

- fix: maintenances tasks were not correctly tracked. ([#151](https://github.com/metalizzsas/NusterKit/pull/151))
  fix: PBR which used maintenance tasks was not able to end successfully.

## 1.8.5

### Patch Changes

- fix: set navigation actions of help center to empty array ([#145](https://github.com/metalizzsas/NusterKit/pull/145))

- fix: removed useless `add new profile` button in profile list ([#145](https://github.com/metalizzsas/NusterKit/pull/145))

## 1.8.4

### Patch Changes

- fix: config route was not handling undefined objects, and was hiding save button ([#124](https://github.com/metalizzsas/NusterKit/pull/124))

- fix: step % could sometimes be on 2 lines. ([#125](https://github.com/metalizzsas/NusterKit/pull/125))

## 1.8.3

### Patch Changes

- feat: edited regulation display on slot component ([#120](https://github.com/metalizzsas/NusterKit/pull/120))

## 1.8.2

### Patch Changes

- fix: keyboard was always shown even on non bundled instances ([#118](https://github.com/metalizzsas/NusterKit/pull/118))
  feat: keyboard now have layouts for each langs

- feat: added help pages ([#115](https://github.com/metalizzsas/NusterKit/pull/115))

- feat: changed font to `Inter` ([#115](https://github.com/metalizzsas/NusterKit/pull/115))

- feat: redacted french help pages ([#115](https://github.com/metalizzsas/NusterKit/pull/115))

## 1.8.1

### Patch Changes

- fix: modals had wrong title color on dark mode ([#116](https://github.com/metalizzsas/NusterKit/pull/116))
  feat: added regulation informations on slot component

## 1.8.0

### Minor Changes

- feat: added sensor maintenance tasks ([#106](https://github.com/metalizzsas/NusterKit/pull/106))

### Patch Changes

- feat: will fetch last Quickstart profile used and add it to the list ([#107](https://github.com/metalizzsas/NusterKit/pull/107))

## 1.7.12

### Patch Changes

- fix: keyboard height modal offset was wrong ([#100](https://github.com/metalizzsas/NusterKit/pull/100))
  fix: keyboard was unable to write Uppercase caracters

- fix: Action Modal do not have a closing button, but was required for some views ([#98](https://github.com/metalizzsas/NusterKit/pull/98))
  fix: Renamed modals to be more clear
  fix: Quickstart modals & rows now have translated profile name
  fix: Quickstart profiles now display correct buttons for profiles
  feat: Select new profile when created using Quickstart

  fix: ProfileController now uses `toJSON()` instead of `toObject()`

## 1.7.11

### Patch Changes

- fix: config api calls were not using the proxy `/api` prefix ([#95](https://github.com/metalizzsas/NusterKit/pull/95))

## 1.7.10

### Patch Changes

- added /remote route to access nuster desktop via remote ip ([#94](https://github.com/metalizzsas/NusterKit/pull/94))

- fix: input analog gates were showing the slider ([#92](https://github.com/metalizzsas/NusterKit/pull/92))
  fix: changelog was sometimes not found due to relative url instead of absolute

- fix: SSR is now disabled, it prevent error messages to be shown at each page refresh ([#94](https://github.com/metalizzsas/NusterKit/pull/94))

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
