import type { User, Recipe, Order } from '../types/index';

// ===== USUARIOS =====
export const MOCK_USERS: User[] = [
  // Admins
  { id: 1, name: 'Admin Sistema', email: 'admin@homechef.com', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Admin Support', email: 'support@homechef.com', password: 'admin123', role: 'admin' },
  
  // Chefs (8)
  { id: 3, name: 'Juan Chef', email: 'chef1@homechef.com', password: 'chef123', role: 'cocinero' },
  { id: 4, name: 'María García', email: 'chef2@homechef.com', password: 'chef123', role: 'cocinero' },
  { id: 5, name: 'Carlos López', email: 'chef3@homechef.com', password: 'chef123', role: 'cocinero' },
  { id: 6, name: 'Ana Martínez', email: 'chef4@homechef.com', password: 'chef123', role: 'cocinero' },
  { id: 7, name: 'Pedro Rodríguez', email: 'chef5@homechef.com', password: 'chef123', role: 'cocinero' },
  { id: 8, name: 'Lucía Fernández', email: 'chef6@homechef.com', password: 'chef123', role: 'cocinero' },
  { id: 9, name: 'Miguel Díaz', email: 'chef7@homechef.com', password: 'chef123', role: 'cocinero' },
  { id: 10, name: 'Sofía Ruiz', email: 'chef8@homechef.com', password: 'chef123', role: 'cocinero' },
  
  // Clientes (50)
  ...Array.from({ length: 50 }, (_, i) => ({
    id: 11 + i,
    name: `Cliente ${i + 1}`,
    email: `cliente${i + 1}@homechef.com`,
    password: 'cliente123',
    role: 'cliente' as const
  }))
];

// ===== RECETAS =====
const recipeTemplates = [
  { title: 'Pasta Carbonara', description: 'Auténtica receta italiana', price: 18 },
  { title: 'Salmón a la Mantequilla', description: 'Fresco con limón y hierbas', price: 22 },
  { title: 'Risotto de Champiñones', description: 'Cremoso con parmesano', price: 15 },
  { title: 'Milanesas Caseras', description: 'Con papas y ensalada', price: 14 },
  { title: 'Pollo al Horno', description: 'Marinado con especias', price: 16 },
];

export let MOCK_RECIPES: Recipe[] = [];

// Generar recetas para cada chef (5 por chef)
for (let chefIndex = 0; chefIndex < 8; chefIndex++) {
  const chefId = 3 + chefIndex;
  const chef = MOCK_USERS.find(u => u.id === chefId)!;
  
  for (let i = 0; i < 5; i++) {
    const template = recipeTemplates[i];
    MOCK_RECIPES.push({
      id: chefIndex * 5 + i + 1,
      chefId,
      chefName: chef.name,
      title: `${template.title} - ${chef.name}`,
      description: template.description,
      price: template.price,
      servings: Math.floor(Math.random() * 3) + 2,
      cookTime: Math.floor(Math.random() * 30) + 15,
      rating: Math.floor(Math.random() * 5) + 1, // 1-5 estrellas variadas
      ordersCount: Math.floor(Math.random() * 50) + 5,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
}

// ===== ÓRDENES =====
export let MOCK_ORDERS: Order[] = [];

// Fecha actual: 06/02/2026
const TODAY = new Date('2026-02-06');

// Generar órdenes para cada cliente (1-5 por cliente)
let orderId = 1;
for (let clientIndex = 0; clientIndex < 50; clientIndex++) {
  const clientId = 11 + clientIndex;
  const client = MOCK_USERS.find(u => u.id === clientId)!;
  const ordersCount = Math.floor(Math.random() * 5) + 1; // 1-5 órdenes
  
  for (let i = 0; i < ordersCount; i++) {
    const recipe = MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const statuses: Array<'completada' | 'pendiente' | 'cancelada'> = ['completada', 'completada', 'completada', 'pendiente', 'cancelada'];
    const hour = Math.floor(Math.random() * 15) + 9; // Entre 9:00 y 23:00
    const minute = Math.floor(Math.random() * 60);
    
    // Crear fecha de creación en los últimos 30 días desde HOY
    const daysAgo = Math.floor(Math.random() * 30);
    const createdDate = new Date(TODAY);
    createdDate.setDate(createdDate.getDate() - daysAgo);
    
    // Crear fecha de recogida entre hoy y 7 días en el futuro
    const daysAhead = Math.floor(Math.random() * 7);
    const pickupDate = new Date(TODAY);
    pickupDate.setDate(pickupDate.getDate() + daysAhead);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    // Solo órdenes completadas pueden tener rating (1-5 variado)
    const rating = status === 'completada' ? Math.floor(Math.random() * 5) + 1 : undefined;
    
    MOCK_ORDERS.push({
      id: orderId++,
      clientId,
      clientName: client.name,
      chefId: recipe.chefId,
      chefName: recipe.chefName,
      recipeId: recipe.id,
      recipeName: recipe.title,
      amount: recipe.price * quantity,
      quantity,
      status,
      pickupDate: pickupDate.toISOString().split('T')[0],
      pickupTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      rating,
      createdAt: createdDate.toISOString().split('T')[0]
    });
  }
}

