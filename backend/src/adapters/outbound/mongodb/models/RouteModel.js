import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  vesselType: { type: String, required: true },
  fuelType: { type: String, required: true },
  year: { type: Number, required: true },
  ghgIntensity: { type: Number, required: true },       // gCO₂e/MJ
  fuelConsumption: { type: Number, required: true },     // tonnes
  distance: { type: Number, required: true },            // km
  totalEmissions: { type: Number, required: true },      // tonnes
  isBaseline: { type: Boolean, default: false },
}, { timestamps: true });

routeSchema.index({ vesselType: 1, fuelType: 1, year: 1 });

export const RouteModel = mongoose.model('Route', routeSchema);
