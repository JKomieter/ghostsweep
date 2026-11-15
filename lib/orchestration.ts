/**
 * Base URL of the orchestration API, read from the ORCHESTRATION_API_URL env var.
 * Falls back to the Fly deployment in production and localhost:4000 in development.
 */
export const ORCHESTRATION_URL = (
  process.env.ORCHESTRATION_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://ghostsweep-orchestration.fly.dev"
    : "http://localhost:4000")
).replace(/\/+$/, "");
