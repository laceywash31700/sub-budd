import { PORT } from "./config/env.js";
import express from "express";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRoutes);

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