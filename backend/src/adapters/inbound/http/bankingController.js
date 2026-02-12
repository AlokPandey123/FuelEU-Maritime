import express from 'express';
import { BankSurplus } from '../../../core/application/BankSurplus.js';
import { ApplyBanked } from '../../../core/application/ApplyBanked.js';
import { MongoComplianceRepository } from '../../outbound/mongodb/MongoComplianceRepository.js';
import { MongoBankingRepository } from '../../outbound/mongodb/MongoBankingRepository.js';

const router = express.Router();
const complianceRepo = new MongoComplianceRepository();
const bankingRepo = new MongoBankingRepository();

/**
 * GET /banking/records
 * Fetch banking records with optional filters
 */
router.get('/records', async (req, res) => {
  try {
    const { shipId, year } = req.query;
    const filters = {};
    if (shipId) filters.shipId = shipId;
    if (year) filters.year = year;
    const records = await bankingRepo.findAll(filters);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /banking/available
 * Get total available banked surplus (global pool)
 */
router.get('/available', async (req, res) => {
  try {
    const totalBanked = await bankingRepo.getTotalBanked();
    const totalApplied = await bankingRepo.getTotalApplied();
    const available = totalBanked - totalApplied;
    res.json({ totalBanked, totalApplied, available });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /banking/bank
 * Bank positive compliance balance
 * Body: { shipId, year }
 */
router.post('/bank', async (req, res) => {
  try {
    const { shipId, year } = req.body;
    if (!shipId || !year) {
      return res.status(400).json({ error: 'shipId and year are required' });
    }
    const useCase = new BankSurplus(complianceRepo, bankingRepo);
    const result = await useCase.execute(shipId, year);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /banking/apply
 * Apply banked surplus to cover a deficit
 * Body: { shipId, year, amount }
 */
router.post('/apply', async (req, res) => {
  try {
    const { shipId, year, amount } = req.body;
    if (!shipId || !year || amount === undefined) {
      return res.status(400).json({ error: 'shipId, year, and amount are required' });
    }
    const useCase = new ApplyBanked(complianceRepo, bankingRepo);
    const result = await useCase.execute(shipId, year, amount);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
