import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { NODE_ENV } from "../config/env.js";
import { ARCJET_KEY } from "./env.js";

export const aj = arcjet({
  key: ARCJET_KEY,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    shield({
      mode: NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      exceptions: [
        {
          path: "/api/v1/auth/*", // Applies to all auth endpoints
          methods: ["POST", "OPTIONS"], // Include OPTIONS for CORS
          disable: ["sqlInjection", "xss"] // Temporarily disable for auth
        }
      ]
    }),
    detectBot({
      mode: NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      allow: [
        ...(NODE_ENV !== "production" ? ["POSTMAN", "INSOMNIA", "CHROME"] : []),
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
        "BROWSER:CHROME", // Allow Chrome requests
        "BROWSER:FIREFOX" // Allow Firefox requests
      ],
    }),
    tokenBucket({
      mode: NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      refillRate: 20, // Increased base rate
      interval: 10,
      capacity: 40,
      exceptions: [
        {
          path: "/api/v1/auth/*",
          methods: ["POST", "OPTIONS"],
          refillRate: 30, // Very generous for auth
          capacity: 60
        }
      ]
    })
  ],
});