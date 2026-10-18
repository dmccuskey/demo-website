# Development

How the Demo Website is developed: the rules that hold throughout, what is built so far, and what is not decided.

## Principles

- **This repository builds no demo.** A demo's code, Dockerfiles and images belong to the demo's own repository. What joins the two is the [hosting contract](hosting-contract.md).
- **Adding a demo is one folder,** plus a DNS name and a deploy ([Adding a Demo](adding-a-demo.md)). If a demo needs a change anywhere else here, the design has a gap: fix the design, don't special-case the demo.
- **Nothing identifying is committed.** The repository is public. The domain comes from `DEMO_DOMAIN`, secrets and the tunnel's credentials are in an uncommitted `.env` with a committed example file showing its shape, and examples use `example.com`. Nothing about the host's network is written down here.
- **Never a forwarded router port** ([ADR 002](decisions/002-tunnel-never-a-forwarded-port.md)).

## Current Baseline

As of 2026-10-18, the hosting runs on the Pi, reached through the tunnel ([Installation](installation.md)):

- **The infrastructure's Compose project** (`infrastructure/`): Caddy, routing by hostname from each demo's snippet, and `cloudflared`, the tunnel's client, started by the profile `tunnel` ([The Tunnel](operations.md#the-tunnel)).
- **The first demo** (`demos/virtual-infrastructure/`): the Virtual Infrastructure Simulator from its published images at version `0.1.0` ([The First Demo](hosting-contract.md#the-first-demo-as-the-example-to-follow)).
- **The scripts** (`scripts/deploy`, `scripts/reset`), which find the demos by listing `demos/` ([Operations](operations.md)).
- **The nightly reset** (`host/systemd/`): a systemd user timer on the Pi that runs `scripts/reset` at 04:00 ([The Nightly Reset](installation.md#4-the-nightly-reset)).
- **The website's source** (`website/`): the list of the demos and a page for each, built with Eleventy and served by Cloudflare Pages on `demo.<domain>` ([ADR 007](decisions/007-eleventy-on-cloudflare-pages.md)).

Checked on a Mac: the demo opens on its hostname through Caddy, only its door is reachable, `/health` answers with the CORS header and stops answering `ok` when a back-end container stops, a write from outside is refused, the "About" dialog shows its links, and a reset under an open tab leaves the tab on the new system. A second, stand-in demo was added as one folder and ran beside the first with no other change.

Checked for the website, also on a Mac: it builds from a clean copy of the repository, the build fails without `DEMO_DOMAIN`, and the built site shows the demo as up, and as down once its live server is stopped.

Checked through the tunnel, from outside: the demo opens at `https://<name>.<domain>`, and its `/health` answers `ok` with the website's origin allowed.

Checked on the Pi: the deploy, and the reset as the timer runs it. With the demo stopped, the website showed it as down; after the reset, open tabs of the demo and of the website came back by themselves, the demo's on a new system. Docker publishes no port but Caddy's, on `127.0.0.1`, and nothing connects out but the tunnel's client.

## Not Yet Checked

The design rests on these, and each is to be checked before the step that needs it:

- Nothing at present.

## Possible Future Changes

None of these is decided. Each needs discussion and a concrete use case before it is worked on.

- **A deploy timer:** a timer on the Pi that checks the repository every few minutes and runs the `deploy` script when there is something new, in place of running it by hand over SSH.
- **A data viewer for each demo:** `feathers-gui` pointed at a demo's data service, linked from the demo's page and its "About" dialog. The data service is read-only from outside ([contract point 6](hosting-contract.md#6-a-data-service-read-only-from-outside)), which makes this safe.
- **A build ID** ([contract point 8](hosting-contract.md#8-a-build-id-optional)), so that a tab running an old build of a demo's web app reloads once a new build is in place.
- **More demos:** a second one from `live-system`, and others from other repositories.

## Testing

There are no automated tests. A change to the infrastructure, a demo's folder or the scripts is checked by hand on a Mac: `scripts/deploy --no-pull` on the branch, then the checks under [The Deploy](adding-a-demo.md#the-deploy) against `http://<name>.localhost:8080`, and `scripts/reset`. Documentation-only changes need none.

A change to the website is checked in a browser, against a demo running on the same Mac ([The Website](operations.md#the-website)): the list, the demo's page, and the demo shown as up, then as down with one of its back-end containers stopped.

## Branch Workflow

`main` holds only what has been checked, because the Pi and the static host both run from it. Every change is made on a short-lived branch named for it (`feat/<name>`, `fix/<name>`, `docs/<name>`), and merged with `git merge --no-ff`.

A change that affects behavior updates the documentation on the same branch. A new decision gets an ADR in `decisions/`, numbered after the last, and a line in the [list](architecture.md#decisions).
