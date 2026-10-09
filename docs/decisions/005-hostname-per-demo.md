# ADR 005: A Hostname per Demo, One Level Under the Domain, from Variables

**Status:** Accepted

## Context

The website and every demo need an address on one domain. TLS ends at Cloudflare ([ADR 002](002-tunnel-never-a-forwarded-port.md)), and this repository is public.

Options considered:

- **A path per demo** on one hostname (`demo.<domain>/<demo>/`). One DNS name for everything. But a demo's web app and its connections would have to know the path they are served under, which builds the host's layout into the demo's images.
- **A hostname per demo under the website's** (`<demo>.demo.<domain>`). It reads well, and groups the demos under the website. But Cloudflare's free certificate covers one level of subdomain only (checked 2026-10-08), so these names would have no certificate.
- **A hostname per demo, one level under the domain** (`<demo>.<domain>`).

## Decision

| Hostname | What |
|---|---|
| `demo.<domain>` | the website |
| `<demo>.<domain>` | a demo, at the root of its hostname |

The real domain and hostnames are not in this repository. The domain is the variable `DEMO_DOMAIN`, given at build and deploy time: Caddy reads `{$DEMO_DOMAIN}`, a demo's `compose.yaml` reads `${DEMO_DOMAIN}`, and the website's build takes it too. Documentation and examples use `example.com`.

## Consequences

- A demo runs at the root of its hostname with nothing built in, the same as when it runs alone on a laptop ([contract point 3](../hosting-contract.md#3-the-root-of-a-hostname)).
- Each new demo needs a DNS name, a step in the DNS provider's account ([Adding a Demo](../adding-a-demo.md#the-dns-name)).
- The demos share the level under the domain with everything else there, so a demo's name must not collide with another hostname on the domain.
- The repository runs on any domain, and a fork or a local run sets its own.
