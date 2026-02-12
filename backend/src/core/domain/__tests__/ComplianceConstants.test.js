import {
  COMPLIANCE_CONSTANTS,
  getTargetIntensity,
  computeComplianceBalance,
  computePercentDiff,
  isCompliant,
} from '../ComplianceConstants.js';

describe('ComplianceConstants', () => {
  test('REFERENCE_INTENSITY is 91.16', () => {
    expect(COMPLIANCE_CONSTANTS.REFERENCE_INTENSITY).toBe(91.16);
  });

  test('TARGET_INTENSITY_2025 is 89.3368 (2% below reference)', () => {
    expect(COMPLIANCE_CONSTANTS.TARGET_INTENSITY_2025).toBe(89.3368);
    // Verify 2% reduction
    const expected = 91.16 * (1 - 0.02);
    expect(COMPLIANCE_CONSTANTS.TARGET_INTENSITY_2025).toBeCloseTo(expected, 4);
  });

  test('MJ_PER_TONNE is 41000', () => {
    expect(COMPLIANCE_CONSTANTS.MJ_PER_TONNE).toBe(41000);
  });
});

describe('getTargetIntensity', () => {
  test('returns target intensity for any year', () => {
    expect(getTargetIntensity(2025)).toBe(89.3368);
    expect(getTargetIntensity(2024)).toBe(89.3368);
  });
});

describe('computeComplianceBalance', () => {
  test('positive CB when GHG below target (surplus)', () => {
    // GHG 85.0 < target 89.3368 → positive
    const cb = computeComplianceBalance(85.0, 1000, 2025);
    expect(cb).toBeGreaterThan(0);
    // CB = (89.3368 - 85.0) × 1000 × 41000 = 4.3368 × 41000000 = 177808800
    const expected = (89.3368 - 85.0) * 1000 * 41000;
    expect(cb).toBeCloseTo(expected, 2);
  });

  test('negative CB when GHG above target (deficit)', () => {
    // GHG 93.0 > target 89.3368 → negative
    const cb = computeComplianceBalance(93.0, 1000, 2025);
    expect(cb).toBeLessThan(0);
  });

  test('zero CB when GHG exactly equals target', () => {
    const cb = computeComplianceBalance(89.3368, 1000, 2025);
    expect(cb).toBeCloseTo(0, 4);
  });

  test('scales linearly with fuel consumption', () => {
    const cb1 = computeComplianceBalance(85.0, 1000, 2025);
    const cb2 = computeComplianceBalance(85.0, 2000, 2025);
    expect(cb2).toBeCloseTo(cb1 * 2, 2);
  });
});

describe('computePercentDiff', () => {
  test('positive when comparison is higher than baseline', () => {
    // 95 vs 90 → ((95/90) - 1) × 100 = 5.56%
    const diff = computePercentDiff(95, 90);
    expect(diff).toBeGreaterThan(0);
    expect(diff).toBeCloseTo(5.5556, 2);
  });

  test('negative when comparison is lower than baseline', () => {
    // 85 vs 90 → ((85/90) - 1) × 100 = -5.56%
    const diff = computePercentDiff(85, 90);
    expect(diff).toBeLessThan(0);
  });

  test('zero when comparison equals baseline', () => {
    const diff = computePercentDiff(90, 90);
    expect(diff).toBe(0);
  });

  test('returns 0 when baseline is 0', () => {
    const diff = computePercentDiff(90, 0);
    expect(diff).toBe(0);
  });
});

describe('isCompliant', () => {
  test('true when GHG at or below target', () => {
    expect(isCompliant(89.3368, 2025)).toBe(true);
    expect(isCompliant(85.0, 2025)).toBe(true);
  });

  test('false when GHG above target', () => {
    expect(isCompliant(90.0, 2025)).toBe(false);
    expect(isCompliant(91.16, 2025)).toBe(false);
  });
});
