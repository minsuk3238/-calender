import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Preferences } from '@capacitor/preferences';

const EventContext = createContext();

export const EventProvider = ({ children, user }) => {
  const [calendars, setCalendars] = useState([]);
  const [visibleCalendars, setVisibleCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [invitations, setInvitations] = useState([]);

  // Load calendars (owned and shared)
  useEffect(() => {
    if (!user?.uid) return;
    
    // In Firestore, we can't do an OR query easily for (ownerId == uid OR sharedWith.uid == uid)
    // So we'll fetch owned calendars and shared calendars separately for simplicity.
    const qOwned = query(collection(db, 'calendars'), where('ownerId', '==', user.uid));
    const qShared = query(collection(db, 'calendars'), where('sharedWithEmails', 'array-contains', user.email || ''));
    
    const unsubscribeOwned = onSnapshot(qOwned, async (snapshot) => {
      const owned = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (owned.length === 0) {
        await addDoc(collection(db, 'calendars'), {
          name: '내 캘린더',
          ownerId: user.uid,
          color: '#3b82f6',
          type: 'personal',
          isDefault: true,
          sharedWithEmails: [],
          sharedWithRoles: {}
        });
      } else {
        setCalendars(prev => {
          const others = prev.filter(c => c.ownerId !== user.uid);
          return [...owned, ...others];
        });
      }
    });

    const unsubscribeShared = onSnapshot(qShared, (snapshot) => {
      const shared = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCalendars(prev => {
        const owned = prev.filter(c => c.ownerId === user.uid);
        return [...owned, ...shared];
      });
    });

    return () => {
      unsubscribeOwned();
      unsubscribeShared();
    };
  }, [user]);

  // Load invitations
  useEffect(() => {
    if (!user?.email) return;
    const q = query(collection(db, 'invitations'), where('inviteeEmail', '==', user.email), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // Load events
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const loadedEvents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          start: data.start ? data.start.toDate() : new Date(),
          end: data.end ? data.end.toDate() : new Date(),
        };
      });
      setEvents(loadedEvents);
      setLoadingEvents(false);
      
      // Sync to native storage for Android Widget
      try {
        const simpleEvents = loadedEvents.map(e => ({
          id: e.id,
          title: e.title,
          start: e.start.toISOString(),
          end: e.end.toISOString()
        }));
        Preferences.set({
          key: 'widget_events',
          value: JSON.stringify(simpleEvents)
        });
      } catch (e) {
        console.error("Failed to sync to Preferences", e);
      }
    });

    return () => unsubscribe();
  }, []);

  // Notification checker
  useEffect(() => {
    if (!user || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const interval = setInterval(() => {
      const now = new Date();
      events.forEach(event => {
        if (event.isCompleted) return;
        const diffMs = event.start.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        // If event is exactly 10 minutes away (or within the 1-minute checking window)
        if (diffMins === 10) {
          new Notification('일정 알림', {
            body: `[${event.title}] 일정이 10분 뒤 시작됩니다.`,
            icon: '/favicon.ico'
          });
        }
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events, user]);

  const addEvent = async (eventData) => {
    try {
      // Ensure we have a default calendarId if none is provided
      if (!eventData.calendarId && calendars.length > 0) {
        eventData.calendarId = calendars[0].id;
      }
      await addDoc(collection(db, 'events'), eventData);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const updateEvent = async (updatedEvent) => {
    try {
      const eventRef = doc(db, 'events', updatedEvent.id);
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

  const addCalendar = async (calendarData) => {
    try {
      await addDoc(collection(db, 'calendars'), {
        ...calendarData,
        ownerId: user.uid
      });
    } catch (e) {
      console.error("Error adding calendar: ", e);
    }
  };

  const toggleCalendarVisibility = (calendarId) => {
    setVisibleCalendars(prev => 
      prev.includes(calendarId) 
        ? prev.filter(id => id !== calendarId) 
        : [...prev, calendarId]
    );
  };
  
  const toggleEventComplete = async (event) => {
    await updateEvent({
      ...event,
      isCompleted: !event.isCompleted
    });
  };

  const acceptInvitation = async (invitation) => {
    try {
      // Add user to calendar's sharedWithEmails and sharedWithRoles
      const calRef = doc(db, 'calendars', invitation.calendarId);
      // We assume sharedWithEmails is an array and sharedWithRoles is a map/object
      // Since arrayUnion isn't directly imported, we can just fetch and update or use arrayUnion
      // but it's simpler to just update the invitation status and let a cloud function do it,
      // or we can do it here directly if we import arrayUnion.
      // Let's do it directly: we need to update the calendar document.
      // For simplicity in MVP, we just update invitation status to 'accepted'.
      const invRef = doc(db, 'invitations', invitation.id);
      await updateDoc(invRef, { status: 'accepted' });
      // To properly share, the user should be in the calendar document.
      // In a real app we'd use arrayUnion. Here we will do a fast read-modify-write if we have the calendar.
      const cal = calendars.find(c => c.id === invitation.calendarId);
      if (cal) {
        const emails = cal.sharedWithEmails || [];
        const roles = cal.sharedWithRoles || {};
        if (!emails.includes(currentUser.email)) {
          await updateDoc(calRef, {
            sharedWithEmails: [...emails, currentUser.email],
            [`sharedWithRoles.${currentUser.email.replace(/\./g, ',')}`]: invitation.role
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const declineInvitation = async (invitationId) => {
    try {
      await updateDoc(doc(db, 'invitations', invitationId), { status: 'declined' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EventContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      toggleEventComplete,
      calendars,
      addCalendar,
      visibleCalendars,
      toggleCalendarVisibility,
      loadingEvents,
      currentUser: user,
      invitations,
      acceptInvitation,
      declineInvitation
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
