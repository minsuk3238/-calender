import React from 'react';
import CalendarView from './components/CalendarView';
import UserSelector from './components/UserSelector';
import { EventProvider } from './context/EventContext';
import './App.css';
import { Calendar as CalendarIcon } from 'lucide-react';

function App() {
  return (
    <EventProvider>
      <div className="app-container">
        <header className="app-header">
          <div className="logo">
            <CalendarIcon size={24} color="#3b82f6" />
            <h1>팀 캘린더 MVP</h1>
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
