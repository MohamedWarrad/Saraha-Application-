import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import geoip from "geoip-lite";
import { client } from "../clients/redis.client.js";

function fromWhere(ip) {
  try {
    return geoip.lookup(ip);
  } catch (error) {
    console.log(error.message);
  }
}

// rate limit
export const generateLimiter = ({
  ttl = 15,
  message = "Too Many Request",
  status = 429,
  legacyHeaders = true,
  standardHeaders = "draft-8",
  skipSuccessfulRequests,
  skipFailedRequests,
  limit = 1000,
}) => {
  return rateLimit({
    windowMs: ttl * 60 * 1000,
    limit: function (req) {
      const data = fromWhere(req.ip);
      return data?.country == "EG" ? limit : 0;
    },
    legacyHeaders,
    standardHeaders,
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: function (req, res, next) {
      return res.status(status).json({ message });
    },
    keyGenerator: function (req) {
      const ip = ipKeyGenerator(req.ip, 52);
      return `${ip}::${req.path}`;
    },
    store: {
      async incr(key, cb) {
        // called by keyGenerator
        try {
          const count = await client.incr(key);

          if (count === 1) {
            await client.expire(key, ttl * 60); // 1 min TTL
          }

          cb(null, count);
        } catch (err) {
          cb(err);
        }
      },

      async decrement(key) {
        if (await client.exists(key)) {
          await client.decr(key);
        }
      },
    },
  });
};
