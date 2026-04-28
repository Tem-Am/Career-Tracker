# AI Job Copilot — Backend

Backend service for an AI-powered job tracking and resume analysis application.

Built with **Node.js, Express, TypeScript, PostgreSQL, and Drizzle ORM**, this service is designed to support a **scalable async AI pipeline using queues and workers**.

---

## 🚀 Overview

This backend provides:

- 🔐 JWT-based authentication
- 📋 Job tracking system (CRUD)
- 📄 Resume storage (raw text)
- 🤖 AI pipeline (queue-based, async — stubbed in Phase 1)
- 🛡️ Secure multi-tenant architecture (user-isolated data)

---

## 🧱 Tech Stack

- **Runtime:** Node.js + Express  
- **Language:** TypeScript (strict mode)  
- **Database:** PostgreSQL (Railway)  
- **ORM:** Drizzle ORM  
- **Auth:** JWT + bcryptjs  
- **Validation:** Zod  
- **Queue:** BullMQ + Redis  
- **AI (planned):** OpenAI API  

---
## 🔐 Authentication

- JWT expires in **7 days**
- Passwords hashed using **bcrypt**
- Protected routes require:


### Endpoints

| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| POST   | /api/auth/register   | Register user       |
| POST   | /api/auth/login      | Login user          |

---

## 📦 API Endpoints

### Jobs (Protected)

| Method | Endpoint         | Description           |
|--------|------------------|-----------------------|
| POST   | /api/jobs        | Create job            |
| GET    | /api/jobs        | Get all user jobs     |
| GET    | /api/jobs/:id    | Get single job        |
| PATCH  | /api/jobs/:id    | Update job            |
| DELETE | /api/jobs/:id    | Delete job            |

---

### Resume (Protected)

| Method | Endpoint        | Description              |
|--------|----------------|--------------------------|
| POST   | /api/resume    | Save resume (raw text)   |
| GET    | /api/resume    | Get user's resume        |

---

### AI (Protected — Phase 1 Stub)

| Method | Endpoint                    | Description               |
|--------|-----------------------------|---------------------------|
| POST   | /api/ai/match/:jobId        | Queue AI job              |
| GET    | /api/ai/insights/:jobId     | Get AI insights (pending) |

---

## ⚙️ Architecture Highlights

### 🔒 Multi-Tenant Security

All queries are scoped to 

