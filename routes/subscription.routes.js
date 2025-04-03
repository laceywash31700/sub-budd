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

const subscriptionRoutes = Router();

subscriptionRoutes.post("/", authorize, createSubscription);
subscriptionRoutes.get("/user/:id", authorize, getUserSubscriptions);
subscriptionRoutes.get("/:id", authorize, getUserSubscriptionDetails);
subscriptionRoutes.put("/:id", authorize, updateSubscription);
subscriptionRoutes.put("/:id/cancel",authorize, cancelSubscription);
subscriptionRoutes.delete("/:id", authorize, deleteSubscription);

subscriptionRoutes.get("/", (req, res) =>
  res.send({ title: "GET all subscriptions" })
);

subscriptionRoutes.get("/upcoming-renewals", (req, res) =>
  res.send({ title: "GET all subscription renewals" })
);

export default subscriptionRoutes;
