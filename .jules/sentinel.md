## 2025-05-15 - Generic Collection API Security Risks
**Vulnerability:** The application uses a generic `/api/collections/:name` endpoint that allows authenticated users to access ANY collection, including the `users` collection which contains sensitive password hashes.
**Learning:** Generic CRUD APIs, while convenient for prototyping and offline-to-online transitions, bypass collection-specific security logic unless explicitly guarded.
**Prevention:** Implement a blacklist or whitelist for generic collection access, or move sensitive data (like users) to dedicated, non-generic endpoints.

## 2025-05-15 - Hardcoded Secret Fallbacks
**Vulnerability:** `server.ts` contained a hardcoded fallback for `JWT_SECRET`.
**Learning:** Fallbacks for security-sensitive environment variables prioritize availability over security, leading to silent vulnerabilities in production if the environment is misconfigured.
**Prevention:** Fail fast and loudly if critical security environment variables are missing.
