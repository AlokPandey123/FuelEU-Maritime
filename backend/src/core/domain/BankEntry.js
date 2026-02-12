/**
 * BankEntry Domain Entity
 * Represents a banked surplus entry for a ship in a given year.
 */
export class BankEntry {
  constructor({ shipId, year, amountGco2eq, createdAt = new Date() }) {
    this.shipId = shipId;
    this.year = year;
    this.amountGco2eq = amountGco2eq;
    this.createdAt = createdAt;
  }
}
