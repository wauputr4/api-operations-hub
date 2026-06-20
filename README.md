# API Operations Hub

**API Operations Hub** is an open source repository for organizing and publishing API assets in one place: Postman collections, OpenAPI specs, conversion scripts, and clean-up notes.

This project helps teams keep multiple payment and integration APIs aligned for API gateway onboarding, API docs publishing, and future automation.

## Why this repository

If you work with several providers and need a single source of truth for API definitions, this repo gives you:

- A versioned `postman/` folder for source collections.
- A normalized `openapi/` folder for OpenAPI 3.x outputs (production-ready JSON/YAML specs).
- A dedicated `openapi-legacy/` folder for historical/spec conversion compatibility.
- Reusable scripts to convert and clean Postman collections automatically.
- Documented cleanup status for schema quality and path correctness.

## Current API collections included

- Midtrans Payment API
- DOKU API Collection
- Xendit API
- Xendit SNAP API
- Fastpay API
- Finpay Billing API
- Finpay Disbursement API
- Finpay Payment Gateway API
- Mayar API
- Hostinger API
- Biznet Gio API

## Repository structure

- `postman/`
  - `midtrans/`
  - `doku/`
  - `xendit/`
  - `fastpay/`
  - `finpay/`
  - `mayar/`
  - `hostinger/`
- `openapi/`
  - Converted OpenAPI outputs for Midtrans, DOKU, Xendit, Fastpay, Finpay, Mayar, Hostinger, Biznet Gio.
- `openapi-legacy/`
  - Legacy conversion outputs retained for comparison.
- `openapi-modern/`
  - Cleanup notes and process documentation.
- `scripts/`
- `convert-postman-to-openapi-modern.mjs`
  - `convert-postman-to-openapi.mjs`
  - `convert-mayar-mintlify.mjs`
  - `clean-openapi-modern.mjs`
- `package.json`
- `package-lock.json`

## SEO-friendly keywords

Postman to OpenAPI, OpenAPI converter, payment API spec repo, API gateway reference, API documentation automation, Xendit API, Midtrans API, DOKU API, Fastpay API, Finpay API, Mayar API, Hostinger API, Biznet Gio API, OpenAPI 3.0 migration, OpenAPI 3.1 migration, API-first workflow.

## Prerequisites

- Node.js 22+
- npm

## Usage

```bash
npm install
```

### Convert modern OpenAPI (recommended)

```bash
npm run convert-postman
```

This reads Postman collections and outputs modern OpenAPI artifacts under `openapi/`.

### Convert Mintlify docs to Mayar (best-effort)

```bash
npm run convert-mayar
```

This reads Mintlify docs pages from `https://docs.mayar.id/llms.txt`, extracts endpoint examples, and outputs:

- `openapi/mayar/mayar.openapi.yaml`
- `postman/mayar/mayar.postman_collection.json`

### Convert legacy OpenAPI

```bash
npm run convert-postman:legacy
```

### Run cleanup checks

```bash
npm run clean-openapi-modern
```

This script checks and normalizes known path placeholders (for example Midtrans `INSERT-ORDER-ID`).

## OpenAPI outputs

- `openapi/midtrans/midtrans.openapi.yaml`
- `openapi/doku/doku.openapi.yaml`
- `openapi/xendit/xendit.openapi.yaml`
- `openapi/xendit/xendit-snap.openapi.yaml`
- `openapi/fastpay/fastpay.openapi.yaml`
- `openapi/finpay/finpay-billing.openapi.yaml`
- `openapi/finpay/finpay-disbursement.openapi.yaml`
- `openapi/finpay/finpay-payment-gateway.openapi.yaml`
- `openapi/mayar/mayar.openapi.yaml`
- `openapi/hostinger/hostinger.openapi.yaml`
- `openapi/hostinger/hostinger.openapi.json`
- `openapi/biznet-gio/biznet-gio.openapi.yaml`
- `openapi/biznet-gio/biznet-gio.openapi.json`

## Contributing

Pull requests are welcome for:

- New provider collections
- Improved normalization and cleanup rules
- Better request/response schema quality
- Gateway-friendly conventions for reusable API specs

## License

This repository is released under MIT. Contributions are welcome.

## Maintainers

This is a community-friendly open source repository maintained by the project owner and contributors.
