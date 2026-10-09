# ADR 001: The Demos Run on a Raspberry Pi at Home

**Status:** Accepted

## Context

The demos need a host that is on around the clock. A demo is not a static page: it is at least three containers (a live server, a data service, a web app), and a visitor's browser holds a connection open to it for as long as the dashboard is shown.

Few people will visit, and at unpredictable times. The cost should be near nothing, and should not grow with how long a visitor leaves a tab open.

Options considered:

- **A Raspberry Pi 4 with 8 GB at home.** Already owned, and already running around the clock. 64-bit ARM.
- **An M1 Mac Mini at home.** Already owned, and able to run the demos. But it is not on around the clock, and the Pi already is: running the Mac Mini all day as well would spend extra watts for nothing the Pi cannot do.
- **A free cloud service,** Google Cloud Run. This was the first plan: no machine to look after, and it scales to zero. But a demo keeps a connection open from every dashboard, and an instance with an open connection stays billed: one forgotten browser tab keeps a demo billed for as long as it stays open. Hosting the demos at home makes that problem, and others that came with a free tier, go away.

## Decision

The demos run on the Raspberry Pi, in containers under Docker Compose.

The fallbacks, in order, are the Mac Mini and then Cloud Run. To keep both possible, a demo's images are built for ARM64 and AMD64 ([contract point 1](../hosting-contract.md#1-images-on-ghcr)), and nothing in a demo knows what it runs on.

## Consequences

- No hosting bill, and an open tab costs nothing.
- Every image must exist for ARM64. A demo's runtime has to work on the Pi, which is to be tried there before a demo is relied on.
- The Pi runs from an SD card, which wears with writes. A demo's data is in memory ([ADR 006](006-reset-by-recreating-containers.md)), and what Docker logs is to be watched.
- A home connection and a single small machine: the demos are down when either is. The website is hosted elsewhere, so it can say so ([ADR 004](004-static-website-hosted-elsewhere.md)).
- A machine at home must not be exposed to the internet directly ([ADR 002](002-tunnel-never-a-forwarded-port.md)).
