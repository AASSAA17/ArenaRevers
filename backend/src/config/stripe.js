import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('⚠️  WARNING: STRIPE_SECRET_KEY is not set!');
  console.error('   Please set STRIPE_SECRET_KEY in your environment variables.');
}

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2023-10-16',
});

export default stripe;

