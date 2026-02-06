// Tipos principales del proyecto
export type UserRole = 'admin' | 'cocinero' | 'cliente';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

export interface Recipe {
  id: number;
  chefId: number;
  chefName: string;
  title: string;
  description: string;
  price: number;
  servings: number;
  cookTime: number;
  rating: number;
  ordersCount: number;
  createdAt: string;
}

export interface Order {
  id: number;
  clientId: number;
  clientName: string;
  chefId: number;
  chefName: string;
  recipeId: number;
  recipeName: string;
  amount: number;
  quantity: number;
  status: 'completada' | 'pendiente' | 'cancelada';
  pickupDate: string;
  pickupTime: string;
  rating?: number;
  createdAt: string;
}
