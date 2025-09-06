import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { banksController } from '../../contexts/banks/presentation/BanksController.js';
import { createLogger } from '../../shared/infrastructure/logging/LoggerFactory.js';

const logger = createLogger().withContext({ service: 'BankServiceAPI' });
const app = new Hono();

// Health check endpoints (as per API documentation)
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health/jwt', (c) => {
  return c.json({
    jwt: {
      status: 'healthy',
      secretProvider: 'AWSSecretsProvider'
    },
    service: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Register banks routes
app.route('/', banksController);

const port = parseInt(process.env.PORT || '3000', 10);

logger.info('Bank Service API starting', { 
  port,
  environment: process.env.NODE_ENV || 'development',
  endpoints: [
    `http://localhost:${port}/health`,
    `http://localhost:${port}/health/jwt`,
    `http://localhost:${port}/api/banks`
  ]
});

serve({
  fetch: app.fetch,
  port
});

export default app;