# AI Agent Workflow Log

## Agents Used
- **GitHub Copilot** (Claude) — Primary AI agent for full-stack code generation, architecture design, and implementation

## Prompts & Outputs

### Example 1: Project Scaffolding
**Prompt:** "Read the Notion doc and develop both frontend and backend. Backend in Node.js and MongoDB. Develop whole application."

**Generated Output:** Complete hexagonal architecture for both frontend and backend including:
- Domain entities (Route, ShipCompliance, BankEntry, Pool)
- Application use cases (GetRoutes, SetBaseline, ComputeComparison, ComputeCB, BankSurplus, ApplyBanked, CreatePool, GetAdjustedCB)
- Port interfaces for all repositories
- MongoDB adapter implementations with Mongoose models
- Express HTTP controllers for all endpoints
- React components with TailwindCSS for all 4 tabs
- API client infrastructure layer

### Example 2: Domain Logic Implementation
**Prompt:** Compliance formulas from the specification were translated into domain constants:
- `computeComplianceBalance(ghgIntensity, fuelConsumption, year)` → CB = (Target − Actual) × Energy
- `computePercentDiff(comparison, baseline)` → ((comparison / baseline) − 1) × 100
- `isCompliant(ghgIntensity, year)` → ghgIntensity ≤ target

### Example 3: Pooling Algorithm (Article 21)
**Prompt:** Greedy allocation algorithm for compliance pooling:
- Sort members descending by CB
- Transfer surplus to cover deficits
- Validate: deficit ships don't exit worse, surplus ships don't go negative
- Ensure sum(CB) ≥ 0

## Validation / Corrections
1. **Architecture Verification:** Ensured core domain has zero framework dependencies (no Express, no React, no Mongoose imports in core)
2. **Formula Accuracy:** Cross-referenced CB formula with EU Regulation 2023/1805 Annex IV: CB = (Target − Actual) × Energy
3. **Pooling Rules:** Verified Article 21 constraints are enforced in CreatePool use case
4. **API Contract:** Matched all endpoints to the specification: /routes, /compliance, /banking, /pools
5. **MongoDB Adaptation:** Original spec called for PostgreSQL — adapted to MongoDB with Mongoose while maintaining the same hexagonal architecture separation

## Observations

### Where Agent Saved Time
- **Boilerplate generation:** Express controllers, Mongoose models, React component structure generated in seconds vs. 30+ min manually
- **Consistent architecture:** Agent maintained hexagonal pattern across all modules without deviation
- **UI components:** TailwindCSS-styled tables, forms, and interactive elements generated with proper accessibility and responsive design
- **Cross-cutting concerns:** CORS, error handling, and JSON middleware applied consistently

### Where It Required Guidance
- **Database choice:** Spec specified PostgreSQL but user requested MongoDB — required explicit instruction
- **Seed data:** Data table from spec needed careful mapping to code

### How Tools Were Combined
- Fetched Notion spec → Parsed requirements → Generated backend domain → Built adapters → Created frontend components → Wired everything together — all in a single session

## Best Practices Followed
- Used GitHub Copilot for complete project scaffolding following hexagonal architecture
- Incremental development: domain → ports → use cases → adapters → infrastructure
- Maintained clear separation: core has no framework dependencies
- Generated seed data matching specification exactly
