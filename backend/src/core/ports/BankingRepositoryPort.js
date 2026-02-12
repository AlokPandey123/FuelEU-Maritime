/**
 * Banking Repository Port (Outbound)
 * Defines the contract for bank entry persistence.
 */
/**
 * Port interface for banking data access.
 * Adapters must extend this class and implement all methods.
 */
export class BankingRepositoryPort {
  async findAll(filters = {}) { throw new Error('Not implemented'); }
  async findByShipAndYear(shipId, year) { throw new Error('Not implemented'); }
  async findByShip(shipId) { throw new Error('Not implemented'); }
  async save(bankEntry) { throw new Error('Not implemented'); }
  async getTotalBanked(shipId = null) { throw new Error('Not implemented'); }
  async getTotalApplied(shipId = null) { throw new Error('Not implemented'); }
}
