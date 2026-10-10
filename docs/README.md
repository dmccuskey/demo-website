# Demo Website Documentation

New to the Demo Website? Start with the [main README](../README.md), which says what it is and is not. The [Quick Start](../README.md#quick-start) there runs the hosting and the first demo on a Mac.

## Use

- [Adding a Demo](adding-a-demo.md): hosting a demo here, as one folder, a DNS name and a deploy
- [Operations](operations.md): the `.env` file, the deploy, the reset, and looking at what runs
- [Hosting Contract](hosting-contract.md): what a demo provides to be hosted, point by point, with the names that are the same in every demo

## Internals

- [Architecture](architecture.md): the parts, how a visitor reaches a demo, how a change gets out, and the nightly reset
- [Architecture Decisions](decisions/): the project's decision records (ADRs), listed in the [architecture](architecture.md#decisions)

## Contribute

- [Development](development.md): the principles, what is built so far, what is not yet checked, and possible future changes

## Project Structure

What is in the repository now:

```text
demo-website/
├── docs/
│   ├── README.md             # this page
│   ├── architecture.md
│   ├── hosting-contract.md
│   ├── adding-a-demo.md
│   ├── operations.md
│   ├── development.md
│   └── decisions/            # ADRs
├── infrastructure/
│   ├── compose.yaml          # the infrastructure's Compose project: Caddy
│   └── Caddyfile             # the main Caddyfile, which imports every demo's
├── demos/
│   └── virtual-infrastructure/   # a folder per demo
│       ├── compose.yaml      # the demo, from its published images
│       ├── Caddyfile         # the demo's hostname to its door
│       └── demo.md           # the entry for the website
├── scripts/
│   ├── deploy                # pull, start everything, reload Caddy
│   ├── reset                 # recreate every demo's containers
│   └── lib.sh                # shared by the two
├── .env.example              # the shape of .env
├── .env                      # you create (gitignored)
├── .gitignore
└── README.md
```

What the design adds, as it is built:

```text
demo-website/
├── <the website>             # the static site's source
└── infrastructure/           # cloudflared, beside Caddy
```
