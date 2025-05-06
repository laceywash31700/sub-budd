import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { NODE_ENV, TRUST_PROXY } from "./env.js";
import { ARCJET_KEY } from "./env.js";

// Configure proxy trust first
const proxyConfig = TRUST_PROXY === "true" ? true : Number(TRUST_PROXY) || 1;

export const aj = arcjet({
  key: ARCJET_KEY,
  characteristics: [
    "ip.src",        // Client IP
    "userAgent",     // Browser/device fingerprint
    "headers.cookie",// Session tracking
    "headers.host",  // Domain verification
    "method",        // Request type
    "path"           // Endpoint pattern
  ],
  rules: [
    shield({
      mode: NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      // Keep protections enabled for auth endpoints
      exceptions: [
        {
          path: "/api/v1/auth/*",
          methods: ["OPTIONS"], // Only relax CORS preflight
          disable: []           // Keep all protections
        }
      ]
    }),
    detectBot({
      mode: NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      allow: [
        // Development tools (local only)
        ...(NODE_ENV !== "production" ? ["POSTMAN", "INSOMNIA"] : []),
        // Allow essential bots
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
        // Block all browsers directly - they should come via your frontend
      ],
      block: [
        "CATEGORY:SPAM", 
        "CATEGORY:SCRAPER",
        "BROWSER:CHROME", // Block direct browser access
        "BROWSER:FIREFOX"
      ]
    }),
    tokenBucket({
      mode: NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      refillRate: 100,    // Base rate per IP
      interval: 60,       // Per minute
      capacity: 200,
      exceptions: [
        {
          path: "/api/v1/auth/login",
          methods: ["POST"],
          refillRate: 20,  // Stricter limits on auth endpoints
          capacity: 40
        },
        {
          path: "/api/v1/auth/refresh",
          methods: ["POST"],
          refillRate: 10,
          capacity: 20
        }
      ]
    })
  ],
});