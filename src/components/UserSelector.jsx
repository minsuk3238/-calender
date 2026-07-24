import React from 'react';
import { useEvents } from '../context/EventContext';
import { User, Users, CheckSquare, Square } from 'lucide-react';

export default function UserSelector() {
  const { users, currentUser, setCurrentUser, visibleUsers, toggleUserVisibility } = useEvents();

  return (
    <div className="sidebar-content">
      {/* 1. 내 프로필 선택 */}
      <div className="user-selector section">
        <div className="selector-header">
          <User size={18} />
          <span>내 프로필 (일정 추가 권한)</span>
        </div>
        <select 
          className="user-dropdown"
          value={currentUser.id} 
          onChange={(e) => {
            const user = users.find(u => u.id === e.target.value);
            setCurrentUser(user);
          }}
          style={{
            borderLeft: `4px solid ${currentUser.color}`
          }}
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. 팀 캘린더 필터 */}
      <div className="user-filter section mt-4">
        <div className="selector-header">
          <Users size={18} />
          <span>팀 캘린더 보기</span>
        </div>
        <div className="filter-list">
          {users.map(user => {
            const isVisible = visibleUsers.includes(user.id);
            return (
              <label 
                key={user.id} 
                className={`filter-item ${isVisible ? 'active' : ''}`}
                style={{
                  borderLeft: `4px solid ${user.color}`,
                  backgroundColor: isVisible ? `${user.color}15` : 'transparent'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={isVisible}
                  onChange={() => toggleUserVisibility(user.id)}
                  className="hidden-checkbox"
                />
                <div className="checkbox-icon" style={{ color: user.color }}>
                  {isVisible ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <span>{user.name}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
