import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

const EventContext = createContext();

export const MOCK_USERS = [
  { id: 'u1', name: '한지원', color: '#3b82f6' },
  { id: 'u2', name: '김민석', color: '#10b981' },
  { id: 'u3', name: '고봉찬', color: '#f59e0b' },
  { id: 'u4', name: '이소희', color: '#8b5cf6' }
];

export const EventProvider = ({ children, user }) => {
  // 사용자의 이메일 기반으로 currentUser 매핑 (또는 기본값 u1)
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]);
  const [visibleUsers, setVisibleUsers] = useState(MOCK_USERS.map(u => u.id));
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    // Firestore events 컬렉션 구독
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const loadedEvents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          start: data.start.toDate(),
          end: data.end.toDate(),
        };
      });
      setEvents(loadedEvents);
      setLoadingEvents(false);
    });

    return () => unsubscribe();
  }, []);

  const addEvent = async (eventData) => {
    try {
      await addDoc(collection(db, 'events'), eventData);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const updateEvent = async (updatedEvent) => {
    try {
      const eventRef = doc(db, 'events', updatedEvent.id);
      // id 필드는 Firestore 문서 ID이므로 업데이트 데이터에서 제외
      const { id, ...dataToUpdate } = updatedEvent;
      await updateDoc(eventRef, dataToUpdate);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
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
      toggleUserVisibility,
      loadingEvents
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
