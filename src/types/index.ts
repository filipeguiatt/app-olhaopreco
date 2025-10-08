export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  url?: string;
  discount?: number;
}

export interface Store {
  id: string;
  name: string;
  logo?: string;
  color: string;
  products: Product[];
}

export interface FavoriteProduct extends Product {
  storeId: string;
  storeName: string;
  addedAt: Date;
}