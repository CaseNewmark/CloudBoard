# CloudBoard Deployment Guide

CloudBoard ships with a Docker Compose setup for running it on a single server, such as a small VPS. It's aimed at a small group of users (the development phase). Everything runs on one domain with automatic HTTPS.

```
Browser ──HTTPS──▶ web (Caddy) ──┬── /            static Vue app
                                 ├── /api, /hubs  ──▶ api ──────┐
                                 └── /keycloak    ──▶ keycloak ─┤
                                                                ▼
                                                   postgres (cloudboard + keycloak DBs)
```

| Service | Image | Purpose |
|---|---|---|
| `web` | built from `CloudBoard.Vue/Dockerfile` | Caddy: serves the built Vue app, reverse-proxies `/api`, `/hubs` (SignalR WebSockets) and `/keycloak`, and gets/renews the Let's Encrypt certificate |
| `api` | built from `CloudBoard.ApiService/Dockerfile` | The .NET API; applies database migrations on startup |
| `keycloak` | `quay.io/keycloak/keycloak:26.6` | Login; imports the `cloudboard` realm on first start |
| `postgres` | `postgres:18` | One server with two databases: `cloudboard` and `keycloak` |

The files live in [`deploy/`](../deploy): `docker-compose.yml`, `Caddyfile`, `.env.example` and a Postgres init script.

## Requirements

