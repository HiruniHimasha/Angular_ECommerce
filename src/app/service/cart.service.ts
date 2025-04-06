import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public cartItemList: any[] = [];
  public productList = new BehaviorSubject<any[]>([]);
  public search = new BehaviorSubject<string>("");

  constructor() {
    // Only try to access localStorage in the browser
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        this.cartItemList = JSON.parse(savedCart);
        this.productList.next(this.cartItemList);
      }
    }
  }

  getProduct() {
    return this.productList.asObservable();
  }

  setProduct(product: any[]) {
    this.cartItemList.push(...product);
    this.updateCart();
  }

  addtoCart(product: any) {
    // Calculate total price
    product.total = product.price * product.quantity;
    this.cartItemList.push(product);
    this.updateCart();
  }

  getTotalPrice(): number {
    return this.cartItemList.reduce((acc: number, item: any) => acc + item.total, 0);
  }

  removeCartItem(product: any) {
    this.cartItemList = this.cartItemList.filter((a: any) => a.id !== product.id);
    this.updateCart();
  }

  removeAllCart() {
    this.cartItemList = [];
    this.updateCart();
  }

  private updateCart() {
    this.productList.next(this.cartItemList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(this.cartItemList));
    }
  }
}
