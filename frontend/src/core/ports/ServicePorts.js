/**
 * Route Service Port (Outbound)
 * Defines the contract for route data access from the frontend.
 */
export class RouteServicePort {
  async getRoutes(filters) { throw new Error('Not implemented'); }
  async setBaseline(routeId) { throw new Error('Not implemented'); }
  async getComparison() { throw new Error('Not implemented'); }
}

export class ComplianceServicePort {
  async getCB(year, shipId) { throw new Error('Not implemented'); }
  async getAdjustedCB(year, shipId) { throw new Error('Not implemented'); }
}

export class BankingServicePort {
  async getRecords(shipId, year) { throw new Error('Not implemented'); }
  async bankSurplus(shipId, year) { throw new Error('Not implemented'); }
  async applyBanked(shipId, year, amount) { throw new Error('Not implemented'); }
}

export class PoolServicePort {
  async createPool(year, members) { throw new Error('Not implemented'); }
  async getPools(year) { throw new Error('Not implemented'); }
}
