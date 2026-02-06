import { useState, useEffect } from 'react';
import { getRecipesByChefService, getOrdersByChefService, createRecipeService, deleteRecipeService } from '../services/api';
import type { User, Recipe, Order } from '../types/index';
import './ChefDashboard.css';

interface ChefDashboardProps {
  user: User;
  onLogout: () => void;
}

export function ChefDashboard({ user, onLogout }: ChefDashboardProps) {
  const [activeTab, setActiveTab] = useState<'inicio' | 'recetas' | 'ordenes' | 'ganancias'>('inicio');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRecipeForm, setShowNewRecipeForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    servings: '',
    cookTime: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [recipesData, ordersData] = await Promise.all([
          getRecipesByChefService(user.id),
          getOrdersByChefService(user.id)
        ]);
        setRecipes(recipesData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error loading chef data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRecipe = await createRecipeService(user.id, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        servings: parseInt(formData.servings),
        cookTime: parseInt(formData.cookTime)
      });
      setRecipes([...recipes, newRecipe]);
      setFormData({ title: '', description: '', price: '', servings: '', cookTime: '' });
      setShowNewRecipeForm(false);
    } catch (error) {
      console.error('Error creating recipe:', error);
    }
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    try {
      await deleteRecipeService(recipeId);
      setRecipes(recipes.filter(r => r.id !== recipeId));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const completedOrders = orders.filter(o => o.status === 'completada').length;
  const totalEarnings = orders.filter(o => o.status === 'completada').reduce((sum, o) => sum + o.amount, 0);
  const avgRating = recipes.length > 0 ? (recipes.reduce((sum, r) => sum + r.rating, 0) / recipes.length).toFixed(1) : 0;
  
  // Calcular ganancias por período
  const today = new Date('2026-02-06'); // Fecha fija: 06/02/2026
  
  // Este mes (febrero 2026)
  const thisMonth = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return o.status === 'completada' && 
           orderDate.getMonth() === today.getMonth() && 
           orderDate.getFullYear() === today.getFullYear();
  }).reduce((sum, o) => sum + o.amount, 0);

  // Este año (2026)
  const thisYear = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return o.status === 'completada' && orderDate.getFullYear() === today.getFullYear();
  }).reduce((sum, o) => sum + o.amount, 0);

  // Últimos 7 días
  const last7Days = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const daysAgo = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    return o.status === 'completada' && daysAgo <= 7 && daysAgo >= 0;
  }).reduce((sum, o) => sum + o.amount, 0);

  // Desglose por día para los últimos 7 días
  const earningsByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayTotal = orders
      .filter(o => o.status === 'completada' && o.createdAt === dateStr)
      .reduce((sum, o) => sum + o.amount, 0);
    return { date: dateStr, amount: dayTotal };
  });

  return (
    <div className="chef-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>👨‍🍳 Panel del Cocinero</h1>
          <button onClick={onLogout} className="logout-btn">
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="chef-nav">
        <button
          className={`nav-btn ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          🏠 Inicio
        </button>
        <button
          className={`nav-btn ${activeTab === 'recetas' ? 'active' : ''}`}
          onClick={() => setActiveTab('recetas')}
        >
          📝 Mis Recetas
        </button>
        <button
          className={`nav-btn ${activeTab === 'ordenes' ? 'active' : ''}`}
          onClick={() => setActiveTab('ordenes')}
        >
          📦 Órdenes
        </button>
        <button
          className={`nav-btn ${activeTab === 'ganancias' ? 'active' : ''}`}
          onClick={() => setActiveTab('ganancias')}
        >
          💰 Ganancias
        </button>
      </nav>

      <main className="chef-content">
        {activeTab === 'inicio' && (
          <section className="section">
            <div className="welcome-box">
              <h2>¡Bienvenido, {user.name}!</h2>
              <p>Comparte tus recetas caseras con vecinos que las aman</p>
            </div>

            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-number">{recipes.length}</div>
                <div className="stat-label">Recetas Publicadas</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-number">{avgRating}</div>
                <div className="stat-label">Calificación Promedio</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-number">{completedOrders}</div>
                <div className="stat-label">Órdenes Completadas</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-number">Bs {totalEarnings.toFixed(2)}</div>
                <div className="stat-label">Ganancias Totales</div>
              </div>
            </div>

            <div className="info-box chef-info">
              <h3>Sobre HomeChef</h3>
              <p>
                Como cocinero en HomeChef, eres parte de una revolución en la forma en que compartimos comida. 
                Sin intermediarios, sin comisiones abusivas, solo tu talento culinario conectando directamente 
                con vecinos que valoran la autenticidad y la economía.
              </p>
              <ul>
                <li>✅ Sin costos de local comercial</li>
                <li>✅ Retiro en mano (sin riesgos de entrega)</li>
                <li>✅ Comisión justa del 6.7%</li>
                <li>✅ Comunidad que valora tu trabajo</li>
              </ul>
            </div>
          </section>
        )}

        {activeTab === 'recetas' && (
          <section className="section">
            <div className="section-header">
              <h2>Mis Recetas</h2>
              <button className="btn-primary" onClick={() => setShowNewRecipeForm(!showNewRecipeForm)}>
                + Nueva Receta
              </button>
            </div>

            {showNewRecipeForm && (
              <form onSubmit={handleCreateRecipe} className="new-recipe-form">
                <h3>Crear Nueva Receta</h3>
                <input
                  type="text"
                  placeholder="Nombre de la receta"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Descripción"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="12"
                  max="25"
                  placeholder="Precio (Bs 12-25)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Porciones"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  required
                />
                <input
                  type="number"
                  min="5"
                  placeholder="Tiempo de cocción (min)"
                  value={formData.cookTime}
                  onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                  required
                />
                <div className="form-actions">
                  <button type="submit" className="btn-success">Crear Receta</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowNewRecipeForm(false)}>Cancelar</button>
                </div>
              </form>
            )}

            {loading ? (
              <p>Cargando recetas...</p>
            ) : (
              <div className="recipes-grid">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="recipe-item">
                    <div className="recipe-image">🍽️</div>
                    <h3>{recipe.title}</h3>
                    <p className="recipe-desc">{recipe.description}</p>
                    <div className="recipe-price">Bs {recipe.price.toFixed(2)}</div>
                    <div className="recipe-meta">
                      <span>⭐ {recipe.rating.toFixed(1)}</span>
                      <span>📦 {recipe.ordersCount} órdenes</span>
                    </div>
                    <div className="recipe-actions">
                      <button className="btn-small">Editar</button>
                      <button className="btn-small danger" onClick={() => handleDeleteRecipe(recipe.id)}>Eliminar</button>
                    </div>
                  </div>
                ))}
                <div className="recipe-item new-recipe" onClick={() => setShowNewRecipeForm(true)}>
                  <div className="recipe-image">➕</div>
                  <p>Crear Nueva Receta</p>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'ordenes' && (
          <section className="section">
            <h2>Mis Órdenes</h2>
            {loading ? (
              <p>Cargando órdenes...</p>
            ) : orders.length === 0 ? (
              <p className="empty-state">No tienes órdenes aún</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className={`order-item status-${order.status}`}>
                    <div className="order-header">
                      <span className="order-id">#{order.id}</span>
                      <span className="status-badge">{order.status === 'completada' ? '✓ Completada' : '⏳ Pendiente'}</span>
                    </div>
                    <div className="order-body">
                      <p><strong>Cliente:</strong> {order.clientName}</p>
                      <p><strong>Platillo:</strong> {order.recipeName}</p>
                      <p><strong>Cantidad:</strong> {order.quantity} porciones</p>
                      <p><strong>Monto Total:</strong> Bs {order.amount.toFixed(2)}</p>
                      <p><strong>Fecha de Retiro:</strong> {order.pickupDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'ganancias' && (
          <section className="section">
            <h2>💰 Tus Ganancias</h2>
            
            {/* Cards principales de ganancias */}
            <div className="earnings-summary">
              <div className="earning-card highlight">
                <div className="earning-icon">📈</div>
                <div className="earning-label">Últimos 7 Días</div>
                <div className="earning-amount">Bs {last7Days.toFixed(2)}</div>
                <div className="earning-progress"></div>
              </div>
              <div className="earning-card">
                <div className="earning-icon">📅</div>
                <div className="earning-label">Este Mes</div>
                <div className="earning-amount">Bs {thisMonth.toFixed(2)}</div>
              </div>
              <div className="earning-card">
                <div className="earning-icon">📊</div>
                <div className="earning-label">Este Año 2026</div>
                <div className="earning-amount">Bs {thisYear.toFixed(2)}</div>
              </div>
              <div className="earning-card">
                <div className="earning-icon">⭐</div>
                <div className="earning-label">Total Historico</div>
                <div className="earning-amount">Bs {totalEarnings.toFixed(2)}</div>
              </div>
            </div>

            {/* Gráfico de barras mejorado */}
            <div className="earnings-detail">
              <h3>📊 Desglose por Día (Últimos 7 Días)</h3>
              <div className="earnings-chart">
                {earningsByDay.map((day, idx) => {
                  const maxAmount = Math.max(...earningsByDay.map(d => d.amount), 1);
                  const barHeight = day.amount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  const dayName = new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' });
                  return (
                    <div key={idx} className="earnings-bar">
                      <div className="bar-container">
                        <div 
                          className="bar" 
                          style={{ height: `${barHeight}%` }}
                          title={`${dayName} - Bs ${day.amount.toFixed(2)}`}
                        />
                      </div>
                      <div className="bar-label">{dayName}</div>
                      <div className="bar-date">{day.date.split('-')[2]}</div>
                      <div className="bar-value">Bs {day.amount > 0 ? day.amount.toFixed(0) : '0'}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estadísticas detalladas */}
            <div className="earnings-stats">
              <div className="stat-item">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <div className="stat-label">Órdenes Completadas</div>
                  <div className="stat-value">{completedOrders}</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">💵</div>
                <div className="stat-content">
                  <div className="stat-label">Promedio por Orden</div>
                  <div className="stat-value">Bs {completedOrders > 0 ? (totalEarnings / completedOrders).toFixed(2) : '0.00'}</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <div className="stat-label">Calificación Promedio</div>
                  <div className="stat-value">{avgRating} / 5.0</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">🍳</div>
                <div className="stat-content">
                  <div className="stat-label">Recetas Activas</div>
                  <div className="stat-value">{recipes.length}</div>
                </div>
              </div>
            </div>

            {/* Últimas órdenes completadas */}
            {completedOrders > 0 && (
              <div className="recent-orders">
                <h3>📋 Últimas Órdenes Completadas</h3>
                <div className="orders-list">
                  {orders
                    .filter(o => o.status === 'completada')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map(order => (
                      <div key={order.id} className="order-summary">
                        <div className="order-summary-left">
                          <div className="order-recipe">{order.recipeName}</div>
                          <div className="order-client">{order.clientName}</div>
                        </div>
                        <div className="order-summary-right">
                          <div className="order-amount">Bs {order.amount.toFixed(2)}</div>
                          <div className="order-rating">
                            {order.rating ? `⭐${order.rating}` : 'Sin calificar'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
