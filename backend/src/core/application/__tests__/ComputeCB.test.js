import { jest } from '@jest/globals';
import { ComputeCB } from '../ComputeCB.js';

// Mock repositories
const mockRouteRepo = {
  findAll: jest.fn(),
};

const mockComplianceRepo = {
  save: jest.fn(),
  findByShipAndYear: jest.fn(),
  findAll: jest.fn(),
};

describe('ComputeCB', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ComputeCB(mockRouteRepo, mockComplianceRepo);
    mockComplianceRepo.save.mockImplementation(async (record) => record);
  });

  test('computes positive CB (surplus) for route below target', async () => {
    // GHG 88.0 < Target 89.3368 → surplus
    mockRouteRepo.findAll.mockResolvedValue([
      { routeId: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200 },
    ]);

    const results = await useCase.execute(null, '2024');

    expect(results).toHaveLength(1);
    expect(results[0].shipId).toBe('R002');
    expect(results[0].isSurplus).toBe(true);
    // CB = (89.3368 - 88.0) × 4800 × 41000 = 1.3368 × 196800000 = 263,082,240 → rounded
    expect(results[0].cbGco2eq).toBeGreaterThan(0);
    expect(mockComplianceRepo.save).toHaveBeenCalledTimes(1);
  });

  test('computes negative CB (deficit) for route above target', async () => {
    // GHG 93.5 > Target 89.3368 → deficit
    mockRouteRepo.findAll.mockResolvedValue([
      { routeId: 'R003', vesselType: 'Tanker', fuelType: 'MGO', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700 },
    ]);

    const results = await useCase.execute(null, '2024');

    expect(results).toHaveLength(1);
    expect(results[0].shipId).toBe('R003');
    expect(results[0].isSurplus).toBe(false);
    expect(results[0].cbGco2eq).toBeLessThan(0);
  });

  test('filters by shipId when provided', async () => {
    mockRouteRepo.findAll.mockResolvedValue([
      { routeId: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500 },
      { routeId: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200 },
    ]);

    const result = await useCase.execute('R001', '2024');

    expect(result.shipId).toBe('R001');
    expect(mockComplianceRepo.save).toHaveBeenCalledTimes(1);
  });

  test('throws error when no routes found for year', async () => {
    mockRouteRepo.findAll.mockResolvedValue([]);

    await expect(useCase.execute(null, '2030')).rejects.toThrow('No routes found for year 2030');
  });

  test('throws error when specific shipId not found', async () => {
    mockRouteRepo.findAll.mockResolvedValue([
      { routeId: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500 },
    ]);

    await expect(useCase.execute('NONEXISTENT', '2024')).rejects.toThrow('Ship NONEXISTENT not found for year 2024');
  });

  test('CB formula: (target - actual) × fuelConsumption × 41000', async () => {
    const ghg = 90.0;
    const fuel = 1000;
    mockRouteRepo.findAll.mockResolvedValue([
      { routeId: 'TEST', vesselType: 'Container', fuelType: 'HFO', year: 2025, ghgIntensity: ghg, fuelConsumption: fuel, distance: 5000, totalEmissions: 1000 },
    ]);

    const results = await useCase.execute(null, '2025');
    const expected = Math.round((89.3368 - ghg) * fuel * 41000 * 100) / 100;
    expect(results[0].cbGco2eq).toBe(expected);
  });
});
