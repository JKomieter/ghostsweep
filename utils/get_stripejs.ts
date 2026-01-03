import { Stripe, loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;
const stripePublishableKey = process.env.NODE_ENV === 'production' ?
 process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! :
    process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY!;
const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(stripePublishableKey);
    }
    return stripePromise;
};

export default getStripe;