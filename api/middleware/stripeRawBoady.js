import { raw } from 'express';

// Middleware to parse the raw body for Stripe webhook
export const stripeRawBodyMiddleware = raw({ type: 'application/json' });
