import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { RouteModel } from '../../adapters/outbound/mongodb/models/RouteModel.js';
import { connectDB, disconnectDB } from './connection.js';

dotenv.config();

const seedRoutes = [
  // ─── 2023 Routes ───────────────────────────────────────
  {
    routeId: 'R001',
    vesselType: 'Container',
    fuelType: 'HFO',
    year: 2023,
    ghgIntensity: 94.2,
    fuelConsumption: 5200,
    distance: 12800,
    totalEmissions: 4850,
    isBaseline: true,
  },
  {
    routeId: 'R002',
    vesselType: 'BulkCarrier',
    fuelType: 'VLSFO',
    year: 2023,
    ghgIntensity: 92.1,
    fuelConsumption: 4600,
    distance: 10200,
    totalEmissions: 4100,
    isBaseline: false,
  },
  {
    routeId: 'R003',
    vesselType: 'Tanker',
    fuelType: 'HFO',
    year: 2023,
    ghgIntensity: 95.8,
    fuelConsumption: 6100,
    distance: 14500,
    totalEmissions: 5600,
    isBaseline: false,
  },
  {
    routeId: 'R004',
    vesselType: 'RoRo',
    fuelType: 'MGO',
    year: 2023,
    ghgIntensity: 90.3,
    fuelConsumption: 3800,
    distance: 8500,
    totalEmissions: 3200,
    isBaseline: false,
  },
  // ─── 2024 Routes ───────────────────────────────────────
  {
    routeId: 'R005',
    vesselType: 'Container',
    fuelType: 'LNG',
    year: 2024,
    ghgIntensity: 88.0,
    fuelConsumption: 5000,
    distance: 12000,
    totalEmissions: 4200,
    isBaseline: false,
  },
  {
    routeId: 'R006',
    vesselType: 'BulkCarrier',
    fuelType: 'LNG',
    year: 2024,
    ghgIntensity: 85.5,
    fuelConsumption: 4800,
    distance: 11500,
    totalEmissions: 3900,
    isBaseline: false,
  },
  {
    routeId: 'R007',
    vesselType: 'Tanker',
    fuelType: 'MGO',
    year: 2024,
    ghgIntensity: 93.5,
    fuelConsumption: 5100,
    distance: 12500,
    totalEmissions: 4700,
    isBaseline: false,
  },
  {
    routeId: 'R008',
    vesselType: 'Container',
    fuelType: 'Methanol',
    year: 2024,
    ghgIntensity: 82.4,
    fuelConsumption: 4400,
    distance: 11200,
    totalEmissions: 3500,
    isBaseline: false,
  },
  {
    routeId: 'R009',
    vesselType: 'RoRo',
    fuelType: 'HFO',
    year: 2024,
    ghgIntensity: 91.8,
    fuelConsumption: 4900,
    distance: 11800,
    totalEmissions: 4450,
    isBaseline: false,
  },
  {
    routeId: 'R010',
    vesselType: 'CruiseShip',
    fuelType: 'LNG',
    year: 2024,
    ghgIntensity: 87.2,
    fuelConsumption: 7200,
    distance: 16000,
    totalEmissions: 6100,
    isBaseline: false,
  },
  // ─── 2025 Routes ───────────────────────────────────────
  {
    routeId: 'R011',
    vesselType: 'Container',
    fuelType: 'Methanol',
    year: 2025,
    ghgIntensity: 79.6,
    fuelConsumption: 4300,
    distance: 11000,
    totalEmissions: 3200,
    isBaseline: false,
  },
  {
    routeId: 'R012',
    vesselType: 'BulkCarrier',
    fuelType: 'LNG',
    year: 2025,
    ghgIntensity: 86.1,
    fuelConsumption: 4700,
    distance: 11200,
    totalEmissions: 3850,
    isBaseline: false,
  },
  {
    routeId: 'R013',
    vesselType: 'Tanker',
    fuelType: 'VLSFO',
    year: 2025,
    ghgIntensity: 92.4,
    fuelConsumption: 5300,
    distance: 13000,
    totalEmissions: 4800,
    isBaseline: false,
  },
  {
    routeId: 'R014',
    vesselType: 'RoRo',
    fuelType: 'Hydrogen',
    year: 2025,
    ghgIntensity: 65.3,
    fuelConsumption: 2800,
    distance: 7500,
    totalEmissions: 1700,
    isBaseline: false,
  },
  {
    routeId: 'R015',
    vesselType: 'Container',
    fuelType: 'LNG',
    year: 2025,
    ghgIntensity: 90.5,
    fuelConsumption: 4950,
    distance: 11900,
    totalEmissions: 4400,
    isBaseline: false,
  },
  {
    routeId: 'R016',
    vesselType: 'CruiseShip',
    fuelType: 'Methanol',
    year: 2025,
    ghgIntensity: 80.8,
    fuelConsumption: 6800,
    distance: 15200,
    totalEmissions: 5200,
    isBaseline: false,
  },
  {
    routeId: 'R017',
    vesselType: 'BulkCarrier',
    fuelType: 'Ammonia',
    year: 2025,
    ghgIntensity: 71.2,
    fuelConsumption: 4100,
    distance: 9800,
    totalEmissions: 2700,
    isBaseline: false,
  },
  {
    routeId: 'R018',
    vesselType: 'Tanker',
    fuelType: 'HFO',
    year: 2025,
    ghgIntensity: 94.1,
    fuelConsumption: 5500,
    distance: 13500,
    totalEmissions: 5100,
    isBaseline: false,
  },
  // ─── 2026 Routes (Projections) ─────────────────────────
  {
    routeId: 'R019',
    vesselType: 'Container',
    fuelType: 'Hydrogen',
    year: 2026,
    ghgIntensity: 58.4,
    fuelConsumption: 2500,
    distance: 10000,
    totalEmissions: 1300,
    isBaseline: false,
  },
  {
    routeId: 'R020',
    vesselType: 'CruiseShip',
    fuelType: 'LNG',
    year: 2026,
    ghgIntensity: 84.9,
    fuelConsumption: 7000,
    distance: 15800,
    totalEmissions: 5700,
    isBaseline: false,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fueleu_maritime';
  await connectDB(uri);

  // Clear existing data
  await RouteModel.deleteMany({});
  console.log('🗑️  Cleared existing routes');

  // Insert seed data
  await RouteModel.insertMany(seedRoutes);
  console.log(`🌱 Seeded ${seedRoutes.length} routes across 2023-2026 (R001 set as baseline)`);

  await disconnectDB();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
