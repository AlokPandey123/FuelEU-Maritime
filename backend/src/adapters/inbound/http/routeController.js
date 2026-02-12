import express from 'express';
import { GetRoutes } from '../../../core/application/GetRoutes.js';
import { SetBaseline } from '../../../core/application/SetBaseline.js';
import { ComputeComparison } from '../../../core/application/ComputeComparison.js';
import { MongoRouteRepository } from '../../outbound/mongodb/MongoRouteRepository.js';

const router = express.Router();
const routeRepo = new MongoRouteRepository();

/**
 * GET /routes
 * Returns all routes with optional filters: vesselType, fuelType, year
 */
router.get('/', async (req, res) => {
  try {
    const useCase = new GetRoutes(routeRepo);
    const filters = {};
    if (req.query.vesselType) filters.vesselType = req.query.vesselType;
    if (req.query.fuelType) filters.fuelType = req.query.fuelType;
    if (req.query.year) filters.year = req.query.year;

    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 0;

    if (page > 0 && limit > 0) {
      const result = await useCase.executePaginated(filters, page, limit);
      return res.json(result);
    }

    const routes = await useCase.execute(filters);
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /routes/:routeId/baseline
 * Sets the specified route as baseline
 */
router.post('/:routeId/baseline', async (req, res) => {
  try {
    const useCase = new SetBaseline(routeRepo);
    const result = await useCase.execute(req.params.routeId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /routes/comparison
 * Returns baseline vs comparison routes
 */
router.get('/comparison', async (req, res) => {
  try {
    const useCase = new ComputeComparison(routeRepo);
    const result = await useCase.execute();
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
