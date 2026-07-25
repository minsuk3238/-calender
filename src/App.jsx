import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import SearchModal from './components/SearchModal';
import DailyNoteModal from './components/DailyNoteModal';
import { EventProvider, useEvents } from './context/EventContext';
import { exportEventsToCSV } from './utils/exportUtils';
import { auth, db } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './App.css';
import { Calendar as CalendarIcon, LogOut, Menu, X, Search, FileDown, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

function MainContent({ user, isSidebarOpen, setIsSidebarOpen, isWidget }) {
  const { events, googleEvents, calendars, isSyncing } = useEvents();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDailyNoteOpen, setIsDailyNoteOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);

  const handleExportCSV = () => {
    const allDisplayEvents = [...(events || []), ...(googleEvents || [])];
    exportEventsToCSV(allDisplayEvents, calendars);
  };

  return (
    <div className={`app-container ${isWidget ? 'widget-mode' : ''}`}>
      {!isWidget && (
        <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <CalendarIcon size={24} color="var(--primary)" className="header-icon" />
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>TeamCalendar</h1>
            
            {/* Real-time Sync Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: isSyncing ? '#fef3c7' : '#dcfce7',
              color: isSyncing ? '#d97706' : '#15803d',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginLeft: '0.5rem'
            }}>
              {isSyncing ? <RefreshCw size={12} className="spin-icon" /> : <CheckCircle2 size={12} />}
              <span>{isSyncing ? '저장 중...' : '실시간 저장 완료'}</span>
            </div>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* ⌘K Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#374151'
              }}
            >
              <Search size={15} />
              <span>검색</span>
              <kbd style={{ backgroundColor: '#e5e7eb', padding: '1px 5px', borderRadius: '4px', fontSize: '0.75rem' }}>⌘K</kbd>
            </button>

            {/* Daily Note Button */}
            <button 
              onClick={() => setIsDailyNoteOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#374151'
              }}
            >
              <FileText size={15} color="#3b82f6" />
              <span>일자별 특이사항</span>
            </button>

            {/* Excel Export Button */}
            <button 
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#15803d'
              }}
            >
              <FileDown size={15} color="#15803d" />
              <span>Excel 다운로드</span>
            </button>

            <span className="user-email" style={{ fontSize: '0.85rem', color: '#6b7280', marginLeft: '0.5rem' }}>{user.email}</span>
            <button className="logout-btn" onClick={() => signOut(auth)}>
              <LogOut size={16} /> <span>로그아웃</span>
            </button>
          </div>
        </header>
      )}

      <main className="app-content">
        {!isWidget && (
          <>
            <div 
              className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            ></div>
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
              <Sidebar />
            </aside>
          </>
        )}
        <section className="calendar-section" style={{ padding: isWidget ? '0.5rem' : '1.5rem', background: isWidget ? 'transparent' : 'var(--bg-color)' }}>
          <CalendarView />
        </section>
      </main>

      {/* Modals */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={(shouldOpen) => {
          if (typeof shouldOpen === 'boolean') {
            setIsSearchOpen(shouldOpen);
          } else {
            setIsSearchOpen(false);
          }
        }}
        events={[...(events || []), ...(googleEvents || [])]}
        calendars={calendars}
        onSelectEvent={(event) => {
          // Open edit modal if needed
        }}
      />

      <DailyNoteModal 
        isOpen={isDailyNoteOpen}
        onClose={() => setIsDailyNoteOpen(false)}
      />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
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

  const isWidget = new URLSearchParams(window.location.search).get('mode') === 'widget';

  if (loading) {
    return <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <EventProvider user={user}>
      <MainContent 
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isWidget={isWidget}
      />
    </EventProvider>
  );
}

export default App;

