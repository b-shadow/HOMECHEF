// Servicios simulados que actúan como backend
import { MOCK_USERS, MOCK_RECIPES, MOCK_ORDERS } from './mockData';
import type { User, LoginResponse, Recipe, Order } from '../types/index';

// Simulamos un pequeño delay para simular latencia de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ===== LOGIN =====
export const loginService = async (email: string, password: string): Promise<LoginResponse> => {
  await delay(500);
  
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword as User,
      message: 'Login exitoso'
    };
  }
  
  return {
    success: false,
    error: 'Email o contraseña incorrectos'
  };
};

// ===== USUARIOS =====
export const getAllUsersService = async (): Promise<User[]> => {
  await delay(300);
  return MOCK_USERS.map(u => {
    const { password: _, ...userWithoutPassword } = u;
    return userWithoutPassword as User;
  });
};

// ===== RECETAS =====
export const getRecipesByChefService = async (chefId: number): Promise<Recipe[]> => {
  await delay(300);
  return MOCK_RECIPES.filter(r => r.chefId === chefId);
};

export const getAllRecipesService = async (): Promise<Recipe[]> => {
  await delay(300);
  return MOCK_RECIPES;
};

export const createRecipeService = async (chefId: number, recipe: Omit<Recipe, 'id' | 'chefId' | 'chefName' | 'createdAt' | 'ordersCount' | 'rating'>): Promise<Recipe> => {
  await delay(500);
  const chef = MOCK_USERS.find(u => u.id === chefId);
  if (!chef) throw new Error('Chef not found');
  
  const newRecipe: Recipe = {
    ...recipe,
    id: Math.max(...MOCK_RECIPES.map(r => r.id), 0) + 1,
    chefId,
    chefName: chef.name,
    ordersCount: 0,
    rating: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  MOCK_RECIPES.push(newRecipe);
  return newRecipe;
};

export const deleteRecipeService = async (recipeId: number): Promise<void> => {
  await delay(300);
  const index = MOCK_RECIPES.findIndex(r => r.id === recipeId);
  if (index !== -1) {
    MOCK_RECIPES.splice(index, 1);
  }
};

// ===== ÓRDENES =====
export const getOrdersByClientService = async (clientId: number): Promise<Order[]> => {
  await delay(300);
  return MOCK_ORDERS.filter(o => o.clientId === clientId);
};

export const getOrdersByChefService = async (chefId: number): Promise<Order[]> => {
  await delay(300);
  return MOCK_ORDERS.filter(o => o.chefId === chefId);
};

export const getAllOrdersService = async (): Promise<Order[]> => {
  await delay(300);
  return MOCK_ORDERS;
};

export const createOrderService = async (clientId: number, recipeId: number, quantity: number, pickupTime: string): Promise<Order> => {
  await delay(500);
  const client = MOCK_USERS.find(u => u.id === clientId);
  const recipe = MOCK_RECIPES.find(r => r.id === recipeId);
  
  if (!client || !recipe) throw new Error('Client or recipe not found');
  
  const newOrder: Order = {
    id: Math.max(...MOCK_ORDERS.map(o => o.id), 0) + 1,
    clientId,
    clientName: client.name,
    chefId: recipe.chefId,
    chefName: recipe.chefName,
    recipeId,
    recipeName: recipe.title,
    amount: recipe.price * quantity,
    quantity,
    status: 'pendiente',
    pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pickupTime: pickupTime,
    rating: undefined,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  MOCK_ORDERS.push(newOrder);
  return newOrder;
};

// ===== ESTADÍSTICAS =====
export const getAdminStatsService = async () => {
  await delay(300);
  
  const totalUsers = MOCK_USERS.length;
  const totalChefs = MOCK_USERS.filter(u => u.role === 'cocinero').length;
  const totalClients = MOCK_USERS.filter(u => u.role === 'cliente').length;
  const totalOrders = MOCK_ORDERS.length;
  const completedOrders = MOCK_ORDERS.filter(o => o.status === 'completada').length;
  const totalRevenue = MOCK_ORDERS.reduce((sum, o) => sum + o.amount, 0);
  const avgRating = (MOCK_RECIPES.reduce((sum, r) => sum + r.rating, 0) / MOCK_RECIPES.length).toFixed(2);
  
  // Órdenes por día (últimos 7 días)
  const ordersPerDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const count = MOCK_ORDERS.filter(o => o.createdAt === dateStr).length;
    return { date: dateStr.split('-')[2], count };
  });
  
  // Ingresos por chef
  const revenueByChef = Array.from({ length: totalChefs }, (_, i) => {
    const chefId = 3 + i;
    const chef = MOCK_USERS.find(u => u.id === chefId);
    const revenue = MOCK_ORDERS.filter(o => o.chefId === chefId).reduce((sum, o) => sum + o.amount, 0);
    return { name: chef?.name || `Chef ${i + 1}`, revenue };
  });
  
  return {
    totalUsers,
    totalChefs,
    totalClients,
    totalOrders,
    completedOrders,
    totalRevenue,
    avgRating,
    ordersPerDay,
    revenueByChef
  };
};
