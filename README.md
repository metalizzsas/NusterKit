# Nuster Kit

Create your machine automation using `JSON` !

## 🤖 Core concepts

Nuster aims to simplify machine automation using Javascript and JSON. `turbine` and `ui` packages work in synergy to control your machine.

Currently Nuster can handle:

- Cycles
- Custom settings for cycles
- Maintenant tasks
- IO Management
- Machine documentations

To access **IO Controllers**, `Turbine` connects to network devices using industrial protocols such as:

- Modbus/TCP
- Ethernet/IP (Compatibility is limited due to the [ts-enip](https://github.com/kworz/ts-enip) package)

## 👾 How to use

Docker images for `ui` and `turbine` are created for each release:

- [nusterkit/ui](https://hub.docker.com/r/nusterkit/ui)
- [nusterkit/turbine](https://hub.docker.com/r/nusterkit/turbine)

Turbine should be customized from your needs with the `/data/machines` mounting point. Follow the [readme.md](https://github.com/metalizzsas/NusterKit/blob/main/packages/turbine/README.md) of `turbine` to create machine custom definitions.

## 📝 Development

This monorepo uses `pnpm` workspaces. Start developing using:

```bash
pnpm run dev
```

This should start all the development servers. To be able to use the Machine simulation Interface use

```bash
pnpm run dev-sim
```

## 🗂️ Packages

The following packages are essentials for our system.

| Packages | Description | Changelog |
| ------ | ------ | ------- |
| UI | UI Provided to machine screens | [Link](./packages/ui/CHANGELOG.md) |
| Turbine | REST Api that drives machines | [Link](./packages/turbine/CHANGELOG.md) |
| Simulation Server | REST backend that simulates a hardware machine | [Link](./simulation/simulation-server/CHANGELOG.md) |
| Simulation UI | UI App that interacts with simulation server | [Link](./simulation/simulation-ui/CHANGELOG.md) |

## ❓ How to contribute

Create a pull request and generate a changeset for the stuff you have added using `pnpm changeset`
