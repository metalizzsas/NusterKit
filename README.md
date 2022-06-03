# **Nuster Desktop**

[![Bundling Nuster Destop for balenaOS](https://github.com/metalizzsas/NusterDesktop/actions/workflows/bundle.yaml/badge.svg)](https://github.com/metalizzsas/NusterDesktop/actions/workflows/bundle.yaml)

**PWA created using:**

- [Sveltekit](https://github.com/sveltejs/kit#readme)
- [TailwindCSS](https://github.com/tailwindlabs/tailwindcss#readme)

This PWA controls NusterTurbine using Rest api and websockets. it is built to be served using Nginx.
This project is bundled in 2 image types:

- BalenaOS docker image.
- Docker image to be served as a standalone application.

## Getting Started

> *Feel free to substitute `npm` with `pnpm` or `yarn`.*

|                      |                        |
| -------------------- | -----------------------|
| Install              | `npm i`                |
| Develop              | `npm run dev`          |
| Build for balena     | `npm run build-bundle` |
| Build for standalone | `npm run build`        |

## Image distribution

Image are built using Github actions and stored in Github container registry.
> You can use `ghcr.io/metalizzsas/nusterdesktop:main` image in BalenaOS.