- A Linux server with [Docker Engine](https://docs.docker.com/engine/install/) and the Compose plugin. 2 GB RAM is the minimum; 4 GB is comfortable (Keycloak is the largest consumer).
- A domain name with a DNS `A` (and optionally `AAAA`) record pointing at the server.
- Ports 80 and 443 reachable from the internet. Caddy needs both to obtain the certificate.

## First Deployment

1. Clone the repository on the server:
   ```bash
   git clone https://github.com/CaseNewmark/CloudBoard.git
   cd CloudBoard/deploy
   ```

2. Create the configuration:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   - `PUBLIC_URL`: the full origin, e.g. `https://cloudboard.example.com` (no trailing slash).
   - `POSTGRES_PASSWORD` and `KEYCLOAK_ADMIN_PASSWORD`: generate strong values, e.g. `openssl rand -base64 32`.
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: the Google OAuth client for sign-in (see [Google Sign-In](#google-sign-in)).
   - `AUTOMAPPER_LICENSE_KEY`: optional, see the main README.

3. Build and start:
   ```bash
   docker compose up -d --build
   ```
   The first start takes a few minutes: images are built, Keycloak initialises its database and imports the realm, and Caddy requests the certificate. Follow progress with `docker compose logs -f`.

4. Open `PUBLIC_URL` in a browser. You should see the CloudBoard home page.

## Google Sign-In

Users sign in with their Google account. Keycloak brokers the login: the app sends users to Keycloak, which forwards them to Google and creates their Keycloak account on first sign-in (with Google's verified email, so boards can be shared with them).

1. In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** of type **Web application**:
   - *Authorized JavaScript origins*: leave empty (the browser never calls Google from JavaScript).
   - *Authorized redirect URIs*: `PUBLIC_URL/keycloak/realms/cloudboard/broker/google/endpoint`, e.g. `https://cloudboard.example.com/keycloak/realms/cloudboard/broker/google/endpoint`.
2. Put the client ID and secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `deploy/.env`.
3. **Who can sign in:** while the Google app's publishing status is **Testing**, only the accounts listed under **Test users** (Google Auth Platform → Audience, up to 100) can sign in. Add each user's Google address there. If you publish the app, any Google account can sign in and create boards.

The Keycloak admin console (`PUBLIC_URL/keycloak/admin`, user `admin`, `KEYCLOAK_ADMIN_PASSWORD`) is only needed for administration, e.g. to disable a user.

### Switching an existing deployment to Google sign-in

The realm file is only imported when the realm doesn't exist yet, so an existing deployment keeps its old login until Keycloak's database is recreated. Recreating it removes all existing Keycloak accounts; boards belong to accounts, so to start fresh, recreate the app database too:

```bash
cd CloudBoard/deploy
# GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET set in .env first
docker compose stop api keycloak
docker compose exec postgres psql -U cloudboard -d postgres \
  -c 'DROP DATABASE cloudboard;' -c 'CREATE DATABASE cloudboard;' \
  -c 'DROP DATABASE keycloak;' -c 'CREATE DATABASE keycloak;'
docker compose up -d --build
```

The API recreates its tables on startup and Keycloak imports the realm, now with Google.

## Updating

```bash
cd CloudBoard
git pull
cd deploy
docker compose up -d --build
```

The API applies any new database migrations when it starts.

### Changes to the Keycloak realm

Keycloak imports `CloudBoard.AppHost/Realms/cloudboard.json` only when the realm doesn't exist yet, so changes to that file don't reach an existing deployment automatically. Either make the same change in the admin console, or, if you have no users worth keeping, recreate Keycloak's database:

```bash
docker compose stop keycloak
docker compose exec postgres psql -U cloudboard -d cloudboard -c 'DROP DATABASE keycloak;' -c 'CREATE DATABASE keycloak;'
docker compose start keycloak
```

This deletes all Keycloak users and settings.

## Backups

Back up both databases. Boards (including uploaded images, which are stored in the database) live in `cloudboard`, users in `keycloak`:

```bash
cd CloudBoard/deploy
docker compose exec -T postgres pg_dump -U cloudboard -Fc cloudboard > cloudboard-$(date +%F).dump
docker compose exec -T postgres pg_dump -U cloudboard -Fc keycloak   > keycloak-$(date +%F).dump
```

Restore (with the app stopped, into an existing database):

```bash
docker compose stop api keycloak
docker compose exec -T postgres pg_restore -U cloudboard -d cloudboard --clean --if-exists < cloudboard-YYYY-MM-DD.dump
docker compose exec -T postgres pg_restore -U cloudboard -d keycloak   --clean --if-exists < keycloak-YYYY-MM-DD.dump
docker compose start api keycloak
```

Copy the dump files off the server, for example with a nightly cron job.

## Trying It Locally

You can run the same stack on your machine without a domain. Plain HTTP on a local port avoids certificate requests:

```bash
cd deploy
cp .env.example .env    # set PUBLIC_URL=http://localhost:8088 plus the two passwords
cat > compose.override.yml <<'EOF'
services:
  web:
    ports: !override
      - "8088:8088"
EOF
docker compose up -d --build
```

Then open `http://localhost:8088`. `compose.override.yml` is picked up automatically; delete it again before deploying.

## Configuration Reference

How the pieces find each other:

- **Frontend → Keycloak.** Production builds use `<page origin>/keycloak`; the dev server uses the URL the AppHost passes in `VITE_KEYCLOAK_URL` (`https://localhost:8080` with a trusted dev certificate, otherwise `http://localhost:8080`). Set `VITE_KEYCLOAK_URL` at build time to override both (see `CloudBoard.Vue/src/services/keycloakApi.ts`).
- **Keycloak public URL.** `KC_HOSTNAME=${PUBLIC_URL}/keycloak`. Keycloak itself listens at `/` inside the Docker network; Caddy strips the `/keycloak` prefix. (It isn't `/auth` because the app's own login callback route is `/auth/callback`.)
- **Keycloak realm.** Redirect URIs and web origins in `cloudboard.json` are `${CLOUDBOARD_APP_URL:http://localhost:5173}`: Compose sets `CLOUDBOARD_APP_URL=${PUBLIC_URL}`, and in development (Aspire) the default applies.
- **API → Keycloak.** `services__keycloak__http__0=http://keycloak:8080` (Aspire service discovery). With `KC_HOSTNAME_BACKCHANNEL_DYNAMIC=true`, the API fetches signing keys over the internal network, while tokens carry the public issuer.
- **API → Postgres.** `ConnectionStrings__cloudboard`.

## Security Notes

- The Keycloak admin console is reachable at `PUBLIC_URL/keycloak/admin`. Use a strong `KEYCLOAK_ADMIN_PASSWORD`, and consider restricting that path by IP in the `Caddyfile`.
- Never commit `deploy/.env`; it's in `.gitignore`.
- Postgres, Keycloak and the API aren't published on host ports; only Caddy is.

## Troubleshooting

- **No certificate / browser warns about HTTPS.** Check that DNS points at the server and ports 80/443 are open, then read `docker compose logs web`.
- **Google shows "Error 400: redirect_uri_mismatch".** The redirect URI in the Google OAuth client must be exactly `PUBLIC_URL/keycloak/realms/cloudboard/broker/google/endpoint`. Google can take a few minutes to apply changes.
- **Google shows "Access blocked" / "has not completed the Google verification process".** The Google account isn't in the app's **Test users** list.
- **Login page shows "Invalid parameter: redirect_uri".** The realm was imported with a different `PUBLIC_URL`. Fix the client's redirect URIs in the admin console (Clients → cloudboard-client), or recreate the Keycloak database as described above.
- **API errors.** `docker compose logs -f api`.
- **Keycloak slow to start.** Its first start takes a minute or two; the API waits until Keycloak reports healthy.

## Development

For local development use the Aspire AppHost instead (see the main [README](../README.md)); it runs Postgres and Keycloak in containers and the API and Vue dev server on your machine.
