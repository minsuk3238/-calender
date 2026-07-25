import { format } from 'date-fns';

export function exportEventsToCSV(events, calendars) {
  if (!events || events.length === 0) {
    alert('다운로드할 일정 데이터가 없습니다.');
    return;
  }

  // Headers for CSV
  const headers = ['제목', '시작 일시', '종료 일시', '캘린더', '완료 여부', '구글 캘린더 여부'];
  
  const rows = events.map(event => {
    const cal = calendars ? calendars.find(c => c.id === event.calendarId) : null;
    const calName = event.isGoogle ? 'Google Calendar' : (cal ? cal.name : '기본 캘린더');
    const startStr = format(new Date(event.start), 'yyyy-MM-dd HH:mm');
    const endStr = format(new Date(event.end), 'yyyy-MM-dd HH:mm');
    const completedStr = event.isCompleted ? '완료' : '진행중';
    const isGoogleStr = event.isGoogle ? '예' : '아니오';

    // Escape quotes for CSV
    const safeTitle = `"${(event.title || '').replace(/"/g, '""')}"`;
    const safeCalName = `"${calName.replace(/"/g, '""')}"`;

    return [safeTitle, startStr, endStr, safeCalName, completedStr, isGoogleStr].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // Add UTF-8 BOM for Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `팀_캘린더_일정목록_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
