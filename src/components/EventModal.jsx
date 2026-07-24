import React, { useState, useEffect } from 'react';
import { useEvents } from '../context/EventContext';
import { X, Calendar as CalendarIcon, Clock, AlignLeft, User } from 'lucide-react';

export default function EventModal({ isOpen, onClose, selectedDate, editingEvent = null }) {
  const { addEvent, updateEvent, deleteEvent, currentUser, users } = useEvents();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [assignee, setAssignee] = useState(currentUser.id);

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setTitle(editingEvent.title);
        setDescription(editingEvent.description || '');
        setAllDay(editingEvent.allDay || false);
        setAssignee(editingEvent.userId || currentUser.id);
        
        // format time
        const startH = editingEvent.start.getHours().toString().padStart(2, '0');
        const startM = editingEvent.start.getMinutes().toString().padStart(2, '0');
        setStartTime(`${startH}:${startM}`);
        
        const endH = editingEvent.end.getHours().toString().padStart(2, '0');
        const endM = editingEvent.end.getMinutes().toString().padStart(2, '0');
        setEndTime(`${endH}:${endM}`);
      } else {
        setTitle('');
        setDescription('');
        setAllDay(false);
        setAssignee(currentUser.id);
        setStartTime('09:00');
        setEndTime('10:00');
      }
    }
  }, [isOpen, editingEvent, currentUser.id]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const baseDate = selectedDate || (editingEvent ? editingEvent.start : new Date());
    
    const startDate = new Date(baseDate);
    const [startH, startM] = startTime.split(':').map(Number);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(baseDate);
    const [endH, endM] = endTime.split(':').map(Number);
    endDate.setHours(endH, endM, 0, 0);

    const eventData = {
      title,
      description,
      start: startDate,
      end: endDate,
      allDay,
      userId: assignee
    };

    if (editingEvent) {
      updateEvent({ ...eventData, id: editingEvent.id });
    } else {
      addEvent(eventData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingEvent && window.confirm('정말 이 일정을 삭제하시겠습니까?')) {
      deleteEvent(editingEvent.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingEvent ? '일정 수정' : '새 일정 추가'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="일정 제목"
              className="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group row">
            <CalendarIcon size={18} className="icon" />
            <span>{selectedDate ? selectedDate.toLocaleDateString() : (editingEvent ? editingEvent.start.toLocaleDateString() : new Date().toLocaleDateString())}</span>
          </div>

          <div className="form-group row time-row">
            <Clock size={18} className="icon" />
            <input 
              type="time" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)}
              disabled={allDay}
            />
            <span> - </span>
            <input 
              type="time" 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)}
              disabled={allDay}
            />
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={allDay} 
                onChange={(e) => setAllDay(e.target.checked)} 
              />
              종일
            </label>
          </div>

          <div className="form-group row">
            <User size={18} className="icon" />
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group row align-top">
            <AlignLeft size={18} className="icon mt-2" />
            <textarea
              placeholder="상세 설명 추가"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-footer">
            {editingEvent && (
              <button type="button" className="btn-delete" onClick={handleDelete}>
                삭제
              </button>
            )}
            <div className="footer-right">
              <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
              <button type="submit" className="btn-save">저장</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
