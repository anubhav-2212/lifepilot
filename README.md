# LifePilot — Personal Life Management Agent

> **"Never miss an important personal responsibility hidden in your digital life."**

LifePilot is a consumer-facing personal life management application designed to identify, organize, and track obligations scattered across your digital accounts (starting with Gmail).

---

## 🎯 Core Responsibility Categories

1. **Bills & Utilities:** Payment amounts, due dates, and payment obligations.
2. **Appointments:** Meetings, doctor visits, bookings, and scheduled events.
3. **Subscriptions:** Renewals, recurring charges, and subscription expirations.
4. **Commitments:** Deadlines, action items, requests, and personal promises.

---

## 🏗️ System Architecture

LifePilot is engineered as a **modular monolith** with synchronous API processing:

### Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v7, Axios.
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL.
- **Security:** AES-256-GCM encrypted OAuth token persistence, HTTP-only signed session cookies, zero client-side token exposure.
- **AI Processing (Phase 4):** Google Gemini API with strict structured JSON schemas and Zod runtime validation.
- **Integrations:** Google OAuth 2.0 and Gmail API (read-only access).

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 20`
- Docker and Docker Compose (for local PostgreSQL)

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Configure Environment
Copy `.env.example` in `api/`:
```bash
cp api/.env.example api/.env
```

### 3. Install & Migrate
```bash
npm install
npm run db:migrate # or npm run prisma:push --workspace=api
```

### 4. Run Development Servers
```bash
# Terminal 1 - Backend API (:4000)
npm run dev:api

# Terminal 2 - Frontend Web (:5173)
npm run dev:web
```

Visit [http://localhost:5173](http://localhost:5173).

---

## 🗺️ Roadmap & Phase Progression

- [x] **Phase 1: Project Foundation** — Monorepo layout, Docker PostgreSQL, Prisma schema, Express backend, React frontend, `/api/health`.
- [x] **Phase 2: Authentication & Sessions** — Google OAuth 2.0, AES-256-GCM token encryption, HTTP-only cookies, protected routes, login & dashboard views.
- [ ] **Phase 3: Gmail Integration** — Decrypt tokens, auto-refresh, paginated email sync, body parsing, deduplication.
- [ ] **Phase 4: AI Extraction** — Gemini API structured extraction, Zod validation, prompt engineering, evidence grounding.
- [ ] **Phase 5: Responsibility Management** — Repository persistence, CRUD, status lifecycle, source item linking.
- [ ] **Phase 6: Comprehensive Dashboard** — Status filters, category views, edit/delete modals, search and date sorting.
- [ ] **Phase 7: End-to-End Testing & Verification**.
