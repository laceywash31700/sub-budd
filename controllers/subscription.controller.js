import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";
import Subscription from "../model/subscription.model.js";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const calculateNextRenewal = (startDate, frequency) => {
  const start = dayjs(startDate);
  const now = dayjs();
  let nextDate = start;

  // Handle different frequencies
  switch (frequency) {
    case "daily":
      nextDate = start.add(Math.ceil(now.diff(start, "day", true)), "day");
      break;

    case "weekly":
      nextDate = start.add(Math.ceil(now.diff(start, "week", true)), "week");
      break;

    case "monthly":
      nextDate = start.add(Math.ceil(now.diff(start, "month", true)), "month");
      // Handle end-of-month edge cases
      if (nextDate.date() !== start.date()) {
        nextDate = nextDate.endOf("month");
      }
      break;

    case "yearly":
      nextDate = start.add(Math.ceil(now.diff(start, "year", true)), "year");
      break;

    default:
      throw new Error(`Invalid frequency: ${frequency}`);
  }

  return nextDate;
};

// NOTE: should create Subscription from req.body and add them to database.
export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    // Upstash will handle the JSON.stringify internally
    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: { subscriptionId: subscription._id }, // Pass raw object here
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    return res.status(201).json({
      success: true,
      data: { subscription, workflowRunId },
    });
  } catch (error) {
    next(error);
  }
};
// NOTE: should get subscriptions from specific user.
export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      const error = new Error(
        "You are not authorized to see these this subscriptions: Access Denied"
      );
      error.status = 401;
      throw error;
    }
    // Processes renewals first
    await Subscription.processRenewals(req.params.id);
     // Then get updated subscriptions
    const subscriptions = await Subscription.find({ user: req.params.id });

    delete subscriptions.__v;

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

//NOTE: should take in an id of an subscription as a pram and get the details of that particular subscription
export const getUserSubscriptionDetails = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription)
      return res.status(404).json({ message: `Could not find subscription` });

    if (req.user.id !== subscription.user.toString()) {
      const error = new Error(
        "You are not authorized to see this subscription's details: Access Denied"
      );
      error.status = 401;
      throw error;
    }

    delete subscription.__v;

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// NOTE: should take in the an ID of a subscription and update it based on what is in the req.body
export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription)
      return res.status(404).json({ message: `Could not find subscription` });

    if (req.user.id !== subscription.user.toString()) {
      const error = new Error(
        "You are not authorized to update this subscription: Access Denied"
      );
      error.status = 401;
      throw error;
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "name",
      "price",
      "currency",
      "frequency",
      "category",
      "paymentMethod",
      "status",
      "renewalDate",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates!" });
    }

    updates.forEach((update) => (subscription[update] = req.body[update]));
    await subscription.save();

    subscription.toObject();
    delete subscription.__v;

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// NOTE: should taken in an subscription id and update the status of the subscription to "Canceled"
// NOTE: eventually will integrate an api for canceling subscriptions on google
export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    // validates ownership and if there is a subscription
    if (!subscription)
      return res.status(404).json({ message: "Subscription not found" });

    if (req.user.id !== subscription.user.toString()) {
      return res.status(403).json({
        message:
          "You are not authorized to cancel this subscription: Access Denied",
      });
    }

    // Validates if there is a status in the body and if it is set to "Canceled"
    if (req.body.status && req.body.status !== "Canceled") {
      return res.status(400).json({
        message: 'Only "canceled" status is allowed for this operation',
      });
    }

    // Update and save
    subscription.status = "Canceled";
    subscription.updatedAt = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      data: subscription,
      message: `Your subscription to ${subscription.name} has been updated to Canceled`,
    });
  } catch (error) {
    next(error);
  }
};

// should take in the id of a subscription and delete it from the database
export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    // validates ownership and if there is a subscription
    if (!subscription)
      return res.status(404).json({ message: "Subscription not found" });

    if (req.user.id !== subscription.user.toString()) {
      return res.status(403).json({
        message:
          "You are not authorized to delete this subscription: Access Denied",
      });
    }
    // Deletes subscription
    await subscription.deleteOne();

    res
      .status(204)
      .json({ success: true, message: "Your subscription has been deleted" });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const currentDate = dayjs();
    const lookaheadWindow = currentDate.add(30, 'day');

    const subscriptions = await Subscription.find({
      user: req.user.id,
      status: "Active",
      renewalDate: {
        $gte: currentDate.toDate(),
        $lte: lookaheadWindow.toDate()
      }
    }).sort({ renewalDate: 1 });

    const formattedRenewals = subscriptions.map(sub => ({
      ...sub.toObject(),
      nextRenewal: dayjs(sub.renewalDate).format("YYYY-MM-DD"),
      daysUntil: dayjs(sub.renewalDate).diff(currentDate, "day"),
      frequency: sub.frequency
    }));

    res.status(200).json({
      success: true,
      count: formattedRenewals.length,
      windowDays: 30,
      data: formattedRenewals
    });
  } catch (error) {
    next(error);
  }
};
