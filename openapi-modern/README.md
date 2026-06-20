# OpenAPI Modern Cleanup Notes

Date: 2026-06-20

## Scope
OpenAPI modern dibuat dari Postman collections:
- Midtrans: [postman/midtrans/midtrans.postman_collection.json](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/postman/midtrans/midtrans.postman_collection.json)
- DOKU: [postman/doku/doku.postman_collection.json](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/postman/doku/doku.postman_collection.json)
- Xendit API: [postman/xendit/xendit.postman_collection.json](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/postman/xendit/xendit.postman_collection.json)
- Xendit SNAP: [postman/xendit/xendit-snap.postman_collection.json](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/postman/xendit/xendit-snap.postman_collection.json)
- Fastpay API: [postman/fastpay/fastpay.postman_collection.json](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/postman/fastpay/fastpay.postman_collection.json)
- Finpay Billing: [postman/finpay/finpay-billing.postman_collection.json](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/postman/finpay/finpay-billing.postman_collection.json)
- Finpay Disbursement: [postman/finpay/finpay-disbursement.postman_collection.json](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/postman/finpay/finpay-disbursement.postman_collection.json)
- Finpay Payment Gateway: [postman/finpay/finpay-payment-gateway.postman_collection.json](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/postman/finpay/finpay-payment-gateway.postman_collection.json)

## Output (OpenAPI modern)
- [openapi/midtrans/midtrans.openapi.yaml](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/openapi/midtrans/midtrans.openapi.yaml)
- [openapi/doku/doku.openapi.yaml](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/openapi/doku/doku.openapi.yaml)
- [openapi/xendit/xendit.openapi.yaml](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/openapi/xendit/xendit.openapi.yaml)
- [openapi/xendit/xendit-snap.openapi.yaml](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/openapi/xendit/xendit-snap.openapi.yaml)
- [openapi/fastpay/fastpay.openapi.yaml](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/openapi/fastpay/fastpay.openapi.yaml)
- [openapi/finpay/finpay-billing.openapi.yaml](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/openapi/finpay/finpay-billing.openapi.yaml)
- [openapi/finpay/finpay-disbursement.openapi.yaml](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/openapi/finpay/finpay-disbursement.openapi.yaml)
- [openapi/finpay/finpay-payment-gateway.openapi.yaml](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/openapi/finpay/finpay-payment-gateway.openapi.yaml)

## Cleanup yang dilakukan
- Semua `/v2/[INSERT-ORDER-ID]/...` (hanya di Midtrans) dinormalisasi jadi `/v2/{order_id}/...`.
- Menambah `path parameter` `order_id` (required) pada operasi path yang terkait.
- Verifikasi otomatis placeholder dan path template untuk file modern yang relevan.

## Jalankan verifikasi
```bash
npm run clean-openapi-modern
```

## Hasil verifikasi terukur
- `openapi/midtrans/midtrans.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=6`
- `openapi/doku/doku.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`
- `openapi/xendit/xendit.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`
- `openapi/xendit/xendit-snap.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`
- `openapi/fastpay/fastpay.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`
- `openapi/finpay/finpay-billing.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`
- `openapi/finpay/finpay-disbursement.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`
- `openapi/finpay/finpay-payment-gateway.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`

## Ringkasan cepat (setelah convert)
- Midtrans: `10` path, `10` operasi
- DOKU: `57` path, `62` operasi
- Xendit: `100` path, `116` operasi
- Xendit SNAP: `13` path, `13` operasi
- Fastpay: `10` path, `10` operasi
- Finpay Billing: `1` path, `1` operasi
- Finpay Disbursement: `7` path, `7` operasi
- Finpay Payment Gateway: `11` path, `11` operasi

## Catatan kualitas
Konversi modern tetap endpoint-complete dari source collection, tapi belum semua schema/request-response di-hardcode.
Perlu penajaman manual untuk:
- `securitySchemes` dan mapping auth tiap produk
- schema `type/required` di request-response
- konsistensi tags dan policy untuk gateway
