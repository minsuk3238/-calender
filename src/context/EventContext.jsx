import React, { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext();

export const MOCK_USERS = [
  { id: 'u1', name: '한지원', color: '#3b82f6' },
  { id: 'u2', name: '김민석', color: '#10b981' },
  { id: 'u3', name: '고봉찬', color: '#f59e0b' },
  { id: 'u4', name: '이소희', color: '#8b5cf6' }
];

const INITIAL_EVENTS = [
  {
    id: 'e1',
    title: '프로젝트 킥오프',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
    userId: 'u1',
    allDay: false,
  },
];

export const EventProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]);
  const [visibleUsers, setVisibleUsers] = useState(MOCK_USERS.map(u => u.id));
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('team_calendar_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert string dates back to Date objects
        return parsed.map(e => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end)
        }));
      } catch (e) {
        return INITIAL_EVENTS;
      }
    }
    return INITIAL_EVENTS;
  });

  useEffect(() => {
    localStorage.setItem('team_calendar_events', JSON.stringify(events));
  }, [events]);

  const addEvent = (event) => {
    setEvents([...events, { ...event, id: Date.now().toString() }]);
  };

  const updateEvent = (updatedEvent) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const deleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const getUserById = (id) => MOCK_USERS.find(u => u.id === id);

  const toggleUserVisibility = (userId) => {
    setVisibleUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  return (
    <EventContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      currentUser,
      setCurrentUser,
      getUserById,
      users: MOCK_USERS,
      visibleUsers,
      toggleUserVisibility
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
