# Adding a Demo

How to host a demo on the Demo Website: one new folder in this repository, a DNS name, and a deploy. It applies to any demo from any repository.

Nothing else in this repository changes for a new demo. If a demo seems to need a change elsewhere, that is a gap in the design: open an issue rather than special-casing the demo.

The first demo's folder, [`demos/virtual-infrastructure/`](../demos/virtual-infrastructure/), is the example for each file.

## Before You Start: Check the Contract

The demo's own repository must meet the [hosting contract](hosting-contract.md) first. Check each point against the running demo, not against its documentation:

| Check | Point |
|---|---|
| The images are on GHCR at a version, for ARM64 and AMD64: `docker manifest inspect ghcr.io/<owner>/<demo>-<part>:<version>` lists both | [1](hosting-contract.md#1-images-on-ghcr) |
| The demo's own `compose.yaml` runs it alone, and one port serves all of it | [2](hosting-contract.md#2-one-door) |
| It works at the root of a hostname other than `localhost`, with nothing rebuilt | [3](hosting-contract.md#3-the-root-of-a-hostname) |
| `GET /health` on the door answers `200` and `{ "status": "ok" }`, and stops doing so when a back-end container is stopped | [4](hosting-contract.md#4-a-health-address) |
| After `docker compose up -d --force-recreate` the data is as on a first start, and an open tab recovers by itself | [5](hosting-contract.md#5-a-reset-by-recreating-its-containers) |
| With `DATA_SERVICE_WRITE_TOKEN` set, a write from a browser is refused, and the demo still works | [6](hosting-contract.md#6-a-data-service-read-only-from-outside) |
| The "About" dialog shows the links set in `ABOUT_LINK_<n>_LABEL` and `ABOUT_LINK_<n>_URL`, and none when they are unset | [7](hosting-contract.md#7-an-about-dialog) |

The first demo is the example to follow for each point ([The First Demo](hosting-contract.md#the-first-demo-as-the-example-to-follow)).

## The Folder

Everything about a demo is in `demos/<name>/`, where `<name>` is the demo's name in its images and in its hostname (`virtual-infrastructure`). The folder has three files:

| File | What |
|---|---|
| `compose.yaml` | [the Compose file](#the-compose-file), which runs the demo |
| `Caddyfile` | [the Caddy snippet](#the-caddy-snippet), which sends the demo's hostname to its door |
| `demo.md` | [the website entry](#the-website-entry) |
| `picture.png` | optional: the demo's picture, for the website entry |

### The Compose File

`demos/<name>/compose.yaml` runs the demo from its published images. Start from the demo's own `compose.yaml` in its repository, and change it in these ways:

- **The project's name is `demo-<name>`,** not `<name>`, which is the name in the demo's own `compose.yaml`. The two can then run on one machine.

  ```yaml
  name: demo-<name>
  ```

- **Images at a version,** not built locally and not `latest`: `ghcr.io/<owner>/<name>-<part>:0.1.0`. A new version of the demo is a change to this number, so this repository's history records what ran when.
- **No published port.** Caddy reaches the door over the Docker network `demos`, which the infrastructure creates. The door joins it under the demo's name, and keeps its place on the demo's own network. Nothing else in the demo joins it.

  ```yaml
  services:
      web:
          networks:
              default:
              demos:
                  aliases:
                      - <name>

  networks:
      demos:
          external: true
  ```
- **The data on a `tmpfs`,** so that recreating the containers resets the demo.
- **The write token, required.** With the variable unset a demo lets every client write, so a missing line in `.env` would open it without any error. Write it so that Compose refuses to start without it, on both the data service and the live server:

  ```yaml
  environment:
    DATA_SERVICE_WRITE_TOKEN: ${DATA_SERVICE_WRITE_TOKEN:?}
  ```

- **The website's origin** on the door, from the domain's variable:

  ```yaml
  environment:
    HEALTH_ALLOW_ORIGIN: https://demo.${DEMO_DOMAIN:?}
  ```

- **The "About" links** on the door, up to four pairs. This is where the Demo Website decides what a demo links to: its page on the website, and its source.

No hostname is written out in the file. The domain comes from `DEMO_DOMAIN`, and secrets come from the host's uncommitted `.env`.

### The Caddy Snippet

`demos/<name>/Caddyfile` sends the demo's hostname to its door. The infrastructure's main Caddyfile imports every demo's `Caddyfile`, so the main file does not change:

```caddyfile
http://<name>.{$DEMO_DOMAIN} {
	reverse_proxy <name>:<door's port>
}
```

The address starts with `http://`, since TLS ends before a request reaches Caddy. The name after `reverse_proxy` is the door's alias on the network `demos`.

### The Website Entry

`demos/<name>/demo.md` is the demo's entry for the website: a `title`, a one-line `summary` and the `source` address at its top, and the description below them, in Markdown. All three are required: the website's build fails without one.

```markdown
---
title: <the demo's title>
summary: <one line, shown in the list>
source: https://github.com/<owner>/<repository>
---

<the description, shown on the demo's page>
```

The website builds the demo's line in the list and the demo's page, `/demos/<name>/`, from it, and reads the demo's health address at `https://<name>.<domain>/health`. The page's address is the one the demo's "About" dialog links back to, from its `compose.yaml`.

A picture is optional: `picture.png` in the demo's folder (or `.jpg`, `.webp`, `.svg`) is shown in the list and on the demo's page. Check the picture for identifying details before committing it.

To see the entry, build the website on your machine ([The Website](operations.md#the-website)).

## The DNS Name

The demo needs the hostname `<name>.<domain>`, one level under the domain ([ADR 005](decisions/005-hostname-per-demo.md)), pointing at the tunnel. It is a route on the tunnel, a "published application" in the Cloudflare account, with `http://caddy:80` as its service; Cloudflare creates the DNS record ([The Tunnel](operations.md#the-tunnel)). Nothing in this repository changes for it.

## The Deploy

Merge the folder to `main` and push. The static host rebuilds the website. On the Pi, run `scripts/deploy`, which pulls the repository and the images, starts the demo, and reloads Caddy ([The Deploy](operations.md#the-deploy)). The scripts find the demo by its folder: nothing lists the demos.

To try the folder on a Mac first, run `scripts/deploy --no-pull` on its branch and open `http://<name>.localhost:8080`.

Then check, from outside the home network:

1. `https://<name>.<domain>/health` answers `{ "status": "ok" }`.
2. The website lists the demo and shows it as up.
3. The demo's "About" dialog shows its links, and each one opens.

## Several Demos from One Repository

Each demo is a set of images of its own, released on a tag of its own (`<demo>-v<version>`), and a folder of its own here. Two demos from one repository are added as two demos: nothing is shared between their folders.

## Images from a Private Repository

A public repository's images need nothing. A private repository's images need a pull token on the Pi: a GitHub token that may read packages, used once with `docker login ghcr.io` there. The token is never in this repository.
