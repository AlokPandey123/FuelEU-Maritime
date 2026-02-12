import express from 'express';
import { ComputeCB } from '../../../core/application/ComputeCB.js';
import { GetAdjustedCB } from '../../../core/application/GetAdjustedCB.js';
import { MongoRouteRepository } from '../../outbound/mongodb/MongoRouteRepository.js';
import { MongoComplianceRepository } from '../../outbound/mongodb/MongoComplianceRepository.js';
import { MongoBankingRepository } from '../../outbound/mongodb/MongoBankingRepository.js';

const router = express.Router();
const routeRepo = new MongoRouteRepository();
const complianceRepo = new MongoComplianceRepository();
const bankingRepo = new MongoBankingRepository();

/**
 * GET /compliance/cb
 * Compute and return compliance balance
 * Query: shipId (optional), year (required)
 */
router.get('/cb', async (req, res) => {
  try {
    const { shipId, year } = req.query;
    if (!year) {
      return res.status(400).json({ error: 'year query parameter is required' });
    }
    const useCase = new ComputeCB(routeRepo, complianceRepo);
    const result = await useCase.execute(shipId, year);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /compliance/adjusted-cb
 * Return CB after bank applications
 * Query: shipId (optional), year (required)
 */
router.get('/adjusted-cb', async (req, res) => {
  try {
    const { shipId, year } = req.query;
    if (!year) {
      return res.status(400).json({ error: 'year query parameter is required' });
    }
    const useCase = new GetAdjustedCB(complianceRepo, bankingRepo);
    const result = await useCase.execute(shipId, year);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
