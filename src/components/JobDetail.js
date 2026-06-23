import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const KAKAO_MAP_KEY = '6ec78b7a9b90b0f07dbb6708e5e9a5d7';

const JobDetail = ({ bookmarks = {}, toggleBookmark }) => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('주요업무');
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [alarmOpen, setAlarmOpen] = useState(false);
  const mapRef = useRef(null);
  const bookmarked = !!bookmarks[jobId];

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`https://illoon.cloud/api/jobs/${jobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 404) {
          setError('존재하지 않는 공고입니다.');
          return;
        }
        if (!res.ok) throw new Error('공고 불러오기 실패');
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error(err);
        setError('공고를 불러오는데 실패했어요.');
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  // 추천 공고 fetch
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('https://illoon.cloud/api/jobs/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setRecommendations(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecommendations();
  }, []);

  // 카카오맵 초기화
  useEffect(() => {
    if (!job?.lat || !job?.lng || !mapRef.current) return;

    const initMap = () => {
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(job.lat, job.lng),
        level: 4,
      };
      const map = new window.kakao.maps.Map(container, options);
      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(job.lat, job.lng),
      });
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`;
      script.onload = () => window.kakao.maps.load(initMap);
      document.head.appendChild(script);
    }
  }, [job]);

  const handleBookmark = async () => {
    setBookmarkLoading(true);
    try {
      await toggleBookmark(jobId);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const tabs = ['주요업무', '자건요건', '채용전형'];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif" }}>
      <div style={{ color: '#ADB5BD', fontSize: 16 }}>공고 불러오는 중...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", gap: 16 }}>
      <div style={{ color: '#FF6B6B', fontSize: 16 }}>{error}</div>
      <button onClick={() => navigate('/home')} style={{ background: '#2196F3', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>홈으로 돌아가기</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif", width: '100%' }}>

      {/* 헤더 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #F2F4F7', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <img src="/fish.png" alt="fish" style={{ height: 16, cursor: 'pointer' }} onClick={() => navigate('/home')} onError={e => e.target.style.display='none'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 13, color: '#4D5562', cursor: 'pointer' }} onClick={() => navigate('/resume/manage')}>이력서 관리</span>
            <span style={{ fontSize: 13, color: '#4D5562', cursor: 'pointer' }} onClick={() => navigate('/bookmark')}>공고 모아보기</span>
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
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EEF6FF', overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate('/bookmark')}>
              <img src="/my.png" alt="my" style={{ width: 32, height: 32, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 120px' }}>

        {/* 회사 정보 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EEF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {job?.companyLogo ? (
              <img src={job.companyLogo} alt="company" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#6B7684', marginBottom: 4 }}>{job?.company || '회사명'}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#191F28', lineHeight: 1.3 }}>{job?.title || '공고 제목'}</div>
          </div>
        </div>

        {/* 메타 정보 */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: `지역: ${job?.location || '-'}` },
            { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, label: `경력: ${job?.careerType || '무관'}` },
            { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: `마감일: ${job?.deadline || '-'}` },
            { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, label: `조회수: ${job?.viewCount ?? '-'}` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {item.icon}
              <span style={{ fontSize: 13, color: '#4D5562' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* 북마크 + 공유 버튼 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1.5px solid ${bookmarked ? '#2196F3' : '#E5E8EB'}`, borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: bookmarked ? '#2196F3' : '#6B7684', background: bookmarked ? '#EEF6FF' : '#fff', cursor: bookmarkLoading ? 'not-allowed' : 'pointer', opacity: bookmarkLoading ? 0.6 : 1, transition: 'all 0.2s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? '#2196F3' : 'none'} stroke={bookmarked ? '#2196F3' : '#6B7684'} strokeWidth="2" strokeLinecap="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {bookmarkLoading ? '처리중...' : bookmarked ? '스크랩됨' : '스크랩'}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid #E5E8EB', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#6B7684', background: '#fff', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2" strokeLinecap="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            공유
          </button>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', borderBottom: '2px solid #F2F4F7', marginBottom: 28 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: '12px 0', fontSize: 14, fontWeight: activeTab === tab ? 700 : 400, color: activeTab === tab ? '#2196F3' : '#6B7684', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #2196F3' : '2px solid transparent', cursor: 'pointer', marginBottom: -2, transition: 'all 0.15s' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* 회사 이미지 배너 */}
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 28, background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {job?.companyImage ? (
            <img src={job.companyImage} alt="company banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{job?.company || '회사명'}</span>
            </div>
          )}
        </div>

        {/* 본문 */}
        <div style={{ fontSize: 14, color: '#4D5562', lineHeight: 1.9, marginBottom: 32, whiteSpace: 'pre-line' }}>
          {job?.description || '공고 내용이 없습니다.'}
        </div>

        {/* 키워드 태그 */}
        {job?.keywords && job.keywords.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
            {job.keywords.map((kw, i) => (
              <span key={i} style={{ fontSize: 12, color: '#2196F3', background: '#EEF6FF', borderRadius: 20, padding: '5px 14px', fontWeight: 600 }}>{kw}</span>
            ))}
          </div>
        )}

        {/* 마감일 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 10 }}>마감일</div>
          <div style={{ fontSize: 14, color: '#4D5562' }}>{job?.deadline || '-'}</div>
        </div>

        {/* 근무지역 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 10 }}>근무지역</div>
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #F2F4F7', marginBottom: 10 }}>
            {job?.lat && job?.lng ? (
              <div ref={mapRef} style={{ height: 200, width: '100%' }} />
            ) : (
              <div style={{ background: '#F8FAFC', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#ADB5BD' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 8 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div style={{ fontSize: 13 }}>위치 정보 없음</div>
                </div>
              </div>
            )}
          </div>
          <div style={{ fontSize: 13, color: '#6B7684' }}>{job?.address || job?.location || '-'}</div>
        </div>

        {/* 회사 정보 카드 */}
        <div style={{ border: '1px solid #F2F4F7', borderRadius: 14, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EEF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#191F28' }}>{job?.company || '회사명'}</div>
              <div style={{ fontSize: 12, color: '#ADB5BD' }}>IT 전문기업</div>
            </div>
          </div>
          <button style={{ fontSize: 13, color: '#2196F3', fontWeight: 600, background: 'none', border: '1px solid #2196F3', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
            더보기
          </button>
        </div>

        {/* 이런 공고는 어때요? */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#191F28' }}>이런 공고는 어때요?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #E5E8EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4D5562" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #E5E8EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4D5562" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {(recommendations.length > 0 ? recommendations : Array(4).fill(null)).map((rec, i) => (
              <div key={rec?.jobId ?? i}
                onClick={() => rec && navigate('/job/' + rec.jobId)}
                style={{ border: '1px solid #F2F4F7', borderRadius: 12, overflow: 'hidden', cursor: rec ? 'pointer' : 'default', opacity: rec ? 1 : 0.4 }}>
                <div style={{ height: 80, background: 'linear-gradient(135deg, #5BC8F5 0%, #2196F3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {rec?.companyLogo ? (
                    <img src={rec.companyLogo} alt={rec.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#191F28', lineHeight: 1.4, marginBottom: 4 }}>
                    {rec?.title ?? '불러오는 중...'}
                  </div>
                  <div style={{ fontSize: 11, color: '#ADB5BD' }}>
                    {rec ? `${rec.location ?? ''} ${rec.careerType ?? ''}`.trim() : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 하단 고정 지원 버튼 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #F2F4F7', padding: '12px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/home')}
            style={{ width: 52, height: 48, border: '1px solid #E5E8EB', borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button style={{ flex: 1, height: 48, background: '#2196F3', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            지원하기
          </button>
        </div>
      </div>

      {/* 푸터 */}
      <div style={{ background: '#fff', borderTop: '1px solid #F2F4F7', padding: '48px 32px 120px' }}>
       <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <img src="/logo2.png" alt="ILLO-ON" style={{ height: 28, marginBottom: 12 }} onError={e => e.target.style.display='none'} />
            <div style={{ fontSize: 12, color: '#ADB5BD', lineHeight: 2 }}>(주) 000 &nbsp;|&nbsp; 대표리더 노영래</div>
            <div style={{ fontSize: 12, color: '#ADB5BD', lineHeight: 2 }}>충남시 동남구 두정동 노영래집 00구 000로 뿜뿜뿜뿜 &nbsp;|&nbsp; 전화번호 : 010-노영래전화번호</div>
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

export default JobDetail;