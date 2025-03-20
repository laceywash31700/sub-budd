import express from "express";
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

const app = express();

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRoutes);

app.get('/', (req, res) => {
 res.send("welcome to Sub-Bud");
});

// listener
app.listen(PORT, () => {
  console.log(`Sub Bud API is running on http://localhost:${PORT}`);
});

export default app;