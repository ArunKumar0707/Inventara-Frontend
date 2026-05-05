import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() editProduct: Product | null = null;
  @Output() productSaved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  productForm!: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editProduct'] && this.productForm) {
      if (this.editProduct) {
        this.productForm.patchValue({
          name: this.editProduct.name,
          price: this.editProduct.price,
          quantity: this.editProduct.quantity,
          categoryId: this.editProduct.categoryId
        });
      } else {
        this.productForm.reset();
      }
    }
  }

  private buildForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      price: [null, [Validators.required, Validators.min(0)]],
      quantity: [null, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required]
    });
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories = cats,
      error: () => this.errorMessage = 'Failed to load categories'
    });
  }

  get isEditMode(): boolean {
    return !!this.editProduct;
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const product: Product = {
      ...this.productForm.value,
      categoryId: Number(this.productForm.value.categoryId)
    };

    const operation = this.isEditMode
      ? this.productService.update(this.editProduct!.id!, product)
      : this.productService.create(product);

    operation.subscribe({
      next: () => {
        this.isLoading = false;
        this.productForm.reset();
        this.productSaved.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Failed to save product. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.productForm.reset();
    this.cancelled.emit();
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.productForm.get(field);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }
}
