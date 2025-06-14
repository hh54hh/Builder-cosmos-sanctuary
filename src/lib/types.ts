export interface Member {
  id: string;
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  courses: string[];
  dietPlans: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  createdAt: Date;
}

export interface DietPlan {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number; // per unit
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  buyerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  loginTime?: Date;
}
