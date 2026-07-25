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
  const [googleEvents, setGoogleEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dailyNotes, setDailyNotes] = useState({});

  // Load daily notes from Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'dailyNotes'), (snapshot) => {
      const notesMap = {};
      snapshot.docs.forEach(docSnap => {
        notesMap[docSnap.id] = docSnap.data().content || '';
      });
      setDailyNotes(notesMap);
    });
    return () => unsubscribe();
  }, [user]);

  const saveDailyNote = async (dateStr, content) => {
    if (!dateStr) return;
    setIsSyncing(true);
    try {
      const { setDoc, doc: firestoreDoc } = await import('firebase/firestore');
      await setDoc(firestoreDoc(db, 'dailyNotes', dateStr), {
        content,
        updatedAt: new Date(),
        updatedBy: user.email
      });
    } catch (e) {
      console.error("Error saving daily note:", e);
    } finally {
      setIsSyncing(false);
    }
  };

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

  const syncGoogleCalendar = async () => {
    try {
      let token = localStorage.getItem('googleAccessToken');
      if (!token) {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
          const googleUser = await GoogleAuth.refresh();
          token = googleUser?.authentication?.accessToken;
        }
      }
      
      if (!token) return;

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${oneYearAgo.toISOString()}&singleEvents=true&orderBy=startTime`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Google Calendar');
      }
      
      const data = await response.json();
      if (data.items) {
        const gEvents = data.items.map(item => ({
          id: item.id,
          title: item.summary || '제목 없음',
          start: new Date(item.start.dateTime || item.start.date),
          end: new Date(item.end.dateTime || item.end.date),
          isGoogle: true,
          color: '#ea4335', // Google Red
          isCompleted: false
        }));
        setGoogleEvents(gEvents);
      }
    } catch (e) {
      console.log("Silent fail for Google sync: ", e);
    }
  };

  useEffect(() => {
    if (user) {
      syncGoogleCalendar();
    }
  }, [user]);

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
    setIsSyncing(true);
    try {
      if (!eventData.calendarId && calendars.length > 0) {
        eventData.calendarId = calendars[0].id;
      }
      await addDoc(collection(db, 'events'), eventData);
    } catch (e) {
      console.error("Error adding document: ", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateEvent = async (updatedEvent) => {
    setIsSyncing(true);
    try {
      const eventRef = doc(db, 'events', updatedEvent.id);
      const { id, ...dataToUpdate } = updatedEvent;
      await updateDoc(eventRef, dataToUpdate);
    } catch (e) {
      console.error("Error updating document: ", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteEvent = async (eventId) => {
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (e) {
      console.error("Error deleting document: ", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const addCalendar = async (calendarData) => {
    setIsSyncing(true);
    try {
      await addDoc(collection(db, 'calendars'), {
        ...calendarData,
        ownerId: user.uid
      });
    } catch (e) {
      console.error("Error adding calendar: ", e);
    } finally {
      setIsSyncing(false);
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
      const calRef = doc(db, 'calendars', invitation.calendarId);
      const invRef = doc(db, 'invitations', invitation.id);
      await updateDoc(invRef, { status: 'accepted' });
      const cal = calendars.find(c => c.id === invitation.calendarId);
      if (cal) {
        const emails = cal.sharedWithEmails || [];
        if (!emails.includes(user.email)) {
          await updateDoc(calRef, {
            sharedWithEmails: [...emails, user.email]
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
      googleEvents,
      syncGoogleCalendar,
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
      declineInvitation,
      isSyncing,
      dailyNotes,
      saveDailyNote
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
