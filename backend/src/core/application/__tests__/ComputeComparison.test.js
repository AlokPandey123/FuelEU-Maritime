import { jest } from '@jest/globals';
import { ComputeComparison } from '../ComputeComparison.js';

const mockRouteRepo = {
  findBaseline: jest.fn(),
  findAll: jest.fn(),
};

describe('ComputeComparison', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ComputeComparison(mockRouteRepo);
  });

  const baseline = {
    routeId: 'R001', vesselType: 'Container', fuelType: 'HFO',
    year: 2024, ghgIntensity: 91.0,
  };

  test('compares all routes against baseline', async () => {
    mockRouteRepo.findBaseline.mockResolvedValue(baseline);
    mockRouteRepo.findAll.mockResolvedValue([
      baseline,
      { routeId: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0 },
      { routeId: 'R003', vesselType: 'Tanker', fuelType: 'MGO', year: 2024, ghgIntensity: 93.5 },
    ]);

    const result = await useCase.execute();

    expect(result.baseline.routeId).toBe('R001');
    expect(result.comparisons).toHaveLength(2);

    // R002 — 88.0 vs 91.0: percentDiff = ((88/91)-1)*100 ≈ -3.30
    const r002 = result.comparisons.find(c => c.routeId === 'R002');
    expect(r002.percentDiff).toBeLessThan(0);
    expect(r002.compliant).toBe(true); // 88.0 <= 89.3368

    // R003 — 93.5 vs 91.0: percentDiff = ((93.5/91)-1)*100 ≈ +2.75
    const r003 = result.comparisons.find(c => c.routeId === 'R003');
    expect(r003.percentDiff).toBeGreaterThan(0);
    expect(r003.compliant).toBe(false); // 93.5 > 89.3368
  });

  test('throws error when no baseline is set', async () => {
    mockRouteRepo.findBaseline.mockResolvedValue(null);

    await expect(useCase.execute()).rejects.toThrow('No baseline route set');
  });

  test('returns compliant flag correctly based on target', async () => {
    mockRouteRepo.findBaseline.mockResolvedValue(baseline);
    mockRouteRepo.findAll.mockResolvedValue([
      baseline,
      { routeId: 'EXACT', vesselType: 'Container', fuelType: 'HFO', year: 2025, ghgIntensity: 89.3368 },
    ]);

    const result = await useCase.execute();
    const exact = result.comparisons.find(c => c.routeId === 'EXACT');
    expect(exact.compliant).toBe(true); // exactly at target is compliant
  });

  test('excludes baseline route from comparisons', async () => {
    mockRouteRepo.findBaseline.mockResolvedValue(baseline);
    mockRouteRepo.findAll.mockResolvedValue([baseline]);

    const result = await useCase.execute();
    expect(result.comparisons).toHaveLength(0);
  });
});
