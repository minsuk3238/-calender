import React, { useState, useEffect } from 'react';
import { X, Save, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEvents } from '../context/EventContext';

export default function DailyNoteModal({ isOpen, onClose }) {
  const { dailyNotes, saveDailyNote } = useEvents();
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dailyNotes && selectedDateStr) {
      setNoteContent(dailyNotes[selectedDateStr] || '');
    } else {
      setNoteContent('');
    }
  }, [selectedDateStr, dailyNotes]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (saveDailyNote) {
        await saveDailyNote(selectedDateStr, noteContent);
      }
      onClose();
    } catch (e) {
      console.error(e);
      alert('특이사항 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '520px',
        padding: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            <FileText size={22} color="#3b82f6" />
            <span>일자별 특이사항 / 메모</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f3f4f6', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
          <CalendarIcon size={18} color="#4b5563" />
          <input 
            type="date" 
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.95rem'
            }}
          />
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            {format(new Date(selectedDateStr + 'T00:00:00'), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
          </span>
        </div>

        {/* Note Textarea */}
        <textarea
          rows={6}
          placeholder="해당 일자의 이슈, 특이사항, 또는 메모를 자유롭게 입력하세요..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '0.95rem',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            취소
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Save size={16} />
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
