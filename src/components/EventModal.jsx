import React, { useState, useEffect } from 'react';
import { useEvents } from '../context/EventContext';
import { db } from '../config/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { X, Calendar as CalendarIcon, Clock, AlignLeft, Folder, CheckSquare, MessageSquare } from 'lucide-react';

export default function EventModal({ isOpen, onClose, selectedDate, editingEvent = null }) {
  const { addEvent, updateEvent, deleteEvent, currentUser, calendars } = useEvents();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [calendarId, setCalendarId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Default calendar
  useEffect(() => {
    if (!calendarId && calendars.length > 0) {
      setCalendarId(calendars[0].id);
    }
  }, [calendars, calendarId]);

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setTitle(editingEvent.title);
        setDescription(editingEvent.description || '');
        setAllDay(editingEvent.allDay || false);
        setCalendarId(editingEvent.calendarId || (calendars.length > 0 ? calendars[0].id : ''));
        setIsCompleted(editingEvent.isCompleted || false);
        
        // format time
        const startH = editingEvent.start.getHours().toString().padStart(2, '0');
        const startM = editingEvent.start.getMinutes().toString().padStart(2, '0');
        setStartTime(`${startH}:${startM}`);
        
        const endH = editingEvent.end.getHours().toString().padStart(2, '0');
        const endM = editingEvent.end.getMinutes().toString().padStart(2, '0');
        setEndTime(`${endH}:${endM}`);

        // Fetch comments
        const q = query(collection(db, `events/${editingEvent.id}/comments`), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
      } else {
        setTitle('');
        setDescription('');
        setAllDay(false);
        setCalendarId(calendars.length > 0 ? calendars[0].id : '');
        setIsCompleted(false);
        setStartTime('09:00');
        setEndTime('10:00');
        setComments([]);
      }
    }
  }, [isOpen, editingEvent, calendars]);

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
      calendarId,
      isCompleted
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !editingEvent) return;
    try {
      await addDoc(collection(db, `events/${editingEvent.id}/comments`), {
        text: newComment,
        authorEmail: currentUser.email,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
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
            <Folder size={18} className="icon" />
            <select value={calendarId} onChange={(e) => setCalendarId(e.target.value)} required>
              {calendars.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {editingEvent && (
            <div className="form-group row">
              <CheckSquare size={18} className="icon" />
              <label className="checkbox-label" style={{ fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={isCompleted} 
                  onChange={(e) => setIsCompleted(e.target.checked)} 
                />
                일정/할일 완료 처리
              </label>
            </div>
          )}

          <div className="form-group row align-top">
            <AlignLeft size={18} className="icon mt-2" />
            <textarea
              placeholder="상세 설명 추가"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-footer" style={{ borderBottom: editingEvent ? '1px solid #eee' : 'none', paddingBottom: editingEvent ? '1rem' : '0' }}>
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

        {/* 코멘트 영역 (수정 모드일 때만 표시) */}
        {editingEvent && (
          <div className="comments-section" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <MessageSquare size={18} className="icon" />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>코멘트</h3>
            </div>
            
            <div className="comments-list" style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem' }}>
              {comments.length === 0 ? (
                <p style={{ color: '#888', fontSize: '0.875rem' }}>아직 작성된 코멘트가 없습니다.</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="comment-item" style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      <strong>{c.authorEmail}</strong>
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>{c.text}</div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder="코멘트를 입력하세요..."
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button type="submit" className="btn-small">등록</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
