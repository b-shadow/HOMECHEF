import { useState, useEffect } from 'react';
import { getAllRecipesService, getOrdersByClientService, createOrderService } from '../services/api';
import type { User, Recipe, Order } from '../types/index';
import './ClientDashboard.css';

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
}

interface PickupTimeForm {
  recipeId: number;
  show: boolean;
  time: string;
  quantity: number;
}

export function ClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'inicio' | 'buscar' | 'ordenes' | 'favoritos'>('inicio');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [pickupTimeForm, setPickupTimeForm] = useState<PickupTimeForm>({ recipeId: 0, show: false, time: '18:00', quantity: 1 });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [recipesData, ordersData] = await Promise.all([
          getAllRecipesService(),
          getOrdersByClientService(user.id)
        ]);
        setRecipes(recipesData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error loading client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  const handleOrderRecipe = (recipeId: number) => {
    setPickupTimeForm({ recipeId, show: true, time: '18:00', quantity: 1 });
  };

  const handleConfirmOrder = async () => {
    try {
      const newOrder = await createOrderService(user.id, pickupTimeForm.recipeId, pickupTimeForm.quantity, pickupTimeForm.time);
      setOrders([...orders, newOrder]);
      setPickupTimeForm({ recipeId: 0, show: false, time: '18:00', quantity: 1 });
      alert('¡Orden creada exitosamente!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear la orden');
    }
  };

  const toggleFavorite = (recipeId: number) => {
    setFavorites(prev =>
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
  };

  return (
    <div className="client-dashboard">
      {/* Modal para seleccionar hora de recogida y cantidad */}
      {pickupTimeForm.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de tu Orden</h3>
            
            <div className="form-group">
              <label>¿Cuántas porciones deseas?</label>
              <div className="quantity-selector">
                <button 
                  onClick={() => setPickupTimeForm({ ...pickupTimeForm, quantity: Math.max(1, pickupTimeForm.quantity - 1) })}
                  className="qty-btn"
                >
                  −
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={pickupTimeForm.quantity}
                  onChange={(e) => setPickupTimeForm({ ...pickupTimeForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="qty-input"
                />
                <button 
                  onClick={() => setPickupTimeForm({ ...pickupTimeForm, quantity: Math.min(10, pickupTimeForm.quantity + 1) })}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>¿A qué hora deseas recoger tu orden?</label>
              <input
                type="time"
                value={pickupTimeForm.time}
                onChange={(e) => setPickupTimeForm({ ...pickupTimeForm, time: e.target.value })}
                className="time-input"
              />
            </div>

            <div className="modal-actions">
              <button className="btn-success" onClick={handleConfirmOrder}>Confirmar Orden</button>
              <button className="btn-secondary" onClick={() => setPickupTimeForm({ ...pickupTimeForm, show: false })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-content">
          <h1>🛒 Panel del Cliente</h1>
          <button onClick={onLogout} className="logout-btn">
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="client-nav">
        <button
          className={`nav-btn ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          🏠 Inicio
        </button>
        <button
          className={`nav-btn ${activeTab === 'buscar' ? 'active' : ''}`}
          onClick={() => setActiveTab('buscar')}
        >
          🔍 Buscar Comida
        </button>
        <button
          className={`nav-btn ${activeTab === 'ordenes' ? 'active' : ''}`}
          onClick={() => setActiveTab('ordenes')}
        >
          📦 Mis Órdenes
        </button>
        <button
          className={`nav-btn ${activeTab === 'favoritos' ? 'active' : ''}`}
          onClick={() => setActiveTab('favoritos')}
        >
          ❤️ Favoritos
        </button>
      </nav>

      <main className="client-content">
        {activeTab === 'inicio' && (
          <section className="section">
            <div className="welcome-box client-welcome">
              <h2>¡Hola, {user.name}!</h2>
              <p>Descubre comida casera a la vuelta de tu casa, económica y auténtica</p>
            </div>

            <div className="value-proposition">
              <div className="value-item">
                <div className="value-icon">💰</div>
                <h3>25% más barato</h3>
                <p>Que delivery tradicional. Sin moto, sin intermediarios.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🏡</div>
                <h3>Comida de Hogar</h3>
                <p>Hecha por vecinos que aman cocinar. Auténtica y casera.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🤝</div>
                <h3>Apoyas Tu Barrio</h3>
                <p>Cada compra activa la economía de tu manzana.</p>
              </div>
            </div>

            <div className="quick-actions">
              <button className="btn-large">🔍 Explorar Comidas Disponibles</button>
              <button className="btn-large secondary">❤️ Ver Mis Favoritos</button>
            </div>
          </section>
        )}

        {activeTab === 'buscar' && (
          <section className="section">
            <div className="search-header">
              <h2>Buscar Comida</h2>
              <input
                type="text"
                placeholder="¿Qué te apetece hoy? (ej: pasta, ensalada...)"
                className="search-input"
              />
            </div>

            {loading ? (
              <p>Cargando recetas disponibles...</p>
            ) : (
              <div className="meals-grid">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="meal-card">
                    <div className="meal-image">🍽️</div>
                    <h3>{recipe.title}</h3>
                    <p className="chef-name">Por {recipe.chefName}</p>
                    <p className="description">{recipe.description}, {recipe.servings} porciones</p>
                    <div className="meal-info">
                      <span className="price">Bs {recipe.price.toFixed(2)}</span>
                      <span className="rating">⭐ {recipe.rating.toFixed(1)}</span>
                    </div>
                    <div className="meal-meta">
                      <span className="available">✓ Disponible</span>
                      <span className={`favorite-btn ${favorites.includes(recipe.id) ? 'active' : ''}`} onClick={() => toggleFavorite(recipe.id)}>
                        {favorites.includes(recipe.id) ? '❤️' : '🤍'}
                      </span>
                    </div>
                    <button className="btn-order" onClick={() => handleOrderRecipe(recipe.id)}>
                      Ordenar Ahora
                    </button>
                  </div>
                ))}
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
              <p className="empty-state">No tienes órdenes aún. ¡Explora y haz tu primera orden!</p>
            ) : (
              <div className="orders-timeline">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className={`order-status-badge ${order.status}`}>
                      {order.status === 'completada' && '✓ Completada'}
                      {order.status === 'pendiente' && '⏳ Pendiente'}
                      {order.status === 'cancelada' && '❌ Cancelada'}
                    </div>
                    <div className="order-info">
                      <h4>{order.recipeName}</h4>
                      <p><strong>Cocinero:</strong> {order.chefName}</p>
                      <p><strong>Monto:</strong> Bs {order.amount.toFixed(2)} | <strong>Retiro:</strong> {order.pickupDate} a las {order.pickupTime}</p>
                      <p><strong>Cantidad:</strong> {order.quantity} porciones</p>
                    </div>
                    {order.status === 'completada' && (
                      <div className="order-rating">
                        {order.rating ? (
                          <div className="rating-display">
                            <p>Tu calificación: {'⭐'.repeat(order.rating)}</p>
                          </div>
                        ) : (
                          <button className="btn-rating">⭐ Calificar esta Orden</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'favoritos' && (
          <section className="section">
            <h2>Mis Favoritos</h2>
            {favorites.length === 0 ? (
              <p className="empty-state">No tienes recetas favoritas aún.</p>
            ) : (
              <div className="favorites-list">
                {recipes.filter(r => favorites.includes(r.id)).map((recipe) => (
                  <div key={recipe.id} className="favorite-item">
                    <div className="recipe-image">🍽️</div>
                    <div className="recipe-info">
                      <h3>{recipe.title}</h3>
                      <p><strong>Chef:</strong> {recipe.chefName}</p>
                      <p><strong>Descripción:</strong> {recipe.description}</p>
                      <p><strong>Precio:</strong> Bs {recipe.price.toFixed(2)} | <strong>Rating:</strong> ⭐ {recipe.rating.toFixed(1)}</p>
                    </div>
                    <div className="favorite-actions">
                      <button className="btn-order" onClick={() => handleOrderRecipe(recipe.id)}>Ordenar</button>
                      <button className="btn-secondary" onClick={() => toggleFavorite(recipe.id)}>Eliminar de Favoritos</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
