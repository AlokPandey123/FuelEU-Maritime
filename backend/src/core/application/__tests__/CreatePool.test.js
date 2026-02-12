import { jest } from '@jest/globals';
import { CreatePool } from '../CreatePool.js';

const mockComplianceRepo = {
  findByShipAndYear: jest.fn(),
};

const mockPoolRepo = {
  save: jest.fn(),
};

describe('CreatePool', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreatePool(mockComplianceRepo, mockPoolRepo);
    mockPoolRepo.save.mockImplementation(async (pool) => ({ ...pool, _id: 'pool123' }));
  });

  test('creates pool with greedy surplus-to-deficit allocation', async () => {
    // Ship A: surplus +1000, Ship B: deficit -500
    mockComplianceRepo.findByShipAndYear
      .mockResolvedValueOnce({ shipId: 'A', year: 2024, cbGco2eq: 1000 })
      .mockResolvedValueOnce({ shipId: 'B', year: 2024, cbGco2eq: -500 });

    const result = await useCase.execute(2024, ['A', 'B']);

    expect(result.members).toHaveLength(2);
    // After greedy allocation: A should transfer 500 to B
    const memberA = result.members.find(m => m.shipId === 'A');
    const memberB = result.members.find(m => m.shipId === 'B');
    expect(memberA.cbAfter).toBe(500); // 1000 - 500
    expect(memberB.cbAfter).toBe(0);   // -500 + 500
    expect(result.totalCBAfter).toBe(500);
  });

  test('throws error when pool sum CB is negative', async () => {
    // Ship A: +100, Ship B: -500 → total = -400
    mockComplianceRepo.findByShipAndYear
      .mockResolvedValueOnce({ shipId: 'A', year: 2024, cbGco2eq: 100 })
      .mockResolvedValueOnce({ shipId: 'B', year: 2024, cbGco2eq: -500 });

    await expect(useCase.execute(2024, ['A', 'B'])).rejects.toThrow('Pool sum CB is negative');
  });

  test('throws error when fewer than 2 members', async () => {
    await expect(useCase.execute(2024, ['A'])).rejects.toThrow('at least 2 members');
  });

  test('throws error when members array is empty', async () => {
    await expect(useCase.execute(2024, [])).rejects.toThrow('at least 2 members');
  });

  test('throws error when compliance record missing for a member', async () => {
    mockComplianceRepo.findByShipAndYear
      .mockResolvedValueOnce({ shipId: 'A', year: 2024, cbGco2eq: 1000 })
      .mockResolvedValueOnce(null);

    await expect(useCase.execute(2024, ['A', 'B'])).rejects.toThrow('No compliance record for ship B');
  });

  test('surplus ship cannot exit negative after allocation', async () => {
    // 3 ships: A +200, B -100, C -150 → total = -50 (rejected by sum check)
    // But let's test a valid case: A +300, B -100, C -150 → total = +50
    mockComplianceRepo.findByShipAndYear
      .mockResolvedValueOnce({ shipId: 'A', year: 2024, cbGco2eq: 300 })
      .mockResolvedValueOnce({ shipId: 'B', year: 2024, cbGco2eq: -100 })
      .mockResolvedValueOnce({ shipId: 'C', year: 2024, cbGco2eq: -150 });

    const result = await useCase.execute(2024, ['A', 'B', 'C']);

    const memberA = result.members.find(m => m.shipId === 'A');
    // A should have transferred 250 (100+150), ending at 50
    expect(memberA.cbAfter).toBeGreaterThanOrEqual(0);
  });

  test('handles all-surplus pool correctly', async () => {
    mockComplianceRepo.findByShipAndYear
      .mockResolvedValueOnce({ shipId: 'A', year: 2024, cbGco2eq: 500 })
      .mockResolvedValueOnce({ shipId: 'B', year: 2024, cbGco2eq: 300 });

    const result = await useCase.execute(2024, ['A', 'B']);

    // No deficit to transfer to, so all values stay the same
    expect(result.members[0].cbAfter).toBe(result.members[0].cbBefore);
    expect(result.members[1].cbAfter).toBe(result.members[1].cbBefore);
  });

  test('saves pool to repository', async () => {
    mockComplianceRepo.findByShipAndYear
      .mockResolvedValueOnce({ shipId: 'A', year: 2024, cbGco2eq: 1000 })
      .mockResolvedValueOnce({ shipId: 'B', year: 2024, cbGco2eq: -500 });

    await useCase.execute(2024, ['A', 'B']);

    expect(mockPoolRepo.save).toHaveBeenCalledTimes(1);
    expect(mockPoolRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2024, members: expect.any(Array) })
    );
  });
});
