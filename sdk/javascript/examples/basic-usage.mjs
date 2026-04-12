import { SaohuaClient } from '../dist/index.js';

const client = new SaohuaClient({
  baseUrl: process.env.SAOHUA_API_URL || 'http://localhost:3000',
  apiKey: process.env.SAOHUA_API_KEY,
  bearerToken: process.env.SAOHUA_BEARER_TOKEN,
  timeout: 8000,
  headers: {
    'X-Request-From': 'sdk/javascript-example',
  },
});

async function main() {
  const health = await client.health();
  console.log('health:', health);

  const random = await client.randomSaohua('zh-CN', 'love');
  console.log('random:', random.fullMessage);

  const registry = await client.searchPluginRegistry('romantic');
  console.log('registry total:', registry.total);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
