import { aj } from "../config/arcjet.js";


const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) 
    ? forwarded[0] 
    : (typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : null);
  
  return ip || req.ip || req.socket.remoteAddress;
};

export const arcjetMW = async (req, res, next) => {
  try {
    const decision = await aj.protect({
      ip: getClientIp(req),
      method: req.method,
      path: req.path,
      headers: {
        cookie: req.headers.cookie,
        host: req.headers.host,
        'user-agent': req.headers['user-agent']
      }
    });

    if (decision.isDenied()) {
      console.log("Arcjet Denial Reason:", decision.reason); 
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
