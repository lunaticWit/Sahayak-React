# Sahayak React Marketplace

React 19 and Vite frontend for the Sahayak agricultural marketplace, with an Express API and the existing FastAPI AI service. The React screens, design system, translations, assets, and business logic are preserved from the Next.js project.

## Requirements

- Node.js 20 or newer
- Python 3.10 or newer for the optional AI service

## Run locally

1. Install JavaScript dependencies with `npm install`.
2. Copy `.env.local.example` to `.env.local` and add optional integration credentials.
3. Start the web app and Express API with `npm run dev`.
4. Open `http://localhost:5173`.
5. To enable Python forecasts and route optimization, install `backend/requirements.txt` and start `python backend/main.py` in a separate terminal.

The Express API listens on port 4000. Vite proxies `/api` requests to it. Both the frontend and API use local demo data when optional integrations are not configured.

## Commands

- `npm run dev` starts Vite and the Express API.
- `npm run build` creates the production frontend in `dist/`.
- `npm start` serves the production frontend and API on port 4000.
- `npm test` runs the existing Node test suite.
- `npm run lint` runs the TypeScript check.

Environment variable names and examples are in `.env.local.example`. Never put server secrets in variables prefixed with `VITE_`; those values are included in the browser bundle.

# Sahayak-React
This is Farmer's Marketplace Portal.

