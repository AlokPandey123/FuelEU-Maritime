# FuelEU Maritime — Compliance Platform

## Overview

Full-stack implementation of the FuelEU Maritime compliance module based on EU Regulation 2023/1805. The application provides a dashboard for managing maritime route compliance data, comparing GHG intensities, banking compliance surplus, and pooling compliance balances across ships.

## Architecture Summary (Hexagonal)

Both frontend and backend follow the **Hexagonal Architecture** (Ports & Adapters / Clean Architecture) pattern:

### Backend Structure
```
backend/src/
├── core/                          # Domain logic — no framework dependencies
│   ├── domain/                    # Entities & business constants
│   │   ├── Route.js               # Route entity
│   │   ├── ShipCompliance.js      # Compliance balance entity
│   │   ├── BankEntry.js           # Banking entry entity
│   │   ├── Pool.js                # Pool entity
│   │   └── ComplianceConstants.js # FuelEU formulas & constants
│   ├── application/               # Use cases
│   │   ├── GetRoutes.js
│   │   ├── SetBaseline.js
│   │   ├── ComputeComparison.js
│   │   ├── ComputeCB.js
│   │   ├── BankSurplus.js
│   │   ├── ApplyBanked.js
│   │   ├── CreatePool.js
│   │   └── GetAdjustedCB.js
│   └── ports/                     # Interface contracts
│       ├── RouteRepositoryPort.js
│       ├── ComplianceRepositoryPort.js
│       ├── BankingRepositoryPort.js
│       └── PoolRepositoryPort.js
├── adapters/
│   ├── inbound/http/              # Express controllers
│   │   ├── routeController.js
│   │   ├── complianceController.js
│   │   ├── bankingController.js
│   │   └── poolController.js
│   └── outbound/mongodb/          # MongoDB repositories
│       ├── models/                # Mongoose schemas
│       ├── MongoRouteRepository.js
│       ├── MongoComplianceRepository.js
│       ├── MongoBankingRepository.js
│       └── MongoPoolRepository.js
└── infrastructure/
    ├── db/                        # DB connection & seeding
    └── server/                    # Express server setup
```

### Frontend Structure
```
frontend/src/
├── core/
│   ├── domain/ComplianceConstants.js  # Shared domain logic
│   └── ports/ServicePorts.js          # Service interface contracts
├── adapters/
│   └── ui/                            # React components (UI adapters)
│       ├── RoutesTab.jsx
│       ├── CompareTab.jsx
│       ├── BankingTab.jsx
│       └── PoolingTab.jsx
├── infrastructure/
│   └── apiClient.js                   # Axios API client (outbound adapter)
└── App.jsx                            # App shell with tab navigation
```

## Setup & Run Instructions

### Prerequisites
- Node.js 18+
- MongoDB running on `localhost:27017`

### Backend
```bash
cd backend
npm install
npm run seed    # Seed the database with 5 routes
npm run dev     # Start development server on port 4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # Start Vite dev server on port 5173
```

### API Endpoints

| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | /routes                     | All routes (filters: vesselType, fuelType, year) |
| POST   | /routes/:routeId/baseline   | Set route as baseline                |
| GET    | /routes/comparison          | Baseline vs other routes comparison  |
| GET    | /compliance/cb?year=YYYY    | Compute compliance balance           |
| GET    | /compliance/adjusted-cb     | CB after banking adjustments         |
| GET    | /banking/records            | Banking history records              |
| POST   | /banking/bank               | Bank positive CB surplus             |
| POST   | /banking/apply              | Apply banked surplus to deficit      |
| POST   | /pools                      | Create compliance pool               |
| GET    | /pools                      | List all pools                       |

## Core Formulas

- **Target Intensity (2025)** = 89.3368 gCO₂e/MJ (2% below 91.16 reference)
- **Energy in scope (MJ)** = fuelConsumption × 41,000 MJ/t
- **Compliance Balance** = (Target − Actual) × Energy in scope
- **% Difference** = ((comparison / baseline) − 1) × 100

## Testing

```bash
cd backend
npm test
```

## Seed Data

| Route ID | Vessel Type  | Fuel Type | Year | GHG Intensity | Fuel Consumption | Distance  | Emissions |
|----------|-------------|-----------|------|---------------|------------------|-----------|-----------|
| R001     | Container   | HFO       | 2024 | 91.0          | 5,000 t          | 12,000 km | 4,500 t   |
| R002     | BulkCarrier | LNG       | 2024 | 88.0          | 4,800 t          | 11,500 km | 4,200 t   |
| R003     | Tanker      | MGO       | 2024 | 93.5          | 5,100 t          | 12,500 km | 4,700 t   |
| R004     | RoRo        | HFO       | 2025 | 89.2          | 4,900 t          | 11,800 km | 4,300 t   |
| R005     | Container   | LNG       | 2025 | 90.5          | 4,950 t          | 11,900 km | 4,400 t   |

R001 is set as baseline by default.
