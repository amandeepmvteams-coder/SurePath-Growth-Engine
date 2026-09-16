# SurePath Growth Engine

**SurePath Growth Engine** is an API-first B2B merchant discovery, research, scoring, and sales CRM platform.

The platform helps teams discover Shopify merchants, research their businesses, generate structured merchant profiles, detect protection providers with supporting evidence, calculate deterministic fit and opportunity scores, and enrich merchant data with AI-powered insights. It also provides CRM capabilities for managing merchants, contacts, notes, activities, tasks, and sales workflows.

---

## Overview

SurePath follows a structured merchant intelligence pipeline:

```text
Discovery
   ↓
Research
   ↓
Profile Generation
   ↓
Provider Detection
   ↓
Scoring
   ↓
AI Processing
   ↓
CRM / Review
```

Each stage builds on the data produced by the previous stage, allowing merchant information to move through the platform as structured, traceable data.

---

## Core Capabilities

### Merchant Discovery

Discover and collect Shopify merchants that can be processed through the platform's merchant intelligence pipeline.

### Website Research

Research merchant websites and store the resulting research data for downstream processing.

The research workflow is designed to:

* Respect `robots.txt`
* Apply request delays
* Respect per-domain restrictions
* Store researched pages and extracted information
* Support concurrent processing across merchants

### Profile Generation

Generate structured merchant profiles from previously stored research data.

Profile generation operates on stored research information and does not perform additional website requests.

### Provider Detection

Identify relevant protection providers associated with merchants and store supporting evidence for detection results.

### Deterministic Scoring

Calculate merchant fit and opportunity values using configurable scoring rules.

Scoring is deterministic and is separate from AI processing.

Changing the scoring configuration does not automatically recalculate existing scores. A scoring run must be executed again when updated configuration should be applied.

### AI Processing

AI processing provides enrichment such as:

* Industry classification
* Shipping-policy summaries
* Returns-policy summaries
* Evidence-grounded outputs
* Citation validation

AI processing does **not** determine the deterministic merchant fit score or opportunity value.

The platform also supports versioned AI configurations so generated results can be traced to the configuration used to produce them.

### Sales CRM

The CRM layer supports merchant relationship management through:

* Merchants
* Contacts
* Notes
* Activities
* Tasks
* Sales workflow management

---

## API Architecture

The backend exposes a versioned REST API under:

```text
/api/v1
```

The health endpoint is publicly accessible:

```http
GET /api/v1/health
```

Most other API operations require an API key using:

```http
X-API-Key: <your-api-key>
```

Authenticated dashboard operations additionally use signed session cookies.

### Authentication Flow

```text
API Request
    ↓
API Key
    ↓
Session Authentication
    ↓
Role Authorization
    ↓
Resource Authorization
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

---

## Technology Stack

### Backend

* Node.js
* Express
* TypeScript
* PostgreSQL
* REST API
* Session-based authentication
* HMAC-signed sessions

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

### Database

PostgreSQL is used as the primary application database for storing:

* Users
* Sessions
* Merchants
* Merchant profiles
* Contacts
* Notes
* Activities
* Tasks
* Research data
* Provider detections
* Scores
* Scoring configurations
* AI configurations
* Related pipeline data

---

## Project Structure

```text
surepath-v1/
│
├── surepath-backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   │   └── migrations/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── validators/
│   │
│   └── ...
│
├── surepath-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## API Pipeline

The intended processing workflow is:

### 1. Discovery

Merchant records are identified and added to the platform.

### 2. Research

Merchant websites are researched and relevant information is persisted.

### 3. Profile Generation

Stored research data is transformed into structured merchant profiles.

### 4. Provider Detection

Protection providers are detected using merchant information and supporting evidence.

### 5. Scoring

Merchants are evaluated using the configured deterministic scoring model.

### 6. AI Processing

Approved AI workflows enrich merchant records with classifications and policy summaries where sufficient source information exists.

### 7. CRM / Review

Sales teams can manage merchants and related CRM information through the platform.

---

## Configuration Versioning

SurePath supports versioned configurations for scoring and AI processing.

This allows the platform to maintain traceability between:

```text
Configuration
      ↓
Processing Run
      ↓
Generated Result
```

Updating a configuration does not automatically modify historical results.

---

## Data Principles

The API follows several conventions:

* Timestamps are represented in UTC using ISO-8601 format.
* Decimal values are returned as strings.
* `null` represents missing data and should not automatically be interpreted as zero.
* Pipeline stages use merchant IDs from previous stages where applicable.
* AI-generated information is grounded in available merchant text.
* Manual merchant profile overrides should not be overwritten by later research.

---

## User Management

The platform supports administrative user management including:

* Listing users
* Creating users
* Updating users
* Activating/deactivating users
* Administrative password recovery

User accounts are deactivated rather than deleted.

The system also protects the final active account from being deactivated.

---

## Development

Clone the repository:

```bash
git clone https://github.com/amandeepmvteams-coder/SurePath-Growth-Engine.git
cd SurePath-Growth-Engine
```

### Backend

```bash
cd surepath-backend
npm install
```

Configure the required environment variables using a local `.env` file.

Then start the backend using the development script defined in `package.json`.

### Frontend

```bash
cd surepath-frontend
npm install
```

Configure the frontend environment variables and start the Next.js development server using the script defined in `package.json`.

---

## Environment Variables

Environment-specific secrets should be stored locally and must not be committed to Git.

Typical backend configuration includes values such as:

```env
PORT=
DATABASE_URL=
API_KEY=
SESSION_SECRET=
```

Use `.env.example` to document required variables without exposing credentials.

---

## API Documentation

The API contract defines the available operations, request parameters, request bodies, responses, authentication requirements, and expected processing behavior.

The API is organized under:

```text
/api/v1
```

Swagger/OpenAPI documentation can be used during development where configured.

---

## Project Goals

SurePath Growth Engine is designed around a traceable merchant intelligence workflow:

```text
Discover
  → Research
  → Understand
  → Detect
  → Score
  → Enrich
  → Manage
```

The goal is to turn raw merchant discovery data into structured, evidence-backed information that can be used by sales and business teams.

---

## License

This project is proprietary. See the repository's licensing and usage terms for details.
