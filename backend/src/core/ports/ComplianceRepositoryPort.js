/**
 * Compliance Repository Port (Outbound)
 * Defines the contract for compliance data persistence.
 */
/**
 * Port interface for compliance data access.
 * Adapters must extend this class and implement all methods.
 */
export class ComplianceRepositoryPort {
  async findByShipAndYear(shipId, year) { throw new Error('Not implemented'); }
  async save(complianceRecord) { throw new Error('Not implemented'); }
  async findAll(filters = {}) { throw new Error('Not implemented'); }
}
