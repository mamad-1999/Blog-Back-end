import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: 5, // Limit each IP to 5 create account requests per `window` (here, per Minute)
  message: 'Too many login request from this IP, please try again after an 1 Minute',
  handler: (req, res, next, options) => {
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default limiter;
