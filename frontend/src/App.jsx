import React, { useState } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent = () => {
  const { user } = useAuth();
  const [view, setView] = useState('login');

  if (user) return <Layout />;

  return view === 'login'
    ? <Login onSwitchToRegister={() => setView('register')} />
    : <Register onSwitchToLogin={() => setView('login')} />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
