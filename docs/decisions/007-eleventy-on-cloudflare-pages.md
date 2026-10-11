# ADR 007: The Website Is Built with Eleventy and Served by Cloudflare Pages

**Status:** Accepted

## Context

The website is a static site on a static host, built on a push ([ADR 004](004-static-website-hosted-elsewhere.md)). That left two choices open: the host, and what builds the site from each demo's entry, `demos/<name>/demo.md`.

This repository is public, and the domain is not in it ([ADR 005](005-hostname-per-demo.md)). The domain's DNS and the tunnel are in a Cloudflare account already ([ADR 002](002-tunnel-never-a-forwarded-port.md)).

Hosts considered:

- **GitHub Pages.** No other account is needed. It takes a custom domain without a `CNAME` file in the repository, as long as the site is published from a GitHub Actions workflow, not from a branch (GitHub's documentation, checked 2026-10-09). But the repository is public, so what it is set up with shows on it: the repository's page links the site's address from its deployments, and a repository variable is printed in the workflow's public logs. The domain would be out of the commits and one click from them.
- **Cloudflare Pages.** The domain and the build's variables are set in the Cloudflare account. Nothing on the repository shows them.

Generators considered:

- **A build script of our own,** with a Markdown library. The fewest parts, but the templates and a server for working on the site would be ours to maintain.
- **Astro.** Components and picture handling, which a list and a page per demo do not need.
- **Eleventy.** Markdown and templates in, plain HTML out, and no framework in the browser.

## Decision

The website's source is in `website/`. Eleventy builds it, and Cloudflare Pages builds and serves it on a push to `main`.

The build reads the demos by listing `demos/`, as the scripts do: a folder with a `demo.md` is a demo. It takes the domain from `DEMO_DOMAIN`, which is set in the Cloudflare Pages project, and on a developer's machine is read from the repository's `.env`. Without it the build fails.

## Consequences

- No workflow file is in the repository: the build's command, its folder and its variables are settings of the Cloudflare Pages project ([The Website](../operations.md#the-website)).
- The built site holds the domain, in the demos' addresses. The repository does not.
- The website depends on the Cloudflare account, as the tunnel and the DNS do. Another static host would need the same three things: the folder, the command and the variable.
- The repository now has Node dependencies, in `website/` only. The hosting needs none of them.
