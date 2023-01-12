# Nuster Kit

[![🚀 CI](https://github.com/metalizzsas/NusterKit/actions/workflows/ci.yaml/badge.svg)](https://github.com/metalizzsas/NusterKit/actions/workflows/ci.yaml)
[![🚀 Release](https://github.com/metalizzsas/NusterKit/actions/workflows/release.yaml/badge.svg)](https://github.com/metalizzsas/NusterKit/actions/workflows/release.yaml)

This mono-repo contains all the code of the Nuster system.

This code is mainly distributed over [BalenaCloud Fleets](https://www.balena.io/cloud/).

## 📝 Development

This monorepo uses `pnpm` workspaces. Start developing using:

```bash
pnpm run dev
```

This should start all the development servers. To be able to use the Machine simulation Interface use

```bash
pnpm run dev-sim
```

to emulate Reverse proxy used by the machines, you have to install Nginx on your machine. For macos we have a dedicated script that configures & restart nginx.

```bash
./containers/proxy/dev.sh
```

Then access NusterDesktop at the following [URL](http://localhost:8080/).

## 🗂️ Packages

The following packages are essentials for our system.

| Packages | Description | Changelog |
| ------ | ------ | ------- |
| Nuster Desktop | UI Provided to machine screens | [Link](./packages/desktop/CHANGELOG.md) |
| Nuster Turbine | REST Api that drives machines | [Link](./packages/turbine/CHANGELOG.md) |
| Simulation Server | REST backend that simulates a hardware machine | [Link](./packages/simulation-server/CHANGELOG.md) |
| Simulation UI | SvelteKIT App that interacts with simulation server | [Link](./packages/simulation-ui/CHANGELOG.md) |

| Libraries | Description | Changelog |
| ------ | ------ | ------- |
| Nuster Turbine Machines | Library of machines definitions | [Link](./libs/turbine-machines/CHANGELOG.md) |
| Typings lib | Types used for machine specification, configuration & communication | [Link](./main/libs/typings/CHANGELOG.md) |

## ❓ How to contribute

Create a pull request and generate a changeset for the stuff you have added using `npx changeset`
