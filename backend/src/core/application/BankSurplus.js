/**
 * BankSurplus Use Case
 * Banks a positive compliance balance for future use.
 */
export class BankSurplus {
  constructor(complianceRepository, bankingRepository) {
    this.complianceRepository = complianceRepository;
    this.bankingRepository = bankingRepository;
  }

  async execute(shipId, year) {
    const compliance = await this.complianceRepository.findByShipAndYear(shipId, parseInt(year));
    if (!compliance) {
      throw new Error(`No compliance record found for ship ${shipId} year ${year}`);
    }

    if (compliance.cbGco2eq <= 0) {
      throw new Error(`Cannot bank negative or zero CB. Current CB: ${compliance.cbGco2eq}`);
    }

    const bankEntry = {
      shipId,
      year: parseInt(year),
      amountGco2eq: compliance.cbGco2eq,
      createdAt: new Date(),
    };

    await this.bankingRepository.save(bankEntry);

    return {
      shipId,
      year: parseInt(year),
      bankedAmount: compliance.cbGco2eq,
      message: `Successfully banked ${compliance.cbGco2eq} gCO₂eq`,
    };
  }
}
