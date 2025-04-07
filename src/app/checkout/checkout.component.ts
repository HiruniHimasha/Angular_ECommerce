import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { CartService } from '../service/cart.service';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Import FormsModule

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],  // Add FormsModule here
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, AfterViewInit {

  public cartItems: any[] = [];
  public grandTotal: number = 0;
  public isLoading = false;
  public paymentError = '';
  public paymentSuccess = false;

  public userDetails = {
    name: '',
    address: '',
    city: '',
    postalCode: ''
  };

  private stripePromise = loadStripe('pk_test_51QcsRtC2AfYWttCeRgLb3d7gaa2T5pjSuFEVGzKXzoGlBnRSCx9UpcMjWuuYHzBm4tGRBjiJo7RqhjwZtuKeAjQf00kfTjCZnY'); 
  private elements!: StripeElements;
  private card!: StripeCardElement;

  @ViewChild('cardElement') cardElement!: ElementRef;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  ngAfterViewInit(): void {
    this.stripePromise.then(stripe => {
      if (stripe) {
        this.elements = stripe.elements();
        this.card = this.elements.create('card');
        this.card.mount(this.cardElement.nativeElement);
      }
    });
  }

  loadCart(): void {
    this.cartService.getProduct().subscribe(res => {
      this.cartItems = res;
      this.grandTotal = this.cartService.getTotalPrice();
    });
  }

  async handlePayment(): Promise<void> {
    const stripe = await this.stripePromise;

    if (!stripe) {
      console.error('Stripe.js failed to load.');
      return;
    }

    this.isLoading = true;
    this.paymentError = '';

    try {
      const { clientSecret } = await this.createPaymentIntent();

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.userDetails.name,
            address: {
              line1: this.userDetails.address,
              postal_code: this.userDetails.postalCode,
              city: this.userDetails.city,
            }
          },
        },
      });

      this.isLoading = false;

      if (error) {
        console.error('Stripe payment error:', error);
        this.paymentError = error.message || 'Payment failed';
      } else if (paymentIntent?.status === 'succeeded') {
        this.paymentSuccess = true;
        this.cartService.removeAllCart();
        this.cartItems = [];
        this.grandTotal = 0;
      }
    } catch (err: any) {
      this.isLoading = false;
      console.error('Unhandled error during payment:', err);
      this.paymentError = err.message || 'Something went wrong. Please try again.';
    }
  }

  async createPaymentIntent(): Promise<{ clientSecret: string }> {
    console.log('Creating PaymentIntent for total:', this.grandTotal); // Debug log
  
    try {
      const response = await fetch('http://localhost:4242/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(this.grandTotal * 100) }) // amount in cents
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error('Server responded with error:', error);
        throw new Error(`Server Error: ${error.error || 'Unknown error'}`);
      }
  
      const data = await response.json();
      console.log('Received clientSecret:', data.clientSecret);
      return { clientSecret: data.clientSecret };
    } catch (error: any) {
      console.error('Error in createPaymentIntent:', error);
      throw error;
    }
  }
}
