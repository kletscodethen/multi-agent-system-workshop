# Exercise 5 — Guardrails

Implement measures to protect from malicious inputs and ensure reliable outputs.

## Steps
1. **Input Validation**
   - Implement pattern matching to detect malicious inputs
   - Create a security agent to analyse requests
   - Block potentially harmful content

2. **Output Validation**
   - Use Zod schemas to validate LLM outputs
   - Ensure responses match expected formats
   - Handle invalid responses gracefully
