import { computePercentDiff, isCompliant, getTargetIntensity } from '../domain/ComplianceConstants.js';

/**
 * ComputeComparison Use Case
 * Compares baseline route against all other routes.
 */
export class ComputeComparison {
  constructor(routeRepository) {
    this.routeRepository = routeRepository;
  }

  async execute() {
    const baseline = await this.routeRepository.findBaseline();
    if (!baseline) {
      throw new Error('No baseline route set. Please set a baseline first.');
    }

    const allRoutes = await this.routeRepository.findAll();
    const comparisons = allRoutes
      .filter(r => r.routeId !== baseline.routeId)
      .map(route => {
        const percentDiff = computePercentDiff(route.ghgIntensity, baseline.ghgIntensity);
        const target = getTargetIntensity(route.year);
        return {
          routeId: route.routeId,
          vesselType: route.vesselType,
          fuelType: route.fuelType,
          year: route.year,
          ghgIntensity: route.ghgIntensity,
          percentDiff: Math.round(percentDiff * 100) / 100,
          compliant: isCompliant(route.ghgIntensity, route.year),
          target,
        };
      });

    return {
      baseline: {
        routeId: baseline.routeId,
        vesselType: baseline.vesselType,
        fuelType: baseline.fuelType,
        year: baseline.year,
        ghgIntensity: baseline.ghgIntensity,
        target: getTargetIntensity(baseline.year),
        compliant: isCompliant(baseline.ghgIntensity, baseline.year),
      },
      comparisons,
    };
  }
}
