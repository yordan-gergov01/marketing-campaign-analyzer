# AdAnalyzer - AI-Powered Marketing Campaign Analyzer

A full-stack web application that analyses Meta Ads and Google Ads campaign exports, generates ad copy variants, and revises media plans - all powered by OpenAI GPT-4o.


## Overview

AdAnalyzer takes the guesswork out of digital advertising performance. Upload a CSV export from Meta Ads Manager or Google Ads, and the application automatically parses every campaign, computes derived metrics (CTR, CPC, CPA, ROAS, Budget Efficiency Score), visualises the results in an interactive dashboard, and uses an LLM to generate ranked, campaign-specific recommendations.

The application covers three core workflows:

| Workflow | Input | Output |
|----------|-------|--------|
| Campaign Analysis | Meta / Google CSV export | Dashboard with charts, AI recommendations, budget suggestions |
| Ad Copy Generation | Objective, audience, product description, tone | 5 headlines · 5 primary texts · 3 CTAs · top combinations with predicted CTR |
| Media Plan Revision | PDF or DOCX media plan + optional performance CSV | Revised channel breakdown · before/after changes · 3 ROI scenarios · downloadable DOCX |


> **⚠️ Demo Notice:** (https://marketing-campaign-analyzer-0n36.onrender.com) — This is a **client-facing demo**, not a production deployment. The backend runs on Render's free tier and may be slow to respond or unavailable. Intended for showcasing the product concept to potential clients.


## Images

<img width="1898" height="904" alt="marketing-analyzer-1" src="https://github.com/user-attachments/assets/294a059d-73b0-41ee-849d-2390b6026e61" />
<img width="1864" height="890" alt="marketing-analyzer-2" src="https://github.com/user-attachments/assets/6c37868e-7285-4267-b8a3-0ca3b4ed2b17" />
<img width="1870" height="903" alt="marketing-analyzer-3" src="https://github.com/user-attachments/assets/6e64b483-6f63-46a2-8131-5417ad800c80" />
<img width="1882" height="901" alt="marketing-analyzer-4" src="https://github.com/user-attachments/assets/8f6a5a55-d6e2-476e-bf7c-f3abc7a0e0f1" />
<img width="1822" height="886" alt="marketing-analyzer-6" src="https://github.com/user-attachments/assets/a3bdef5b-af14-41da-b3fb-d1673457626a" />
<img width="1740" height="902" alt="marketing-analyzer-7" src="https://github.com/user-attachments/assets/8eb9f6c4-6ba8-40d8-b00e-d95fd51d10af" />
<img width="1676" height="901" alt="marketing-analyzer-8" src="https://github.com/user-attachments/assets/e08c11c2-ef1a-484f-82e3-73091b70c311" />
<img width="1633" height="900" alt="marketing-analyzer-9" src="https://github.com/user-attachments/assets/cfed06d8-cb85-45c2-87f5-0cd916469bd7" />



## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  User                                                       │
│  CSV upload          Copy form         PDF + CSV upload     │
└────────┬─────────────────┬──────────────────┬──────────────┘
         │                 │                  │
┌────────▼─────────────────▼──────────────────▼──────────────┐
│  Frontend  (React + TypeScript + Tailwind + Recharts)       │
│  Dashboard page    Copy Generator    Media Plan page        │
└────────┬─────────────────┬──────────────────┬──────────────┘
         │  POST /api/...  │                  │
┌────────▼─────────────────▼──────────────────▼──────────────┐
│  Backend  (FastAPI + Python)                                │
│  routers/analyze.py  routers/copy_gen.py  routers/media_plan.py │
└────────┬─────────────────────────────────────┬─────────────┘
         │                                     │
┌────────▼──────────┐              ┌───────────▼─────────────┐
│ services/         │              │ services/               │
│ csv_parser.py     │              │ pdf_parser.py           │
│ pandas · auto-    │              │ PyMuPDF · extract text  │
│ detect platform   │              │                         │
└────────┬──────────┘              └───────────┬─────────────┘
         │                                     │
┌────────▼─────────────────────────────────────▼─────────────┐
│  services/ai_service.py                                     │
│  All GPT-4o calls in JSON mode with retry logic            │
│  analyse_campaigns() · generate_copy() · revise_media_plan()│
└─────────────────────────────────────────────────────────────┘
```



## Features

### Campaign Analysis (`POST /api/analyze`)

- Auto-detects Meta Ads and Google Ads CSV export formats
- Handles real-world dirty data: EU decimal formats, currency symbols, `--` placeholders, encoding variations (UTF-8, CP1251, Latin-1)
- Computes per-campaign: CTR, CPC, CPA, ROAS, Budget Efficiency Score (0–100 composite)
- ROAS calculation priority: actual `Conv. value` column → `avg_order_value` query param → reported as unavailable (no hardcoded fallback)
- AI generates up to 5 ranked recommendations with `impact_score`, `category`, and a concrete `action` verb
- Budget reallocation suggestions per campaign
- Returns chart-ready data for Recharts (spend, CTR, ROAS, efficiency)
- Demo mode available without uploading a real file

### Ad Copy Generator (`POST /api/generate-copy`)

- Supports Meta, Google, LinkedIn, TikTok
- Objectives: conversions, traffic, awareness, leads, engagement
- Tones: professional, casual, urgent, emotional, humorous
- Languages: English, Bulgarian
- Returns 5 headlines, 5 primary texts, 3 CTAs — each with a score (0–10), score breakdown (relevance, emotion, clarity, platform fit), and reasoning
- Top 3 headline + text + CTA combinations with predicted CTR range
- Enforces platform character limits (Meta ≤ 40 chars for headlines, Google ≤ 30)

### Media Plan Revision (`POST /api/revise-plan`)

- Accepts PDF (PyMuPDF) or DOCX (python-docx) media plan files up to 15 MB
- Optional: enrich revision with a current performance CSV export
- Parameters: new objectives, total budget, currency, timeframe
- Returns revised channel breakdown, key changes with before/after comparison, and three ROI scenarios (conservative / realistic / optimistic)
- Generates a downloadable DOCX of the full revised plan (returned as base64)

### Robustness

- Prompt injection protection: safety preamble in every system prompt instructs the model to treat uploaded content as untrusted data
- AI output sanitisation before Pydantic validation: composite category values (`"creative|targeting"`) are split and the first valid token is used; `impact_score` is clamped to 1–10
- LLM retry logic: up to 2 retries with exponential back-off on transient failures
- File size limits: 10 MB for CSV, 15 MB for media plan documents


## Evaluation Notebooks

The `notebooks/` directory contains two Jupyter notebooks used to validate the application before and during development.

### `01_csv_parser_real_data.ipynb`

Runs the full `csv_parser.py` pipeline against real simulated CSV exports without making any AI calls. Shows the exact JSON payload that gets forwarded to the AI, validates all edge cases (`_safe_float`, `_detect_platform`, `_find_column`, `_calculate_efficiency`), and demonstrates ROAS calculation with and without `avg_order_value`.

**Zero cost — no API key required.**

### `02_ai_prompt_eval_real_data.ipynb`

Sends the real parsed campaign data to OpenAI and evaluates the quality of responses across all three AI functions:

- **Structure check** — validates JSON against the Pydantic schemas in `models/schemas.py`
- **Specificity check** — verifies that recommendations mention actual campaign names and real numbers, not generic advice
- **Consistency check** — calls the same prompt three times and compares which campaigns are flagged across runs

**Requires `OPENAI_API_KEY`. Estimated cost: ~$0.10–0.20 per full run.**


## CSV Export Format

The parser auto-detects the platform from column names and handles real-world export quirks.

### Meta Ads

Export from **Ads Manager → Reports → Export Table Data (.csv)**.  
Required columns: `Campaign name`, `Amount spent (EUR)`, `Impressions`, `Clicks (all)`, `Results`.

> Note: Meta exports `Clicks (all)` — not `Link clicks`. Ensure the correct column is included in your custom report.

### Google Ads

Export from **Google Ads → Reports → Predefined reports → Basic → Campaigns → Download CSV**.  
Required columns: `Campaign`, `Impr.`, `Clicks`, `Cost`, `Conversions`.  
Optional (enables real ROAS): `Conv. value`.
