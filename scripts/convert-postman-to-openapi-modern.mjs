import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import { convert } from '@scalar/postman-to-openapi';

const pairs = [
  {
    input: 'postman/midtrans/midtrans.postman_collection.json',
    output: 'openapi/midtrans/midtrans.openapi.yaml',
  },
  {
    input: 'postman/doku/doku.postman_collection.json',
    output: 'openapi/doku/doku.openapi.yaml',
  },
  {
    input: 'postman/xendit/xendit.postman_collection.json',
    output: 'openapi/xendit/xendit.openapi.yaml',
  },
  {
    input: 'postman/xendit/xendit-snap.postman_collection.json',
    output: 'openapi/xendit/xendit-snap.openapi.yaml',
  },
  {
    input: 'postman/ipaymu/ipaymu.postman_collection.json',
    output: 'openapi/ipaymu/ipaymu.openapi.yaml',
  },
  {
    input: 'postman/flip/flip.postman_collection.json',
    output: 'openapi/flip/flip.openapi.yaml',
  },
  {
    input: 'postman/fastpay/fastpay.postman_collection.json',
    output: 'openapi/fastpay/fastpay.openapi.yaml',
  },
  {
    input: 'postman/finpay/finpay-billing.postman_collection.json',
    output: 'openapi/finpay/finpay-billing.openapi.yaml',
  },
  {
    input: 'postman/finpay/finpay-disbursement.postman_collection.json',
    output: 'openapi/finpay/finpay-disbursement.openapi.yaml',
  },
  {
    input: 'postman/finpay/finpay-payment-gateway.postman_collection.json',
    output: 'openapi/finpay/finpay-payment-gateway.openapi.yaml',
  },
];

for (const p of pairs) {
  await fs.mkdir(path.dirname(p.output), { recursive: true });
  const text = await fs.readFile(p.input, 'utf8');
  const openapi = convert(text, {
    keepHeaders: ['Accept', 'Content-Type'],
    mergeOperation: true,
    tagNamingStrategy: 'leaf',
  });
  await fs.writeFile(p.output, yaml.dump(openapi), 'utf8');
}

console.log(`converted ${pairs.length} postman collections with @scalar/postman-to-openapi`);
