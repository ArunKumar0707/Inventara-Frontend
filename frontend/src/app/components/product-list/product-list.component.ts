import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, PagedResponse } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  @Output() editRequested = new EventEmitter<Product>();

  products: Product[] = [];
  categories: Category[] = [];
  pagedData: PagedResponse<Product> | null = null;

  selectedCategoryId: number | null = null;
  currentPage = 0;
  pageSize = 8;
  isLoading = false;
  deleteConfirmId: number | null = null;
  successMessage = '';
  errorMessage = '';
  sortBy = 'id';
  sortDir = 'asc';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories = cats
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    if (this.selectedCategoryId) {
      this.productService.getByCategory(this.selectedCategoryId).subscribe({
        next: (products) => {
          this.products = products;
          this.pagedData = null;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load products';
          this.isLoading = false;
        }
      });
    } else {
      this.productService.getAll(this.currentPage, this.pageSize, this.sortBy, this.sortDir).subscribe({
        next: (data) => {
          this.pagedData = data;
          this.products = data.content;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load products';
          this.isLoading = false;
        }
      });
    }
  }

  onCategoryFilter(categoryId: string): void {
    this.selectedCategoryId = categoryId ? Number(categoryId) : null;
    this.currentPage = 0;
    this.loadProducts();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDir = 'asc';
    }
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onEdit(product: Product): void {
    this.editRequested.emit(product);
  }

  onDeleteConfirm(id: number): void {
    this.deleteConfirmId = id;
  }

  onDeleteCancel(): void {
    this.deleteConfirmId = null;
  }

  onDeleteConfirmed(): void {
    if (!this.deleteConfirmId) return;
    const id = this.deleteConfirmId;
    this.deleteConfirmId = null;

    this.productService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Product deleted successfully');
        if (this.products.length === 1 && this.currentPage > 0) {
          this.currentPage--;
        }
        this.loadProducts();
      },
      error: () => this.showError('Failed to delete product')
    });
  }

  public refresh(): void {
    this.loadProducts();
    this.showSuccess('Product saved successfully!');
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 4000);
  }

  get totalPages(): number {
    return this.pagedData?.totalPages ?? 1;
  }

  get pageRange(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  getStockClass(quantity: number): string {
    if (quantity === 0) return 'stock-out';
    if (quantity <= 10) return 'stock-low';
    return 'stock-ok';
  }

  getStockLabel(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
  }
}
