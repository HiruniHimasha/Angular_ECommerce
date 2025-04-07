import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
const PORT = 4242;

// ✅ Replace with your real Stripe secret key
const stripe = new Stripe('sk_test_51QcsRtC2AfYWttCeWJnOcYzcv2qHYWXzau5iAVhIsXVDYgcXbWOP1x3pQ49jlDjSHg35suq3ZbuLXckVxUq2DWKK007IbVdFdI', {
  // Omit apiVersion to avoid Angular compiler errors
  // apiVersion: '2023-10-16'
});

app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req: Request, res: Response): Promise<void> => {
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

app.listen(PORT, () => {
  console.log(`✅ Stripe backend running at http://localhost:${PORT}`);
});
