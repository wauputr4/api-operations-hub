import fs from 'node:fs/promises';
import yaml from 'js-yaml';

const targets = [
  'openapi/midtrans/midtrans.openapi.yaml',
  'openapi/doku/doku.openapi.yaml',
  'openapi/xendit/xendit.openapi.yaml',
  'openapi/xendit/xendit-snap.openapi.yaml',
  'openapi/ipaymu/ipaymu.openapi.yaml',
];

for (const target of targets) {
  const raw = await fs.readFile(target, 'utf8');
  const doc = yaml.load(raw);
  const paths = doc.paths || {};
  const cleanedPaths = {};

  for (const [path, operations] of Object.entries(paths)) {
    const normalizedPath = path.replace('/[INSERT-ORDER-ID]/', '/{order_id}/');
    const existing = cleanedPaths[normalizedPath];
    if (!existing) {
      cleanedPaths[normalizedPath] = operations;
      continue;
    }

    cleanedPaths[normalizedPath] = {
      ...existing,
      ...operations,
    };
  }

  if (target.includes('midtrans')) {
    for (const [path, operations] of Object.entries(cleanedPaths)) {
      if (!path.includes('{order_id}')) {
        continue;
      }

      for (const op of Object.values(operations)) {
        const params = Array.isArray(op.parameters) ? [...op.parameters] : [];
        const hasOrderId = params.some((item) => item?.in === 'path' && item?.name === 'order_id');
        if (!hasOrderId) {
          params.push({
            name: 'order_id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^[A-Za-z0-9._-]+$',
              minLength: 4,
            },
            description: 'Order identifier in URL path.',
          });
          op.parameters = params;
        }
      }
    }
  }

  doc.paths = cleanedPaths;
  await fs.writeFile(target, yaml.dump(doc), 'utf8');

  const cleanedRaw = await fs.readFile(target, 'utf8');
  const checks = [
    ['path-placeholders', '/\\[INSERT-ORDER-ID\\]/'],
    ['path-item-template-brace', '/{order_id}/'],
  ].map(([name, pattern]) => {
    const matches = cleanedRaw.match(new RegExp(pattern, 'g')) || [];
    return `${name}: ${matches.length}`;
  });

  console.log(`${target}\n  ${checks.join('\n  ')}\n`);
}
