# Operations

How the hosting is run: the `.env` file, the deploy, the reset, and looking at what runs. It is the same on a Mac and on the host, apart from the tunnel, which only the host has.

Everything here is run from the repository's root. Why it works this way is in the [architecture](architecture.md).

## Quick Reference

| To | Run |
|---|---|
| Deploy what is on `main` | `scripts/deploy` |
| Deploy what is checked out, with no `git pull` | `scripts/deploy --no-pull` |
| Reset every demo | `scripts/reset` |
| Reset one demo | `scripts/reset <name>` |
| See what runs | `docker compose ls` |
| Read a demo's logs | `docker compose -p demo-<name> logs` |
| Stop a demo | `docker compose -p demo-<name> down` |
| Stop the infrastructure | `docker compose -p demo-infrastructure down` |

## The `.env` File

One file, `.env` in the repository's root, holds what is not committed. Copy [`.env.example`](../.env.example) and set each value:

```sh
cp .env.example .env
```

| Variable | What |
|---|---|
| `DEMO_DOMAIN` | The domain every hostname is under: a demo is `<name>.<domain>`. On a Mac, `localhost` |
| `DATA_SERVICE_WRITE_TOKEN` | The token a demo's live server presents to write to its data service ([contract point 6](hosting-contract.md#6-a-data-service-read-only-from-outside)). Any value, kept secret: `openssl rand -hex 32` makes one |
| `CADDY_PORT` | Optional. The port on this machine that Caddy listens on, on `127.0.0.1` only. Default `8080` |
| `COMPOSE_PROFILES` | `tunnel` on the host, which starts `cloudflared` with the infrastructure. Left out on a Mac without a tunnel |
| `TUNNEL_TOKEN` | With the profile `tunnel`: the tunnel's token ([The Tunnel](#the-tunnel)). A secret |

The scripts stop without the file. A demo does not start without the token: Compose refuses, and says which variable is missing.

The scripts pass the file to every Compose project. To run `docker compose` by hand on a Compose file, pass it too:

```sh
docker compose --env-file .env -f demos/<name>/compose.yaml config
```

## What Runs

Each part is a Compose project of its own:

| Project | From | What |
|---|---|---|
| `demo-infrastructure` | `infrastructure/compose.yaml` | Caddy, which routes by hostname. It also creates the Docker network `demos` |
| `demo-<name>` | `demos/<name>/compose.yaml` | A demo. Only its door joins the network `demos` |

No demo publishes a port. Caddy listens on `127.0.0.1:8080` of the machine, and reaches a door over the network `demos`. On a Mac a demo is therefore at `http://<name>.localhost:8080`, since a browser resolves every name under `localhost` to the machine itself. A hostname that no demo answers to gets a `404`.

The scripts name no demo. They find the demos by listing `demos/*/compose.yaml`.

## The Deploy

```sh
scripts/deploy
```

It pulls the repository, then pulls the images and starts the infrastructure and each demo, and reloads Caddy:

```text
==> Pulling the repository
==> infrastructure
==> virtual-infrastructure
==> Reloading Caddy
Deployed.
```

A demo whose containers are already as its `compose.yaml` says is left running, so a deploy with nothing new changes nothing. A demo that fails does not stop the others: the script carries on, lists the failed demos at the end, and exits with `1`.

With `--no-pull` it leaves the repository alone and deploys what is checked out. Use it to try a branch on a Mac.

Then check a demo:

```sh
curl http://virtual-infrastructure.localhost:8080/health
```

```json
{"status":"ok"}
```

On the host the same check goes through the tunnel, at `https://<name>.<domain>/health`.

## The Reset

```sh
scripts/reset
```

It recreates the containers of every demo, or of the one demo named. A demo's data is on a `tmpfs`, so the demo starts from nothing ([ADR 006](decisions/006-reset-by-recreating-containers.md)). The infrastructure keeps running. A browser tab that is open across the reset reconnects and shows the new system.

