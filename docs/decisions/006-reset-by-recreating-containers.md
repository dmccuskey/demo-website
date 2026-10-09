# ADR 006: A Reset by Recreating Containers, with the Data on a `tmpfs`

**Status:** Accepted

## Context

A demo is open to anyone, and visitors change its data. Each demo should start over regularly, so the next visitor finds it as intended. The host is a Raspberry Pi on an SD card, which wears with writes ([ADR 001](001-raspberry-pi-at-home.md)).

Options considered:

- **A reset inside each demo:** a reset command, or a seed file the host loads. Every demo would then implement a reset, each in its own way, and the host would have to know how to call each one.
- **A "demo ID" for open tabs:** an identifier that changes with each reset, so that a tab open across a reset notices and reloads. More for every demo to build, for a case the demo's own reconnect may already handle.
- **Recreate the containers.** If a demo's data does not outlive its containers, recreating them is the reset, and it is the same for every demo.

## Decision

The reset is the host's job, not the demo's. A timer on the Pi recreates each demo's containers at night.

A demo keeps its data on a `tmpfs`, and creates what it needs on a first start, with no seed ([contract point 5](../hosting-contract.md#5-a-reset-by-recreating-its-containers)).

There is no demo ID. A tab open across the reset loses its connection, reconnects, and is brought in line by the demo's own resync on reconnect.

## Consequences

- One reset script covers every demo, and a demo implements nothing for it.
- A demo's data is never written to the SD card.
- A demo's data is in memory, so it must stay small, and it is also gone after a restart of the Pi or of the demo for any other reason.
- A demo must recover in an open tab by itself. With the first demo this was checked on a laptop on 2026-10-08: a tab open across a recreate said the connection was lost, then showed the new system. It is still to be checked on the Pi.
- A demo that needs data to outlive a restart does not fit, and would need this decision revisited.
