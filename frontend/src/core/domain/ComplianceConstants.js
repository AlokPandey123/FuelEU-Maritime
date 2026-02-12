/**
 * Frontend Domain - Compliance Constants
 * Mirrors backend constants for client-side validation/display.
 */
export const COMPLIANCE_CONSTANTS = {
  REFERENCE_INTENSITY: 91.16,
  TARGET_INTENSITY_2025: 89.3368,
  MJ_PER_TONNE: 41000,
};

export function getTargetIntensity(year) {
  return COMPLIANCE_CONSTANTS.TARGET_INTENSITY_2025;
}

export function computePercentDiff(comparison, baseline) {
  if (baseline === 0) return 0;
  return ((comparison / baseline) - 1) * 100;
}

export function isCompliant(ghgIntensity, year) {
  return ghgIntensity <= getTargetIntensity(year);
}
