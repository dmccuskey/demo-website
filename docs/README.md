# Demo Website Documentation

New to the Demo Website? Start with the [main README](../README.md), which says what it is and is not. There is nothing to run yet, so there is no Quick Start ([Current Baseline](development.md#current-baseline)).

## Use

- [Adding a Demo](adding-a-demo.md): hosting a demo here, as one folder, a DNS name and a deploy
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
│   ├── development.md
│   └── decisions/            # ADRs
├── .gitignore
└── README.md
```

What the design adds, as it is built:

```text
demo-website/
├── <the website>             # the static site's source
├── <the infrastructure>      # its Compose project: cloudflared and Caddy
├── demos/
│   └── <name>/               # a folder per demo: compose.yaml, a Caddy snippet, the website entry
├── <deploy and reset scripts>
├── .env.example              # the shape of .env
└── .env                      # you create (gitignored)
```
