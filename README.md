# AI Services Playground

Full-stack playground (Vue 3 + Express) for experimenting with AI APIs across multiple providers (e.g., OpenAI, Google Cloud, and more).
The goal is to quickly prototype features (speech-to-text, summarization, embeddings, etc.) and later spin off focused microservices.

## Monorepo Structure

├── front/ # Vue 3 client (Vite)
└── backend/ # Node.js / Express API (integrations & services)

## Features (WIP)

- ✅ Provider experiments (OpenAI / GCP / others)
- ✅ Basic API layer in Express
- ✅ UI playground in Vue 3
- ⏳ Speech-to-Text (GCP Speech / other providers)
- ⏳ Summarization / chat workflows
- ⏳ Embeddings / vector search experiments
- ⏳ Retry / rate-limit / basic observability patterns

## Requirements

- Node.js `>= 18`
- npm `>= 9`

## Setup

Clone and install dependencies:

bash:
git clone <REPO_URL>
cd <REPO_FOLDER>

# Frontend
cd front
npm install

# Backend
cd ../backend
npm install


backend/.env 
PORT=3002
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=your_key_here

# Google Cloud (recommended)
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account-key.json

# Or if you prefer raw JSON in env (optional approach)
# GCP_SERVICE_ACCOUNT_JSON=...

Run (Development)
Backend
cd backend
npm run dev

Backend should be available at:

http://localhost:3002

Frontend
cd front
npm run dev

Build
# Frontend build
cd front
npm run build

# Backend production start (depends on your setup)
cd ../backend
npm run sta
