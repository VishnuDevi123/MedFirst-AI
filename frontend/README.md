## MedTrust AI Frontend

MedTrust AI lets patients and pharmacists verify medicine authenticity by scanning a secure barcode token printed on each package. The web app talks to our backend to validate the signature, read the Sui testnet object, cross-check FDA data, and present an AI summary of the findings.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 to use the app.

## Barcode Workflow

1. Scan the tamper-resistant barcode or paste the token manually.
2. The frontend sends the signed payload to the backend `/verify` endpoint.
3. The backend validates the signature, pulls the Sui object + OpenFDA info, runs extra risk checks, and asks the LLM for a plain-language summary.
4. The results—including signature status, duplicate warnings, and blockchain hashes—display instantly in the UI.

## Useful Commands
- `npm run dev` – local development server

## Environment

Create `frontend/.env.local` if you need to point at a non-default backend:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5050
```

