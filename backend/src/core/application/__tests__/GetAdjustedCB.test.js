import { jest } from '@jest/globals';
import { GetAdjustedCB } from '../GetAdjustedCB.js';

const mockComplianceRepo = {
  findByShipAndYear: jest.fn(),
  findAll: jest.fn(),
};

const mockBankingRepo = {
  getTotalBanked: jest.fn(),
  getTotalApplied: jest.fn(),
};

describe('GetAdjustedCB', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetAdjustedCB(mockComplianceRepo, mockBankingRepo);
  });

  test('returns adjusted CB = original + bankedAvailable for single ship', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue({
      shipId: 'R002', year: 2024, cbGco2eq: -500000,
    });
    mockBankingRepo.getTotalBanked.mockResolvedValue(700000);
    mockBankingRepo.getTotalApplied.mockResolvedValue(100000);

    const result = await useCase.execute('R002', '2024');

    expect(result.originalCB).toBe(-500000);
    expect(result.bankedAvailable).toBe(600000);
    expect(result.adjustedCB).toBe(100000); // -500000 + 600000
    expect(result.isSurplus).toBe(true);
  });

  test('returns all ships adjusted CB when no shipId provided', async () => {
    mockComplianceRepo.findAll.mockResolvedValue([
      { shipId: 'R001', year: 2024, cbGco2eq: -200000 },
      { shipId: 'R002', year: 2024, cbGco2eq: 500000 },
    ]);
    mockBankingRepo.getTotalBanked.mockResolvedValue(0);
    mockBankingRepo.getTotalApplied.mockResolvedValue(0);

    const results = await useCase.execute(null, '2024');

    expect(results).toHaveLength(2);
    expect(results[0].adjustedCB).toBe(-200000); // 0 banked
    expect(results[0].isSurplus).toBe(false);
    expect(results[1].adjustedCB).toBe(500000);
    expect(results[1].isSurplus).toBe(true);
  });

  test('throws error when ship compliance not found', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue(null);

    await expect(useCase.execute('UNKNOWN', '2024')).rejects.toThrow('No compliance record');
  });

  test('adjustedCB correctly accounts for applied amounts', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue({
      shipId: 'R001', year: 2024, cbGco2eq: 100000,
    });
    mockBankingRepo.getTotalBanked.mockResolvedValue(500000);
    mockBankingRepo.getTotalApplied.mockResolvedValue(400000);

    const result = await useCase.execute('R001', '2024');

    expect(result.bankedAvailable).toBe(100000);
    expect(result.adjustedCB).toBe(200000); // 100000 + 100000
  });
});
