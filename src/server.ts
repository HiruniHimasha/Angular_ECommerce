import express, { Request, Response as ExpressResponse } from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { CommonEngine } from '@angular/ssr/node';  // Netlify SSR dependency
import { render } from '@netlify/angular-runtime/common-engine.mjs'; // CommonEngine render function

const app = express();
const PORT = 4242;

// ✅ Fix for Netlify: Use the CommonEngine for SSR
const commonEngine = new CommonEngine();

if (process.env['NETLIFY'] !== 'true') {
  // ✅ Set up Stripe outside Netlify
  const stripe = new Stripe('sk_test_51QcsRtC2AfYWttCeWJnOcYzcv2qHYWXzau5iAVhIsXVDYgcXbWOP1x3pQ49jlDjSHg35suq3ZbuLXckVxUq2DWKK007IbVdFdI', {
    // Remove the apiVersion to avoid the TypeScript error
    // apiVersion: '2023-10-16',
  });

  app.use(cors());
  app.use(express.json());

  // Stripe Payment Intent API
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

    return;
  });

  app.listen(PORT, () => {
    console.log(`✅ Stripe backend running at http://localhost:${PORT}`);
  });
}

// Netlify SSR - CommonEngine integration for Angular SSR
export async function netlifyCommonEngineHandler(request: Request, context: any): Promise<ExpressResponse> {
  const result = await render(commonEngine);
  
  // Cast the result to `unknown` first, then to `ExpressResponse`
  return result as unknown as ExpressResponse; // Double cast to ensure compatibility
}

// Handle SSR request
app.all('*', (req, res) => {
  netlifyCommonEngineHandler(req, res)
    .then((result) => res.send(result))
    .catch((err) => res.status(500).send({ error: err.message }));
});
