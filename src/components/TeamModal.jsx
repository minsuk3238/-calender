import React, { useState } from 'react';
import { X, Users, UserPlus, Plus, Check } from 'lucide-react';
import { useEvents } from '../context/EventContext';

export default function TeamModal({ isOpen, onClose }) {
  const { teams, currentTeam, setCurrentTeam, createTeam, inviteTeamMember } = useEvents();
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'invite'
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setIsSubmitting(true);
    setMessage('');
    try {
      if (createTeam) {
        await createTeam(teamName.trim());
        setTeamName('');
        setMessage('팀이 성공적으로 생성되었습니다!');
        setTimeout(() => {
          setMessage('');
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setMessage('팀 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentTeam?.id) return;
    setIsSubmitting(true);
    setMessage('');
    try {
      if (inviteTeamMember) {
        await inviteTeamMember(currentTeam.id, inviteEmail.trim());
        setInviteEmail('');
        setMessage(`${inviteEmail}님에게 팀 초대장이 발송되었습니다!`);
      }
    } catch (err) {
      console.error(err);
      setMessage('팀원 초대 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
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
        maxWidth: '480px',
        padding: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            <Users size={22} color="#3b82f6" />
            <span>팀 및 멤버 관리</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', gap: '1rem' }}>
          <button 
            onClick={() => { setActiveTab('create'); setMessage(''); }}
            style={{
              padding: '0.5rem 0.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'create' ? 'bold' : 'normal',
              color: activeTab === 'create' ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === 'create' ? '2px solid #3b82f6' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Plus size={16} /> 새 팀 만들기
          </button>
          <button 
            onClick={() => { setActiveTab('invite'); setMessage(''); }}
            style={{
              padding: '0.5rem 0.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'invite' ? 'bold' : 'normal',
              color: activeTab === 'invite' ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === 'invite' ? '2px solid #3b82f6' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <UserPlus size={16} /> 팀원 초대하기
          </button>
        </div>

        {message && (
          <div style={{
            padding: '0.6rem 0.8rem',
            borderRadius: '6px',
            backgroundColor: message.includes('실패') || message.includes('오류') ? '#fee2e2' : '#dcfce7',
            color: message.includes('실패') || message.includes('오류') ? '#991b1b' : '#166534',
            fontSize: '0.85rem'
          }}>
            {message}
          </div>
        )}

        {activeTab === 'create' ? (
          <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
              팀(워크스페이스) 이름
            </label>
            <input 
              type="text" 
              placeholder="예: 그로습 스튜디오, 기획 1팀" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.95rem'
              }}
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                padding: '0.6rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
            >
              {isSubmitting ? '팀 생성 중...' : '팀 생성하기'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleInviteMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
              초대할 팀 선택
            </label>
            <select 
              value={currentTeam?.id || ''} 
              onChange={(e) => {
                const selected = teams.find(t => t.id === e.target.value);
                if (selected) setCurrentTeam(selected);
              }}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.95rem'
              }}
            >
              {(teams || []).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <label style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
              초대할 팀원의 이메일 주소
            </label>
            <input 
              type="email" 
              placeholder="member@example.com" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.95rem'
              }}
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !currentTeam}
              style={{
                padding: '0.6rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#10b981',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
            >
              {isSubmitting ? '초대 중...' : '팀원 초대 발송'}
            </button>
          </form>
        )}

        {/* Current Teams List */}
        <div style={{ marginTop: '0.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>내 소속 팀 목록</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '120px', overflowY: 'auto' }}>
            {(teams || []).map(t => (
              <div 
                key={t.id} 
                onClick={() => setCurrentTeam(t)}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: currentTeam?.id === t.id ? '#eff6ff' : '#f9fafb',
                  border: currentTeam?.id === t.id ? '1px solid #bfdbfe' : '1px solid #f3f4f6',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ fontWeight: currentTeam?.id === t.id ? 'bold' : 'normal', color: '#1f2937' }}>
                  {t.name}
                </span>
                {currentTeam?.id === t.id && <Check size={14} color="#3b82f6" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
