import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import {
  createSubscription,
  getUserSubscriptions,
  getUserSubscriptionDetails,
  updateSubscription,
  cancelSubscription ,
  deleteSubscription,
  getUpcomingRenewals
  
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

// Path: /api/v1/subscriptions
subscriptionRouter.post("/", authorize, createSubscription);
subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);
subscriptionRouter.get("/:id", authorize, getUserSubscriptionDetails);
subscriptionRouter.put("/:id/update", authorize, updateSubscription);
subscriptionRouter.put("/:id/cancel",authorize, cancelSubscription);
subscriptionRouter.delete("/:id/delete", authorize, deleteSubscription);
subscriptionRouter.get("/upcoming-renewals/:id", authorize, getUpcomingRenewals);

export default subscriptionRouter;
