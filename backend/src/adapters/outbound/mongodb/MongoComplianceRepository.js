import { ShipComplianceModel } from './models/ShipComplianceModel.js';
import { ComplianceRepositoryPort } from '../../../core/ports/ComplianceRepositoryPort.js';

/**
 * MongoDB adapter implementing ComplianceRepositoryPort
 */
export class MongoComplianceRepository extends ComplianceRepositoryPort {
  async findByShipAndYear(shipId, year) {
    return ShipComplianceModel.findOne({ shipId, year: parseInt(year) }).lean();
  }

  async save(record) {
    return ShipComplianceModel.findOneAndUpdate(
      { shipId: record.shipId, year: record.year },
      record,
      { upsert: true, new: true }
    ).lean();
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.year) query.year = parseInt(filters.year);
    if (filters.shipId) query.shipId = filters.shipId;
    return ShipComplianceModel.find(query).lean();
  }
}
