import React, { useState, useEffect } from 'react';
import { Search, X, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function SearchModal({ isOpen, onClose, events, calendars, onSelectEvent }) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open search modal (handled by parent or toggled)
          onClose(true); // pass signal to open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEvents = (events || []).filter(event => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = (event.title || '').toLowerCase().includes(term);
    const descMatch = (event.description || '').toLowerCase().includes(term);
    return titleMatch || descMatch;
  });

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '5rem',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '560px',
        maxHeight: '75vh',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Search Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e5e7eb',
          gap: '0.75rem'
        }}>
          <Search size={20} color="#6b7280" />
          <input 
            type="text"
            placeholder="일정 제목 또는 내역 검색... (Esc로 닫기)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: '#1f2937'
            }}
          />
          <button 
            onClick={() => onClose()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredEvents.map(event => {
              const cal = (calendars || []).find(c => c.id === event.calendarId);
              const calColor = event.isGoogle ? '#ea4335' : (cal ? cal.color : '#3b82f6');
              const startFormatted = event.start ? format(new Date(event.start), 'M월 d일 (EEE) HH:mm', { locale: ko }) : '';

              return (
                <div 
                  key={event.id || Math.random()}
                  onClick={() => {
                    if (onSelectEvent) onSelectEvent(event);
                    onClose();
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f9fafb',
                    transition: 'background-color 0.15s ease',
                    borderLeft: `4px solid ${calColor}`
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {event.isCompleted && <CheckCircle size={15} color="#10b981" />}
                      <span style={{ textDecoration: event.isCompleted ? 'line-through' : 'none' }}>
                        {event.title || '제목 없음'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={13} /> {startFormatted}
                      </span>
                      <span>•</span>
                      <span>{event.isGoogle ? 'Google Calendar' : (cal ? cal.name : '기본 캘린더')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          fontSize: '0.8rem',
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>총 {filteredEvents.length}개 검색됨</span>
          <span><kbd style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>Esc</kbd> 닫기</span>
        </div>
      </div>
    </div>
  );
}
