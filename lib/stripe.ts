import 'server-only';

import Stripe from "stripe"

const stripeKey = process.env.NODE_ENV === 'production' ? 
    process.env.STRIPE_SECRET_KEY! :
    process.env.STRIPE_TEST_SECRET_KEY!;

const stripe = new Stripe(stripeKey);

export default stripe;