import fs from 'node:fs/promises';
import yaml from 'js-yaml';

const HTTP_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);

const targets = [
  'openapi/midtrans/midtrans.openapi.yaml',
  'openapi/doku/doku.openapi.yaml',
  'openapi/xendit/xendit.openapi.yaml',
  'openapi/xendit/xendit-snap.openapi.yaml',
  'openapi/ipaymu/ipaymu.openapi.yaml',
  'openapi/flip/flip.openapi.yaml',
  'openapi/fastpay/fastpay.openapi.yaml',
  'openapi/finpay/finpay-billing.openapi.yaml',
  'openapi/finpay/finpay-disbursement.openapi.yaml',
  'openapi/finpay/finpay-payment-gateway.openapi.yaml',
];

for (const target of targets) {
  const raw = await fs.readFile(target, 'utf8');
  const doc = yaml.load(raw);
  const paths = doc.paths || {};
  const cleanedPaths = {};

  for (const [path, operations] of Object.entries(paths)) {
    let normalizedPath = path.replace('/[INSERT-ORDER-ID]/', '/{order_id}/');

    if (target.includes('fastpay')) {
      normalizedPath = normalizedPath
        .replace('/183xx00010100000', '/{merchant_id}')
        .replace('/182xx00010100000', '/{merchant_id}');
    }

    if (target.includes('flip')) {
      normalizedPath = normalizedPath.replaceAll(':bill_id', '{bill_id}');
    }
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

      for (const [method, op] of Object.entries(operations)) {
        if (!HTTP_METHODS.has(method.toLowerCase())) {
          continue;
        }
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

  if (target.includes('fastpay')) {
    doc.info ??= {};
    doc.info.title = 'Faspay API';

    for (const [path, operations] of Object.entries(cleanedPaths)) {
      if (!path.includes('{merchant_id}')) {
        continue;
      }

      for (const op of Object.values(operations)) {
        const params = Array.isArray(op.parameters) ? [...op.parameters] : [];
        const hasMerchantId = params.some((item) => item?.in === 'path' && item?.name === 'merchant_id');
        if (!hasMerchantId) {
          params.push({
            name: 'merchant_id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Faspay merchant identifier in URL path.',
          });
          op.parameters = params;
        }
      }
    }
  }

  if (target.includes('flip')) {
    for (const [path, operations] of Object.entries(cleanedPaths)) {
      if (!path.includes('{bill_id}')) {
        continue;
      }

      for (const [method, op] of Object.entries(operations)) {
        if (!HTTP_METHODS.has(method.toLowerCase())) {
          continue;
        }
        const params = Array.isArray(op.parameters) ? [...op.parameters] : [];
        const hasBillId = params.some((item) => item?.in === 'path' && item?.name === 'bill_id');
        if (!hasBillId) {
          params.push({
            name: 'bill_id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Flip payment link identifier.',
          });
          op.parameters = params;
        }
      }
    }
  }

  if (target.includes('ipaymu')) {
    for (const [path, operations] of Object.entries(cleanedPaths)) {
      for (const op of Object.values(operations)) {
        const params = Array.isArray(op.parameters) ? [...op.parameters] : [];

        for (const param of params) {
          if (param?.in === 'header' && param?.name === 'signature') {
            param.schema ??= {};
            param.schema.type = 'string';
          }
        }

        if (path.includes('{transaction_id}')) {
          const hasTransactionId = params.some(
            (item) => item?.in === 'path' && item?.name === 'transaction_id',
          );
          if (!hasTransactionId) {
            params.unshift({
              name: 'transaction_id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'iPaymu COD transaction identifier.',
            });
          }
        }

        op.parameters = params;
      }
    }
  }

  if (target.includes('flip')) {
    const formSchemas = {
      'Bank Account Inquiry': {
        account_number: 'string',
        bank_code: 'string',
      },
      'Create Disbursement': {
        account_number: 'string',
        bank_code: 'string',
        amount: 'integer',
        remark: 'string',
      },
      'Create Bill': {
        title: 'string',
        type: 'string',
        amount: 'integer',
        expired_date: 'string',
        step: 'integer',
      },
    };

    for (const operations of Object.values(cleanedPaths)) {
      for (const [method, op] of Object.entries(operations)) {
        if (!HTTP_METHODS.has(method.toLowerCase())) {
          continue;
        }

        if (Array.isArray(op.parameters)) {
          op.parameters = op.parameters.filter(
            (param) => !(
              param?.in === 'header'
              && ['content-type', 'accept'].includes(param.name?.toLowerCase())
            ),
          );
          for (const param of op.parameters) {
            if (param?.in === 'query' && param.schema?.type === 'integer') {
              for (const example of Object.values(param.examples || {})) {
                if (typeof example?.value === 'string' && /^-?\d+$/.test(example.value)) {
                  example.value = Number(example.value);
                }
              }
            }
          }
          if (op.parameters.length === 0) {
            delete op.parameters;
          }
        }

        const fields = formSchemas[op.summary];
        const mediaType = op.requestBody?.content?.['application/x-www-form-urlencoded'];
        if (fields && mediaType) {
          mediaType.schema = {
            type: 'object',
            properties: Object.fromEntries(
              Object.entries(fields).map(([name, type]) => [name, { type }]),
            ),
            required: Object.keys(fields).filter((name) => !['remark', 'expired_date'].includes(name)),
          };
        }

        op.responses ??= { '200': { description: 'Successful response' } };
      }
    }
  }

  doc.paths = cleanedPaths;
  await fs.writeFile(target, yaml.dump(doc), 'utf8');

  const pathNames = Object.keys(cleanedPaths);
  const checks = [
    `path-placeholders: ${pathNames.filter((item) => item.includes('[INSERT-ORDER-ID]')).length}`,
    `path-item-template-brace: ${pathNames.filter((item) => /\{[^}]+\}/.test(item)).length}`,
  ];

  console.log(`${target}\n  ${checks.join('\n  ')}\n`);
}
