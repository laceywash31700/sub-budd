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
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(arcjetMW)

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);



// error handling
app.use(errorMiddleware)

app.get('/', (req, res) => {
 res.send("welcome to Sub-Bud");
});

// listener
app.listen(PORT, async () => {
  console.log(`Sub Bud API is running on http://localhost:${PORT}`);
  await  connectToDatabase();
});

export default app;