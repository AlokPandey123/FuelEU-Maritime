import { jest } from '@jest/globals';
import { BankSurplus } from '../BankSurplus.js';

const mockComplianceRepo = {
  findByShipAndYear: jest.fn(),
};

const mockBankingRepo = {
  save: jest.fn(),
};

describe('BankSurplus', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new BankSurplus(mockComplianceRepo, mockBankingRepo);
    mockBankingRepo.save.mockImplementation(async (entry) => entry);
  });

  test('banks positive CB successfully', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue({
      shipId: 'R002', year: 2024, cbGco2eq: 263082240,
    });

    const result = await useCase.execute('R002', '2024');

    expect(result.shipId).toBe('R002');
    expect(result.bankedAmount).toBe(263082240);
    expect(mockBankingRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        shipId: 'R002',
        year: 2024,
        amountGco2eq: 263082240,
      })
    );
  });

  test('throws error when CB is zero', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue({
      shipId: 'R001', year: 2024, cbGco2eq: 0,
    });

    await expect(useCase.execute('R001', '2024')).rejects.toThrow('Cannot bank negative or zero CB');
  });

  test('throws error when CB is negative (deficit)', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue({
      shipId: 'R003', year: 2024, cbGco2eq: -100000,
    });

    await expect(useCase.execute('R003', '2024')).rejects.toThrow('Cannot bank negative or zero CB');
  });

  test('throws error when no compliance record exists', async () => {
    mockComplianceRepo.findByShipAndYear.mockResolvedValue(null);

    await expect(useCase.execute('UNKNOWN', '2024')).rejects.toThrow('No compliance record found');
  });
});
