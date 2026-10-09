# ADR 003: Caddy Behind the Tunnel Routes by Hostname

**Status:** Accepted

## Context

Requests for every demo arrive on the Pi through one tunnel ([ADR 002](002-tunnel-never-a-forwarded-port.md)). Something has to send each one to the right demo's door, by its hostname.

Options considered:

- **Route in the tunnel.** The tunnel's own configuration can map each hostname to a service. One container fewer. But the routing then lives in the provider's configuration or in its format, each new demo is a change there, and leaving the provider means rewriting all of it.
- **A reverse proxy behind the tunnel.** The tunnel sends everything to one place, and a proxy in this repository routes it.

## Decision

Caddy runs in the infrastructure's Compose project, behind `cloudflared`. The tunnel sends every hostname to Caddy, and Caddy routes by hostname to a demo's door.

The routing is files in this repository: a main Caddyfile that imports a snippet from each demo's folder. The hostnames in them are built from `{$DEMO_DOMAIN}` ([ADR 005](005-hostname-per-demo.md)).

Caddy reaches a door over a Docker network shared between the infrastructure and the demos. A demo publishes no port on the Pi.

## Consequences

- Adding a demo adds a snippet in the demo's own folder, and changes neither the main Caddyfile nor the tunnel ([Adding a Demo](../adding-a-demo.md#the-caddy-snippet)).
- The routing is versioned and reviewed with everything else, and runs the same on a Mac without the tunnel.
- Leaving Cloudflare later changes one piece: what stands in front of Caddy.
- One more container on the Pi, and one more hop for each request.
