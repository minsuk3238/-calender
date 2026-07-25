import React, { useState } from 'react';
import { X, Smartphone, Download, Share, CheckCircle2, Globe, QrCode, Copy, Check } from 'lucide-react';

export default function AppDownloadModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://calender-one-rho.vercel.app';
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentOrigin)}`;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentOrigin);
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
        maxHeight: '90vh',
        overflowY: 'auto',
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
            <span>모바일 어플 다운로드 & QR 스캔</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Section 1: QR Code Scan for Mobile */}
        <div style={{ backgroundColor: '#eff6ff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 'bold', fontSize: '1rem', color: '#1e40af', marginBottom: '0.75rem' }}>
            <QrCode size={20} color="#3b82f6" />
            <span>스마트폰 카메라로 QR 코드 스캔</span>
          </div>

          <div style={{
            display: 'inline-block',
            padding: '0.75rem',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '0.75rem'
          }}>
            <img 
              src={qrCodeApiUrl} 
              alt="Team Calendar QR Code" 
              style={{ width: '160px', height: '160px', display: 'block' }}
            />
          </div>

          <p style={{ fontSize: '0.85rem', color: '#1d4ed8', margin: '0 0 0.75rem 0' }}>
            휴대폰 카메라 앱으로 위 QR 코드를 찍으면 모바일 캘린더가 즉시 열립니다!
          </p>

          <button
            onClick={handleCopyLink}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid #93c5fd',
              backgroundColor: '#fff',
              color: '#1d4ed8',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? '링크 복사 완료' : '모바일 접속 링크 복사'}
          </button>
        </div>

        {/* Section 2: Direct APK Download */}
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
            <Download size={18} color="#10b981" />
            <span>안드로이드 APK 설치 파일 직접 다운로드</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
            PC에 파일로 다운받은 뒤 스마트폰으로 옮겨서 설치할 수 있습니다.
          </p>

          <a 
            href="/TeamCalendar.apk" 
            download="TeamCalendar.apk"
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
              gap: '0.4rem',
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
            <Download size={16} />
            TeamCalendar.apk 다운로드 받기
          </a>
        </div>

        {/* Section 3: PWA Mobile Install Guide */}
        <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem', color: '#166534', marginBottom: '0.4rem' }}>
            <Globe size={18} color="#10b981" />
            <span>스마트폰 홈 화면에 아이콘 추가 (PWA)</span>
          </div>
          <ul style={{ fontSize: '0.8rem', color: '#166534', paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li><strong>iPhone (Safari)</strong>: 하단 공유 버튼(<Share size={12} style={{ display: 'inline' }} />) ➔ <strong>'홈 화면에 추가'</strong></li>
            <li><strong>Android (Chrome)</strong>: 우측 상단 메뉴(⋮) ➔ <strong>'앱 설치'</strong> 또는 <strong>'홈 화면에 추가'</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
