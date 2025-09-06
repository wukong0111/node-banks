import { Hono } from 'hono';
import { GetBanksUseCase } from '../application/GetBanksUseCase.js';
import { GetBankDetailsUseCase } from '../application/GetBankDetailsUseCase.js';
import { HardcodedBankRepository } from '../infrastructure/HardcodedBankRepository.js';
import type { GetBanksRequest } from '../application/dto/GetBanksRequest.js';
import type { GetBankDetailsRequest } from '../application/dto/GetBankDetailsRequest.js';
import type { Environment } from '../domain/Bank.js';

const banksController = new Hono();

// Initialize dependencies
const bankRepository = new HardcodedBankRepository();
const getBanksUseCase = new GetBanksUseCase(bankRepository);
const getBankDetailsUseCase = new GetBankDetailsUseCase(bankRepository);

banksController.get('/api/banks', async (c) => {
  // Extract query parameters
  const request: GetBanksRequest = {
    env: c.req.query('env'),
    name: c.req.query('name'),
    api: c.req.query('api'),
    country: c.req.query('country'),
    page: c.req.query('page'),
    limit: c.req.query('limit')
  };

  // Execute use case
  const result = await getBanksUseCase.execute(request);

  // Map result to HTTP response
  if (!result.success) {
    return c.json(result, 400);
  }

  return c.json(result.data, 200);
});

banksController.get('/api/banks/:bankId/details', async (c) => {
  // Extract path and query parameters
  const bankId = c.req.param('bankId');
  const env = c.req.query('env') as Environment | undefined;

  const request: GetBankDetailsRequest = {
    bankId,
    env
  };

  // Execute use case
  const result = await getBankDetailsUseCase.execute(request);

  // Map result to HTTP response
  if (!result.success) {
    const statusCode = result.error.includes('not found') ? 404 : 400;
    return c.json({
      success: false,
      error: result.error,
      timestamp: new Date().toISOString()
    }, statusCode);
  }

  return c.json(result.data, 200);
});

export { banksController };