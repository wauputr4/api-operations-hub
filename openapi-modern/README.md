# OpenAPI Modern Cleanup Notes

Date: 2026-06-20

## What is this
Folder ini dipakai sebagai catatan cleanup manual untuk hasil OpenAPI modern yang dibuat dari Postman:
- [openapi/midtrans/midtrans.openapi.yaml](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/openapi/midtrans/midtrans.openapi.yaml)
- [openapi/doku/doku.openapi.yaml](/Users/wauputra/Documents/02_Bisnis_Pekerjaan/07_Dev/api-operations-hub/openapi/doku/doku.openapi.yaml)

## Cleanup yang sudah dilakukan
- Normalize path placeholder Midtrans:
  - Semua `/v2/[INSERT-ORDER-ID]/...` diganti ke `/v2/{order_id}/...`.
- Tambah parameter path `order_id` (required) untuk semua operasi yang memakai path itu.
- Jalankan validasi otomatis supaya tidak ada placeholder `[INSERT-ORDER-ID]` lagi di file output modern.

## Perintah verifikasi
```bash
npm run clean-openapi-modern
```

Output verifikasi yang diharapkan:
- `openapi/midtrans/midtrans.openapi.yaml`: `path-placeholders: 0`, `path-item-template-brace: 6`
- `openapi/doku/doku.openapi.yaml`: `path-placeholders: 0`, `path-item-template-brace: 0`

## Hasil cek cepat setelah cleanup
- Midtrans: `10` path, `10` operasi, placeholder path `0`, parameter `order_id` sudah 6 kali (sesuai jumlah operasi path yang butuh).
- DOKU: `57` path, `62` operasi, placeholder path `0`.
- Kualitas modern setelah convert tetap “lengkap endpoint” tapi tetap perlu review manual untuk:
  - schema response/request yang tegas
  - `securitySchemes` yang benar per produk/auth mode
  - penamaan tag / grouping gateway policy
