import React, { useState } from 'react';
import { X, Layout, Copy, ExternalLink, Smartphone, Monitor, Check } from 'lucide-react';

export default function WidgetGuideModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const widgetUrl = `${window.location.origin}/?mode=widget`;

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(widgetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        gap: '1.25rem'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            <Layout size={22} color="#3b82f6" />
            <span>바탕화면 & 웹 위젯 활용 가이드</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Option 1: Web Widget Mode */}
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
            <Monitor size={18} color="#3b82f6" />
            <span>1. 웹 전용 위젯 (투명 모드)</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
            헤더와 사이드바 없이 캘린더만 깔끔하게 띄울 수 있는 전용 주소입니다.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="text" 
              readOnly 
              value={widgetUrl}
              style={{
                flex: 1,
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#fff',
                fontSize: '0.8rem',
                color: '#334155'
              }}
            />
            <button 
              onClick={handleCopyUrl}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: copied ? '#10b981' : '#3b82f6',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? '복사됨' : '복사'}
            </button>
            <a 
              href={widgetUrl} 
              target="_blank" 
              rel="noreferrer"
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#fff',
                color: '#334155',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <ExternalLink size={14} />
              열기
            </a>
          </div>
        </div>

        {/* Option 2: Mobile App Widget */}
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
            <Smartphone size={18} color="#10b981" />
            <span>2. 안드로이드 홈화면 위젯</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            모바일 APK 앱을 설치하면 스마트폰 홈화면에 캘린더 위젯을 띄워 실시간 일정 동기화를 이용하실 수 있습니다. (Capacitor Preferences 연동)
          </p>
        </div>

        {/* Option 3: Electron Desktop Widget */}
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
            <Monitor size={18} color="#f59e0b" />
            <span>3. PC 데스크톱 프로그램 (Electron)</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            프로젝트 폴더에서 <code style={{ backgroundColor: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>npm run electron:start</code> 명령어를 실행하면 윈도우 바탕화면 프로그램으로 구동됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
