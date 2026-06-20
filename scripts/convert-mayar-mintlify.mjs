import fs from 'node:fs/promises';
import yaml from 'js-yaml';

const DOCS_HOST = 'https://docs.mayar.id';
const LLMs_URL = `${DOCS_HOST}/llms.txt`;
const OPENAPI_OUT = 'openapi/mayar/mayar.openapi.yaml';
const POSTMAN_OUT = 'postman/mayar/mayar.postman_collection.json';
const TAG_LABEL = 'Mayar';

const pageEntries = (await (await fetch(LLMs_URL)).text())
  .matchAll(/https:\/\/docs\.mayar\.id\/api-reference\/[a-zA-Z0-9_\/-]+\.md/g);
const pageUrls = [...new Set(Array.from(pageEntries, (match) => match[0]))];

function normalizeEndpoint(raw) {
  if (!raw) {
    return null;
  }

  const withoutWrap = raw
    .replace(/^['"`]/, '')
    .replace(/['"`]$/, '')
    .replace(/\\\\/g, '')
    .replace(/^https:api\.mayar\.id\/\//i, 'https://api.mayar.id/')
    .replace(/^https:api\.mayar\.club\/\//i, 'https://api.mayar.club/')
    .replace(/^api\.mayar\.id\//i, 'https://api.mayar.id/')
    .replace(/^api\.mayar\.club\//i, 'https://api.mayar.club/')
    .replace(/^https:\/(?!\/)/i, 'https://')
    .replace(/^https:\/\/+/, 'https://')
    .trim();

  return withoutWrap;
}

function parseJsonSafe(rawBody) {
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    // Best effort: remove simple JS comments
    const sanitized = rawBody
      .replace(/\/\/[^\n\r]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
    try {
      return JSON.parse(sanitized);
    } catch {
      return null;
    }
  }
}

function extractRequestBlock(pageText) {
  return pageText.match(/<RequestExample>[\s\S]*?```(?:bash[^\n]*)?\n([\s\S]*?)```/)?.[1] ?? '';
}

function extractUrlFromRequestText(requestText) {
  const directMatch = requestText.match(/(?:https?:\/\/|https:|)(?:api\.mayar\.(?:id|club))[^\s'"`)\]]*/i);
  if (directMatch?.[0]) {
    return directMatch[0];
  }
  const endpointMatch = requestText.match(/```Production Production theme=\{[^}]*\}\n([^\n`]+)\n/);
  if (endpointMatch?.[1]) {
    const parsed = endpointMatch[1].match(/(?:https?:\/\/|https:|)(?:api\.mayar\.(?:id|club))[^\s'"`)\]]*/i);
    if (parsed?.[0]) {
      return parsed[0];
    }
  }
  return null;
}

function extractMethodFromRequestText(requestText) {
  const explicit = requestText.match(/curl\s+(?:--location\s+)?--request\s+([A-Za-z]+)/i)?.[1];
  if (explicit) {
    return explicit.toUpperCase();
  }
  if (requestText.includes('--data') || requestText.includes('--data-raw')) {
    return 'POST';
  }
  return 'GET';
}

function extractBodyFromRequestText(requestText) {
  const bodyMatch = requestText.match(
    /--data-raw\s+'([\s\S]*?)'|--data-raw\s+\"([\s\S]*?)\"|--data\s+'([\s\S]*?)'|--data\s+\"([\s\S]*?)\"/i,
  );
  if (!bodyMatch) {
    return null;
  }
  return bodyMatch[1] || bodyMatch[2] || bodyMatch[3] || bodyMatch[4];
}

function inferParametersFromPath(path) {
  const out = [];
  const pathParamNames = [...path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
  for (const name of pathParamNames) {
    out.push({
      name,
      in: 'path',
      required: true,
      schema: { type: 'string' },
      description: `Path parameter from docs placeholder: ${name}`,
    });
  }
  return out;
}

function inferParametersFromUrl(urlObj) {
  const out = [];
  for (const [name, value] of urlObj.searchParams.entries()) {
    out.push({
      name,
      in: 'query',
      required: value.startsWith('{') && value.endsWith('}'),
      schema: { type: 'string' },
      description: value ? `Sample placeholder/value from docs: ${value}` : 'Query parameter',
    });
  }
  return out;
}

function toOpenApiOperationId(slug, method) {
  const clean = slug.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
  return `${method.toLowerCase()}_${clean}`.toLowerCase();
}

function toPostmanRawPath(path) {
  return path.split('/').filter(Boolean);
}

const operations = [];

  for (const pageUrl of pageUrls) {
  const pageText = await (await fetch(pageUrl)).text();
  const title = pageText.match(/^#\s*(.+)$/m)?.[1]?.trim() ?? pageUrl;
  const description = pageText.match(/^>\s*(.+)$/m)?.[1]?.trim() ?? '';
  const requestText = extractRequestBlock(pageText);

  if (!requestText) {
    continue;
  }

  const method = extractMethodFromRequestText(requestText);
  const rawUrl = extractUrlFromRequestText(requestText);
  if (!rawUrl) {
    continue;
  }

  const endpoint = normalizeEndpoint(rawUrl);
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    continue;
  }

  const rawBody = extractBodyFromRequestText(requestText);
  const cleanedBody = rawBody ? rawBody.replace(/\r/g, '').replace(/\\\n/g, '').trim() : null;
  const requestBody = parseJsonSafe(cleanedBody);

  const responseText = pageText.match(/<ResponseExample>[\s\S]*?```json[\s\S]*?\n([\s\S]*?)```/)?.[1] ?? null;
  const responseBody = parseJsonSafe(responseText);

  const slug = pageUrl.replace(`${DOCS_HOST}/api-reference/`, '').replace(/\.md$/, '');
  operations.push({
    slug,
    title,
    description,
    method,
    url: url.toString(),
    path: url.pathname,
    query: inferParametersFromUrl(url),
    pathParams: inferParametersFromPath(url.pathname),
    requestBody,
    requestBodyRaw: cleanedBody,
    responseBody,
  });
}

const uniqueByKey = new Map();
for (const op of operations) {
  const key = `${op.method} ${op.path}`;
  if (!uniqueByKey.has(key)) {
    uniqueByKey.set(key, op);
  }
}
const deduped = [...uniqueByKey.values()];

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Mayar API',
    version: '1.0.0',
    description:
      'Generated from Mayar documentation pages in llms.txt and markdown endpoint examples. This is best-effort extraction from docs.',
  },
  servers: [{ url: 'https://api.mayar.id' }],
  tags: [{ name: TAG_LABEL }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {},
};

for (const op of deduped) {
  const safePath = op.path;
  const method = op.method.toLowerCase();
  openapi.paths[safePath] ??= {};

  const methodAlreadyExists = Object.prototype.hasOwnProperty.call(openapi.paths[safePath], method);
  if (methodAlreadyExists) {
    continue;
  }

  const operation = {
    operationId: toOpenApiOperationId(op.slug, op.method),
    summary: op.title,
    description: op.description,
    tags: [TAG_LABEL],
    parameters: [...op.pathParams, ...op.query],
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: true,
            },
            example: op.responseBody,
          },
        },
      },
    },
  };

  if (['post', 'put', 'patch'].includes(method)) {
    operation.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: op.requestBody
            ? {
                type: typeof op.requestBody === 'string' ? 'string' : 'object',
                additionalProperties: true,
              }
            : {
                type: 'string',
              },
          example: op.requestBody ?? op.requestBodyRaw ?? null,
        },
      },
    };
  }

  openapi.paths[safePath][method] = operation;
}

await fs.mkdir('openapi/mayar', { recursive: true });
await fs.writeFile(OPENAPI_OUT, yaml.dump(openapi), 'utf8');

const collection = {
  info: {
    name: 'Mayar API',
    description:
      'Generated from Mayar docs pages in llms.txt (best-effort extraction from Markdown docs).',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    version: '1.0.0',
  },
  variable: [{ key: 'baseUrl', value: 'https://api.mayar.id' }],
  item: [],
};

for (const op of deduped) {
  const rawPath = op.path.startsWith('/') ? op.path : `/${op.path}`;
  const rawUrl = `{{baseUrl}}${rawPath}`;

  collection.item.push({
    name: op.title,
    request: {
      method: op.method,
      header: [
        {
          key: 'Authorization',
          value: 'Bearer <YOUR_API_KEY>',
          type: 'text',
        },
      ],
      url: {
        raw: rawUrl,
        host: ['{{baseUrl}}'],
        path: toPostmanRawPath(op.path),
      },
      description: `${op.description}\n\nSource: ${op.slug}`,
      ...(op.requestBody
        ? {
            body: { mode: 'raw', raw: JSON.stringify(op.requestBody, null, 2) },
          }
        : op.requestBodyRaw
          ? {
              body: { mode: 'raw', raw: op.requestBodyRaw },
            }
          : {}),
      ...(op.query.length
        ? {
            query: op.query.map((item) => ({
              key: item.name,
              value: item.schema ? item.name : '',
              description: item.description,
            })),
          }
        : {}),
    },
    response: op.responseBody
      ? [
          {
            name: 'OK',
            status: 'OK',
            code: 200,
            _postman_previewlanguage: 'json',
            body: JSON.stringify(op.responseBody, null, 2),
          },
        ]
      : [],
  });
}

await fs.mkdir('postman/mayar', { recursive: true });
await fs.writeFile(POSTMAN_OUT, JSON.stringify(collection, null, 2), 'utf8');

console.log(`mintlify pages: ${pageUrls.length}`);
console.log(`extracted operations: ${operations.length}`);
console.log(`deduped operations: ${deduped.length}`);