On the host a timer runs it each night. The timer is not set up yet ([Current Baseline](development.md#current-baseline)).

Reset a demo as a whole, with the script. Restarting one of its containers alone can leave the demo's parts out of step: a data service that restarts alone has lost its records, while its live server still runs on them.

## The Tunnel

The tunnel connects the host to Cloudflare, outbound ([ADR 002](decisions/002-tunnel-never-a-forwarded-port.md)). It is `cloudflared` in the infrastructure's Compose project, started only with the profile `tunnel`. It reaches Caddy, and no demo: every request goes to Caddy, which routes it by its hostname.

The tunnel itself is set up in the Cloudflare account, which is also where its hostnames are. Nothing of it is in the repository:

1. In Cloudflare Zero Trust, under Networks, create a tunnel of the type Cloudflared. Name it for the host.
2. Copy its token, the long value after `--token` in the install command it shows, into the host's `.env` as `TUNNEL_TOKEN`, with `COMPOSE_PROFILES=tunnel`. Skip installing `cloudflared` the way the page shows: the Compose project runs it.
3. Add a route for each demo, a "published application" (once called a public hostname): the hostname is `<name>.<domain>`, and the service is `http://caddy:80`. Cloudflare creates the DNS record for it.
4. Run `scripts/deploy`. The tunnel shows as healthy in the account.

Then from any machine:

```sh
curl https://<name>.<domain>/health
```

The host's `.env` must have the real domain in `DEMO_DOMAIN`: Caddy routes by it, and a request for a hostname it does not know gets `No demo at this address.`

One tunnel serves one host. To try the tunnel from a Mac before the host has it, give the Mac's `.env` the real domain and the token, run `scripts/deploy --no-pull`, and take both out again after: while the tunnel runs on the Mac, the demos are served from the Mac.

## The Website

The website's source is in `website/`. Its build needs Node 22 or later, and the domain: it reads `DEMO_DOMAIN` from its environment, or else from the repository's `.env`, and fails without it.

```sh
cd website
npm ci
npm start        # builds, serves on http://localhost:8081, rebuilds on a change
npm run build    # builds once, into website/_site/
```

With `localhost` as the domain, the built site points at the demos behind Caddy on the same machine (`http://<name>.localhost:8080`, or the port in `CADDY_PORT`). With any other domain it points at `https://<name>.<domain>`.

On a Mac a running demo is still shown as down. A demo allows its health address to be read from the website's real origin only, `https://demo.<domain>` ([contract point 4](hosting-contract.md#4-a-health-address)), and the site on your machine has another. To see it as up, start the demo's door with the origin of the site on your machine, from a Compose file of your own that is not committed:

```yaml
# website.local.yaml
services:
    web:
        environment:
            HEALTH_ALLOW_ORIGIN: http://localhost:8081
```

```sh
docker compose --env-file .env -f demos/<name>/compose.yaml -f website.local.yaml up -d
```

Run `scripts/deploy --no-pull` to put the door back.

### On Cloudflare Pages

Cloudflare Pages builds and serves the website on a push to `main` ([ADR 007](decisions/007-eleventy-on-cloudflare-pages.md)). Nothing of it is in the repository: these are the settings of the Pages project, in the Cloudflare account.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | `website` |
| Build command | `npm run build` |
| Build output directory | `_site` |
| Environment variable `DEMO_DOMAIN` | the domain |
| Custom domain | `demo.<domain>` |

The Node version comes from `website/.node-version`.

## Removing a Demo

Stop the demo before removing its folder, since the scripts only know the demos that have one:

```sh
docker compose -p demo-<name> down
```

Then remove `demos/<name>/` and deploy, which reloads Caddy without the demo's hostname.

## Running a Demo's Own Compose File on the Same Machine

A demo's repository has a `compose.yaml` of its own, which runs the demo alone. Its project is named for the demo (`<name>`), and the one here is `demo-<name>`, so both can run on one machine without one replacing the other's containers.
