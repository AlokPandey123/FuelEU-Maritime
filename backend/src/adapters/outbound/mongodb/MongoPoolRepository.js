import { PoolModel } from './models/PoolModel.js';
import { PoolRepositoryPort } from '../../../core/ports/PoolRepositoryPort.js';

/**
 * MongoDB adapter implementing PoolRepositoryPort
 */
export class MongoPoolRepository extends PoolRepositoryPort {
  async save(pool) {
    return PoolModel.create(pool);
  }

  async findByYear(year) {
    return PoolModel.find({ year: parseInt(year) }).lean();
  }

  async findAll() {
    return PoolModel.find().lean();
  }
}
