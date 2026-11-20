/**
 * Base URL of the orchestration API (the backend on the Oracle Cloud server), read from the
 * ORCHESTRATION_API_URL env var. Falls back to localhost:4000 only in development.
 */
export const ORCHESTRATION_URL = (
  process.env.ORCHESTRATION_API_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000")
).replace(/\/+$/, "");

if (!ORCHESTRATION_URL) {
  console.error("ORCHESTRATION_API_URL is not set: backend requests will fail");
}
