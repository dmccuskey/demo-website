# ADR 002: The Pi Is Reached Through a Tunnel, Never a Forwarded Port

**Status:** Accepted

## Context

The demos run on a machine at home ([ADR 001](001-raspberry-pi-at-home.md)), and visitors on the internet must reach them.

Options considered:

- **A forwarded router port,** with the domain's DNS pointing at the home connection. It needs nothing but the router. But the DNS record publishes the home address to anyone who looks up a demo, the router then accepts connections from the whole internet, and the certificates have to be obtained and renewed on the Pi.
- **A tunnel.** A client on the Pi connects outbound to a provider, and the provider sends visitors' requests back through that connection. DNS points at the provider, never at home.

## Decision

The Pi is reached through a tunnel, Cloudflare Tunnel, whose client (`cloudflared`) runs as a container in the infrastructure's Compose project. Cloudflare holds the domain's DNS and ends TLS.

No router port is forwarded for the demos, ever: not for a test, and not as a fallback when the tunnel is down.

The tunnel's credentials are in the Pi's uncommitted `.env`, never in this repository.

## Consequences

- The home address is not published, and nothing at home listens for the internet.
- Certificates are the provider's job. The door of a demo speaks plain HTTP ([contract point 2](../hosting-contract.md#2-one-door)).
- The domain's nameservers must be at Cloudflare, and the demos depend on Cloudflare being up.
- Cloudflare's free certificate covers one level of subdomain, which shapes the hostnames ([ADR 005](005-hostname-per-demo.md)).
- Since nothing outside can reach the Pi, a deploy is a pull from the Pi, not a push to it ([How a Change Gets Out](../architecture.md#how-a-change-gets-out)).
- To keep the dependency on one provider small, the tunnel carries traffic and does not route it ([ADR 003](003-caddy-behind-the-tunnel.md)).
