import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Calendar as CalendarIcon } from 'lucide-react';
import { app } from '../config/firebase';

const auth = getAuth(app);

export default function Login({ onLogin }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const googleUser = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
      await signInWithCredential(auth, credential);
      
      if (googleUser.authentication.accessToken) {
        localStorage.setItem('googleAccessToken', googleUser.authentication.accessToken);
      }
    } catch (err) {
      console.error(err);
      setError('구글 로그인에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onLogin) onLogin();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 가입된 이메일입니다.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호는 6자리 이상이어야 합니다.');
      } else {
        setError('인증에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div className="login-header">
          <CalendarIcon size={48} color="#3b82f6" style={{ margin: '0 auto 1rem auto' }} />
          <h2>팀 캘린더 MVP</h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>{isRegister ? '새 계정을 만드세요' : '로그인하세요'}</p>
        </div>
        
        {error && <div className="error-message" style={{ margin: '1rem 0', color: 'red' }}>{error}</div>}

        <button 
          type="button" 
          className="btn-primary" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{ 
            backgroundColor: '#4285F4', 
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%'
          }}
        >
          {loading ? '처리 중...' : 'Google 계정으로 계속하기'}
        </button>

        <div style={{ margin: '1.5rem 0', color: '#999', fontSize: '0.9rem' }}>또는 이메일로 시작하기</div>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="email" 
            placeholder="이메일" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="password" 
            placeholder="비밀번호 (6자리 이상)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {loading ? '처리 중...' : (isRegister ? '이메일로 회원가입' : '이메일로 로그인')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <button 
            type="button" 
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? '이미 계정이 있으신가요? 로그인하기' : '계정이 없으신가요? 회원가입하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
