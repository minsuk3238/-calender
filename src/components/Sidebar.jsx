import React, { useState } from 'react';
import { useEvents } from '../context/EventContext';
import { Plus, Check, Link as LinkIcon, Users, Check as CheckIcon, X as XIcon } from 'lucide-react';
import { auth, googleProvider, db } from '../config/firebase';
import { linkWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

export default function Sidebar() {
  const { 
    calendars, visibleCalendars, toggleCalendarVisibility, addCalendar, currentUser,
    invitations, acceptInvitation, declineInvitation, syncGoogleCalendar
  } = useEvents();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCalName, setNewCalName] = useState('');
  
  const [invitingCalId, setInvitingCalId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  
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
        // Web Browser Platform Flow
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

  const handleSendInvite = async (cal) => {
    if (!inviteEmail.trim()) return;
    try {
      await addDoc(collection(db, 'invitations'), {
        calendarId: cal.id,
        calendarName: cal.name,
        inviterEmail: currentUser.email,
        inviteeEmail: inviteEmail,
        role: inviteRole,
        status: 'pending'
      });
      setInvitingCalId(null);
      setInviteEmail('');
      alert('초대장을 보냈습니다.');
    } catch (e) {
      console.error(e);
      alert('초대 실패: ' + e.message);
    }
  };

  return (
    <div className="sidebar-content">
      {invitations && invitations.length > 0 && (
        <div className="sidebar-section" style={{ marginBottom: '1.5rem', backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#d97706', marginTop: 0 }}>받은 초대장 ({invitations.length})</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {invitations.map(inv => (
              <li key={inv.id} style={{ fontSize: '0.875rem', backgroundColor: '#fff', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold' }}>{inv.calendarName}</div>
                <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  from: {inv.inviterEmail} ({inv.role === 'editor' ? '수정 가능' : '읽기 전용'})
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => acceptInvitation(inv)} className="btn-small" style={{ flex: 1, backgroundColor: '#10b981' }}>수락</button>
                  <button onClick={() => declineInvitation(inv.id)} className="btn-small" style={{ flex: 1, backgroundColor: '#ef4444' }}>거절</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sidebar-section">
        <h3>내 캘린더</h3>
        <ul className="calendar-list">
          {calendars.filter(c => c.ownerId === currentUser?.uid).map(cal => {
            const isVisible = visibleCalendars.includes(cal.id);
            return (
              <li key={cal.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div 
                    className="calendar-item" 
                    onClick={() => toggleCalendarVisibility(cal.id)}
                    style={{ flex: 1, padding: '0.5rem' }}
                  >
                    <div 
                      className="checkbox-icon" 
                      style={{ 
                        border: `2px solid ${cal.color}`,
                        backgroundColor: isVisible ? cal.color : 'transparent',
                        width: '16px', height: '16px'
                      }}
                    >
                      {isVisible && <Check size={12} color="white" />}
                    </div>
                    <span className="calendar-name">{cal.name}</span>
                  </div>
                  <button onClick={() => setInvitingCalId(cal.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }} title="팀원 초대">
                    <Users size={16} />
                  </button>
                </div>
                
                {invitingCalId === cal.id && (
                  <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <input 
                      type="email" 
                      value={inviteEmail} 
                      onChange={e => setInviteEmail(e.target.value)} 
                      placeholder="초대할 이메일" 
                      style={{ width: '100%', marginBottom: '0.5rem', padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ flex: 1, padding: '0.4rem' }}>
                        <option value="viewer">읽기 전용</option>
                        <option value="editor">수정 가능</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleSendInvite(cal)} className="btn-small" style={{ flex: 1 }}>보내기</button>
                      <button onClick={() => setInvitingCalId(null)} className="btn-small btn-cancel" style={{ flex: 1 }}>취소</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        
        {isAdding ? (
          <div className="add-calendar-form" style={{ marginTop: '1rem' }}>
            <input 
              type="text" 
              value={newCalName} 
              onChange={e => setNewCalName(e.target.value)}
              placeholder="캘린더 이름"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddCalendar()}
            />
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
              <button onClick={handleAddCalendar} className="btn-small">추가</button>
              <button onClick={() => setIsAdding(false)} className="btn-small btn-cancel">취소</button>
            </div>
          </div>
        ) : (
          <button className="add-calendar-btn" onClick={() => setIsAdding(true)}>
            <Plus size={16} /> 새 캘린더 추가
          </button>
        )}
      </div>

      <div className="sidebar-section" style={{ marginTop: '2rem' }}>
        <h3>구독/팀 캘린더</h3>
        <ul className="calendar-list">
          {calendars.filter(c => c.ownerId !== currentUser?.uid).map(cal => {
            const isVisible = visibleCalendars.includes(cal.id);
            return (
              <li key={cal.id} className="calendar-item" onClick={() => toggleCalendarVisibility(cal.id)}>
                <div 
                  className="checkbox-icon" 
                  style={{ 
                    border: `2px solid ${cal.color}`,
                    backgroundColor: isVisible ? cal.color : 'transparent',
                    width: '16px', height: '16px'
                  }}
                >
                  {isVisible && <Check size={12} color="white" />}
                </div>
                <span className="calendar-name">{cal.name}</span>
              </li>
            );
          })}
        </ul>
        {calendars.filter(c => c.ownerId !== currentUser?.uid).length === 0 && (
          <div style={{fontSize: '0.8rem', color: '#888'}}>초대받은 캘린더가 없습니다.</div>
        )}
      </div>

      <div className="sidebar-section" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <button className="add-calendar-btn" onClick={handleLinkGoogle} style={{ color: '#ea4335' }}>
          <LinkIcon size={16} /> 구글 캘린더 연동
        </button>
      </div>
    </div>
  );
}
