export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  category: string;
  stock: { [sizeColor: string]: number };
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface StockEntry {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}
