import { CommonModule} from '@angular/common';
import { Component, OnInit} from '@angular/core';
import { CartService } from '../../service/cart.service';


@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent  implements OnInit{

  public product : any[] = [];
  public grandTotal !: number;
  constructor(private cartService:CartService){}

  ngOnInit(): void {
    this.cartService.getProduct()
    .subscribe(res=>{
      this.product = res;
      this.grandTotal = this.cartService.getTotalPrice();
      console.log("Current cart:", this.product);
    })
  }
  

  removeItem(item: any){
    this.cartService.removeCartItem(item);
  }
  
  emptyCart(){
    this.cartService.removeAllCart();
  }
  }


