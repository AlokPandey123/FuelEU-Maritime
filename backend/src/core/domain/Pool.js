/**
 * Pool Domain Entity
 * Represents a pool of ships sharing compliance balances.
 */
export class Pool {
  constructor({ year, members = [], createdAt = new Date() }) {
    this.year = year;
    this.members = members; // Array of { shipId, cbBefore, cbAfter }
    this.createdAt = createdAt;
  }

  get sumCbBefore() {
    return this.members.reduce((sum, m) => sum + m.cbBefore, 0);
  }

  get isValid() {
    return this.sumCbBefore >= 0;
  }
}
