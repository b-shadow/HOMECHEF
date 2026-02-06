import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { getAdminStatsService, getAllUsersService, getAllOrdersService } from '../services/api';
import type { User, Order } from '../types/index';
import './AdminDashboard.css';

interface Stats {
  totalUsers: number;
  totalChefs: number;
  totalClients: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  avgRating: string;
  ordersPerDay: { date: string; count: number }[];
  revenueByChef: { name: string; revenue: number }[];
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'estadisticas' | 'usuarios' | 'ordenes'>('estadisticas');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, usersData, ordersData] = await Promise.all([
          getAdminStatsService(),
          getAllUsersService(),
          getAllOrdersService()
        ]);
        setStats(statsData);
        setUsers(usersData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🍳 HomeChef - Panel Administrativo</h1>
          <button onClick={onLogout} className="logout-btn">
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="admin-nav">
        <button
          className={`nav-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setActiveTab('estadisticas')}
        >
          📊 Estadísticas
        </button>
        <button
          className={`nav-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          👥 Usuarios
        </button>
        <button
          className={`nav-btn ${activeTab === 'ordenes' ? 'active' : ''}`}
          onClick={() => setActiveTab('ordenes')}
        >
          📦 Órdenes
        </button>
      </nav>

      <main className="admin-content">
        {loading ? (
          <div className="loading-state">
            <p>Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* TAB: ESTADÍSTICAS */}
            {activeTab === 'estadisticas' && stats && (
              <section className="section">
                <h2>Estadísticas de la Plataforma</h2>

                {/* KPI Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">{stats.totalUsers}</div>
                    <div className="stat-label">Usuarios Totales</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{stats.totalChefs}</div>
                    <div className="stat-label">Cocineros</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{stats.totalClients}</div>
                    <div className="stat-label">Clientes</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{stats.totalOrders}</div>
                    <div className="stat-label">Órdenes Totales</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{stats.completedOrders}</div>
                    <div className="stat-label">Completadas</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">${stats.totalRevenue.toFixed(0)}</div>
                    <div className="stat-label">Ingresos Totales</div>
                  </div>
                </div>

                {/* Charts */}
                <div className="charts-container">
                  {/* Orders per Day */}
                  <div className="chart-card">
                    <h3>📈 Órdenes por Día (últimos 7 días)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.ordersPerDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 5 }}
                          name="Órdenes"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Revenue by Chef */}
                  <div className="chart-card">
                    <h3>💰 Ingresos por Cocinero</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.revenueByChef}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* User Distribution */}
                  <div className="chart-card">
                    <h3>👥 Distribución de Usuarios</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Clientes', value: stats.totalClients },
                            { name: 'Cocineros', value: stats.totalChefs },
                            { name: 'Admins', value: stats.totalUsers - stats.totalChefs - stats.totalClients }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[0, 1, 2].map((index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Order Status */}
                  <div className="chart-card">
                    <h3>📦 Estado de Órdenes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completadas', value: stats.completedOrders },
                            { name: 'Pendientes', value: stats.totalOrders - stats.completedOrders }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            )}

            {/* TAB: USUARIOS */}
            {activeTab === 'usuarios' && (
              <section className="section">
                <h2>Gestión de Usuarios</h2>
                <div className="users-table">
                  <div className="table-header">
                    <div className="col-id">ID</div>
                    <div className="col-name">Nombre</div>
                    <div className="col-email">Email</div>
                    <div className="col-role">Rol</div>
                    <div className="col-actions">Acciones</div>
                  </div>
                  {users.map((u) => (
                    <div key={u.id} className="table-row">
                      <div className="col-id">#{u.id}</div>
                      <div className="col-name">{u.name}</div>
                      <div className="col-email">{u.email}</div>
                      <div className="col-role">
                        <span className={`role-badge ${u.role}`}>
                          {u.role === 'admin' && '🔐 Admin'}
                          {u.role === 'cocinero' && '👨‍🍳 Cocinero'}
                          {u.role === 'cliente' && '👨‍💼 Cliente'}
                        </span>
                      </div>
                      <div className="col-actions">
                        <button className="action-btn view">Ver</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TAB: ÓRDENES */}
            {activeTab === 'ordenes' && (
              <section className="section">
                <h2>Órdenes Recientes</h2>
                <div className="orders-list">
                  {orders.slice(0, 15).map((order) => (
                    <div key={order.id} className="order-item">
                      <div className="order-info">
                        <div className="order-id">#{order.id}</div>
                        <div className="order-details">
                          <p><strong>De:</strong> {order.chefName} → <strong>Para:</strong> {order.clientName}</p>
                          <p><strong>Comida:</strong> {order.recipeName} ({order.quantity} porciones)</p>
                          <p><strong>Monto:</strong> ${order.amount.toFixed(2)} | <strong>Fecha:</strong> {order.pickupDate}</p>
                        </div>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${order.status}`}>
                          {order.status === 'completada' && '✅ Completada'}
                          {order.status === 'pendiente' && '⏳ Pendiente'}
                          {order.status === 'cancelada' && '❌ Cancelada'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
