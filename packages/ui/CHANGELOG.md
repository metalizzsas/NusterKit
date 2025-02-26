# @nuster/ui

## 2.3.4

### Patch Changes

-   [`4e5aaed`](https://github.com/metalizzsas/NusterKit/commit/4e5aaed1caf1eeffb46a6d79709ea898dea73edc) Thanks [@Kworz](https://github.com/Kworz)! - chore(deps): stick @steeze-ui/svelte-icons to 1.5.0

## 2.3.3

## 2.3.2

### Patch Changes

-   [#572](https://github.com/metalizzsas/NusterKit/pull/572) [`1b11999`](https://github.com/metalizzsas/NusterKit/commit/1b1199962a1890ac0832ef81f363913895222ba5) Thanks [@Kworz](https://github.com/Kworz)! - fix: mapped gates would always have the same step

-   [#572](https://github.com/metalizzsas/NusterKit/pull/572) [`56bb002`](https://github.com/metalizzsas/NusterKit/commit/56bb002a68aad98ca4f20e5558aaf9d9834ac89a) Thanks [@Kworz](https://github.com/Kworz)! - feat: display loading screen when turbine is not available

## 2.3.1

### Patch Changes

-   [`9f2093d`](https://github.com/metalizzsas/NusterKit/commit/9f2093da42e714add91f61635ddd47e1e97ef8dd) Thanks [@Kworz](https://github.com/Kworz)! - fix: copied profile now has his name translated

-   [`679be28`](https://github.com/metalizzsas/NusterKit/commit/679be2899785e117dc20f6ccf45101b517cbda15) Thanks [@Kworz](https://github.com/Kworz)! - fix: premade profile could be edited

-   [`ef16681`](https://github.com/metalizzsas/NusterKit/commit/ef1668188ed3bfeb68e8176c7866b3e54af0ee2b) Thanks [@Kworz](https://github.com/Kworz)! - fix: container regulation were not sending forms to correct endpoint

## 2.3.0

### Minor Changes

-   [#568](https://github.com/metalizzsas/NusterKit/pull/568) [`1d45dfa`](https://github.com/metalizzsas/NusterKit/commit/1d45dfab5e8796a353fad826e9b4b0acb84e8f52) Thanks [@Kworz](https://github.com/Kworz)! - feat: duration computation is now step iteration based, you now have the detailed progress with step.progresses json array

### Patch Changes

-   [#568](https://github.com/metalizzsas/NusterKit/pull/568) [`52bda7c`](https://github.com/metalizzsas/NusterKit/commit/52bda7cf9e2a72f8fb9a7d6f745f3a553e9f5eae) Thanks [@Kworz](https://github.com/Kworz)! - fix: toasts call to actions are now executed, no api endpoint data is leaked to the user now.

## 2.2.3

### Patch Changes

-   [#565](https://github.com/metalizzsas/NusterKit/pull/565) [`b49c876`](https://github.com/metalizzsas/NusterKit/commit/b49c876a7ba24b5a777e566fa92dbd67611fc783) Thanks [@Kworz](https://github.com/Kworz)! - feat: if a cycle has an indefinite duration, display current run time

## 2.2.2

## 2.2.1

### Patch Changes

-   [#560](https://github.com/metalizzsas/NusterKit/pull/560) [`9b91f02`](https://github.com/metalizzsas/NusterKit/commit/9b91f02fc59a767e057069c1248dd911339b2273) Thanks [@Kworz](https://github.com/Kworz)! - fix(comp): progress bar would show a progress that is equal to -1

## 2.2.0

### Patch Changes

-   [#556](https://github.com/metalizzsas/NusterKit/pull/556) [`aa9e5f1`](https://github.com/metalizzsas/NusterKit/commit/aa9e5f1f1966e86814439cde57dd7dc41af1f07a) Thanks [@Kworz](https://github.com/Kworz)! - fix(cycle): preparing a cycle with a premade profile with no uuid was not working

## 2.1.4

### Patch Changes

-   [#554](https://github.com/metalizzsas/NusterKit/pull/554) [`f0d3916`](https://github.com/metalizzsas/NusterKit/commit/f0d3916fefead369c0e1369215fe237de07d0892) Thanks [@Kworz](https://github.com/Kworz)! - feat: io page is now using url navigation instead of variable navigation

-   [#554](https://github.com/metalizzsas/NusterKit/pull/554) [`41a83c0`](https://github.com/metalizzsas/NusterKit/commit/41a83c0b733c4668f34c979406c07b80f128d011) Thanks [@Kworz](https://github.com/Kworz)! - feat: users can now trigger a full page reload in settings

## 2.1.3

## 2.1.2

### Patch Changes

-   [#549](https://github.com/metalizzsas/NusterKit/pull/549) [`813940a`](https://github.com/metalizzsas/NusterKit/commit/813940abe3adce39756c813a35f453f9edf13dd0) Thanks [@Kworz](https://github.com/Kworz)! - fix: power management button were not full-length

-   [#549](https://github.com/metalizzsas/NusterKit/pull/549) [`813940a`](https://github.com/metalizzsas/NusterKit/commit/813940abe3adce39756c813a35f453f9edf13dd0) Thanks [@Kworz](https://github.com/Kworz)! - feat: the settings/edit password is now checked on server side, you can provide the `PASSWORD` env var to manipulate its value otherwise its set to `Nuster` by default

## 2.1.1

## 2.1.0

## 2.0.11

### Patch Changes

-   [#543](https://github.com/metalizzsas/NusterKit/pull/543) [`4c5f2a5`](https://github.com/metalizzsas/NusterKit/commit/4c5f2a5784c5c2dd79c2021b4d7701d88dd7395a) Thanks [@Kworz](https://github.com/Kworz)! - feat: when maintenance is cleared, scroll is send to top

-   [#543](https://github.com/metalizzsas/NusterKit/pull/543) [`8eff282`](https://github.com/metalizzsas/NusterKit/commit/8eff2823b776864535f474f62c92d26f562697fa) Thanks [@Kworz](https://github.com/Kworz)! - fix: cycle is now patched if you click back on the same cycle

-   [#543](https://github.com/metalizzsas/NusterKit/pull/543) [`c0fc300`](https://github.com/metalizzsas/NusterKit/commit/c0fc300bee5817537641c87c03ba7b5a881ea5e4) Thanks [@Kworz](https://github.com/Kworz)! - feat: websocket default url is current page Origin

## 2.0.10

### Patch Changes

-   [#539](https://github.com/metalizzsas/NusterKit/pull/539) [`d5d5fe1`](https://github.com/metalizzsas/NusterKit/commit/d5d5fe18668c43b194e56516ee89efbbecd73e76) Thanks [@Kworz](https://github.com/Kworz)! - feat(ui): can now give TURBINE_WS_ADDRESS to tell the client the websocket address to connect to

## 2.0.9

## 2.0.8

## 2.0.7

### Patch Changes

-   [`d3e3be6`](https://github.com/metalizzsas/NusterKit/commit/d3e3be664054d3bf76e6d6e71f1e7d0c16163a7a) Thanks [@Kworz](https://github.com/Kworz)! - fix(docs): help page could not find help docs served staticly by sveltekit

## 2.0.6

### Patch Changes

-   [`a9ba09e`](https://github.com/metalizzsas/NusterKit/commit/a9ba09e0b73989b4b353e0245f2304d49ced9062) Thanks [@Kworz](https://github.com/Kworz)! - fix(css): wrong config name

## 2.0.5

### Patch Changes

-   [`ad63f94`](https://github.com/metalizzsas/NusterKit/commit/ad63f94f2d8bac9162322d3c987f915bc2d075ba) Thanks [@Kworz](https://github.com/Kworz)! - fix(css): tailwindcss config was missing on the docker image, leading to missing css styles

## 2.0.4

### Patch Changes

-   [`78de468`](https://github.com/metalizzsas/NusterKit/commit/78de4688f82ff6251ac1442c0cd964e13a8332be) Thanks [@Kworz](https://github.com/Kworz)! - fix(ssr): do not replace %lang% and %dark% when machine is unconfigured

## 2.0.3

### Patch Changes

-   [#527](https://github.com/metalizzsas/NusterKit/pull/527) [`24fa5a6`](https://github.com/metalizzsas/NusterKit/commit/24fa5a6f8dd0d9afd0575cdd19c4b2eecf52d0a4) Thanks [@Kworz](https://github.com/Kworz)! - fix(ui): hook would not find machine settings in /configure route as they are not available

## 2.0.2

### Patch Changes

-   [`307a2a9`](https://github.com/metalizzsas/NusterKit/commit/307a2a96a832c36ed640a0835e2822f8b8a4bf29) Thanks [@Kworz](https://github.com/Kworz)! - fix(ci): dockerfile was not copying from absolute folder

## 2.0.1

### Patch Changes

-   [`4267bce`](https://github.com/metalizzsas/NusterKit/commit/4267bceb8387bb4b2a0ddc1d470d49dd06944f68) Thanks [@Kworz](https://github.com/Kworz)! - fix(ci): could not build docker images due to configuration issue

## 2.0.0

### Major Changes

-   [#524](https://github.com/metalizzsas/NusterKit/pull/524) [`1a74b6e`](https://github.com/metalizzsas/NusterKit/commit/1a74b6eb81af68665fd9229f454617a7d3bde9de) Thanks [@Kworz](https://github.com/Kworz)! - feat(breaking): updated all packages to be machine agnostic

### Patch Changes

-   [#522](https://github.com/metalizzsas/NusterKit/pull/522) [`5f7a0f6`](https://github.com/metalizzsas/NusterKit/commit/5f7a0f612f9d11dfa172cfbfda0f2b32ddbad3e1) Thanks [@Kworz](https://github.com/Kworz)! - chore(deps): updated to latest dependencies

## 1.13.6

### Patch Changes

-   [#518](https://github.com/metalizzsas/NusterKit/pull/518) [`1bf54e6c`](https://github.com/metalizzsas/NusterKit/commit/1bf54e6c21e7241f13fe7e6e8c3374fd5c6de1bb) Thanks [@Kworz](https://github.com/Kworz)! - fix(profiles): time fields with undefined enabled times would make profil un-usable

## 1.13.5

### Patch Changes

-   [#506](https://github.com/metalizzsas/NusterKit/pull/506) [`cb04ebe8`](https://github.com/metalizzsas/NusterKit/commit/cb04ebe8c4cc4c8d302a57c193a1b3c783f5b453) Thanks [@Kworz](https://github.com/Kworz)! - feat(desktop): maintenance now displays the last task date

-   [#506](https://github.com/metalizzsas/NusterKit/pull/506) [`7b7cc0f6`](https://github.com/metalizzsas/NusterKit/commit/7b7cc0f6180770fd8745669a0f5ac5b1c9db75c6) Thanks [@Kworz](https://github.com/Kworz)! - feat: updated profile model

## 1.13.4

### Patch Changes

-   [#494](https://github.com/metalizzsas/NusterKit/pull/494) [`294c0edd`](https://github.com/metalizzsas/NusterKit/commit/294c0edd3b9559100e24efc2138be85b86bd98eb) Thanks [@Kworz](https://github.com/Kworz)! - fix: PillMenu was overusing the /machine endpoint

## 1.13.3

### Patch Changes

-   [#485](https://github.com/metalizzsas/NusterKit/pull/485) [`402e3292`](https://github.com/metalizzsas/NusterKit/commit/402e3292756383c2458a8e4f85ec5e3e5b755eda) Thanks [@Kworz](https://github.com/Kworz)! - fix: cycle was'nt taking the whole screen

## 1.13.2

### Patch Changes

-   [#482](https://github.com/metalizzsas/NusterKit/pull/482) [`d8f22b8d`](https://github.com/metalizzsas/NusterKit/commit/d8f22b8dfc2462e71032b3eff1ab1f4fa7221e21) Thanks [@Kworz](https://github.com/Kworz)! - feat: added a blue dot if an update is available

-   [#482](https://github.com/metalizzsas/NusterKit/pull/482) [`7e25317b`](https://github.com/metalizzsas/NusterKit/commit/7e25317b5418411ace9e5bf7e13bede5ae85dbef) Thanks [@Kworz](https://github.com/Kworz)! - fix: version was not good

## 1.13.1

### Patch Changes

-   [#480](https://github.com/metalizzsas/NusterKit/pull/480) [`c3ccafbd`](https://github.com/metalizzsas/NusterKit/commit/c3ccafbd5f41baffd8ff0263df5ccae075fe0a2b) Thanks [@Kworz](https://github.com/Kworz)! - feat: added network configuration page

## 1.13.0

### Minor Changes

-   [#478](https://github.com/metalizzsas/NusterKit/pull/478) [`875fb150`](https://github.com/metalizzsas/NusterKit/commit/875fb150a91c442d67e48e07696b982dccd6a0bf) Thanks [@Kworz](https://github.com/Kworz)! - chore(deps): updated dependencies to latest versions

### Patch Changes

-   [#478](https://github.com/metalizzsas/NusterKit/pull/478) [`eec96cbe`](https://github.com/metalizzsas/NusterKit/commit/eec96cbe028455748f5cd7952199f302249e051f) Thanks [@Kworz](https://github.com/Kworz)! - chore(deps): updated dependencies

## 1.12.7

### Patch Changes

-   [#471](https://github.com/metalizzsas/NusterKit/pull/471) [`4614a04d`](https://github.com/metalizzsas/NusterKit/commit/4614a04d1fc1d4751b6fb4029f60aaceaa99140a) Thanks [@Kworz](https://github.com/Kworz)! - feat: regulation max security target is now set in the machine configuration

## 1.12.6

### Patch Changes

-   [#467](https://github.com/metalizzsas/NusterKit/pull/467) [`65b791df`](https://github.com/metalizzsas/NusterKit/commit/65b791dfff39724ce29335f7331f3a29d3ca8352) Thanks [@Kworz](https://github.com/Kworz)! - fix: select is now clickable from the whole box

-   [#467](https://github.com/metalizzsas/NusterKit/pull/467) [`a83bf8d8`](https://github.com/metalizzsas/NusterKit/commit/a83bf8d8d4e2a874f244fc6ad95f0e550990643e) Thanks [@Kworz](https://github.com/Kworz)! - feat: cycles can now be paused

-   [#467](https://github.com/metalizzsas/NusterKit/pull/467) [`2901aa3f`](https://github.com/metalizzsas/NusterKit/commit/2901aa3ff3961da7473c949f3d560e17f4f33673) Thanks [@Kworz](https://github.com/Kworz)! - fix: button no longer have a dropdown shadow

## 1.12.5

### Patch Changes

-   [#444](https://github.com/metalizzsas/NusterKit/pull/444) [`59c2d0fe`](https://github.com/metalizzsas/NusterKit/commit/59c2d0fef7bbd3c2bc6c107f721a02736acd96e2) Thanks [@Kworz](https://github.com/Kworz)! - feat: container regulation messages now supply additional information about which security condition is responsible of the regulation shutdown

-   [#465](https://github.com/metalizzsas/NusterKit/pull/465) [`8cbe98d1`](https://github.com/metalizzsas/NusterKit/commit/8cbe98d12cb320b24004112d8cbbcee41cc48671) Thanks [@Kworz](https://github.com/Kworz)! - feat: early exited steps are now displayed with a great UI

## 1.12.4

### Patch Changes

-   [#457](https://github.com/metalizzsas/NusterKit/pull/457) [`0684196f`](https://github.com/metalizzsas/NusterKit/commit/0684196fedb0c9118bf95d78edf272f3de977e54) Thanks [@Kworz](https://github.com/Kworz)! - chore: add a redirect button on main error screen

## 1.12.3

### Patch Changes

-   [#453](https://github.com/metalizzsas/NusterKit/pull/453) [`2353ca17`](https://github.com/metalizzsas/NusterKit/commit/2353ca176bdf92ff03ada657cdaeaf53846bf54f) Thanks [@Kworz](https://github.com/Kworz)! - fix: nuster version was not diplayed

## 1.12.2

### Patch Changes

-   [#451](https://github.com/metalizzsas/NusterKit/pull/451) [`28d7f9ff`](https://github.com/metalizzsas/NusterKit/commit/28d7f9ff4bf1700dc349857f21c3fe9577695a31) Thanks [@Kworz](https://github.com/Kworz)! - fix: desktop would not compute container product state correctly due to new product lifespan values

## 1.12.1

### Patch Changes

-   [#419](https://github.com/metalizzsas/NusterKit/pull/419) [`dd2614ac`](https://github.com/metalizzsas/NusterKit/commit/dd2614aca055c45068f28e2a67dc8b0d7e1b9261) Thanks [@0auriane](https://github.com/0auriane)! - fix: updated back button ui in help page

-   [#429](https://github.com/metalizzsas/NusterKit/pull/429) [`172ca476`](https://github.com/metalizzsas/NusterKit/commit/172ca476dbf55352ebe08dc68f0e48f42b106b03) Thanks [@Kworz](https://github.com/Kworz)! - fix: remove Latex code in help files

-   [#419](https://github.com/metalizzsas/NusterKit/pull/419) [`d73a60c9`](https://github.com/metalizzsas/NusterKit/commit/d73a60c9dc4a9713982c3a1d30a60f1d9cb8ee0c) Thanks [@0auriane](https://github.com/0auriane)! - fix: re-introduced latex code remover

-   [#429](https://github.com/metalizzsas/NusterKit/pull/429) [`7689c4b5`](https://github.com/metalizzsas/NusterKit/commit/7689c4b575c505c761569ff44d43e486f35e7c0b) Thanks [@Kworz](https://github.com/Kworz)! - fix: list could overflow when reduced

## 1.12.0

### Minor Changes

-   [#445](https://github.com/metalizzsas/NusterKit/pull/445) [`b0e6d476`](https://github.com/metalizzsas/NusterKit/commit/b0e6d47650ce4088dbbf52d6d9af0cdbd6391d30) Thanks [@Kworz](https://github.com/Kworz)! - feat: desktop help has been re-designed to have less issues

### Patch Changes

-   [#445](https://github.com/metalizzsas/NusterKit/pull/445) [`f3d14e93`](https://github.com/metalizzsas/NusterKit/commit/f3d14e93280d4d82e28182683790543a492559cd) Thanks [@Kworz](https://github.com/Kworz)! - feat: changed profile display method, used sveltekit routes instead of displaying profil on the same route.

-   [#423](https://github.com/metalizzsas/NusterKit/pull/423) [`e8384828`](https://github.com/metalizzsas/NusterKit/commit/e838482886f2c31039148fe7e31662b015db3d64) Thanks [@Kworz](https://github.com/Kworz)! - fix: nuster help would display All languages

-   [#445](https://github.com/metalizzsas/NusterKit/pull/445) [`5bbedae0`](https://github.com/metalizzsas/NusterKit/commit/5bbedae0c11c93016e331d5c9e88a32e2163b2c6) Thanks [@Kworz](https://github.com/Kworz)! - chore: moved PillMenu buttons to a seprate component

-   [#445](https://github.com/metalizzsas/NusterKit/pull/445) [`f3d14e93`](https://github.com/metalizzsas/NusterKit/commit/f3d14e93280d4d82e28182683790543a492559cd) Thanks [@Kworz](https://github.com/Kworz)! - feat: on profile copy, user is redirected to the copied profile

## 1.11.19

### Patch Changes

-   [#438](https://github.com/metalizzsas/NusterKit/pull/438) [`90c0e885`](https://github.com/metalizzsas/NusterKit/commit/90c0e885fd4733708a81017e0df2077124efc423) Thanks [@Kworz](https://github.com/Kworz)! - feat: machine can now be shutted down or rebooted from nuster desktop

## 1.11.18

### Patch Changes

-   fix: selects options could be under other selects ([#428](https://github.com/metalizzsas/NusterKit/pull/428))

-   fix: Container product load date was not readable enough ([#428](https://github.com/metalizzsas/NusterKit/pull/428))

## 1.11.17

### Patch Changes

-   chore: updated deps ([#422](https://github.com/metalizzsas/NusterKit/pull/422))

## 1.11.16

### Patch Changes

-   fix: toggle with undefnied values are now converted to boolean by default ([#415](https://github.com/metalizzsas/NusterKit/pull/415))

-   feat: created variables to hide multilayer and profile non-selected fields ([#415](https://github.com/metalizzsas/NusterKit/pull/415))

-   feat: realtime maintenance ([#407](https://github.com/metalizzsas/NusterKit/pull/407))

-   fix: product with no lifespan set now displays "Lifespan unknown" ([#414](https://github.com/metalizzsas/NusterKit/pull/414))

-   fix: removed overflow rules that made select fiels invisible sometimes ([#414](https://github.com/metalizzsas/NusterKit/pull/414))

-   feat: sensor maintenance now shows units ([#407](https://github.com/metalizzsas/NusterKit/pull/407))

## 1.11.15

### Patch Changes

-   fix: container product would not accept any other value than the first compatible product if supportedProductSeries length was more than 1 ([#396](https://github.com/metalizzsas/NusterKit/pull/396))

## 1.11.14

### Patch Changes

-   fix: help links could resolve to wrong url if relative path was given ([#389](https://github.com/metalizzsas/NusterKit/pull/389))

## 1.11.13

### Patch Changes

-   fix: help page would not load due to clone error ([#383](https://github.com/metalizzsas/NusterKit/pull/383))

## 1.11.12

### Patch Changes

-   fix: compute the maintenance state correctly ([#381](https://github.com/metalizzsas/NusterKit/pull/381))

-   feat: display a warning if some of the safety conditions are in a warning state ([#381](https://github.com/metalizzsas/NusterKit/pull/381))

## 1.11.11

### Patch Changes

-   fix: maintenances images are now displayed correctly ([#351](https://github.com/metalizzsas/NusterKit/pull/351))

-   fix: help image could crash the app ([#351](https://github.com/metalizzsas/NusterKit/pull/351))

-   fix: help Indexes were not found due to wrong path ([#351](https://github.com/metalizzsas/NusterKit/pull/351))

## 1.11.10

### Patch Changes

-   feat: show wifi button in any case ([#374](https://github.com/metalizzsas/NusterKit/pull/374))

-   feat: progressbar indefinite if value is set to -1 ([#374](https://github.com/metalizzsas/NusterKit/pull/374))

-   fix: container product translation key was off ([#374](https://github.com/metalizzsas/NusterKit/pull/374))

## 1.11.9

### Patch Changes

-   feat: toggle now has a background with stripes when locked ([#369](https://github.com/metalizzsas/NusterKit/pull/369))

-   feat: cycle displays a resume when ended ([#369](https://github.com/metalizzsas/NusterKit/pull/369))

## 1.11.8

### Patch Changes

-   fix: cycle now shows correct icons and colors ([#365](https://github.com/metalizzsas/NusterKit/pull/365))
    fix: multiple steps now works as intended
    fix: skipped multiple step no longer skip itself at the next iteration

## 1.11.7

### Patch Changes

-   fix: clicking on input inside keyboard will not re-open keyboard ([#360](https://github.com/metalizzsas/NusterKit/pull/360))

-   feat: password field can now show text typed if asked ([#360](https://github.com/metalizzsas/NusterKit/pull/360))

-   feat: keyboard will now be 65% screen wide ([#360](https://github.com/metalizzsas/NusterKit/pull/360))

## 1.11.6

### Patch Changes

-   feat: Settings can now display array of strings ([#355](https://github.com/metalizzsas/NusterKit/pull/355))

-   feat: changed iframe url to windows host ([#355](https://github.com/metalizzsas/NusterKit/pull/355))

## 1.11.5

### Patch Changes

-   feat: enhanced cycle step progress bar ([#345](https://github.com/metalizzsas/NusterKit/pull/345))

## 1.11.4

### Patch Changes

-   fix: run conditions had wrong translations keys namespace ([#340](https://github.com/metalizzsas/NusterKit/pull/340))

-   feat: can access wifi setup using settings page ([#340](https://github.com/metalizzsas/NusterKit/pull/340))

-   fix: display cycle events only if dev mode ([#340](https://github.com/metalizzsas/NusterKit/pull/340))

## 1.11.3

### Patch Changes

-   feat: io gates supports float values ([#338](https://github.com/metalizzsas/NusterKit/pull/338))

## 1.11.2

### Patch Changes

-   fix: desktop reditects to / if turbine in unreachable ([#336](https://github.com/metalizzsas/NusterKit/pull/336))

## 1.11.1

### Patch Changes

-   feat: detect if machine is configured, if not, redirect to configuration screen ([#332](https://github.com/metalizzsas/NusterKit/pull/332))

## 1.11.0

### Minor Changes

-   feat: PBR can now end using 2 scenarios: ([#314](https://github.com/metalizzsas/NusterKit/pull/314))

    -   Soft ending stops a step then goes to another step then the cycle ends.
    -   Hard ending was the default behavior before, it is stoping the cycle directly.

### Patch Changes

-   feat: adaptaed ui to use new run Conditions, added Cycle events ([#314](https://github.com/metalizzsas/NusterKit/pull/314))

## 1.10.12

### Patch Changes

-   fix: improved select field display ([#307](https://github.com/metalizzsas/NusterKit/pull/307))

-   feat: new help files folders structure ([#307](https://github.com/metalizzsas/NusterKit/pull/307))

## 1.10.11

### Patch Changes

-   fix: localhost was used in server hook instead of nuster-turbine due to NODE_ENV being `development` ([#298](https://github.com/metalizzsas/NusterKit/pull/298))

## 1.10.10

### Patch Changes

-   chore: updated packages ([#291](https://github.com/metalizzsas/NusterKit/pull/291))

## 1.10.9

### Patch Changes

-   chore: trigger a rebuild ([#272](https://github.com/metalizzsas/NusterKit/pull/272))

## 1.10.8

### Patch Changes

-   chore: updated mono repo structure ([#270](https://github.com/metalizzsas/NusterKit/pull/270))

## 1.10.7

### Patch Changes

-   feat: ui settings are now stored on turbine instead of desktop localeStorage ([#266](https://github.com/metalizzsas/NusterKit/pull/266))

-   fix: timefields units could overflow on other units ([#266](https://github.com/metalizzsas/NusterKit/pull/266))

## 1.10.6

### Patch Changes

-   fix: various input fields changes ([#255](https://github.com/metalizzsas/NusterKit/pull/255))

-   fix: when cycle is patched it is now unselected correctly ([#255](https://github.com/metalizzsas/NusterKit/pull/255))

-   fix: profile copy is now translated correctly ([#255](https://github.com/metalizzsas/NusterKit/pull/255))

## 1.10.5

### Patch Changes

-   fix: containers would not unload product ([#253](https://github.com/metalizzsas/NusterKit/pull/253))

-   feat: containers no longer use a network_mode of `host` ([#253](https://github.com/metalizzsas/NusterKit/pull/253))

-   fix: only show runAmout when set to more than 1 ([#253](https://github.com/metalizzsas/NusterKit/pull/253))

## 1.10.4

### Patch Changes

-   fix: simple-keyboard-layout were imported on server side ([#251](https://github.com/metalizzsas/NusterKit/pull/251))

## 1.10.3

### Patch Changes

-   fix: would not show install update button ([#247](https://github.com/metalizzsas/NusterKit/pull/247))

-   feat: enhanced progress computation and progress display ([#249](https://github.com/metalizzsas/NusterKit/pull/249))

## 1.10.2

### Patch Changes

-   fix: IO gates now have a numeric input instead of a slider ([#243](https://github.com/metalizzsas/NusterKit/pull/243))

-   feat: ehanced websocket connection screen ([#243](https://github.com/metalizzsas/NusterKit/pull/243))

## 1.10.1

### Patch Changes

-   fix: profile time field was not taking enabledTimes in account ([#237](https://github.com/metalizzsas/NusterKit/pull/237))

## 1.10.0

### Minor Changes

-   feat: moved documentation to @metalizzsas/nuster-misc ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

### Patch Changes

-   feat: Additional machine informations can be displayed on landing page of desktop, configurable in machine specs.json ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

-   fix: updated markdown styles ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

-   feat: now using nuster-misc as source for i18n files & documentation files ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

-   fix: updated translations ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

-   feat: added vite plugin to copy documentation files to static folder ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

-   fix: When loading product the first productseries is selected ([#233](https://github.com/metalizzsas/NusterKit/pull/233))

## 1.9.20

### Patch Changes

-   feat: Maintenance & Help images are zoomable now ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

-   fix: new api routes ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

-   fix: http method was PATCH instead of patch ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

-   fix: now installing OTA updates ([#231](https://github.com/metalizzsas/NusterKit/pull/231))

## 1.9.19

### Patch Changes

-   fix: updated time field using numField instead of select ([#230](https://github.com/metalizzsas/NusterKit/pull/230))

-   feat: cycle now display runCounts / runAmouts of multiple steps ([#230](https://github.com/metalizzsas/NusterKit/pull/230))

## 1.9.18

### Patch Changes

-   fix: disabled internal keyboard of weston ([#226](https://github.com/metalizzsas/NusterKit/pull/226))

-   fix: select field is not handled correctly by safari ([#226](https://github.com/metalizzsas/NusterKit/pull/226))

-   fix: updated UA check for internal keyboard ([#226](https://github.com/metalizzsas/NusterKit/pull/226))

## 1.9.17

### Patch Changes

-   chore: revert 3e350d8e8ac5f4b4fa996527775a3e056a75c07d ([#224](https://github.com/metalizzsas/NusterKit/pull/224))

## 1.9.16

### Patch Changes

-   fix: window size was not set properly ([#222](https://github.com/metalizzsas/NusterKit/pull/222))

## 1.9.15

### Patch Changes

-   fix: float profile rows had no label ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

-   feat: locking realtimeData if keyboard is open ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

-   fix: re-add tohora as it was mandatory ([#219](https://github.com/metalizzsas/NusterKit/pull/219))

-   chore: added addons translations ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

-   chore: updated translations for french & italian ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

-   fix: made profile in cycle premade optional ([#221](https://github.com/metalizzsas/NusterKit/pull/221))

## 1.9.14

### Patch Changes

-   chore: disabled tohora, network mode to host ([#216](https://github.com/metalizzsas/NusterKit/pull/216))

## 1.9.13

### Patch Changes

-   feat: using weston & webkit wpe instead of kiosk ([#214](https://github.com/metalizzsas/NusterKit/pull/214))

## 1.9.12

### Patch Changes

-   fix: removed /api redirect on turbine & on handleFetch ([#212](https://github.com/metalizzsas/NusterKit/pull/212))

## 1.9.11

### Patch Changes

-   fix: bypass fetch url to locahost url ([#210](https://github.com/metalizzsas/NusterKit/pull/210))

## 1.9.10

### Patch Changes

-   chore: updated simple-keyboard-layout ([#208](https://github.com/metalizzsas/NusterKit/pull/208))

## 1.9.9

### Patch Changes

-   fix: proxy was listening on port 8080 ([#206](https://github.com/metalizzsas/NusterKit/pull/206))

## 1.9.8

### Patch Changes

-   fix: wrong path for mime types on proxy ([#204](https://github.com/metalizzsas/NusterKit/pull/204))

## 1.9.7

### Patch Changes

-   fix: api routes are now relative to client webapp ([#202](https://github.com/metalizzsas/NusterKit/pull/202))

-   fix: WS url is now determined by client side ([#202](https://github.com/metalizzsas/NusterKit/pull/202))

## 1.9.6

### Patch Changes

-   fix: forgot base /api/ on 1 file ([#200](https://github.com/metalizzsas/NusterKit/pull/200))

## 1.9.5

### Patch Changes

-   fix: removed base url on prod ([#198](https://github.com/metalizzsas/NusterKit/pull/198))

## 1.9.4

### Patch Changes

-   fix: url was sometimes not prefixed by /api/ for api endpoints ([#196](https://github.com/metalizzsas/NusterKit/pull/196))

## 1.9.3

### Patch Changes

-   fix: Github action now builds projects using NODE_ENV=production ([#194](https://github.com/metalizzsas/NusterKit/pull/194))

## 1.9.2

### Patch Changes

-   fix: nginx removed Host header ([#192](https://github.com/metalizzsas/NusterKit/pull/192))

## 1.9.1

### Patch Changes

-   fix: url is now computed using Host header ([#190](https://github.com/metalizzsas/NusterKit/pull/190))

## 1.9.0

### Minor Changes

-   feat: refactored desktop with a brand new look and is now using new typings ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

### Patch Changes

-   fix: updated i18n ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

-   feat: new pbr definitions ([#188](https://github.com/metalizzsas/NusterKit/pull/188))

## 1.8.10

### Patch Changes

-   chore: updated dependencies ([#176](https://github.com/metalizzsas/NusterKit/pull/176))

## 1.8.9

### Patch Changes

-   fix: profiles would not have a background ([#168](https://github.com/metalizzsas/NusterKit/pull/168))
    fix: profiles would not display rows with "enabled" in their name

## 1.8.8

### Patch Changes

-   fix: Docker images were using workspace label on packages version ([#165](https://github.com/metalizzsas/NusterKit/pull/165))

## 1.8.7

### Patch Changes

-   chore: now using context instead of stores for navStack data, removed useContainer store ([#160](https://github.com/metalizzsas/NusterKit/pull/160))

## 1.8.6

### Patch Changes

-   feat: start conditions can now be disabled programatically ([#151](https://github.com/metalizzsas/NusterKit/pull/151))

-   fix: maintenances tasks were not correctly tracked. ([#151](https://github.com/metalizzsas/NusterKit/pull/151))
    fix: PBR which used maintenance tasks was not able to end successfully.

## 1.8.5

### Patch Changes

-   fix: set navigation actions of help center to empty array ([#145](https://github.com/metalizzsas/NusterKit/pull/145))

-   fix: removed useless `add new profile` button in profile list ([#145](https://github.com/metalizzsas/NusterKit/pull/145))

## 1.8.4

### Patch Changes

-   fix: config route was not handling undefined objects, and was hiding save button ([#124](https://github.com/metalizzsas/NusterKit/pull/124))

-   fix: step % could sometimes be on 2 lines. ([#125](https://github.com/metalizzsas/NusterKit/pull/125))

## 1.8.3

### Patch Changes

-   feat: edited regulation display on slot component ([#120](https://github.com/metalizzsas/NusterKit/pull/120))

## 1.8.2

### Patch Changes

-   fix: keyboard was always shown even on non bundled instances ([#118](https://github.com/metalizzsas/NusterKit/pull/118))
    feat: keyboard now have layouts for each langs

-   feat: added help pages ([#115](https://github.com/metalizzsas/NusterKit/pull/115))

-   feat: changed font to `Inter` ([#115](https://github.com/metalizzsas/NusterKit/pull/115))

-   feat: redacted french help pages ([#115](https://github.com/metalizzsas/NusterKit/pull/115))

## 1.8.1

### Patch Changes

-   fix: modals had wrong title color on dark mode ([#116](https://github.com/metalizzsas/NusterKit/pull/116))
    feat: added regulation informations on slot component

## 1.8.0

### Minor Changes

-   feat: added sensor maintenance tasks ([#106](https://github.com/metalizzsas/NusterKit/pull/106))

### Patch Changes

-   feat: will fetch last Quickstart profile used and add it to the list ([#107](https://github.com/metalizzsas/NusterKit/pull/107))

## 1.7.12

### Patch Changes

-   fix: keyboard height modal offset was wrong ([#100](https://github.com/metalizzsas/NusterKit/pull/100))
    fix: keyboard was unable to write Uppercase caracters

-   fix: Action Modal do not have a closing button, but was required for some views ([#98](https://github.com/metalizzsas/NusterKit/pull/98))
    fix: Renamed modals to be more clear
    fix: Quickstart modals & rows now have translated profile name
    fix: Quickstart profiles now display correct buttons for profiles
    feat: Select new profile when created using Quickstart

    fix: ProfileController now uses `toJSON()` instead of `toObject()`

## 1.7.11

### Patch Changes

-   fix: config api calls were not using the proxy `/api` prefix ([#95](https://github.com/metalizzsas/NusterKit/pull/95))

## 1.7.10

### Patch Changes

-   added /remote route to access nuster desktop via remote ip ([#94](https://github.com/metalizzsas/NusterKit/pull/94))

-   fix: input analog gates were showing the slider ([#92](https://github.com/metalizzsas/NusterKit/pull/92))
    fix: changelog was sometimes not found due to relative url instead of absolute

-   fix: SSR is now disabled, it prevent error messages to be shown at each page refresh ([#94](https://github.com/metalizzsas/NusterKit/pull/94))

## 1.7.9

### Patch Changes

-   -   AnalogScale manuals can now be negative ([#87](https://github.com/metalizzsas/NusterKit/pull/87))
    -   Manuals modes now have `emergency-stop` gate always on their security chain

-   add: mapped gates are now scale aware ([#87](https://github.com/metalizzsas/NusterKit/pull/87))

## 1.7.8

### Patch Changes

-   updated package json to stick to latest sveltekit & vite versions ([#84](https://github.com/metalizzsas/NusterKit/pull/84))

## 1.7.7

### Patch Changes

-   added cycle additional informations ([#80](https://github.com/metalizzsas/NusterKit/pull/80))

-   fix: Quickstart cycle failed to send profile to CycleController ([#80](https://github.com/metalizzsas/NusterKit/pull/80))

## 1.7.6

### Patch Changes

-   config is now editable when machine is running ([#75](https://github.com/metalizzsas/NusterKit/pull/75))

-   updated code readability & removed useless goto calls ([#73](https://github.com/metalizzsas/NusterKit/pull/73))

-   properties class was spreading undefined ([#75](https://github.com/metalizzsas/NusterKit/pull/75))

## 1.7.5

### Patch Changes

-   fix: retry & return buttons were not working on connect layout ([#71](https://github.com/metalizzsas/NusterKit/pull/71))

## 1.7.4

### Patch Changes

-   fix: Italian was mixed with French translations ([#66](https://github.com/metalizzsas/NusterKit/pull/66))

-   i18n: lang files were not formated correctly ([#66](https://github.com/metalizzsas/NusterKit/pull/66))

-   i18n: finalized Italian translations ([#66](https://github.com/metalizzsas/NusterKit/pull/66))

-   removed: passive components ([#66](https://github.com/metalizzsas/NusterKit/pull/66))

-   fix: expanded Ws connection from 10s to 30s ([#66](https://github.com/metalizzsas/NusterKit/pull/66))

## 1.7.3

### Patch Changes

-   fix: maintenance tasks images were not displayed ([#64](https://github.com/metalizzsas/NusterKit/pull/64))

## 1.7.2

### Patch Changes

-   Added italiano as an available language. Still needs some work. ([#61](https://github.com/metalizzsas/NusterKit/pull/61))

-   Added a warning on slot product for non time tracked machines ([#59](https://github.com/metalizzsas/NusterKit/pull/59))

## 1.7.1

### Patch Changes

-   Made profiles work again ([#54](https://github.com/metalizzsas/NusterKit/pull/54))

## 1.7.0

### Minor Changes

-   Removed passives ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

-   Passives are now Slots Regulation ([#49](https://github.com/metalizzsas/NusterKit/pull/49))
    Slots loading is now able to choose product series to be loaded

### Patch Changes

-   Adjusted translation ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

-   Inputkb disable input arrows for numeric inputs ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

-   Layout adjustment ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

-   adjusted slots list order ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

-   Externalized call to action execution ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

-   Moved modals to separate div instead of stacking them on body tag ([#49](https://github.com/metalizzsas/NusterKit/pull/49))

## 1.6.5

### Patch Changes

-   Network mac address filter should be more reliable ([#42](https://github.com/metalizzsas/NusterKit/pull/42))

-   Disabled kiosk translation with meta and html tags ([#42](https://github.com/metalizzsas/NusterKit/pull/42))

## 1.6.4

### Patch Changes

-   Websocket are handled more properly ([#40](https://github.com/metalizzsas/NusterKit/pull/40))

-   Machine list fetchs ar enow handled more properly ([#40](https://github.com/metalizzsas/NusterKit/pull/40))

-   Load Indicator should not appear randomly now ([#40](https://github.com/metalizzsas/NusterKit/pull/40))

## 1.6.3

### Patch Changes

-   Right top corner buttons works correctly now ([#34](https://github.com/metalizzsas/NusterKit/pull/34))

## 1.6.2

### Patch Changes

-   Websocket connexion now handles timeouts ([#31](https://github.com/metalizzsas/NusterKit/pull/31))

## 1.6.1

### Patch Changes

-   Passive chart automatically updates now ([#24](https://github.com/metalizzsas/NusterKit/pull/24))

## 1.6.0

### Minor Changes

-   Added Configuration screen ([#21](https://github.com/metalizzsas/NusterKit/pull/21))

## 1.5.2

### Patch Changes

-   now using nuster-typings only as types only for dev ([#19](https://github.com/metalizzsas/NusterKit/pull/19))

## 1.5.1

### Patch Changes

-   updated typings for all packages ([#17](https://github.com/metalizzsas/NusterKit/pull/17))

-   updated dockerfile to match file paths ([#17](https://github.com/metalizzsas/NusterKit/pull/17))

## 1.5.0

### Minor Changes

-   changed the way the Websocket connection is established ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

### Patch Changes

-   passives logData type change ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

-   changlelog is now copied to static files ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

-   changelogs are now displayed correctly ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

-   profile are now displayed correctly ([#15](https://github.com/metalizzsas/NusterKit/pull/15))

## 1.4.1

### Patch Changes

-   lint: Linting progress ([#13](https://github.com/metalizzsas/NusterKit/pull/13))

-   pkg: updated dependencies ([#13](https://github.com/metalizzsas/NusterKit/pull/13))

-   lint: migrated from eslint-plugin-svelte3 to eslint-plugin-svelte ([#13](https://github.com/metalizzsas/NusterKit/pull/13))

## 1.4.0

### Minor Changes

-   First Changeset release ([#2](https://github.com/metalizzsas/NusterKit/pull/2))
