import { jest } from '@jest/globals';
import { ApplyBanked } from '../ApplyBanked.js';

const mockComplianceRepo = {
  findByShipAndYear: jest.fn(),
  save: jest.fn(),
};

const mockBankingRepo = {
  getTotalBanked: jest.fn(),
  getTotalApplied: jest.fn(),
  save: jest.fn(),
};

describe('ApplyBanked', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ApplyBanked(mockComplianceRepo, mockBankingRepo);
    mockBankingRepo.save.mockImplementation(async (entry) => entry);
    mockComplianceRepo.save.mockImplementation(async (record) => record);
  });

  test('applies banked surplus to deficit ship', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue({
      shipId: 'R003', year: 2024, cbGco2eq: -500000,
    });
    mockBankingRepo.getTotalBanked.mockResolvedValue(1000000);
    mockBankingRepo.getTotalApplied.mockResolvedValue(0);

    const result = await useCase.execute('R003', '2024', 300000);

    expect(result.cbBefore).toBe(-500000);
    expect(result.applied).toBe(300000);
    expect(result.cbAfter).toBe(-200000);
    expect(mockBankingRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ amountGco2eq: -300000 })
    );
  });

  test('throws error when amount exceeds available banked', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue({
      shipId: 'R003', year: 2024, cbGco2eq: -500000,
    });
    mockBankingRepo.getTotalBanked.mockResolvedValue(100000);
    mockBankingRepo.getTotalApplied.mockResolvedValue(0);

    await expect(useCase.execute('R003', '2024', 200000)).rejects.toThrow('Insufficient banked surplus');
  });

  test('throws error when amount is negative', async () => {
    await expect(useCase.execute('R003', '2024', -100)).rejects.toThrow('Amount must be a positive number');
  });

  test('throws error when amount is zero', async () => {
    await expect(useCase.execute('R003', '2024', 0)).rejects.toThrow('Amount must be a positive number');
  });

  test('throws error when no compliance record', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue(null);

    await expect(useCase.execute('UNKNOWN', '2024', 100)).rejects.toThrow('No compliance record found');
  });

  test('updates compliance record with new CB after applying', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue({
      shipId: 'R005', year: 2025, cbGco2eq: -200000,
    });
    mockBankingRepo.getTotalBanked.mockResolvedValue(500000);
    mockBankingRepo.getTotalApplied.mockResolvedValue(100000);

    await useCase.execute('R005', '2025', 200000);

    expect(mockComplianceRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ cbGco2eq: 0 }) // -200000 + 200000
    );
  });
});
