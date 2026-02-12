# Reflection

## What I Learned Using AI Agents

Working with AI agents (GitHub Copilot/Claude) on this FuelEU Maritime compliance project highlighted how effective these tools are for structured, specification-driven development. The agent was particularly strong at:

1. **Translating specifications to architecture:** Given the hexagonal architecture requirement and the detailed API/domain specification from the Notion doc, the agent produced a clean separation of concerns across domain, ports, adapters, and infrastructure layers — following the pattern consistently across both frontend and backend.

2. **Domain modeling:** The compliance balance formula, banking logic, and pooling algorithm (Article 20-21 of EU 2023/1805) were correctly implemented from the specification. The mathematical formulas translated directly into domain functions without needing iterative correction.

3. **Full-stack coherence:** The agent maintained consistency between backend API contracts and frontend API client calls, ensuring the data types and endpoint signatures matched across the stack.

## Efficiency Gains vs Manual Coding

- **Time saved:** Roughly 3-4x faster than manual implementation for the initial scaffold. What would typically take a day of setup and boilerplate was completed in under an hour.
- **Consistency:** Every module follows the same architectural pattern. Manual coding often introduces inconsistencies as fatigue sets in.
- **Less context-switching:** The agent handled both backend (Node.js/Express/MongoDB) and frontend (React/TailwindCSS) in a single workflow, reducing the mental overhead of switching between technologies.

## Improvements I'd Make Next Time

1. **TypeScript:** The spec called for TypeScript strict mode. In a production setting, I would use TypeScript for both frontend and backend to catch type errors at compile time.
2. **Testing first:** While the architecture supports testing (domain logic has no framework dependencies), I would adopt a TDD approach — writing tests for use cases before implementation.
3. **More granular agent prompts:** Breaking the task into smaller prompts (e.g., "implement only the banking use case with tests") would allow for better verification at each step.
4. **Environment configuration:** A Docker Compose setup for MongoDB + backend + frontend would make the project fully reproducible.
