import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import UserSelector from './components/UserSelector';
import Login from './components/Login';
import { EventProvider } from './context/EventContext';
import { auth } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';
import { Calendar as CalendarIcon, LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <EventProvider user={user}>
      <div className="app-container">
        <header className="app-header">
          <div className="logo">
            <CalendarIcon size={24} color="#3b82f6" />
            <h1>팀 캘린더 MVP</h1>
          </div>
          <div className="header-right">
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              로그아웃
            </button>
          </div>
        </header>
        <main className="app-content">
          <aside className="sidebar">
            <UserSelector />
          </aside>
          <section className="calendar-section">
            <CalendarView />
          </section>
        </main>
      </div>
    </EventProvider>
  );
}

export default App;
