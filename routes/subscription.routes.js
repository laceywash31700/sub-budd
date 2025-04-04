import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import {
  createSubscription,
  getUserSubscriptions,
  getUserSubscriptionDetails,
  updateSubscription,
  cancelSubscription ,
  deleteSubscription
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

// Path: /api/v1/auth
subscriptionRouter.post("/", authorize, createSubscription);
subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);
subscriptionRouter.get("/:id", authorize, getUserSubscriptionDetails);
subscriptionRouter.put("/:id", authorize, updateSubscription);
subscriptionRouter.put("/:id/cancel",authorize, cancelSubscription);
subscriptionRouter.delete("/:id", authorize, deleteSubscription);

subscriptionRouter.get("/", (req, res) =>
  res.send({ title: "GET all subscriptions" })
);
subscriptionRouter.get("/upcoming-renewals", (req, res) =>
  res.send({ title: "GET all subscription renewals" })
);

export default subscriptionRouter;
