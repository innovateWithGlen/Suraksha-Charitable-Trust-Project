# Suraksha Charitable Trust Project

A production-oriented Next.js platform for **Suraksha Charitable Trust** that combines:

- Public website pages for trust information and donor engagement
- Donation and 80G receipt workflows
- CSR initiative and pledge management
- Admin dashboard and content/data management
- AI assistant (RAG + Gemini) for trust-related FAQs

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [Scripts](#scripts)
- [Testing](#testing)
- [Core Functional Areas](#core-functional-areas)
- [AI Assistant (RAG) Notes](#ai-assistant-rag-notes)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

---

## Overview

This repository powers a trust operations stack designed for real-world NGO workflows:

- donor management
- donation tracking and payment verification
- 80G tax document generation and delivery
- CSR project planning and expense tracking
- contact inquiry management
- content/gallery updates from admin panel

The app is built with the Next.js App Router and uses MongoDB models for operational data.

---

## Key Features

### Public Experience
- Homepage and trust information pages (`about`, `what-we-do`, `impact`, `gallery`, `contact`)
- Donation flow with payment order creation and verification
- Project adoption and CSR outreach pages

### Admin Experience
- Protected admin login (Google + credentials + OTP)
- Dashboard with donation metrics, donor growth, and recent transactions
- CRUD management for:
  - donors
  - donations
  - gallery/events
  - site content
  - trust settings
  - contact inquiries
  - tax documents

### Finance & Compliance
- 80G receipt/certificate generation and delivery endpoints
- CSR project, pledge, and expense APIs
- Document upload/download workflows

### Messaging & Communication
- Automated donation confirmations
- 80G receipt/certificate emails
- OTP delivery for admin login
- Contact inquiry notifications and replies

### AI Assistant
- Domain-constrained trust assistant (`/api/chat`)
- Retrieval-augmented answers from trust documents + curated trust facts

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4, shadcn/ui, Radix UI
- **Database:** MongoDB + Mongoose
- **Auth:** NextAuth v5 (Google + Credentials + OTP)
- **Payments:** Razorpay
- **Email:** Resend
- **AI:** Vercel AI SDK + Google Gemini + LangChain utilities
- **Testing:** Vitest + Testing Library + jsdom

---

## Repository Structure

```text
app/                 Next.js routes, API handlers, admin/public pages
components/          Shared UI and section components
lib/                 Core services (auth, db, models, email, ai, rag, utils)
lib/models/          Mongoose models (donors, donations, CSR, settings, docs, etc.)
__tests__/           Unit tests for helper/validation logic
demo-docs/           Source trust documents for ingestion/seeding
scripts/             Auxiliary scripts (example: transaction seed)
public/              Static assets
```

---

## Getting Started

### 1) Prerequisites

- Node.js 20+
- npm (or compatible package manager)
- MongoDB instance

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment

Create `.env.local` in the project root and add required variables (see [Environment Variables](#environment-variables)).

### 4) Seed baseline data

```bash
npm run seed
```

Optional additional seeds:

```bash
npm run seed:demo
npm run seed:csr
npm run seed:docs
```

### 5) Start development server

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Environment Variables

> Create `.env.local` and define values appropriate for your environment.

### Core

- `MONGODB_URI` — MongoDB connection string (required)
- `NEXTAUTH_URL` — canonical app URL
- `NEXTAUTH_SECRET` — NextAuth secret
- `APP_URL` / `NEXT_PUBLIC_APP_URL` — optional public URL helpers for email links

### Admin/Auth

- `ADMIN_EMAIL` — allowed admin email for login restrictions
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `ENCRYPTION_KEY` — app encryption key (used by encryption utilities)

### Email (Resend)

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TEST_EMAIL_INBOX` (optional)
- `DEMO_EMAIL_INBOX` (optional)
- `DEMO_EMAIL_REDIRECT_ENABLED` (optional, `true`/`false`)

### Payments (Razorpay)

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### AI

- `GEMINI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`

### CSR / Certificates / Contact

- `SURAKSHA_80G_URN` (optional override)
- `TRUSTEE_SIGNATORY_NAME` (optional)
- `NEXT_PUBLIC_TRUST_WHATSAPP_NUMBER` / `TRUST_WHATSAPP_NUMBER` (optional)

### Blob Storage (if enabled)

- `BLOB_OBJECT_ACCESS`
- `BLOB_COVER_IMAGE_ACCESS`
- `BLOB_EXPENSE_ACCESS`

---

## Database Seeding

Baseline and domain seeds are available through scripts:

- `npm run seed` — admin user + base content/settings
- `npm run seed:demo` — demo data
- `npm run seed:csr` — CSR-related seed data
- `npm run seed:docs` — trust/document corpus for assistant workflows

The default seed flow creates/updates an admin user and initial CMS records.

---

## Scripts

```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Run ESLint
npm run test           # Run Vitest once
npm run test:coverage  # Run tests with coverage
npm run test:ui        # Launch Vitest UI
npm run seed           # Seed baseline data
npm run seed:demo      # Seed demo records
npm run seed:csr       # Seed CSR records
npm run seed:docs      # Seed trust documents
```

---

## Testing

Run all tests:

```bash
npm run test
```

Coverage:

```bash
npm run test:coverage
```

Current test suite includes utility and validation-focused tests under `__tests__/`.

---

## Core Functional Areas

- **Donor & Donation APIs:** `app/api/donors`, `app/api/donations`
- **Dashboard Analytics:** `app/api/dashboard`, admin dashboard UI in `app/admin/page.tsx`
- **CSR Workflows:** `app/api/csr-projects`, `app/api/csr-pledges`, `app/api/csr-transactions`
- **Documents & Certificates:** `app/api/documents`, `app/api/certificates`
- **Content/Gallery/Settings:** `app/api/content`, `app/api/gallery`, `app/api/settings`
- **Contact & Notifications:** `app/api/contact`, `app/api/notifications`
- **Auth + OTP:** `app/api/auth`, `lib/auth.ts`

---

## AI Assistant (RAG) Notes

The chat endpoint (`app/api/chat/route.ts`) is intentionally domain-restricted and prioritizes:

1. deterministic trust facts
2. retrieval from trust documents
3. safe fallback behavior when context is missing

This reduces hallucinations and keeps responses specific to the trust’s legal/compliance and operational context.

---

## Deployment Notes

- Ensure all required environment variables are configured in your deployment platform.
- Use a production MongoDB cluster with proper IP/network rules.
- Confirm OAuth redirect URIs and domain values match deployed URLs.
- Validate Razorpay keys and webhook/payment verification behavior before go-live.

Suggested pre-release checks:

```bash
npm run lint
npm run test
npm run build
```

---

## Troubleshooting

### `Please define the MONGODB_URI...`
Add `MONGODB_URI` to `.env.local`.

### Admin login fails for valid OAuth account
Only `ADMIN_EMAIL` is allowed for admin access and must exist in the admin user store.

### Email delivery errors in development
Check `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and test inbox configuration (`TEST_EMAIL_INBOX` / `DEMO_EMAIL_INBOX`).

### Payment verification issues
Validate `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` and ensure request signatures are generated/verified correctly.

---

## Maintainers

Glen Saver Monteiro.
