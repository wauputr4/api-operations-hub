# OpenAPI Modern Cleanup Notes

Date: 2026-06-20

## Scope
OpenAPI modern dibuat dari Postman collections:
- Midtrans: [postman/midtrans/midtrans.postman_collection.json](../postman/midtrans/midtrans.postman_collection.json)
- DOKU: [postman/doku/doku.postman_collection.json](../postman/doku/doku.postman_collection.json)
- Xendit API: [postman/xendit/xendit.postman_collection.json](../postman/xendit/xendit.postman_collection.json)
- Xendit SNAP: [postman/xendit/xendit-snap.postman_collection.json](../postman/xendit/xendit-snap.postman_collection.json)
- iPaymu API v2: [postman/ipaymu/ipaymu.postman_collection.json](../postman/ipaymu/ipaymu.postman_collection.json)
- Faspay API: [postman/fastpay/fastpay.postman_collection.json](../postman/fastpay/fastpay.postman_collection.json)
- Finpay Billing: [postman/finpay/finpay-billing.postman_collection.json](../postman/finpay/finpay-billing.postman_collection.json)
- Finpay Disbursement: [postman/finpay/finpay-disbursement.postman_collection.json](../postman/finpay/finpay-disbursement.postman_collection.json)
- Finpay Payment Gateway: [postman/finpay/finpay-payment-gateway.postman_collection.json](../postman/finpay/finpay-payment-gateway.postman_collection.json)
- Mayar API (Mintlify): [https://docs.mayar.id/api-reference/introduction](https://docs.mayar.id/api-reference/introduction)

## Output (OpenAPI modern)
- [openapi/midtrans/midtrans.openapi.yaml](../openapi/midtrans/midtrans.openapi.yaml)
- [openapi/doku/doku.openapi.yaml](../openapi/doku/doku.openapi.yaml)
- [openapi/xendit/xendit.openapi.yaml](../openapi/xendit/xendit.openapi.yaml)
- [openapi/xendit/xendit-snap.openapi.yaml](../openapi/xendit/xendit-snap.openapi.yaml)
- [openapi/ipaymu/ipaymu.openapi.yaml](../openapi/ipaymu/ipaymu.openapi.yaml)
- [openapi/fastpay/fastpay.openapi.yaml](../openapi/fastpay/fastpay.openapi.yaml)
- [openapi/finpay/finpay-billing.openapi.yaml](../openapi/finpay/finpay-billing.openapi.yaml)
- [openapi/finpay/finpay-disbursement.openapi.yaml](../openapi/finpay/finpay-disbursement.openapi.yaml)
- [openapi/finpay/finpay-payment-gateway.openapi.yaml](../openapi/finpay/finpay-payment-gateway.openapi.yaml)
- [openapi/mayar/mayar.openapi.yaml](../openapi/mayar/mayar.openapi.yaml)

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
- `openapi/xendit/xendit.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=49`
- `openapi/xendit/xendit-snap.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`
- `openapi/ipaymu/ipaymu.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=1`
- `openapi/fastpay/fastpay.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=5`
- `openapi/finpay/finpay-billing.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`
- `openapi/finpay/finpay-disbursement.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`
- `openapi/finpay/finpay-payment-gateway.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0`
- `openapi/mayar/mayar.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=0` (best-effort Mintlify extraction)

## Ringkasan cepat (setelah convert)
- Midtrans: `10` path, `10` operasi
- DOKU: `57` path, `62` operasi
- Xendit: `100` path, `116` operasi
- Xendit SNAP: `13` path, `13` operasi
- iPaymu: `12` path, `12` operasi
- Faspay: `10` path, `10` operasi
- Finpay Billing: `1` path, `1` operasi
- Finpay Disbursement: `7` path, `7` operasi
- Finpay Payment Gateway: `11` path, `11` operasi
- Mayar: `52` path, `52` operasi (hasil parser Mintlify dari llms.txt)

## Catatan kualitas
Konversi modern tetap endpoint-complete dari source collection, tapi belum semua schema/request-response di-hardcode.
Perlu penajaman manual untuk:
- `securitySchemes` dan mapping auth tiap produk
- schema `type/required` di request-response
- konsistensi tags dan policy untuk gateway
- Mayar masih best-effort karena berasal dari Markdown example (Request/ResponseExample), bukan export OpenAPI asli.
