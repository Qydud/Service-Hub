# ServiceHub production deployment

Production is intentionally separated from the local Docker Compose setup.
Use `docker-compose.prod.yml` on the VPS and keep real secrets only in `.env.production`.

## 1. Server

Recommended starting point:

- Ubuntu 24.04 LTS
- 2+ CPU
- 4+ GB RAM
- 40+ GB SSD
- public IPv4 address
- firewall allowing TCP 80 and 443

Do not expose PostgreSQL or the backend port to the public internet.

## 2. Clone the repository

```bash
git clone -b Miras https://github.com/Qydud/Service-Hub.git
cd Service-Hub
```

Install Docker Engine and the Docker Compose plugin using Docker's official Ubuntu instructions.

## 3. Create production secrets

```bash
cp .env.production.example .env.production
nano .env.production
```

Set unique production values for:

- `POSTGRES_PASSWORD`
- `SECRET_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_EMAIL`
- `CORS_ORIGINS`

Never commit `.env.production`.

## 4. Start the production stack

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Check:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 backend
```

Expected state:

- `db`: healthy
- `backend`: healthy
- `frontend`: healthy
- `nginx-proxy`: running

## 5. Create the admin account

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec backend python create_admin.py
```

Use the same `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env.production`.

## 6. Nginx Proxy Manager

The Nginx Proxy Manager admin UI is bound to `127.0.0.1:81` for security.
It is not exposed publicly.

From your own computer, create an SSH tunnel:

```bash
ssh -L 8081:127.0.0.1:81 user@SERVER_IP
```

Then open `http://localhost:8081`.

Create a Proxy Host for the public domain:

- Domain: `your-domain.kz`
- Forward Hostname/IP: `frontend`
- Forward Port: `80`
- Enable Websockets if needed
- Request a Let's Encrypt SSL certificate
- Enable Force SSL

The frontend container already proxies `/api/` and `/uploads/` to the backend service.

## 7. DNS

At the domain registrar, create:

```text
A    @      SERVER_IP
A    www    SERVER_IP
```

Wait for DNS propagation before requesting the certificate.

## 8. Backups

The repository includes a backup script for both PostgreSQL and uploaded files:

```bash
sh scripts/backup-production.sh
```

Backups are written to `./backups/`.

Do not rely on backups stored only on the same VPS. Copy them periodically to another machine or object storage.

## 9. Updates

Before an update:

```bash
git pull origin Miras
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Then verify:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

And test:

- homepage
- `/api/health`
- application submission
- photo upload
- admin login
- application status changes

## 10. Important security rules

- Do not commit `.env.production`.
- Do not publish PostgreSQL port `5432`.
- Do not publish backend port `8000`.
- Keep Nginx Proxy Manager admin port `81` bound to localhost.
- Use HTTPS for the public domain.
- Use a strong unique admin password.
- Use a long random `SECRET_KEY`.
- Keep regular off-server backups.
