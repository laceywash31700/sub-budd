import { aj } from "../config/acrjet.js";

export const arcjetMW = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {requested: 1 });

    if (decision.isDenied()) {
      console.log("Arcjet Denial Reason:", decision.reason); // Log the reason
      if (decision.reason.isRateLimit())
        return res.status(409).json({ error: "Rate limit exceeded" });
      if (decision.reason.isBot())
        return res.status(403).json({ error: "Bot detected" });

      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (error) {
    console.log(`Arcjet Middleware Error: ${error}`);

    next(error);
  }
};
