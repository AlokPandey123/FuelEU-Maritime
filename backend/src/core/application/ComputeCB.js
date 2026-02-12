import { computeComplianceBalance } from '../domain/ComplianceConstants.js';

/**
 * ComputeCB Use Case
 * Computes the compliance balance for a ship in a given year.
 */
export class ComputeCB {
  constructor(routeRepository, complianceRepository) {
    this.routeRepository = routeRepository;
    this.complianceRepository = complianceRepository;
  }

  async execute(shipId, year) {
    // Find routes for this ship (using routeId as shipId proxy)
    const routes = await this.routeRepository.findAll({ year: parseInt(year) });

    if (routes.length === 0) {
      throw new Error(`No routes found for year ${year}`);
    }

    // Compute CB for each route (treating routeId as shipId)
    const results = routes.map(route => {
      const cb = computeComplianceBalance(route.ghgIntensity, route.fuelConsumption, route.year);
      return {
        shipId: route.routeId,
        year: route.year,
        ghgIntensity: route.ghgIntensity,
        fuelConsumption: route.fuelConsumption,
        cbGco2eq: Math.round(cb * 100) / 100,
        isSurplus: cb > 0,
      };
    });

    // If specific shipId requested, filter
    if (shipId) {
      const result = results.find(r => r.shipId === shipId);
      if (!result) throw new Error(`Ship ${shipId} not found for year ${year}`);

      // Save compliance record
      await this.complianceRepository.save(result);
      return result;
    }

    // Save all and return
    for (const r of results) {
      await this.complianceRepository.save(r);
    }
    return results;
  }
}
