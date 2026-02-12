/**
 * Route Domain Entity
 * Represents a maritime route with fuel and emissions data.
 */
export class Route {
  constructor({ routeId, vesselType, fuelType, year, ghgIntensity, fuelConsumption, distance, totalEmissions, isBaseline = false }) {
    this.routeId = routeId;
    this.vesselType = vesselType;
    this.fuelType = fuelType;
    this.year = year;
    this.ghgIntensity = ghgIntensity;           // gCO₂e/MJ
    this.fuelConsumption = fuelConsumption;       // tonnes
    this.distance = distance;                     // km
    this.totalEmissions = totalEmissions;         // tonnes
    this.isBaseline = isBaseline;
  }

  /** Energy in scope (MJ) ≈ fuelConsumption × 41,000 MJ/t */
  get energyInScope() {
    return this.fuelConsumption * 41000;
  }

  setAsBaseline() {
    this.isBaseline = true;
  }

  unsetBaseline() {
    this.isBaseline = false;
  }
}
