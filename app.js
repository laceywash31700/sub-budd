import https from "https";
import fs from "fs";
import express from "express";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import workflowRouter from "./routes/workflow.routes.js";
import { arcjetMW } from "./middleware/arcjet.middleware.js";
import { PORT } from "./config/env.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMW);

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);

// Error handling
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to Sub-Bud");
});

// HTTPS Server Configuration
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/sub-budd.zapto.org/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/sub-budd.zapto.org/cert.pem"),
  ca: fs.readFileSync("/etc/letsencrypt/live/sub-budd.zapto.org/chain.pem"),
};

// HTTPS Listener
https.createServer(options, app).listen(443, async () => {
  console.log("Sub-Bud API is running on https://sub-budd.zapto.org");
});

// Optional: Redirect HTTP to HTTPS
import http from "http";
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80);
