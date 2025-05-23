import express from "express";
import cors from 'cors';
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import workflowRouter from "./routes/workflow.routes.js";
import { arcjetMW } from "./middleware/arcjet.middleware.js";
import { PORT } from "./config/env.js";
import { TRUST_PROXY } from "./config/env.js";

const app = express();

const proxyConfig = TRUST_PROXY === "true" ? true : 
  Number(TRUST_PROXY) || 1;

app.set('trust proxy', proxyConfig);  

// 1. CORS Configuration 
app.use(cors({
  origin: ['https://sub-bud.netlify.app', 'http://127.0.0.1:5173'], 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] 
}));

// 2. Other Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 3. Arcjet Middleware (after CORS but before routes)
app.use(arcjetMW);

// 4. Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);

// 5. Explicit OPTIONS handler for all routes
app.options('*', cors()); 

// Error handling
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send("Welcome to Sub-Bud");
});

// Listener
app.listen(PORT, async () => {
  console.log(`Sub Bud API is running on http://localhost:${PORT}`);
  await connectToDatabase();
});

export default app;