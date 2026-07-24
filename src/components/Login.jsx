import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Calendar as CalendarIcon } from 'lucide-react';
import { app } from '../config/firebase';

const auth = getAuth(app);

export default function Login({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin(); // App.jsx에서 인증 상태를 갱신하게 만듭니다.
    } catch (err) {
      console.error(err);
      setError('인증에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <CalendarIcon size={32} color="#3b82f6" />
          <h2>팀 캘린더 MVP</h2>
          <p>{isLoginMode ? '로그인하여 일정을 관리하세요' : '계정을 생성하여 팀에 참여하세요'}</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>이메일</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn-primary">
            {isLoginMode ? '로그인' : '회원가입'}
          </button>
        </form>
        
        <div className="login-footer">
          <button 
            type="button" 
            className="text-btn" 
            onClick={() => setIsLoginMode(!isLoginMode)}
          >
            {isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
