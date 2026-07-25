import React from 'react';
import { X, Smartphone, Download, Share, CheckCircle2, Globe } from 'lucide-react';

export default function AppDownloadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleDownloadAPK = () => {
    alert("안드로이드 APK 빌드 파일이 다운로드됩니다. (Capacitor Android 빌드)");
    // In a production setup, this can point to a real apk release asset link or public asset
    window.open('https://github.com/minsuk3238/-calender/releases', '_blank');
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
        maxWidth: '500px',
        padding: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            <Smartphone size={22} color="#10b981" />
            <span>팀 캘린더 모바일 앱 다운로드</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Option 1: PWA (Direct Web App Install) */}
        <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem', color: '#166534', marginBottom: '0.4rem' }}>
            <Globe size={18} color="#10b981" />
            <span>1. 무설치 웹앱 (PWA 홈화면에 추가)</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#15803d', margin: '0 0 0.5rem 0' }}>
            별도 설치 파일 없이 스마트폰 브라우저 메뉴에서 바로 앱으로 등록할 수 있습니다.
          </p>
          <ul style={{ fontSize: '0.8rem', color: '#166534', paddingLeft: '1.25rem', margin: 0 }}>
            <li><strong>iPhone/Safari</strong>: 하단 공유 버튼(<Share size={12} style={{ display: 'inline' }} />) ➔ <strong>'홈 화면에 추가'</strong></li>
            <li><strong>Android/Chrome</strong>: 우측 상단 메뉴(⋮) ➔ <strong>'앱 설치'</strong> 또는 <strong>'홈 화면에 추가'</strong></li>
          </ul>
        </div>

        {/* Option 2: Android APK Download */}
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
            <Smartphone size={18} color="#3b82f6" />
            <span>2. 안드로이드 전용 어플 (APK)</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
            홈화면 위젯 동기화 기능이 포함된 안드로이드 정식 앱 패키지입니다.
          </p>

          <button 
            onClick={handleDownloadAPK}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#10b981',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Download size={16} />
            Android 앱 (APK) 다운로드 / Release 이동
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
          <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
          팀 캘린더 어플은 모든 기기(iOS, Android, PC)에서 동일하게 실시간 동기화됩니다.
        </div>
      </div>
    </div>
  );
}
