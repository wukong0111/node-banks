import { Hono } from 'hono';
import { GetBanksUseCase } from '../application/GetBanksUseCase.js';
import { HardcodedBankRepository } from '../infrastructure/HardcodedBankRepository.js';
import type { GetBanksRequest } from '../application/dto/GetBanksRequest.js';

const banksController = new Hono();

// Initialize dependencies
const bankRepository = new HardcodedBankRepository();
const getBanksUseCase = new GetBanksUseCase(bankRepository);

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

export { banksController };