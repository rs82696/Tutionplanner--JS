# TuitionPlanner -- Scholarship Matching API

A Javascript + Express + SQLite application that matches students to
scholarships based on eligibility rules and generates a mock AI
explanation for the top match.

------------------------------------------------------------------------

# Features Implemented

-   Seed scholarships from JSON into SQLite
-   Create student profiles
-   List scholarships
-   Compute eligibility-based matches
-   Return match reasons
-   Generate mock AI explanation for the top match
-   View recent students in UI

------------------------------------------------------------------------

# Tech Stack

-   Node.js(JavaScript)
-   Express.js
-   SQLite (better-sqlite3)
-   Zod (validation)
-   dotenv
-   Static HTML

------------------------------------------------------------------------

# Setup Instructions

## Install Dependencies

npm install

## Create Environment File

Create `.env` in project root:

PORT=3000 DATABASE_URL=file:./dev.db AI_PROVIDER=mock

## Seed Scholarship Data

npm run seed

Expected output: Seeded scholarships: 12

## Start the Server

npm run dev

Server runs at: http://localhost:3000

## Open the Demo UI

Open in browser: http://localhost:3000

------------------------------------------------------------------------

# API Endpoints

## Health

GET /health

## Scholarships

GET /api/scholarships

## Students

POST /api/students\
GET /api/students

## Matching

GET /api/students/:id/matches

Returns: - match_count - matches with eligibility reasons -
top_match_explanation (mock AI generated)

------------------------------------------------------------------------

# Design Decisions

## SQLite for Persistence

-   No external database setup required
-   Lightweight and ideal for evaluation
-   Persistent across restarts

## better-sqlite3

-   Simple synchronous API
-   Minimal boilerplate
-   Good performance for small datasets

## Rule-Based Matching Engine

Matching is deterministic and checks: - GPA minimum - Citizenship
eligibility - Enrollment status - Financial need - First-generation
status - Gender restriction - Residency - Community service hours -
Field of study (if defined)

All required conditions must be satisfied.

## Mock AI Explanation

Chosen to keep project self-contained and reproducible. No external APIs
required.

------------------------------------------------------------------------

# AI Option Chosen

✅ Mock AI\
AI_PROVIDER=mock

------------------------------------------------------------------------

# Time Breakdown (Approximate)

- Setup & scaffolding: 20–30 min
- Database schema & seed: 40–50 min
- Scholarships API: 15–20 min
- Student creation endpoint: 25–35 min
- Matching logic + reasons: 60–75 min
- Mock AI explanation: 15–20 min
- Static HTML UI: 35–45 min
- Documentation: 20–30 min

Total: ~4–5 hours

------------------------------------------------------------------------

# Assumptions Made

-   financial_need is boolean (no income thresholds implemented)
-   If a scholarship has no restriction, it is considered open
-   Email must be unique
-   Matching is strict eligibility (no scoring model)

------------------------------------------------------------------------

# Known Limitations

-   No edit student endpoint
-   No delete student endpoint
-   No pagination
-   No authentication
-   No real AI provider
-   No automated test suite

------------------------------------------------------------------------

# Future Improvements

-   Add edit/delete student endpoints
-   Add income-based eligibility logic
-   Add scoring/ranking system
-   Add unit tests
-   Add real AI integration
-   Add pagination & filtering
-   Improve UI styling

------------------------------------------------------------------------

#  Database

-   SQLite file: dev.db
-   Delete dev.db to reset students
-   Reseed scholarships using: npm run seed

------------------------------------------------------------------------

# Required Files Included

-   Source code
-   schema.sql
-   README.md
-   .env.example
-   .gitignore
-   package.json
