/**
 * Route Repository Port (Outbound)
 * Defines the contract for route data persistence.
 */
/**
 * Port interface for route data access.
 * Adapters must extend this class and implement all methods.
 */
export class RouteRepositoryPort {
  async findAll(filters = {}) { throw new Error('Not implemented'); }
  async findPaginated(filters = {}, page = 1, limit = 10) { throw new Error('Not implemented'); }
  async countAll(filters = {}) { throw new Error('Not implemented'); }
  async findByRouteId(routeId) { throw new Error('Not implemented'); }
  async findBaseline() { throw new Error('Not implemented'); }
  async setBaseline(routeId) { throw new Error('Not implemented'); }
  async clearAllBaselines() { throw new Error('Not implemented'); }
}
