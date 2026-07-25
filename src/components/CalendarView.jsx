import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import Holidays from 'date-holidays';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import { useEvents } from '../context/EventContext';
import EventModal from './EventModal';

const locales = {
  'ko': ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  const { events, googleEvents, calendars, visibleCalendars, updateEvent } = useEvents();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const hd = new Holidays('KR');
    const currentYear = new Date().getFullYear();
    const h1 = hd.getHolidays(currentYear - 1);
    const h2 = hd.getHolidays(currentYear);
    const h3 = hd.getHolidays(currentYear + 1);
    
    const mapped = [...h1, ...h2, ...h3].map(h => ({
      id: `holiday-${h.date}`,
      title: h.name,
      start: new Date(h.date),
      end: new Date(h.date),
      allDay: true,
      isHoliday: true
    }));
    setHolidays(mapped);
  }, []);

  const filteredEvents = events.filter(e => visibleCalendars.includes(e.calendarId));
  const displayEvents = [...filteredEvents, ...holidays, ...(googleEvents || [])];

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    if (event.isHoliday || event.isGoogle) return;
    setEditingEvent(event);
    setSelectedDate(event.start);
    setModalOpen(true);
  };

  const handleEventDrop = ({ event, start, end, isAllDay: droppedOnAllDaySlot }) => {
    if (event.isHoliday || event.isGoogle) return;
    updateEvent({ ...event, start, end, allDay: droppedOnAllDaySlot });
  };

  const handleEventResize = ({ event, start, end }) => {
    if (event.isHoliday || event.isGoogle) return;
    updateEvent({ ...event, start, end });
  };

  const eventPropGetter = (event) => {
    if (event.isHoliday) {
      return {
        style: {
          backgroundColor: '#ef4444',
          borderRadius: '4px',
          opacity: 0.9,
          color: 'white',
          border: '0px',
          display: 'block'
        }
      };
    }

    if (event.isGoogle) {
      return {
        style: {
          backgroundColor: event.color,
          borderRadius: '4px',
          opacity: 0.9,
          color: 'white',
          border: '1px solid #c5221f',
          display: 'block'
        }
      };
    }

    const cal = calendars.find(c => c.id === event.calendarId);
    const backgroundColor = cal ? cal.color : '#3174ad';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.isCompleted ? 0.6 : 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        textDecoration: event.isCompleted ? 'line-through' : 'none'
      }
    };
  };

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={displayEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 120px)' }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        eventPropGetter={eventPropGetter}
        culture="ko"
        views={['month', 'week', 'day']}
        messages={{
          today: '오늘',
          previous: '이전',
          next: '다음',
          month: '월',
          week: '주',
          day: '일',
          agenda: '일정'
        }}
      />
      
      <EventModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        selectedDate={selectedDate}
        editingEvent={editingEvent}
      />
    </div>
  );
}
