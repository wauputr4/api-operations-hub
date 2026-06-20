# OpenAPI Modern Cleanup Notes

Date: 2026-06-20

## Scope
OpenAPI modern dibuat dari Postman collections:
- Midtrans: [postman/midtrans/midtrans.postman_collection.json](../postman/midtrans/midtrans.postman_collection.json)
- DOKU: [postman/doku/doku.postman_collection.json](../postman/doku/doku.postman_collection.json)
- Xendit API: [postman/xendit/xendit.postman_collection.json](../postman/xendit/xendit.postman_collection.json)
- Xendit SNAP: [postman/xendit/xendit-snap.postman_collection.json](../postman/xendit/xendit-snap.postman_collection.json)
- iPaymu API v2: [postman/ipaymu/ipaymu.postman_collection.json](../postman/ipaymu/ipaymu.postman_collection.json)

## Output (OpenAPI modern)
- [openapi/midtrans/midtrans.openapi.yaml](../openapi/midtrans/midtrans.openapi.yaml)
- [openapi/doku/doku.openapi.yaml](../openapi/doku/doku.openapi.yaml)
- [openapi/xendit/xendit.openapi.yaml](../openapi/xendit/xendit.openapi.yaml)
- [openapi/xendit/xendit-snap.openapi.yaml](../openapi/xendit/xendit-snap.openapi.yaml)
- [openapi/ipaymu/ipaymu.openapi.yaml](../openapi/ipaymu/ipaymu.openapi.yaml)

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
- `openapi/ipaymu/ipaymu.openapi.yaml`: `path-placeholders=0`, `path-item-template-brace=1`

## Ringkasan cepat (setelah convert)
- Midtrans: `10` path, `10` operasi
- DOKU: `57` path, `62` operasi
- Xendit: `100` path, `116` operasi
- Xendit SNAP: `13` path, `13` operasi
- iPaymu: `12` path, `12` operasi

## Catatan kualitas
Konversi modern tetap endpoint-complete dari source collection, tapi belum semua schema/request-response di-hardcode.
Perlu penajaman manual untuk:
- `securitySchemes` dan mapping auth tiap produk
- schema `type/required` di request-response
- konsistensi tags dan policy untuk gateway
