import express from 'express';
import { CreatePool } from '../../../core/application/CreatePool.js';
import { MongoComplianceRepository } from '../../outbound/mongodb/MongoComplianceRepository.js';
import { MongoPoolRepository } from '../../outbound/mongodb/MongoPoolRepository.js';

const router = express.Router();
const complianceRepo = new MongoComplianceRepository();
const poolRepo = new MongoPoolRepository();

/**
 * POST /pools
 * Create a new pool with members
 * Body: { year, members: [shipId1, shipId2, ...] }
 */
router.post('/', async (req, res) => {
  try {
    const { year, members } = req.body;
    if (!year || !members || !Array.isArray(members)) {
      return res.status(400).json({ error: 'year and members array are required' });
    }
    const useCase = new CreatePool(complianceRepo, poolRepo);
    const result = await useCase.execute(year, members);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /pools
 * Fetch all pools or filter by year
 */
router.get('/', async (req, res) => {
  try {
    const { year } = req.query;
    let pools;
    if (year) {
      pools = await poolRepo.findByYear(year);
    } else {
      pools = await poolRepo.findAll();
    }
    res.json(pools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
