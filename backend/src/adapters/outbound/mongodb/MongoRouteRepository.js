import { RouteModel } from './models/RouteModel.js';
import { RouteRepositoryPort } from '../../../core/ports/RouteRepositoryPort.js';

/**
 * MongoDB adapter implementing RouteRepositoryPort
 */
export class MongoRouteRepository extends RouteRepositoryPort {
  _buildQuery(filters) {
    const query = {};
    if (filters.vesselType) query.vesselType = filters.vesselType;
    if (filters.fuelType) query.fuelType = filters.fuelType;
    if (filters.year) query.year = parseInt(filters.year);
    return query;
  }

  async findAll(filters = {}) {
    return RouteModel.find(this._buildQuery(filters)).lean();
  }

  async findPaginated(filters = {}, page = 1, limit = 10) {
    const query = this._buildQuery(filters);
    const skip = (page - 1) * limit;
    return RouteModel.find(query).skip(skip).limit(limit).lean();
  }

  async countAll(filters = {}) {
    return RouteModel.countDocuments(this._buildQuery(filters));
  }

  async findByRouteId(routeId) {
    return RouteModel.findOne({ routeId }).lean();
  }

  async findBaseline() {
    return RouteModel.findOne({ isBaseline: true }).lean();
  }

  async setBaseline(routeId) {
    return RouteModel.findOneAndUpdate(
      { routeId },
      { isBaseline: true },
      { new: true }
    ).lean();
  }

  async clearAllBaselines() {
    return RouteModel.updateMany({}, { isBaseline: false });
  }
}
