import React, { useState } from 'react';
import { useEvents } from '../context/EventContext';
import { Plus, Check, Link as LinkIcon, Users, UserPlus, Search, FileText, FileDown, Eye, EyeOff, Calendar as CalendarIcon } from 'lucide-react';
import { auth, googleProvider, db } from '../config/firebase';
import { linkWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

export default function Sidebar({ onOpenSearch, onOpenDailyNote, onExportCSV, onOpenTeamModal }) {
  const { 
    calendars, visibleCalendars, toggleCalendarVisibility, addCalendar, currentUser,
    invitations, acceptInvitation, declineInvitation, syncGoogleCalendar,
    teams, currentTeam, setCurrentTeam
  } = useEvents();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCalName, setNewCalName] = useState('');
  const [hiddenMembers, setHiddenMembers] = useState([]);

  const handleAddCalendar = () => {
    if (!newCalName.trim()) return;
    addCalendar({
      name: newCalName,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      type: 'personal',
      isDefault: false,
      sharedWithEmails: [],
      sharedWithRoles: {}
    });
    setNewCalName('');
    setIsAdding(false);
  };

  const handleLinkGoogle = async () => {
    try {
      if (!auth.currentUser) return;
      let accessToken = null;

      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
        const googleUser = await GoogleAuth.signIn();
        const idToken = googleUser.authentication.idToken;
        accessToken = googleUser.authentication.accessToken;
        const credential = GoogleAuthProvider.credential(idToken);
        
        try {
          await linkWithCredential(auth.currentUser, credential);
        } catch (linkError) {
          if (linkError.code !== 'auth/credential-already-in-use' && linkError.code !== 'auth/provider-already-linked') {
            throw linkError;
          }
        }
      } else {
        const { signInWithPopup } = await import('firebase/auth');
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        accessToken = credential?.accessToken;
      }
      
      if (accessToken) {
        localStorage.setItem('googleAccessToken', accessToken);
      }
      
      alert("구글 캘린더 연동이 완료되었습니다! 일정을 불러옵니다.");
      await syncGoogleCalendar();
    } catch (error) {
      console.error(error);
      alert("연동 실패: " + error.message);
    }
  };

  const toggleMemberVisibility = (email) => {
    setHiddenMembers(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const memberEmails = currentTeam?.memberEmails || [currentUser?.email || ''];

  return (
    <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
      {/* Workspace / Team Profile Card */}
      <div style={{
        backgroundColor: '#f1f5f9',
        padding: '0.875rem',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b' }}>
            <Users size={18} color="#3b82f6" />
            <span>{currentTeam?.name || '내 팀'}</span>
          </div>
          <button 
            onClick={onOpenTeamModal}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              fontSize: '0.75rem',
              cursor: 'pointer',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            <UserPlus size={13} />
            <span>팀 관리</span>
          </button>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          소속 팀원 {memberEmails.length}명
        </div>
      </div>

      {/* Dashboard Menu Section */}
      <div className="sidebar-section">
        <h4 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          대시보드 메뉴
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button 
            onClick={onOpenSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#334155',
              textAlign: 'left'
            }}
          >
            <Search size={16} color="#3b82f6" />
            <span style={{ flex: 1 }}>일정 검색</span>
            <kbd style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7rem', color: '#64748b' }}>⌘K</kbd>
          </button>

          <button 
            onClick={onOpenDailyNote}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#334155',
              textAlign: 'left'
            }}
          >
            <FileText size={16} color="#10b981" />
            <span>일자별 특이사항</span>
          </button>

          <button 
            onClick={onExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#334155',
              textAlign: 'left'
            }}
          >
            <FileDown size={16} color="#059669" />
            <span>Excel 다운로드</span>
          </button>
        </div>
      </div>

      {/* Team Members List Section */}
      <div className="sidebar-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', margin: 0, fontWeight: 'bold' }}>
            멤버 캘린더
          </h4>
          <button onClick={onOpenTeamModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '0.75rem', padding: 0 }}>
            + 초대
          </button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {memberEmails.map((email, idx) => {
            const isHidden = hiddenMembers.includes(email);
            const name = email.split('@')[0];
            return (
              <li key={email} style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '0.4rem 0.5rem',
                borderRadius: '6px',
                backgroundColor: isHidden ? '#f8fafc' : '#f1f5f9',
                opacity: isHidden ? 0.6 : 1,
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: idx === 0 ? '#3b82f6' : (idx === 1 ? '#10b981' : '#f59e0b')
                  }} />
                  <span style={{ color: '#334155', fontWeight: '500' }}>{name}</span>
                </div>
                <button 
                  onClick={() => toggleMemberVisibility(email)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: isHidden ? '#94a3b8' : '#3b82f6', padding: '2px' }}
                  title={isHidden ? '일정 표시하기' : '일정 숨기기'}
                >
                  {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Invitations Section if any */}
      {invitations && invitations.length > 0 && (
        <div className="sidebar-section" style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '8px' }}>
          <h4 style={{ color: '#d97706', marginTop: 0, fontSize: '0.85rem' }}>받은 초대장 ({invitations.length})</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {invitations.map(inv => (
              <li key={inv.id} style={{ fontSize: '0.8rem', backgroundColor: '#fff', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold' }}>{inv.calendarName}</div>
                <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.4rem' }}>from: {inv.inviterEmail}</div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => acceptInvitation(inv)} className="btn-small" style={{ flex: 1, backgroundColor: '#10b981', padding: '0.2rem' }}>수락</button>
                  <button onClick={() => declineInvitation(inv.id)} className="btn-small" style={{ flex: 1, backgroundColor: '#ef4444', padding: '0.2rem' }}>거절</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Calendars Section */}
      <div className="sidebar-section">
        <h4 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          내 캘린더
        </h4>
        <ul className="calendar-list">
          {calendars.filter(c => c.ownerId === currentUser?.uid).map(cal => {
            const isVisible = visibleCalendars.includes(cal.id);
            return (
              <li key={cal.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
                <div 
                  className="calendar-item" 
                  onClick={() => toggleCalendarVisibility(cal.id)}
                  style={{ flex: 1, padding: '0.25rem 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div 
                    className="checkbox-icon" 
                    style={{ 
                      border: `2px solid ${cal.color}`,
                      backgroundColor: isVisible ? cal.color : 'transparent',
                      width: '15px', height: '15px',
                      borderRadius: '3px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {isVisible && <Check size={11} color="white" />}
                  </div>
                  <span className="calendar-name" style={{ fontSize: '0.85rem', color: '#334155' }}>{cal.name}</span>
                </div>
              </li>
            );
          })}
        </ul>
        
        {isAdding ? (
          <div className="add-calendar-form" style={{ marginTop: '0.5rem' }}>
            <input 
              type="text" 
              value={newCalName} 
              onChange={e => setNewCalName(e.target.value)}
              placeholder="캘린더 이름"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddCalendar()}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}
            />
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.4rem'}}>
              <button onClick={handleAddCalendar} className="btn-small">추가</button>
              <button onClick={() => setIsAdding(false)} className="btn-small btn-cancel">취소</button>
            </div>
          </div>
        ) : (
          <button className="add-calendar-btn" onClick={() => setIsAdding(true)} style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            <Plus size={14} /> 새 캘린더 추가
          </button>
        )}
      </div>

      {/* Bottom Link Google Calendar */}
      <div className="sidebar-section" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <button className="add-calendar-btn" onClick={handleLinkGoogle} style={{ color: '#ea4335', width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
          <LinkIcon size={15} /> 구글 캘린더 연동
        </button>
      </div>
    </div>
  );
}
