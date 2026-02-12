import mongoose from 'mongoose';

const shipComplianceSchema = new mongoose.Schema({
  shipId: { type: String, required: true },
  year: { type: Number, required: true },
  cbGco2eq: { type: Number, required: true },
  ghgIntensity: { type: Number, required: true },
  fuelConsumption: { type: Number, required: true },
  isSurplus: { type: Boolean, default: false },
}, { timestamps: true });

shipComplianceSchema.index({ shipId: 1, year: 1 }, { unique: true });

export const ShipComplianceModel = mongoose.model('ShipCompliance', shipComplianceSchema);
