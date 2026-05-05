import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { Product } from './models/product.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ProductFormComponent, ProductListComponent, CategoryListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('productList') productListRef!: ProductListComponent;

  editingProduct: Product | null = null;

  onEditRequested(product: Product): void {
    this.editingProduct = { ...product };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onProductSaved(): void {
    this.editingProduct = null;
    this.productListRef.refresh();
  }

  onCancelled(): void {
    this.editingProduct = null;
  }
}
