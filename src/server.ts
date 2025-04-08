import express, { Request, Response as ExpressResponse } from 'express';
import Stripe from 'stripe';
import cors from 'cors';

// Import Netlify Angular SSR runtime
import { CommonEngine } from '@angular/ssr/node';
import { render } from '@netlify/angular-runtime/common-engine.mjs'; // For CommonEngine integration

const app = express();
const PORT = 4201;

// ✅ Replace with your real Stripe secret key
const stripe = new Stripe('sk_test_51QcsRtC2AfYWttCeWJnOcYzcv2qHYWXzau5iAVhIsXVDYgcXbWOP1x3pQ49jlDjSHg35suq3ZbuLXckVxUq2DWKK007IbVdFdI', {
  // Omit apiVersion to avoid Angular compiler errors
  // apiVersion: '2023-10-16'
});

app.use(cors());
app.use(express.json());

// Stripe Payment Intent API
app.post('/create-payment-intent', async (req: Request, res: ExpressResponse): Promise<void> => {
  const { amount } = req.body;

  console.log('Incoming amount:', amount);

  if (!amount || typeof amount !== 'number') {
    console.error('Invalid amount:', amount);
    res.status(400).json({ error: 'Invalid amount provided' });
    return;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    console.log('Created PaymentIntent:', paymentIntent.id);

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message || 'Failed to create PaymentIntent' });
  }

  return;
});

// Netlify SSR - CommonEngine integration for Angular SSR
const commonEngine = new CommonEngine();

// Define the handler for SSR requests
export async function netlifyCommonEngineHandler(request: Request, context: any): Promise<ExpressResponse> {
  const result = await render(commonEngine);

  // Cast the result to `unknown` first, then to `ExpressResponse`
  return result as unknown as ExpressResponse; // Double cast to ensure compatibility
}

// Serve both the API routes and SSR handler
app.all('*', (req, res) => {
  netlifyCommonEngineHandler(req, res)
    .then((result) => res.send(result))
    .catch((err) => res.status(500).send({ error: err.message }));
});

app.listen(PORT, () => {
  console.log(`✅ Stripe backend running at http://localhost:${PORT}`);
});
