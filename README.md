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

The website is on its static host, and the first demo is reached through the tunnel, from a Mac for now. The Raspberry Pi is still to come ([Current Baseline](docs/development.md#current-baseline)).

## Quick Start

The following steps take about 5 minutes on a Mac. You will have the first demo running in containers, behind the reverse proxy, on a hostname of its own.

You need Docker with Compose (`docker compose version`) and Git (`git --version`).

1. Clone the repository and go into it:

   ```sh
   git clone https://github.com/dmccuskey/demo-website.git
   cd demo-website
   ```

2. Create `.env` for a Mac, with `localhost` as the domain and a write token of your own:

   ```sh
   printf 'DEMO_DOMAIN=localhost\nDATA_SERVICE_WRITE_TOKEN=%s\n' "$(openssl rand -hex 32)" > .env
   ```

   **Going further:** every value is described in [The `.env` File](docs/operations.md#the-env-file).

3. Deploy. The first run downloads the images:

   ```sh
   scripts/deploy
   ```

   ```text
   ==> Pulling the repository
   ==> infrastructure
   ==> virtual-infrastructure
   ==> Reloading Caddy
   Deployed.
   ```

   If it stops with `required variable DATA_SERVICE_WRITE_TOKEN is missing a value`, the token is missing from `.env`.

4. Open <http://virtual-infrastructure.localhost:8080> in a browser. The dashboard shows one user and one server, and "About" opens the demo's dialog.

5. Reset the demo, with the tab left open:

   ```sh
   scripts/reset
   ```

   The tab reconnects and shows a new system.

   **Going further:** [Operations](docs/operations.md) has the rest: logs, one demo at a time, stopping everything.

6. Optional: see the website, the list of the demos with a page for each. It needs Node 22 or later (`node --version`):

   ```sh
   cd website
   npm ci
   npm start
   ```

   Open <http://localhost:8081>. The demo is shown as "Down" there even while it runs: a demo lets only the website's real address read its state.

   **Going further:** [The Website](docs/operations.md#the-website) shows how to see it as up on your machine.

To update, run `scripts/deploy` again: it pulls the repository and the images.

## Documentation

- [Architecture](docs/architecture.md): the parts, how a visitor reaches a demo, how a change gets out, the nightly reset
- [Hosting Contract](docs/hosting-contract.md): what a demo provides to be hosted here
- [Adding a Demo](docs/adding-a-demo.md): the folder, the DNS name and the deploy
- [Operations](docs/operations.md): the `.env` file, the deploy and the reset

Everything else, including the decision records and how the project is developed, is listed on the [documentation home](docs/README.md).
