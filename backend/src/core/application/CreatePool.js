/**
 * CreatePool Use Case
 * Creates a pool of ships sharing compliance balances.
 * Implements FuelEU Article 21 – Pooling.
 *
 * Rules:
 * - Sum(adjustedCB) ≥ 0
 * - Deficit ship cannot exit worse
 * - Surplus ship cannot exit negative
 * - Greedy allocation: Sort desc by CB, transfer surplus to deficits
 */
export class CreatePool {
  constructor(complianceRepository, poolRepository) {
    this.complianceRepository = complianceRepository;
    this.poolRepository = poolRepository;
  }

  async execute(year, memberShipIds) {
    if (!memberShipIds || memberShipIds.length < 2) {
      throw new Error('A pool must have at least 2 members');
    }

    // Fetch compliance records for all members
    const members = [];
    for (const shipId of memberShipIds) {
      const compliance = await this.complianceRepository.findByShipAndYear(shipId, parseInt(year));
      if (!compliance) {
        throw new Error(`No compliance record for ship ${shipId} year ${year}`);
      }
      members.push({
        shipId,
        cbBefore: compliance.cbGco2eq,
        cbAfter: compliance.cbGco2eq,
      });
    }

    // Validate sum(CB) ≥ 0
    const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0);
    if (totalCB < 0) {
      throw new Error(`Pool sum CB is negative (${totalCB}). Cannot create pool.`);
    }

    // Greedy allocation
    // Sort members descending by CB
    members.sort((a, b) => b.cbBefore - a.cbBefore);

    // Identify surplus and deficit members
    const surplusMembers = members.filter(m => m.cbBefore > 0);
    const deficitMembers = members.filter(m => m.cbBefore < 0);

    // Transfer surplus to cover deficits
    for (const deficit of deficitMembers) {
      let remaining = Math.abs(deficit.cbBefore);

      for (const surplus of surplusMembers) {
        if (remaining <= 0) break;
        if (surplus.cbAfter <= 0) continue;

        const transfer = Math.min(surplus.cbAfter, remaining);
        surplus.cbAfter -= transfer;
        deficit.cbAfter += transfer;
        remaining -= transfer;
      }
    }

    // Validate post-allocation constraints
    for (const m of members) {
      // Deficit ship cannot exit worse than before
      if (m.cbBefore < 0 && m.cbAfter < m.cbBefore) {
        throw new Error(`Deficit ship ${m.shipId} would exit worse after pooling`);
      }
      // Surplus ship cannot exit negative
      if (m.cbBefore > 0 && m.cbAfter < 0) {
        throw new Error(`Surplus ship ${m.shipId} would exit negative after pooling`);
      }
    }

    // Round values
    members.forEach(m => {
      m.cbBefore = Math.round(m.cbBefore * 100) / 100;
      m.cbAfter = Math.round(m.cbAfter * 100) / 100;
    });

    const pool = {
      year: parseInt(year),
      members,
      createdAt: new Date(),
    };

    const saved = await this.poolRepository.save(pool);

    return {
      poolId: saved._id || saved.id,
      year: parseInt(year),
      members,
      totalCBBefore: Math.round(totalCB * 100) / 100,
      totalCBAfter: Math.round(members.reduce((s, m) => s + m.cbAfter, 0) * 100) / 100,
    };
  }
}
