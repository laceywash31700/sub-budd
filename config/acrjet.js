import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { NODE_ENV } from "../config/env.js";
import { ARCJET_KEY } from "./env.js";


export const aj = arcjet({
    key: ARCJET_KEY,
    characteristics: ["ip.src"], // Track requests by IP
    rules: [
      // Shield protects your app from common attacks e.g. SQL injection
      shield({ mode: "LIVE" }),
      // Create a bot detection rule
      detectBot({
        mode: "LIVE", // Blocks bots in real time
        allow: [
          // Allow Postman in dev/test
          ...(NODE_ENV !== "production" ? ["POSTMAN"] : []),
          // See the full list at https://arcjet.com/bot-list
          "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
          "CATEGORY:MONITOR", // Uptime monitoring services
          "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
        ],
      }),
      // Create a token bucket rate limit. Other algorithms are supported.
      tokenBucket({
        mode: "LIVE",
        refillRate: 5, // Refill 5 tokens per interval
        interval: 10, // Refill every 10 seconds
        capacity: 10, // Bucket capacity of 10 tokens
      }),
    ],
  });