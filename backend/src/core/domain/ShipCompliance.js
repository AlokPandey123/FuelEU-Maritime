/**
 * ShipCompliance Domain Entity
 * Represents a ship's computed compliance balance for a given year.
 */
export class ShipCompliance {
  constructor({ shipId, year, cbGco2eq, ghgIntensity, fuelConsumption }) {
    this.shipId = shipId;
    this.year = year;
    this.cbGco2eq = cbGco2eq;            // Compliance Balance in gCO₂eq
    this.ghgIntensity = ghgIntensity;     // Actual GHG intensity
    this.fuelConsumption = fuelConsumption;
  }

  get isSurplus() {
    return this.cbGco2eq > 0;
  }

  get isDeficit() {
    return this.cbGco2eq < 0;
  }
}
