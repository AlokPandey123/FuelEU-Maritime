/**
 * GetAdjustedCB Use Case
 * Returns compliance balance after banking adjustments.
 */
export class GetAdjustedCB {
  constructor(complianceRepository, bankingRepository) {
    this.complianceRepository = complianceRepository;
    this.bankingRepository = bankingRepository;
  }

  async execute(shipId, year) {
    if (shipId) {
      const compliance = await this.complianceRepository.findByShipAndYear(shipId, parseInt(year));
      if (!compliance) {
        throw new Error(`No compliance record for ${shipId} year ${year}`);
      }

      const totalBanked = await this.bankingRepository.getTotalBanked(shipId);
      const totalApplied = await this.bankingRepository.getTotalApplied(shipId);
      const bankedAvailable = totalBanked - totalApplied;

      return {
        shipId,
        year: parseInt(year),
        originalCB: compliance.cbGco2eq,
        bankedAvailable,
        adjustedCB: compliance.cbGco2eq + bankedAvailable,
        isSurplus: (compliance.cbGco2eq + bankedAvailable) > 0,
      };
    }

    // Return all compliance records for the year
    const allCompliance = await this.complianceRepository.findAll({ year: parseInt(year) });
    const results = [];
    for (const c of allCompliance) {
      const totalBanked = await this.bankingRepository.getTotalBanked(c.shipId);
      const totalApplied = await this.bankingRepository.getTotalApplied(c.shipId);
      const bankedAvailable = totalBanked - totalApplied;
      const adjusted = c.cbGco2eq + bankedAvailable;
      results.push({
        shipId: c.shipId,
        year: c.year,
        originalCB: c.cbGco2eq,
        bankedAvailable,
        adjustedCB: adjusted,
        isSurplus: adjusted > 0,
      });
    }
    return results;
  }
}
