# Deploying

The site runs as one Docker container on the Debian server, published only on
`127.0.0.1:3200`. A Cloudflare Tunnel is the only way in from the internet.

```
visitor → Cloudflare → cloudflared (on the server) → 127.0.0.1:3200 → container :3000
```

Everything lives in [`deploy/`](../deploy): `Dockerfile`, `docker-compose.yml`, `Makefile` and
`portfolio.env.example`.

## First deploy

Requirements: Docker Engine with the Compose plugin, `git`, `make` and `curl`. Your user should be
in the `docker` group.

```bash
sudo systemctl enable --now docker          # Docker (and so the container) starts on boot
git clone https://github.com/jeary-dev/<repo>.git ~/portfolio
cd ~/portfolio
cp deploy/portfolio.env.example deploy/portfolio.env
nano deploy/portfolio.env                   # fill in the values (see below)
make -C deploy deploy-local
```

`deploy-local` builds the image, starts the container, waits until it reports healthy and prints
the status.

Then point the tunnel at it. In the cloudflared config, add an ingress rule above the catch-all:

```yaml
ingress:
  - hostname: jeary.dev
    service: http://127.0.0.1:3200
  # ...existing rules, ending with:
  - service: http_status:404
```

```bash
sudo systemctl restart cloudflared
```

For a dashboard-managed tunnel, add the public hostname `jeary.dev` → `http://127.0.0.1:3200`
under Zero Trust → Networks → Tunnels instead.

## Environment (`deploy/portfolio.env`)

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Defaults to `https://jeary.dev`. Built into the image, so changes need `deploy-local`. |
| `GITHUB_TOKEN` | Optional. Fine-grained token with no permissions. Without it the site stays well inside GitHub's 60 requests an hour. |
| `CONTACT_EMAIL` | Where contact messages go, and the `mailto:` fallback. |
| `RESEND_API_KEY` | Optional. Sends the form from the server. Without it the form uses `mailto:`. |
| `RESEND_FROM` | Sender on a domain verified in Resend, e.g. `jeary.dev <contact@jeary.dev>`. |

The file is git-ignored. After changing it, run `make -C deploy deploy-local` so the container is
recreated with the new values.

## Day to day

| Command | What it does |
| --- | --- |
| `make -C deploy deploy` | `git pull`, build the new image while the current one keeps serving, then swap containers and wait for the health check |
| `make -C deploy rollback` | Return to the image that was live before the last `deploy` |
| `make -C deploy logs` | Follow the logs |
| `make -C deploy status` | Container state plus `GET /api/health` |
| `make -C deploy deploy-local` | Rebuild and restart the current checkout (no pull) |

The swap recreates the container, so expect a second or two of unavailability while the new one
starts. Cloudflare shows its error page for any request that lands in that gap.

## Health and restarts

- `GET /api/health` returns `{"status":"ok","version":"<git sha>","uptime":<seconds>}`.
- Docker runs the same check every 30 seconds; `docker compose ps` shows `healthy`.
- `restart: unless-stopped` brings the container back after a crash or a reboot. It stays down
  only if you stop it yourself (`make -C deploy down`).
- Logs rotate at 10 MB, three files.

## Security notes

- The port is bound to `127.0.0.1`, so nothing is exposed except through the tunnel.
- The container runs as a non-root user with all capabilities dropped and `no-new-privileges`.
- Every page gets a nonce-based Content-Security-Policy (`src/proxy.ts`) plus HSTS,
  `X-Frame-Options`, `nosniff`, a referrer policy and a permissions policy (`next.config.ts`).
- The contact form is rate-limited per visitor IP (Cloudflare's `CF-Connecting-IP`) and has a
  honeypot field.

## Troubleshooting

- **Contact form says it couldn't send:** check `make -C deploy logs` for `[contact]` lines. The
  most common cause is `RESEND_FROM` using a domain that isn't verified in Resend.
- **Projects show a "GitHub couldn't be reached" notice:** GitHub was unreachable or rate-limited
  and the container had no earlier result yet (for example, just after a restart). It retries
  every five minutes. Setting `GITHUB_TOKEN` avoids rate limits entirely.
