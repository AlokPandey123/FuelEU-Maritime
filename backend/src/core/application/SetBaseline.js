/**
 * SetBaseline Use Case
 * Sets a route as the baseline for comparison.
 */
export class SetBaseline {
  constructor(routeRepository) {
    this.routeRepository = routeRepository;
  }

  async execute(routeId) {
    const route = await this.routeRepository.findByRouteId(routeId);
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }
    // Clear all existing baselines then set the new one
    await this.routeRepository.clearAllBaselines();
    await this.routeRepository.setBaseline(routeId);
    return { routeId, isBaseline: true };
  }
}
