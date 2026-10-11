# Development

How the Demo Website is developed: the rules that hold throughout, what is built so far, and what is not decided.

## Principles

- **This repository builds no demo.** A demo's code, Dockerfiles and images belong to the demo's own repository. What joins the two is the [hosting contract](hosting-contract.md).
- **Adding a demo is one folder,** plus a DNS name and a deploy ([Adding a Demo](adding-a-demo.md)). If a demo needs a change anywhere else here, the design has a gap: fix the design, don't special-case the demo.
- **Nothing identifying is committed.** The repository is public. The domain comes from `DEMO_DOMAIN`, secrets and the tunnel's credentials are in an uncommitted `.env` with a committed example file showing its shape, and examples use `example.com`. Nothing about the host's network is written down here.
- **Never a forwarded router port** ([ADR 002](decisions/002-tunnel-never-a-forwarded-port.md)).

## Current Baseline

As of 2026-10-09, the hosting runs on a Mac, without the tunnel:

- **The infrastructure's Compose project** (`infrastructure/`): Caddy, routing by hostname from each demo's snippet. `cloudflared` is not in it yet.
- **The first demo** (`demos/virtual-infrastructure/`): the Virtual Infrastructure Simulator from its published images at version `0.1.0` ([The First Demo](hosting-contract.md#the-first-demo-as-the-example-to-follow)).
- **The scripts** (`scripts/deploy`, `scripts/reset`), which find the demos by listing `demos/` ([Operations](operations.md)).
- **The website's source** (`website/`): the list of the demos and a page for each, built with Eleventy ([ADR 007](decisions/007-eleventy-on-cloudflare-pages.md)). It is not on its static host yet: that comes with the domain.

Checked on a Mac: the demo opens on its hostname through Caddy, only its door is reachable, `/health` answers with the CORS header and stops answering `ok` when a back-end container stops, a write from outside is refused, the "About" dialog shows its links, and a reset under an open tab leaves the tab on the new system. A second, stand-in demo was added as one folder and ran beside the first with no other change.

Checked for the website, also on a Mac: it builds from a clean copy of the repository, the build fails without `DEMO_DOMAIN`, and the built site shows the demo as up, and as down once its live server is stopped.

To be built, in this order:

1. **The domain:** the tunnel (`cloudflared` in the infrastructure's Compose project), the hostnames, and the website on Cloudflare Pages.
2. **The Pi:** Docker, this repository, its `.env`, the tunnel's credentials and the reset timer. Then the reset checked under an open tab.

## Not Yet Checked

The design rests on these, and each is to be checked before the step that needs it:

- That Cloudflare's free plan covers the tunnel and the DNS as needed.
- `cloudflared` as a container on Linux ARM64.
- A demo's runtime on the Pi 4. The first demo runs on Bun, whose documentation says Linux ARM64 is supported without naming the Pi.
- The reset under an open tab on the Pi itself ([ADR 006](decisions/006-reset-by-recreating-containers.md)); it was checked on a laptop.

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
