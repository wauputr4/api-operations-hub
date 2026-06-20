import fs from 'node:fs';
import path from 'node:path';
import postmanToOpenApi from 'postman-to-openapi';

const pairs = [
  { in: 'postman/midtrans/midtrans.postman_collection.json', out: 'openapi-legacy/midtrans/midtrans.openapi.yaml', tag: 'Midtrans' },
  { in: 'postman/doku/doku.postman_collection.json', out: 'openapi-legacy/doku/doku.openapi.yaml', tag: 'DOKU' },
];

for (const item of pairs) {
  const out = await postmanToOpenApi(item.in, item.out, {
    defaultTag: item.tag,
  });
  if (!out) {
    throw new Error(`konversi gagal untuk ${item.in}`);
  }
}

console.log(`converted ${pairs.length} file(s)`);
