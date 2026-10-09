# Demo Website

The website where a visitor picks one of my demos, and the hosting that runs them.

A demo is a small, complete system a visitor can use in the browser: a dashboard, a live server behind it, and its data. The Demo Website lists the demos, gives each a page of its own, and shows whether each one is up. The demos themselves run in containers on a Raspberry Pi, each on a hostname of its own, reached through a tunnel.

```text
demo.example.com                       the website: the list of demos, a page for each
virtual-infrastructure.example.com     a demo, running on the Pi
```

## What It Is

- **A static website** that lists the demos and links to each one. It is hosted apart from the demos, so it is there when the Pi is not, and can show a demo as down.
- **The hosting for the demos:** a Compose project for the infrastructure (the tunnel's client and a reverse proxy), a folder per demo, a script that deploys, and one that resets every demo at night.
- **A contract** that says what a demo provides to be hosted here. Adding a demo that meets it is one folder, a DNS name and a deploy.

## What It Is Not

- **Not where a demo is built.** A demo's code, its Dockerfiles and its published images belong to the demo's own repository, which knows nothing of this one. The first demo, the Virtual Infrastructure Simulator, comes from [live-system](https://github.com/dmccuskey/live-system).
- **Not a portfolio.** My Portfolio Website is a different site, which sends visitors here for some of its projects.
- **Not tied to one domain.** The domain and the hostnames come from variables at build and deploy time. The examples use `example.com`.

## Status

The design is written down and the implementation is starting. There is nothing to run yet, so the Quick Start comes with the first working piece.

## Documentation

- [Architecture](docs/architecture.md): the parts, how a visitor reaches a demo, how a change gets out, the nightly reset
- [Hosting Contract](docs/hosting-contract.md): what a demo provides to be hosted here
- [Adding a Demo](docs/adding-a-demo.md): the folder, the DNS name and the deploy

Everything else, including the decision records and how the project is developed, is listed on the [documentation home](docs/README.md).
