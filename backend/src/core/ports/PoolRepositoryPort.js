/**
 * Pool Repository Port (Outbound)
 * Defines the contract for pool persistence.
 */
/**
 * Port interface for pool data access.
 * Adapters must extend this class and implement all methods.
 */
export class PoolRepositoryPort {
  async save(pool) { throw new Error('Not implemented'); }
  async findByYear(year) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
}
