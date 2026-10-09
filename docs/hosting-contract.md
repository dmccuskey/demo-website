# Hosting Contract

What a demo provides to be hosted on the Demo Website. A demo's repository meets these points by itself: it needs nothing from this repository, and this repository changes nothing in the demo.

Once a demo meets the contract, [Adding a Demo](adding-a-demo.md) says how to host it. Why the hosting works this way is in the [architecture](architecture.md).

## Quick Reference

| Point | A demo provides |
|---|---|
| [1](#1-images-on-ghcr) | Images on GHCR for ARM64 and AMD64, one per container, published on a tag |
| [2](#2-one-door) | One door: one container, one HTTP port, the whole demo behind it |
| [3](#3-the-root-of-a-hostname) | It runs at the root of a hostname of its own |
| [4](#4-a-health-address) | `GET /health` on the door, readable from the website's origin |
| [5](#5-a-reset-by-recreating-its-containers) | A reset by recreating its containers |
| [6](#6-a-data-service-read-only-from-outside) | A data service that is read-only from outside |
| [7](#7-an-about-dialog) | An "About" dialog, with its links given at run time |
| [8](#8-a-build-id-optional) | Optional, later: a build ID |

## Fixed Names

These names are the same in every demo, so the website, the scripts and a demo's `compose.yaml` here are written once:

| Name | Where | Point |
|---|---|---|
| `ghcr.io/<owner>/<demo>-<part>` | an image | [1](#1-images-on-ghcr) |
| `<demo>-v<version>` | the Git tag that publishes the images | [1](#1-images-on-ghcr) |
| `/health` | a path on the door | [4](#4-a-health-address) |
| `HEALTH_ALLOW_ORIGIN` | an environment variable on the door | [4](#4-a-health-address) |
| `DATA_SERVICE_WRITE_TOKEN` | an environment variable on the data service and the live server | [6](#6-a-data-service-read-only-from-outside) |
| `ABOUT_LINK_<n>_LABEL`, `ABOUT_LINK_<n>_URL` | environment variables on the door, `<n>` from 1 to 4 | [7](#7-an-about-dialog) |

## 1. Images on GHCR

One image per container, on GitHub Container Registry, built for ARM64 (the Pi) and for AMD64 (a Mac or a cloud host).

- **Name:** `ghcr.io/<owner>/<demo>-<part>`, for example `ghcr.io/<owner>/virtual-infrastructure-web`.
- **Tags:** a version, and `latest`.
- **Published on a Git tag** `<demo>-v<version>` in the demo's repository, for example `virtual-infrastructure-v0.1.0`. The demo's name is in the tag so that several demos in one repository are released apart.
- **Public,** unless the repository is private. A private repository's images need a pull token on the host ([Adding a Demo](adding-a-demo.md#images-from-a-private-repository)).

## 2. One Door

One container, the door, listens on one HTTP port and serves the whole demo: the web app, and the demo's own back end forwarded behind it. Nothing else in the demo is reachable from outside its Compose project.

The door speaks plain HTTP. TLS ends before the request reaches the host.

## 3. The Root of a Hostname

The demo runs at the root of a hostname of its own (`https://<demo>.<domain>/`), not under a path. The hostname is not built into the images: the web app talks to its own origin, whatever that is.

## 4. A Health Address

`GET /health` on the door answers:

- `200` with `{ "status": "ok" }` only while the whole demo works,
- anything else otherwise.

"The whole demo" means the door forwards the request to the part that knows. A door that answers by itself would report a demo as up while its back end is down.

The website reads the address from the visitor's browser, on another hostname. The door therefore adds the CORS header for one origin, which it is given at run time in `HEALTH_ALLOW_ORIGIN` (for example `https://demo.example.com`).

## 5. A Reset by Recreating Its Containers

Recreating the demo's containers resets it:

- its data lives where a recreate wipes it (a `tmpfs`, not a named volume),
- it starts from nothing, creating what it needs on a first start.

There is no reset command and no seed step for the host to run. The host recreates the containers each night ([The Nightly Reset](architecture.md#the-nightly-reset)).

A browser tab that is open across the reset must recover by itself: it reconnects and shows the new system.

## 6. A Data Service Read-Only from Outside

The demo's data service refuses writes from outside. Writes come from the demo's own live server only, which presents a write token.

The token is one environment variable given to both containers, `DATA_SERVICE_WRITE_TOKEN`. Its value is the host's, any value, kept in the host's uncommitted `.env`. This also makes a data viewer safe to point at the data service.

## 7. An "About" Dialog

The demo opens on its dashboard. The dashboard has an "About" control that opens a dialog inside the demo, the same in every demo: a short description of the demo, and its links out.

The links are generic: the demo knows nothing of what they lead to. Each is a label and an address given at run time, as a pair of environment variables on the door:

```text
ABOUT_LINK_1_LABEL=More about this demo
ABOUT_LINK_1_URL=https://demo.example.com/demos/virtual-infrastructure/
ABOUT_LINK_2_LABEL=Source code
ABOUT_LINK_2_URL=https://github.com/<owner>/<repository>
```

`<n>` runs from 1 to 4, and the links are shown in that order. A pair that is not set gives no link, so a demo run alone has the description and no links.

## 8. A Build ID (Optional)

Later, and optional: a build ID, so that a tab running an old build of the web app reloads once a new build is in place. Not implemented by any demo yet, and nothing here reads one.

## The First Demo, as the Example to Follow

The Virtual Infrastructure Simulator meets the contract, in the [live-system](https://github.com/dmccuskey/live-system) repository under `examples/virtual-infrastructure/`. A new demo copies its shape:

| Point | How it is met there |
|---|---|
| 1 | A `Dockerfile` per part (`data-service/`, `live-server/`, `web/`), built from the repository's root. A workflow, `.github/workflows/demo-images.yml`, builds them on the tag for both architectures and pushes them. Published: `virtual-infrastructure-data-service`, `-live-server` and `-web`, version `0.1.0`, public. |
| 2, 3 | The `web` image is the door: Caddy on port 3032, serving the built web app and forwarding `/socket.io/*` to the data service, and `/command` and `/health` to the live server. The web app talks to its own origin only, so it runs at the root of any hostname with nothing built in. |
| 4 | Each server has its own `/health`. The door forwards the live server's, which is healthy only while connected to its data service. |
| 5 | The data service's SQLite file is on a `tmpfs` at `/data`, and the live server creates its first records when there are none, so there is no seed. |
| 6 | The live server presents the token as it connects, and a hook in the data service refuses writes from outside without it. With the variable unset, every client may write: the host must set it ([Adding a Demo](adding-a-demo.md#the-compose-file)). |
| 7 | The door answers `/config.json` (`{ "links": [{ "label", "url" }] }`) from the `ABOUT_LINK_<n>_…` variables. The web app reads it as it starts, and leaves out a link without a label or without an `http:` or `https:` address. |

Its own `compose.yaml` there runs it alone and builds the images locally. It is the pattern for the demo's `compose.yaml` here, which names the published images at a version instead. Its documentation there: `docs/development.md`, "Running the Demo in Containers" and "Publishing the Demo's Images".
