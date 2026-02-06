import { useState } from 'react';
import type { User } from './types/index';
import { Login } from '@components/Login';
import { AdminDashboard } from '@pages/AdminDashboard';
import { ChefDashboard } from '@pages/ChefDashboard';
import { ClientDashboard } from '@pages/ClientDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const renderDashboard = () => {
    if (!user) return <Login onLoginSuccess={handleLoginSuccess} />;

    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case 'cocinero':
        return <ChefDashboard user={user} onLogout={handleLogout} />;
      case 'cliente':
        return <ClientDashboard user={user} onLogout={handleLogout} />;
      default:
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return <>{renderDashboard()}</>;
}

export default App;
