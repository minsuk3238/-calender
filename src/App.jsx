import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import { EventProvider } from './context/EventContext';
import { auth, db } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './App.css';
import { Calendar as CalendarIcon, LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // 새 유저인 경우 랜덤 색상과 함께 저장
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            await setDoc(userRef, {
              id: currentUser.uid,
              name: currentUser.displayName || currentUser.email.split('@')[0],
              email: currentUser.email,
              photoURL: currentUser.photoURL || '',
              color: randomColor
            });
          } else {
            // 이미 존재하는 유저인 경우 최신 정보(이름, 프사) 업데이트
            await setDoc(userRef, {
              name: currentUser.displayName || currentUser.email.split('@')[0],
              photoURL: currentUser.photoURL || '',
            }, { merge: true });
          }
        } catch (error) {
          console.error("Error saving user to DB:", error);
        }
      }
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

  const isWidget = new URLSearchParams(window.location.search).get('mode') === 'widget';

  if (loading) {
    return <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <EventProvider user={user}>
      <div className={`app-container ${isWidget ? 'widget-mode' : ''}`}>
        {!isWidget && (
          <header className="app-header">
            <div className="logo">
              <CalendarIcon size={24} color="var(--primary)" />
              <h1>TeamCalendar</h1>
            </div>
            <div className="header-right">
              <span className="user-email">{user.email}</span>
              <button className="logout-btn" onClick={() => signOut(auth)}>
                <LogOut size={16} /> 로그아웃
              </button>
            </div>
          </header>
        )}
        <main className="app-content">
          {!isWidget && (
            <aside className="sidebar">
              <Sidebar />
            </aside>
          )}
          <section className="calendar-section" style={{ padding: isWidget ? '0.5rem' : '1.5rem', background: isWidget ? 'transparent' : 'var(--bg-color)' }}>
            <CalendarView />
          </section>
        </main>
      </div>
    </EventProvider>
  );
}

export default App;
