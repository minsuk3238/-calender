import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import SearchModal from './components/SearchModal';
import DailyNoteModal from './components/DailyNoteModal';
import TeamModal from './components/TeamModal';
import WidgetGuideModal from './components/WidgetGuideModal';
import AppDownloadModal from './components/AppDownloadModal';
import { EventProvider, useEvents } from './context/EventContext';
import { exportEventsToCSV } from './utils/exportUtils';
import { auth, db } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './App.css';
import { Calendar as CalendarIcon, LogOut, Menu, X, CheckCircle2, RefreshCw, Layout, HelpCircle, ExternalLink, Download } from 'lucide-react';

function MainContent({ user, isSidebarOpen, setIsSidebarOpen, isWidget }) {
  const { events, googleEvents, calendars, isSyncing } = useEvents();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDailyNoteOpen, setIsDailyNoteOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isWidgetGuideOpen, setIsWidgetGuideOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);

  const handleExportCSV = () => {
    const allDisplayEvents = [...(events || []), ...(googleEvents || [])];
    exportEventsToCSV(allDisplayEvents, calendars);
  };

  const widgetUrl = `${window.location.origin}/?mode=widget`;

  return (
    <div className={`app-container ${isWidget ? 'widget-mode' : ''}`}>
      {!isWidget && (
        <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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
            {/* App Download Button */}
            <button
              onClick={() => setIsAppDownloadOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #10b981',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <Download size={15} color="#10b981" />
              <span>어플 다운로드</span>
            </button>

            {/* Widget Mode Shortcut Button */}
            <a 
              href={widgetUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: '500',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <Layout size={15} color="#3b82f6" />
              <span>위젯 모드</span>
              <ExternalLink size={12} color="#64748b" />
            </a>

            {/* Widget Guide Button */}
            <button
              onClick={() => setIsWidgetGuideOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#fff',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <HelpCircle size={15} color="#f59e0b" />
              <span>위젯 안내</span>
            </button>

            <span className="user-email" style={{ fontSize: '0.875rem', color: '#4b5563', marginLeft: '0.5rem' }}>{user.email}</span>
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
              <Sidebar 
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenDailyNote={() => setIsDailyNoteOpen(true)}
                onExportCSV={handleExportCSV}
                onOpenTeamModal={() => setIsTeamModalOpen(true)}
              />
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
      />

      <DailyNoteModal 
        isOpen={isDailyNoteOpen}
        onClose={() => setIsDailyNoteOpen(false)}
      />

      <TeamModal 
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />

      <WidgetGuideModal
        isOpen={isWidgetGuideOpen}
        onClose={() => setIsWidgetGuideOpen(false)}
      />

      <AppDownloadModal
        isOpen={isAppDownloadOpen}
        onClose={() => setIsAppDownloadOpen(false)}
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
