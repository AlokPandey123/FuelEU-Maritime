import { BankEntryModel } from './models/BankEntryModel.js';
import { BankingRepositoryPort } from '../../../core/ports/BankingRepositoryPort.js';

/**
 * MongoDB adapter implementing BankingRepositoryPort
 */
export class MongoBankingRepository extends BankingRepositoryPort {
  async findAll(filters = {}) {
    const query = {};
    if (filters.shipId) query.shipId = filters.shipId;
    if (filters.year) query.year = parseInt(filters.year);
    return BankEntryModel.find(query).sort({ createdAt: -1 }).lean();
  }

  async findByShipAndYear(shipId, year) {
    return BankEntryModel.find({ shipId, year: parseInt(year) }).lean();
  }

  async findByShip(shipId) {
    return BankEntryModel.find({ shipId }).lean();
  }

  async save(entry) {
    return BankEntryModel.create(entry);
  }

  async getTotalBanked(shipId = null) {
    const match = { amountGco2eq: { $gt: 0 } };
    if (shipId) match.shipId = shipId;
    const result = await BankEntryModel.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amountGco2eq' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async getTotalApplied(shipId = null) {
    const match = { amountGco2eq: { $lt: 0 } };
    if (shipId) match.shipId = shipId;
    const result = await BankEntryModel.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amountGco2eq' } } },
    ]);
    return result.length > 0 ? Math.abs(result[0].total) : 0;
  }
}
