/**
 * Compliance constants based on FuelEU Maritime Regulation (EU) 2023/1805
 */
export const COMPLIANCE_CONSTANTS = {
  /** Reference GHG intensity - gCO₂e/MJ */
  REFERENCE_INTENSITY: 91.16,

  /** Target intensity 2025 = 2% below reference → 89.3368 gCO₂e/MJ */
  TARGET_INTENSITY_2025: 89.3368,

  /** Energy conversion factor: MJ per tonne of fuel */
  MJ_PER_TONNE: 41000,
};

/**
 * Get target intensity for a given year.
 * 2025: 2% reduction → 89.3368
 * Future years can have different reduction factors.
 */
export function getTargetIntensity(year) {
  // For this implementation, all years use the 2025 target
  return COMPLIANCE_CONSTANTS.TARGET_INTENSITY_2025;
}

/**
 * Compute Compliance Balance
 * CB = (Target − Actual) × Energy in scope
 * Positive → Surplus, Negative → Deficit
 */
export function computeComplianceBalance(ghgIntensity, fuelConsumption, year) {
  const target = getTargetIntensity(year);
  const energyInScope = fuelConsumption * COMPLIANCE_CONSTANTS.MJ_PER_TONNE;
  return (target - ghgIntensity) * energyInScope;
}

/**
 * Compute percentage difference between comparison and baseline
 * percentDiff = ((comparison / baseline) − 1) × 100
 */
export function computePercentDiff(comparisonIntensity, baselineIntensity) {
  if (baselineIntensity === 0) return 0;
  return ((comparisonIntensity / baselineIntensity) - 1) * 100;
}

/**
 * Check if a route is compliant (ghgIntensity ≤ target)
 */
export function isCompliant(ghgIntensity, year) {
  return ghgIntensity <= getTargetIntensity(year);
}
