// app.component.ts
import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';

import { HeaderComponent } from './component/header/header.component';
import { CartComponent } from './component/cart/cart.component';
import { ProductComponent } from './component/product/product.component';
import { CommonModule } from '@angular/common';
import { FilterPipe } from './shared/filter.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderComponent,
    CartComponent,
    ProductComponent,
    FilterPipe,
    
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {}
