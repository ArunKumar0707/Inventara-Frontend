export interface Product {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  categoryId: number | null;
  categoryName?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
