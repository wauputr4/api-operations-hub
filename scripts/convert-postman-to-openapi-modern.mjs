import fs from 'node:fs/promises';
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
];

for (const p of pairs) {
  const text = await fs.readFile(p.input, 'utf8');
  const openapi = convert(text, {
    keepHeaders: ['Accept', 'Content-Type'],
    mergeOperation: true,
    tagNamingStrategy: 'leaf',
  });
  await fs.writeFile(p.output, yaml.dump(openapi), 'utf8');
}

console.log('converted 2 postman collections with @scalar/postman-to-openapi');
