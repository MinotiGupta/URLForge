# URLForge ⚡

> A production-grade URL shortener built with FastAPI, Redis, PostgreSQL, React & Docker.



---

## System Architecture

```
              Users
                │
            Nginx (:80)
           /          \
       Frontend       FastAPI (:8000)
                      /            \
                  Redis          PostgreSQL
                    \
               Celery Worker
               (cleanup every 1h)
```

## Tech Stack

| Layer | Tech |
|---|---|
| **Backend** | FastAPI, SQLAlchemy, Alembic |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 (write-through, 1h TTL) |
| **Auth** | JWT + bcrypt |
| **Workers** | Celery + Redis Beat |
| **Rate Limiting** | SlowAPI (100 req/min) |
| **Metrics** | Prometheus (`/metrics`) |
| **Frontend** | React + Vite |
| **Deployment** | Docker Compose + Nginx |
| **CI/CD** | GitHub Actions |
| **Testing** | Pytest, 80%+ coverage |

---

## Database Schema

```sql
-- Users
id UUID PK, email, hashed_password, is_admin, created_at

-- URLs
id UUID PK, user_id FK, original_url, short_code (unique),
custom_alias, expires_at, created_at, click_count, qr_code

-- ClickAnalytics
id UUID PK, url_id FK, country, device, browser, os,
ip_hash, referer, timestamp
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Get JWT token |
| GET | `/api/auth/me` | ✅ | Current user |
| POST | `/api/shorten` | Optional | Shorten URL |
| GET | `/api/urls` | ✅ | List my URLs |
| PUT | `/api/url/{id}` | ✅ | Update URL |
| DELETE | `/api/url/{id}` | ✅ | Delete URL |
| GET | `/api/analytics/{id}` | ✅ | Link analytics |
| GET | `/api/dashboard` | 🔐 Admin | System stats |
| GET | `/{short_code}` | ❌ | Redirect |
| GET | `/api/health` | ❌ | Health check |
| GET | `/metrics` | ❌ | Prometheus |

---

## Quick Start

### With Docker (recommended)

```bash
docker compose up
```

- Frontend: http://localhost
- Backend API: http://localhost/api/docs
- Direct backend: http://localhost:8000/api/docs

### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# set DATABASE_URL and REDIS_URL in .env
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Run tests:**
```bash
cd backend
pytest ../tests/ -v --cov=app
```


## Environment Variables

See `.env.example` for all configuration options.
