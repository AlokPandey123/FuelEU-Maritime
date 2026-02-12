import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../db/connection.js';
import routeController from '../../adapters/inbound/http/routeController.js';
import complianceController from '../../adapters/inbound/http/complianceController.js';
import bankingController from '../../adapters/inbound/http/bankingController.js';
import poolController from '../../adapters/inbound/http/poolController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fueleu_maritime';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/routes', routeController);
app.use('/compliance', complianceController);
app.use('/banking', bankingController);
app.use('/pools', poolController);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  await connectDB(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`🚀 FuelEU Maritime API running on http://localhost:${PORT}`);
  });
}

start();

export default app;
