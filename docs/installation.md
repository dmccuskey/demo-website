# Installation

How to set up the host that runs the demos: a Raspberry Pi, reached through a Cloudflare tunnel. To try the hosting on a Mac first, the [Quick Start](../README.md#quick-start) is the short path. Everything after the setup is in [Operations](operations.md).

## What the Host Needs

- **A 64-bit Raspberry Pi** (`aarch64`), such as a Pi 4. A demo's images are built for Linux ARM64.
- **A 64-bit Debian,** such as Raspberry Pi OS (64-bit) or Debian 13, with SSH and a user that has `sudo`.
- **A tunnel in the Cloudflare account,** with its token ([The Tunnel](operations.md#the-tunnel)). The host is reached through it only: no router port is forwarded to it ([ADR 002](decisions/002-tunnel-never-a-forwarded-port.md)).
- **No other host running the same tunnel.** Two hosts with one token share its visitors between them.

The steps run on the host, over SSH.

## 1. Docker

Install Docker Engine and its Compose plugin from Docker's own apt repository, as Docker's documentation shows for Debian (search for "Install Docker Engine on Debian"). Check it:

```sh
docker version --format '{{.Server.Version}}'
docker compose version
```

Add the user to the `docker` group, so the scripts and the reset timer run as that user, without `sudo`. Log out and back in for it to take effect:

```sh
sudo usermod -aG docker "$USER"
```

Then limit the containers' logs, so they do not fill an SD card: `/etc/docker/daemon.json`, with 10 MB × 3 files per container.

```json
{
  "log-driver": "local",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
```

```sh
sudo systemctl restart docker
docker info --format '{{.LoggingDriver}}'      # local
```

## 2. The Repository and `.env`

Clone the repository into the home folder. The reset timer looks for it at `~/demo-website`:

```sh
git clone https://github.com/dmccuskey/demo-website.git ~/demo-website
cd ~/demo-website
```

Create `.env` from the example, and set every value in it, the tunnel's two lines included ([The `.env` File](operations.md#the-env-file)):

```sh
cp .env.example .env
chmod 600 .env
```

```text
DEMO_DOMAIN=example.com
DATA_SERVICE_WRITE_TOKEN=<the output of openssl rand -hex 32>
COMPOSE_PROFILES=tunnel
TUNNEL_TOKEN=<the tunnel's token>
```

The website at `demo.<domain>` is allowed to read a demo's state only when `DEMO_DOMAIN` is the real domain.

## 3. The Deploy

```sh
scripts/deploy
```

The first run downloads the images. It ends with `Deployed.`, and the tunnel shows as healthy in the Cloudflare account. Its client logs four connections:

```sh
docker logs demo-infrastructure-cloudflared-1 2>&1 | grep -c 'Registered tunnel connection'     # 4
```

Then check a demo from anywhere, through the tunnel:

```sh
curl https://virtual-infrastructure.example.com/health
```

```json
{"status":"ok"}
```

A `502` there means the tunnel reaches Caddy, but the demo is not running: see `docker compose ls`.

## 4. The Nightly Reset

The reset runs each night at 04:00, in the host's time zone, as a pair of systemd user units in `host/systemd/`: `demo-reset.timer` starts `demo-reset.service`, which runs `scripts/reset` in `~/demo-website`. A night missed while the host was off is not made up: the host's restart has started every demo from nothing already.

Let the user's units run while nobody is logged in, then link the units and start the timer:

```sh
sudo loginctl enable-linger "$USER"
systemctl --user link ~/demo-website/host/systemd/demo-reset.service ~/demo-website/host/systemd/demo-reset.timer
systemctl --user enable --now demo-reset.timer
```

Check it, and run the reset once as the timer will:

```sh
systemctl --user list-timers               # demo-reset.timer, next at 04:00
systemctl --user start demo-reset.service
sudo journalctl _SYSTEMD_USER_UNIT=demo-reset.service -n 1      # ... Reset.
```

If the run fails with `permission denied while trying to connect to the docker API`, the user's systemd manager started before the user joined the `docker` group, and still has the groups it started with. Restart it, or the host:

```sh
sudo systemctl restart "user@$(id -u).service"
```

The units are linked, not copied, so a `git pull` changes them. After a change to them, run `systemctl --user daemon-reload`.

## Updating

Run `scripts/deploy` again: it pulls the repository and the images ([The Deploy](operations.md#the-deploy)).
