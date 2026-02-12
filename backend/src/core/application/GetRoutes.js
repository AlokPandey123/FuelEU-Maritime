/**
 * GetRoutes Use Case
 * Fetches all routes with optional filtering and pagination.
 */
export class GetRoutes {
  constructor(routeRepository) {
    this.routeRepository = routeRepository;
  }

  async execute(filters = {}) {
    return this.routeRepository.findAll(filters);
  }

  async executePaginated(filters = {}, page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.routeRepository.findPaginated(filters, page, limit),
      this.routeRepository.countAll(filters),
    ]);
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
