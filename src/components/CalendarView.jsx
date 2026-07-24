import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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
  const { events, getUserById, visibleUsers } = useEvents();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const filteredEvents = events.filter(e => visibleUsers.includes(e.userId));

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setEditingEvent(event);
    setSelectedDate(event.start);
    setModalOpen(true);
  };

  const eventPropGetter = (event) => {
    const user = getUserById(event.userId);
    const backgroundColor = user ? user.color : '#3174ad';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
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
