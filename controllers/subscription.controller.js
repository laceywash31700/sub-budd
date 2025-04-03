import Subscription from "../model/subscription.model.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    return res.status(201).json({success: true, data: subscription})
  } catch (error) {
    next(error)
  }
};
