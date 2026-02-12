/**
 * ApplyBanked Use Case
 * Applies banked surplus to cover a deficit.
 */
export class ApplyBanked {
  constructor(complianceRepository, bankingRepository) {
    this.complianceRepository = complianceRepository;
    this.bankingRepository = bankingRepository;
  }

  async execute(shipId, year, amount) {
    if (amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const compliance = await this.complianceRepository.findByShipAndYear(shipId, parseInt(year));
    if (!compliance) {
      throw new Error(`No compliance record found for ship ${shipId} year ${year}`);
    }

    // Check GLOBAL pool: surplus banked from any ship can be applied to any deficit ship
    const totalBanked = await this.bankingRepository.getTotalBanked();   // all ships
    const totalApplied = await this.bankingRepository.getTotalApplied(); // all ships
    const availableBanked = totalBanked - totalApplied;

    if (amount > availableBanked) {
      throw new Error(`Insufficient banked surplus. Available: ${availableBanked.toLocaleString()}, Requested: ${amount.toLocaleString()}`);
    }

    // Record the application as a negative bank entry
    const applyEntry = {
      shipId,
      year: parseInt(year),
      amountGco2eq: -amount,
      createdAt: new Date(),
    };

    await this.bankingRepository.save(applyEntry);

    const cbBefore = compliance.cbGco2eq;
    const cbAfter = cbBefore + amount;

    // Update compliance record
    await this.complianceRepository.save({
      ...compliance,
      cbGco2eq: cbAfter,
    });

    return {
      shipId,
      year: parseInt(year),
      cbBefore,
      applied: amount,
      cbAfter,
    };
  }
}
