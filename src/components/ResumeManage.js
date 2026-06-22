import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ResumeManage = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [alarmOpen, setAlarmOpen] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await fetch('https://illoon.cloud/api/resumes', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setResumes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResumes();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`https://illoon.cloud/api/resumes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
    setResumes(resumes.filter(r => r.id !== id));
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch('https://illoon.cloud/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const ScoreCircle = ({ score }) => {
    const R = 40;
    const circ = 2 * Math.PI * R;
    const pct = score != null ? score / 100 : 0;
    return (
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#E5E8EB" strokeWidth="10"/>
          {score != null && (
            <circle cx="50" cy="50" r={R} fill="none" stroke="#2196F3" strokeWidth="10"
              strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
              strokeDashoffset={circ * 0.25}
              strokeLinecap="round"/>
          )}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {score != null ? (
            <>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#191F28', lineHeight: 1.2 }}>{score}</span>
              <span style={{ fontSize: 11, color: '#2196F3', fontWeight: 600 }}>양호</span>
            </>
          ) : (
            <span style={{ fontSize: 12, color: '#ADB5BD', fontWeight: 600, textAlign: 'center' }}>분석 전</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif", width: '100%' }}>

      {/* 헤더 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #F2F4F7', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <img src="/fish.png" alt="fish" style={{ height: 22, cursor: 'pointer' }} onClick={() => navigate('/home')} onError={e => e.target.style.display='none'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 13, color: '#2196F3', fontWeight: 700, cursor: 'pointer' }}>이력서 관리</span>
            <span style={{ fontSize: 13, color: '#4D5562', cursor: 'pointer' }} onClick={() => navigate('/bookmark')}>공고 모아보기</span>
            <span onClick={handleLogout} style={{ fontSize: 13, color: '#ADB5BD', cursor: 'pointer' }}>로그아웃</span>
            <div style={{ position: 'relative' }}>
              <img src="/alarm.png" alt="alarm" style={{ width: 24, height: 24, cursor: 'pointer' }} onClick={() => setAlarmOpen(v => !v)} onError={e => e.target.style.display='none'} />
              {alarmOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setAlarmOpen(false)} />
                  <div style={{ position: 'absolute', top: 32, right: 0, width: 260, background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 200, border: '1px solid #F2F4F7', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid #F2F4F7', fontSize: 14, fontWeight: 700, color: '#191F28' }}>알림</div>
                    <div style={{ padding: '32px 18px', textAlign: 'center', fontSize: 13, color: '#ADB5BD' }}>알림이 없습니다.</div>
                  </div>
                </>
              )}
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EEF6FF', overflow: 'hidden', cursor: 'pointer' }}>
              <img src="/my.png" alt="my" style={{ width: 32, height: 32, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 32px 80px' }}>

        {/* 타이틀 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#191F28', marginBottom: 8 }}>내 이력서 리스트</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2196F3', lineHeight: 1.35 }}>이력서 관리를<br />한 번에!</div>
        </div>

        {/* 이력서 목록 - 가로로 나란히 */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* 왼쪽 캐릭터 */}
          <div style={{ width: 240, flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', minHeight: 300 }}>
            <img src="/character2.png" alt="character" style={{ width: 220 }} onError={e => e.target.style.display='none'} />
          </div>

          {/* 카드들 - 한 줄로 나란히 */}
          <div style={{ flex: 1, display: 'flex', gap: 20, alignItems: 'stretch' }}>

            {/* 작성된 이력서 카드 */}
            {resumes.map((resume) => (
              <div key={resume.id} style={{ flex: '0 0 280px', background: '#F0F6FF', borderRadius: 20, padding: '24px', position: 'relative', border: '1px solid #E3F0FF', minHeight: 300 }}>
                <button
                  onClick={() => { localStorage.setItem('editing_resume_id', resume.id); navigate('/resume'); }}
                  style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <div style={{ marginBottom: 24, paddingRight: 32 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#191F28', marginBottom: 8, lineHeight: 1.3 }}>{resume.title}</div>
                  <div style={{ fontSize: 13, color: '#6B7684' }}>작성완료 {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }) : ''}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                  <ScoreCircle score={resume.score} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    style={{ background: '#fff', border: '1px solid #E5E8EB', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* 새 이력서 추가 카드 */}
            <div
              onClick={() => navigate('/resume')}
              style={{ flex: '0 0 280px', background: '#fff', borderRadius: 20, padding: '24px', border: '2px dashed #D1D5DB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 300, gap: 12, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2196F3'; e.currentTarget.style.background = '#F0F6FF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#fff'; }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EEF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#6B7684' }}>새 이력서 작성</span>
            </div>

          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div style={{ background: '#fff', borderTop: '1px solid #F2F4F7', padding: '48px 32px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <img src="/logo2.png" alt="ILLO-ON" style={{ height: 28, marginBottom: 12 }} onError={e => e.target.style.display='none'} />
            <div style={{ fontSize: 12, color: '#ADB5BD', lineHeight: 2 }}>(주) 000 &nbsp;|&nbsp; 대표리더 노영래</div>
            <div style={{ fontSize: 12, color: '#ADB5BD', lineHeight: 2 }}>충남시 동남구 두정동 노영래집 00구 000로 뿜뿜뿜뿜, 뀨뀨뀨 뿌직 &nbsp;|&nbsp; 전화번호 : 010-노영래전화번호</div>
            <div style={{ fontSize: 12, color: '#ADB5BD', marginTop: 16 }}>Copyright © 2024 MESSE ESANG All Rights Reserved.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, paddingBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#191F28', whiteSpace: 'nowrap' }}>일로온의 디자이너와 개발자</div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5E8EB', borderRadius: 10, padding: '10px 28px', fontSize: 14, fontWeight: 600, color: '#191F28', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <img src="/fish.png" alt="" style={{ height: 18 }} onError={e => e.target.style.display='none'} />
                보러가기
              </button>
            </div>
            <img src="/character6.png" alt="character" style={{ width: 160 }} onError={e => e.target.style.display='none'} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResumeManage;