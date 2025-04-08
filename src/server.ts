import express, { Request, Response as ExpressResponse } from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
const PORT = 4242;

// ✅ Fix for TS4111: Use bracket notation
if (process.env['NETLIFY'] !== 'true') {
  const stripe = new Stripe('sk_test_51QcsRtC2AfYWttCeWJnOcYzcv2qHYWXzau5iAVhIsXVDYgcXbWOP1x3pQ49jlDjSHg35suq3ZbuLXckVxUq2DWKK007IbVdFdI', {
    // apiVersion intentionally omitted for Angular compatibility
  });

  app.use(cors());
  app.use(express.json());

  // ✅ Fix for TS7030: Ensure all code paths return
  app.post('/create-payment-intent', async (req: Request, res: ExpressResponse) => {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number') {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
      });

      res.send({ clientSecret: paymentIntent.client_secret });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }

    return; // ✅ Return here to satisfy TS7030
  });

  app.listen(PORT, () => {
    console.log(`✅ Stripe backend running at http://localhost:${PORT}`);
  });
}
