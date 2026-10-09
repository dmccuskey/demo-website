# ADR 004: The Website Is Static and Hosted Elsewhere

**Status:** Accepted

## Context

The website lists the demos and has a page for each. The demos run on one small machine on a home connection ([ADR 001](001-raspberry-pi-at-home.md)), which will be down at times.

Options considered:

- **Serve the website from the Pi,** from Caddy, next to the demos. One place for everything. But when the Pi or the connection is down, so is the page that should say so, and a visitor sent here from elsewhere sees an error instead of the list.
- **A static site on a static host.** The site has no server side of its own, so any static host can build and serve it.

## Decision

The website is a static site, built and served by a static host on a push to this repository. It is not hosted on the Pi, and the Pi never receives the built site.

The website learns whether a demo is up from the visitor's browser: the page reads the demo's health address ([contract point 4](../hosting-contract.md#4-a-health-address)) and shows the demo as up or down. Nothing on a server checks the demos.

The site's build takes the domain as a variable, as everything else does ([ADR 005](005-hostname-per-demo.md)).

## Consequences

- The website is there when the Pi is not, and can show a demo as down.
- The website and a demo are on different hostnames, so reading a demo's health is a cross-origin request. Every demo's door must allow the website's origin, `HEALTH_ALLOW_ORIGIN`.
- A change gets out in two halves: the static host rebuilds the site, and the Pi pulls ([How a Change Gets Out](../architecture.md#how-a-change-gets-out)).
- Which static host is not decided here ([Possible Future Changes](../development.md#possible-future-changes)).
