# Architecture

How the Demo Website is put together: the parts, how a visitor reaches a demo, how a change gets out, and how the demos are reset. The reasons behind each choice are in the [decision records](#decisions).

This page describes the design. What is built so far is under [Current Baseline](development.md#current-baseline).

## Overview

```text
visitor ──▶ Demo Website (static, NOT on the Pi)  ──link──▶ a demo's hostname
                                                                  │
                                                           Cloudflare (TLS)
                                                                  │ tunnel, outbound from the Pi
                                              ┌───────────────────▼──────────────────┐
                                              │ Pi: infrastructure Compose project   │
                                              │   cloudflared ──▶ Caddy (by hostname)│
                                              └───────────┬───────────────┬──────────┘
                                                          ▼               ▼
                                              demo A's Compose      demo B's Compose
                                              door ─ live server    door ─ ...
                                                   └ data service
```

A visitor opens the website, picks a demo, and follows a link to the demo's own hostname. That request ends at Cloudflare, which holds the certificate, and travels through a tunnel that the Pi opened outbound. On the Pi, Caddy sends it to the demo's door by its hostname.

## The Parts

### The Website

A static site: the list of the demos, and a page for each. It is built and served by a static host, not by the Pi ([ADR 004](decisions/004-static-website-hosted-elsewhere.md)). The Pi never receives the built site.

For each demo, the page in the visitor's browser reads the demo's [health address](hosting-contract.md#4-a-health-address) and shows the demo as up or down.

### The Infrastructure

One Compose project on the Pi ([ADR 001](decisions/001-raspberry-pi-at-home.md)), with two containers:

- **`cloudflared`**, the tunnel's client. It connects outbound to Cloudflare, so nothing on the home network listens for the internet ([ADR 002](decisions/002-tunnel-never-a-forwarded-port.md)).
- **Caddy**, which receives everything from the tunnel and routes it by hostname to a demo's door ([ADR 003](decisions/003-caddy-behind-the-tunnel.md)). Its main Caddyfile imports a snippet from every demo's folder.

### A Demo

A Compose project of its own, from a folder of its own, `demos/<name>/`. A demo is at least three containers:

- exactly one **live server**,
- exactly one **data service**,
- one or more **web apps**.

Only one container, the **door**, is reachable from Caddy. It serves the whole demo: the web app, and the demo's own back end forwarded behind it. What a demo must provide is the [hosting contract](hosting-contract.md).

### Addresses

Everything is on one domain, given as the variable `DEMO_DOMAIN` ([ADR 005](decisions/005-hostname-per-demo.md)):

| Hostname | What |
|---|---|
| `demo.<domain>` | the website |
| `<demo>.<domain>` | a demo, at the root of its hostname |

The real domain is not in this repository. Caddy reads it as `{$DEMO_DOMAIN}`, and the website's build takes it too. Secrets and the tunnel's credentials are in an uncommitted `.env`, with a committed example file showing its shape.

## Two Kinds of Repository

- **A demo's own repository** builds and publishes the demo: its Dockerfiles, its images on GitHub Container Registry (GHCR), and a `compose.yaml` that runs it alone on any machine. It knows nothing of the Demo Website.
- **This repository** hosts: the website, the infrastructure's Compose project, a folder per demo, the reset, the deploy. It builds no demo.

The [hosting contract](hosting-contract.md) is what joins the two. A demo that meets it is added with one folder here ([Adding a Demo](adding-a-demo.md)), and with no change to the demo.

## A Demo's Page and "About"

The website's page for a demo is the demo's entry page: a description, and links to the demo, to its source, and later to a viewer for its data. The demo itself opens straight on its dashboard.

Every demo has the same "About": a control on the dashboard that opens a dialog inside the demo, not a link that leaves it. The dialog says in a few sentences what the demo is, and holds the links out.

The links are generic. A demo's code names none of them, so nothing in it says "about page" or "source". Each link is a label and an address, given to the demo's door at run time ([contract point 7](hosting-contract.md#7-an-about-dialog)). This repository decides what they are, in the demo's `compose.yaml`: back to the demo's page on the website, to its source, and later to the viewer for its data. So a demo's images hold no hostname, and a demo run alone, with no link set, has the description and no links.

## How a Change Gets Out

Everything goes through a push to this repository, in two halves:

- **The website:** the static host rebuilds and serves it on the push.
- **The Pi:** it pulls, since nothing outside can reach it. One `deploy` script runs `git pull`, then `docker compose pull` and `docker compose up -d` for the infrastructure and for each demo, and reloads Caddy. It is run by hand over SSH to begin with.

A new version of a demo is a changed version number in its `compose.yaml` here. The repository's history is therefore the record of what ran when, and a rollback is a revert.

## The Nightly Reset

Visitors change a demo's data, so every demo starts over each night. The reset is the host's job, not the demo's ([ADR 006](decisions/006-reset-by-recreating-containers.md)): a timer on the Pi recreates each demo's containers. A demo's data is on a `tmpfs`, so it is gone with the container, and the demo starts from nothing ([contract point 5](hosting-contract.md#5-a-reset-by-recreating-its-containers)).

A browser tab that is open across the reset loses its connection, reconnects, and shows the new system. Nothing tells the tab that the demo was reset.

## Decisions

| ADR | Decision |
|---|---|
| [001](decisions/001-raspberry-pi-at-home.md) | The demos run on a Raspberry Pi at home |
| [002](decisions/002-tunnel-never-a-forwarded-port.md) | The Pi is reached through a tunnel, never a forwarded port |
| [003](decisions/003-caddy-behind-the-tunnel.md) | Caddy behind the tunnel routes by hostname |
| [004](decisions/004-static-website-hosted-elsewhere.md) | The website is static and hosted elsewhere |
| [005](decisions/005-hostname-per-demo.md) | A hostname per demo, one level under the domain, from variables |
| [006](decisions/006-reset-by-recreating-containers.md) | A reset by recreating containers, with the data on a `tmpfs` |
