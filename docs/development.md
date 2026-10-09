# Development

How the Demo Website is developed: the rules that hold throughout, what is built so far, and what is not decided.

## Principles

- **This repository builds no demo.** A demo's code, Dockerfiles and images belong to the demo's own repository. What joins the two is the [hosting contract](hosting-contract.md).
- **Adding a demo is one folder,** plus a DNS name and a deploy ([Adding a Demo](adding-a-demo.md)). If a demo needs a change anywhere else here, the design has a gap: fix the design, don't special-case the demo.
- **Nothing identifying is committed.** The repository is public. The domain comes from `DEMO_DOMAIN`, secrets and the tunnel's credentials are in an uncommitted `.env` with a committed example file showing its shape, and examples use `example.com`. Nothing about the host's network is written down here.
- **Never a forwarded router port** ([ADR 002](decisions/002-tunnel-never-a-forwarded-port.md)).

## Current Baseline

As of 2026-10-09, the repository holds the design only: the [architecture](architecture.md), the [hosting contract](hosting-contract.md), and the [decision records](architecture.md#decisions). Nothing runs from it yet.

The first demo exists and meets the contract: the Virtual Infrastructure Simulator, with its images published at version `0.1.0` ([The First Demo](hosting-contract.md#the-first-demo-as-the-example-to-follow)).

To be built, in this order:

1. **The infrastructure and the first demo, on a Mac first:** the infrastructure's Compose project (Caddy, with `cloudflared` left out locally), `demos/virtual-infrastructure/`, the `deploy` script and the reset script.
2. **The website:** the list of the demos and a page for each, with a demo shown as down from its health address.
3. **The domain:** the tunnel and the hostnames.
4. **The Pi:** Docker, this repository, its `.env`, the tunnel's credentials and the reset timer. Then the reset checked under an open tab.

## Not Yet Checked

The design rests on these, and each is to be checked before the step that needs it:

- That Cloudflare's free plan covers the tunnel and the DNS as needed.
- `cloudflared` as a container on Linux ARM64.
- A demo's runtime on the Pi 4. The first demo runs on Bun, whose documentation says Linux ARM64 is supported without naming the Pi.
- The reset under an open tab on the Pi itself ([ADR 006](decisions/006-reset-by-recreating-containers.md)); it was checked on a laptop.

## Possible Future Changes

None of these is decided. Each needs discussion and a concrete use case before it is worked on.

- **Which static host serves the website:** GitHub Pages or Cloudflare Pages ([ADR 004](decisions/004-static-website-hosted-elsewhere.md)). One thing to find out first: whether GitHub Pages takes a custom domain without a `CNAME` file in the repository, which would commit the hostname.
- **A deploy timer:** a timer on the Pi that checks the repository every few minutes and runs the `deploy` script when there is something new, in place of running it by hand over SSH.
- **A data viewer for each demo:** `feathers-gui` pointed at a demo's data service, linked from the demo's page and its "About" dialog. The data service is read-only from outside ([contract point 6](hosting-contract.md#6-a-data-service-read-only-from-outside)), which makes this safe.
- **A build ID** ([contract point 8](hosting-contract.md#8-a-build-id-optional)), so that a tab running an old build of a demo's web app reloads once a new build is in place.
- **More demos:** a second one from `live-system`, and others from other repositories.

## Testing

There are no tests yet, since there is no code. Documentation-only changes need none.

## Branch Workflow

`main` holds only what has been checked, because the Pi and the static host both run from it. Every change is made on a short-lived branch named for it (`feat/<name>`, `fix/<name>`, `docs/<name>`), and merged with `git merge --no-ff`.

A change that affects behavior updates the documentation on the same branch. A new decision gets an ADR in `decisions/`, numbered after the last, and a line in the [list](architecture.md#decisions).
