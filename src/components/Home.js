import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ bookmarks, toggleBookmark, allJobs, setAllJobs }) => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('해운대구');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobsLoading, setJobsLoading] = useState(true);
  const [regionJobs, setRegionJobs] = useState([]);
  const [regionJobsLoading, setRegionJobsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const allJobsRef = useRef(null);
  const scrollRef = useRef(null);

  const [alarmOpen, setAlarmOpen] = useState(false);

  // 챗봇 state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1, from: 'bot', time: '오후 1:10',
      text: '안녕하세요. 일리온 봇입니다.\n\n문의사항을 입력해주세요.\n\n어떤 질문할지 고민이 되신다면 아래 메뉴를 눌러 자주 묻는 질문을 확인해주세요!',
      categoryChips: ['공고/채용정보', '나의 검색'],
    }
  ]);
  const FAQ_CATEGORIES = {
    '공고/채용정보': [
      '요즘 가장 많이 올라오는 직무가 뭔가요?',
      '요즘 IT 기업이 많이 요구하는 스킬이 뭔가요?',
      '신입이 지원하기 좋은 공고 알려주세요',
      '재택근무 가능한 공고 뭐가 있나요?',
      '연봉 제일 높은 직무가 뭔가요?',
    ],
    '나의 검색': [
      '나한테 맞는 공고 추천해줘',
      '내 경력에 맞는 공고 있나요?',
      '내 전공으로 지원 가능한 공고 있나요?',
    ],
  };
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  const regions = ['강서구','금정구','기장군','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'];

  useEffect(() => {
    if (allJobs.length > 0) { setJobsLoading(false); return; }
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('https://illoon.cloud/api/jobs/keywords', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('공고 불러오기 실패');
        const data = await res.json();
        setAllJobs(data);
      } catch (err) { console.error(err); }
      finally { setJobsLoading(false); }
    };
    fetchJobs();
  }, [allJobs.length, setAllJobs]);

  const [recommendJobs, setRecommendJobs] = useState([]);
  const [topRecommendJobs, setTopRecommendJobs] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('https://illoon.cloud/api/jobs/recommendations/survey', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setRecommendJobs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecommendations();
  }, []);

  useEffect(() => {
    const fetchTopRecommendations = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('https://illoon.cloud/api/jobs/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setTopRecommendJobs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopRecommendations();
  }, []);
  

  useEffect(() => {
    const fetchRegionJobs = async () => {
      setRegionJobsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`https://illoon.cloud/api/jobs?condition.location=${encodeURIComponent(selectedRegion)}&condition.page=0&condition.size=8`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRegionJobs(data.jobs || []);
      } catch (err) { setRegionJobs([]); }
      finally { setRegionJobsLoading(false); }
    };
    fetchRegionJobs();
  }, [selectedRegion]);

  useEffect(() => {
    if (chatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // 무한스크롤: 스크롤 바닥 닿으면 다음 페이지를 기존 리스트에 이어붙임
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreJobs();
      }
    }, { threshold: 0 });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, page]);

  const fetchJobsPage = async (pageNum) => {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams({ 'condition.page': pageNum, 'condition.size': 8 });
    const res = await fetch(`https://illoon.cloud/api/jobs?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.jobs ?? data ?? [];
  };

  const loadMoreJobs = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newJobs = await fetchJobsPage(nextPage);
      if (newJobs === null) return;
      if (newJobs.length === 0) {
        setHasMore(false);
        return;
      }
      // 무한스크롤: 기존 리스트 뒤에 이어붙임
      setAllJobs(prev => [...prev, ...newJobs]);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate('/search?q=' + encodeURIComponent(searchQuery));
  };

  const handleJobClick = (jobId) => {
    if (String(jobId).startsWith('rec-') || String(jobId).startsWith('region-') || String(jobId).startsWith('all-') || String(jobId).startsWith('illione-') || String(jobId).startsWith('featured-')) return;
    navigate('/job/' + jobId);
  };

  const scrollRight = () => { if (scrollRef.current) scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' }); };
  const scrollLeft = () => { if (scrollRef.current) scrollRef.current.scrollBy({ left: -280, behavior: 'smooth' }); };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch('https://illoon.cloud/api/auth/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
    } catch (err) { console.error(err); }
    finally { localStorage.clear(); navigate('/login'); }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    const time = `오후 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), from: 'user', text: chatInput, time },
      { id: Date.now() + 1, from: 'bot', text: '문의 내용을 확인 중입니다. 잠시만 기다려주세요!', time },
    ]);
    setChatInput('');
  };

  const getChatTime = () => {
    const now = new Date();
    return `오후 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const handleCategoryClick = (category) => {
    const time = getChatTime();
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), from: 'bot', time, text: `'${category}' 관련 질문이에요. 궁금한 걸 선택해주세요!`, faqChips: FAQ_CATEGORIES[category] },
    ]);
  };

  const handleFaqClick = (question) => {
    const time = getChatTime();
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), from: 'user', time, text: question },
      { id: Date.now() + 1, from: 'bot', time, text: '아직 준비 중인 답변이에요. 곧 더 정확한 정보로 찾아올게요!' },
    ]);
  };


  const BookmarkIcon = ({ filled, white }) => (
    <svg width="16" height="16" viewBox="0 0 24 24"
      fill={filled ? (white ? '#fff' : '#2196F3') : 'none'}
      stroke={filled ? (white ? '#fff' : '#2196F3') : (white ? 'rgba(255,255,255,0.7)' : '#ADB5BD')}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );


  const SmallJobCard = ({ id, title, company, meta }) => {
    return (
      <div className="job-card" onClick={() => handleJobClick(id)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4D5562' }}>{company}</span>
          <div onClick={(e) => { e.stopPropagation(); toggleBookmark(id); }} style={{ cursor: 'pointer' }}><BookmarkIcon filled={!!bookmarks[id]} /></div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', lineHeight: 1.5, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#ADB5BD' }}>{meta}</div>
        <button className="apply-btn" onClick={(e) => { e.stopPropagation(); handleJobClick(id); }}>
          지원하러 가기 ›
        </button>
      </div>
    );
  };

  const RegionJobCard = ({ id, title, company, meta }) => {
    const initial = company ? company.charAt(0) : '일';
    return (
      <div className="job-card" onClick={() => handleJobClick(id)} style={{ padding: '20px', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EEF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#2196F3', flexShrink: 0 }}>
              {initial}
            </div>
            <span style={{ fontSize: 12, color: '#6B7684', fontWeight: 500 }}>{company}</span>
          </div>
          <div onClick={(e) => { e.stopPropagation(); toggleBookmark(id); }} style={{ cursor: 'pointer' }}><BookmarkIcon filled={!!bookmarks[id]} /></div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#191F28', lineHeight: 1.5, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#ADB5BD' }}>{meta}</div>
        <button className="apply-btn" onClick={(e) => { e.stopPropagation(); handleJobClick(id); }}>
          지원하러 가기 ›
        </button>
      </div>
    );
  };

  const RecommendCard = ({ id, title, meta }) => (
    <div onClick={() => handleJobClick(id)} style={{ minWidth: 260, maxWidth: 260, background: '#fff', borderRadius: 14, flexShrink: 0, boxShadow: '0 2px 10px rgba(33,150,243,0.1)', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
      <div onClick={(e) => { e.stopPropagation(); toggleBookmark(id); }} style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, cursor: 'pointer' }}><BookmarkIcon filled={!!bookmarks[id]} /></div>
      <div style={{ height: 160, background: 'linear-gradient(135deg, #5BC8F5 0%, #2196F3 50%, #1565C0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -25, right: -15, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
            <path d="M6 20C6 12.27 12.27 6 20 6C27.73 6 34 12.27 34 20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M20 34C16.13 34 13 30.87 13 27C13 23.13 16.13 20 20 20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <circle cx="20" cy="27" r="3.5" fill="white"/>
          </svg>
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#191F28', lineHeight: 1.5, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#ADB5BD' }}>{meta}</div>
      </div>
    </div>
  );

  // 챗봇 컴포넌트
  const Chatbot = () => (
    <>
      {/* 챗봇 창 */}
      {chatOpen && (
        <div style={{ position: 'fixed', bottom: 90, right: 24, width: 340, background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', zIndex: 999, display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 560 }}>
          {/* 헤더 */}
          <div style={{ background: '#fff', padding: '16px 20px', borderBottom: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#191F28' }}>일리온 챗봇과 대화하기</span>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2" strokeLinecap="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
          </div>
          {/* 개인정보 안내 */}
          <div style={{ background: '#F8FAFC', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #F2F4F7' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontSize: 11, color: '#6B7684' }}>원활한 상담을 위해 대화 내용이 보관됩니다.</span>
          </div>
          {/* 메시지 영역 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 날짜 */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: '#fff', background: '#ADB5BD', borderRadius: 20, padding: '3px 12px' }}>4월 6일 월요일</span>
            </div>
            {chatMessages.map((msg) => (
              <div key={msg.id}>
                {msg.from === 'bot' ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EEF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ background: '#F8FAFC', borderRadius: '4px 14px 14px 14px', padding: '10px 14px', fontSize: 13, color: '#191F28', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: 4 }}>
                        {msg.text}
                      </div>
                      {msg.categoryChips && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                          {msg.categoryChips.map((chip, i) => (
                            <button key={i} onClick={() => handleCategoryClick(chip)}
                              style={{ fontSize: 12, fontWeight: 600, color: '#2196F3', background: '#EEF6FF', border: '1px solid #BFDBFE', borderRadius: 20, padding: '6px 14px', cursor: 'pointer' }}>
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                      {msg.faqChips && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 4 }}>
                          {msg.faqChips.map((chip, i) => (
                            <button key={i} onClick={() => handleFaqClick(chip)}
                              style={{ fontSize: 12, color: '#2196F3', background: '#fff', border: '1px solid #BFDBFE', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', textAlign: 'left' }}>
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: '#ADB5BD' }}>{msg.time}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ background: '#2196F3', borderRadius: '14px 4px 14px 14px', padding: '10px 14px', fontSize: 13, color: '#fff', lineHeight: 1.7, maxWidth: '80%' }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: 10, color: '#ADB5BD', marginTop: 4 }}>{msg.time}</div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
          {/* 입력창 */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="메세지 보내기"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#333', background: 'transparent' }}
            />
            <button onClick={sendChat} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 챗봇 플로팅 버튼 - 동동 떠다니는 애니메이션 */}
      <style>{`
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%', background: '#fffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(33,150,243,0.4)', zIndex: 998, animation: chatOpen ? 'none' : 'floating 2.5s ease-in-out infinite' }}>
        {chatOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <img src="/chat.png" alt="chat" style={{ width: 28, height: 28, objectFit: 'contain' }} />
        )}
      </button>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif", width: '100%' }}>
      <style>{`
        .job-card { background: #fff; border-radius: 16px; padding: 20px; cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; transition: box-shadow 0.2s ease; }
        .job-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
        .job-card .apply-btn { width: 100%; padding: 10px 0; background: #2196F3; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transform: translateY(50px); opacity: 0; transition: transform 0.25s ease, opacity 0.2s ease; display: block; margin-top: 8px; }
        .job-card:hover .apply-btn { transform: translateY(0); opacity: 1; }
      `}</style>

      {/* 챗봇 */}
      <Chatbot />

      {/* 헤더 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #F2F4F7', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <img src="/fish.png" alt="fish" style={{ height: 16, cursor: 'pointer' }} onClick={() => navigate('/home')} onError={e => e.target.style.display='none'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 13, color: '#4D5562', cursor: 'pointer' }} onClick={() => navigate('/resume/manage')}>이력서 관리</span>
            <span style={{ fontSize: 13, color: '#4D5562', cursor: 'pointer' }} onClick={() => navigate('/bookmark')}>공고 모아보기</span>
            {localStorage.getItem('access_token') ? (
              <span onClick={handleLogout} style={{ fontSize: 13, color: '#ADB5BD', cursor: 'pointer' }}>로그아웃</span>
            ) : (
              <span onClick={() => navigate('/login')} style={{ fontSize: 13, color: '#ADB5BD', cursor: 'pointer' }}>로그인</span>
            )}
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

      {/* 로고 + 검색바 */}
      <div style={{ background: '#fff', padding: '20px 32px 18px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 14 }}>
            <img src="/logo2.png" alt="ILLO-ON" style={{ height: 44 }} onError={e => e.target.style.display='none'} />
          </div>
          <div style={{ background: '#fff', borderRadius: 50, border: '1.5px solid #E5E8EB', display: 'flex', alignItems: 'center', padding: '0 20px', height: 52, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="공고 검색"
              style={{ flex: 1, height: '100%', border: 'none', outline: 'none', fontSize: 15, color: '#333', background: 'transparent' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, color: '#2196F3', fontWeight: 700 }}>1</span>
              <span style={{ fontSize: 14, color: '#4D5562' }}>토스</span>
              <span style={{ fontSize: 14, color: '#ADB5BD' }}>—</span>
              <span style={{ fontSize: 14, color: '#ADB5BD' }}>•••</span>
              <svg onClick={handleSearch} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4D5562" strokeWidth="2" style={{ cursor: 'pointer' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 32px 80px' }}>

        {/* 배너 + 추천공고 */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'stretch' }}>
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28' }}><span style={{ color: '#2196F3' }}>김여주</span> 님!</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>취업하러 이리와봐유 🔥</div>
            </div>
            <div style={{ background: 'linear-gradient(150deg, #2196F3 0%, #42A5F5 60%, #90CAF9 100%)', borderRadius: 18, padding: '22px 20px 0 20px', color: '#fff', position: 'relative', overflow: 'hidden', minHeight: 340 }}>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.4, marginBottom: 20 }}>AI로 이력서 빠르게<br />평가 받기</div>
              <button onClick={() => navigate('/resume')} style={{ background: '#fff', color: '#2196F3', border: 'none', borderRadius: 18, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                평가하러가기 <span>›</span>
              </button>
              <img src="/character2.png" alt="character" style={{ position: 'absolute', right: -10, bottom: 0, width: 200 }} onError={e => e.target.style.display='none'} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, background: '#F9FAFF', borderRadius: 18, padding: '20px 28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', marginBottom: 20 }}>
              <span style={{ color: '#2196F3' }}>김여주</span> 님을 위한 추천 공고!
            </div>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button onClick={scrollLeft} style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 34, height: 34, borderRadius: '50%', background: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div ref={scrollRef} style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', width: '100%' }}>
                {topRecommendJobs.length > 0 ? topRecommendJobs.map((job) => (
                  <RecommendCard key={job.jobId} id={job.jobId} title={job.title} meta={`${job.company} · ${job.location}`} />
                )) : Array(3).fill(null).map((_, i) => (
                  <div key={i} style={{ minWidth: 260, maxWidth: 260, background: '#F2F4F7', borderRadius: 14, flexShrink: 0, height: 240 }} />
                ))}
              </div>
              <button onClick={scrollRight} style={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 34, height: 34, borderRadius: '50%', background: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* 취업 배너 */}
        <div style={{ background: 'linear-gradient(90deg, #1976D2 0%, #2196F3 60%, #64B5F6 100%)', borderRadius: 16, padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 180, top: 0, bottom: 0, width: 50, background: 'rgba(255,255,255,0.08)', transform: 'skewX(-12deg)' }} />
          <div style={{ position: 'absolute', right: 140, top: 0, bottom: 0, width: 25, background: 'rgba(255,255,255,0.05)', transform: 'skewX(-12deg)' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>취업이 하고 싶긴 하니?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>근데 니발은 왜 발레를 하나도 안해본 사람 발같아:?</div>
          </div>
          <button style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 10, padding: '9px 18px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>발레 배우러 가기 ›</button>
        </div>

        {/* 오늘의 스크랩 현황 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>오늘의 스크랩 현황</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: '새로운 공고', value: 5, color: '#2196F3', img: '/character3.png' },
              { label: '마감 임박 공고', value: 2, color: '#FF6B6B', img: '/character4.png' },
              { label: '전체 스크랩', value: Object.values(bookmarks).filter(Boolean).length, color: '#191F28', img: '/character5.png' },
            ].map((item, i) => (
              <div key={i} onClick={() => navigate('/bookmark')} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid #F2F4F7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7684', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: item.color }}>{item.value}</div>
                </div>
                <img src={item.img} alt={item.label} style={{ width: 90, height: 90, objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
              </div>
            ))}
          </div>
        </div>

        {/* 일리온이 추천하는 공고 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>일리온이 추천하는 공고! 놓치지 마세요!</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'start' }}>
            {(recommendJobs.length > 0 ? recommendJobs.slice(0, 6) : Array(6).fill(null)).map((job, i) => (
              <SmallJobCard
                key={job?.jobId ?? i}
                id={job?.jobId ?? `illione-${i}`}
                title={job?.title ?? '불러오는 중...'}
                company={job?.company ?? ''}
                meta={job ? `${job.company ?? ''} · ${job.location ?? ''}`.trim() : ''}
              />
            ))}
          </div>
        </div>

        {/* AI가 평가해준 내 이력서 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>AI가 평가해준 내 이력서</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { role: 'Product Designer', score: 70, date: '18일 목요일', note: '김여주 님이 부족한 부분', skills: ['UX Research', 'Figma'] },
                { role: 'UX/UI Designer', score: 40, date: '18일 목요일', note: '김여주 님이 부족한 부분', skills: ['Design skill', '그냥 다'] },
              ].map((item, i) => (
                <div key={i} style={{ background: '#F8FAFC', borderRadius: 14, padding: '16px 20px', border: '1px solid #F2F4F7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#ADB5BD' }}>이력서 분석</div>
                      <div style={{ fontSize: 11, color: '#ADB5BD' }}>{item.date}</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#191F28' }}>{item.role}</div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#2196F3', marginBottom: 6 }}>{item.score}</div>
                  <div style={{ fontSize: 11, color: '#6B7684', marginBottom: 8 }}>{item.note}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {item.skills.map((s, j) => (
                      <span key={j} style={{ fontSize: 11, color: '#6B7684', background: '#EEF2FF', borderRadius: 6, padding: '3px 10px' }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <div style={{ position: 'relative', width: 160, height: 160 }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="64" fill="none" stroke="#E5E8EB" strokeWidth="16"/>
                  <circle cx="80" cy="80" r="64" fill="none" stroke="#2196F3" strokeWidth="16"
                    strokeDasharray={`${2 * Math.PI * 64 * 0.7} ${2 * Math.PI * 64 * 0.3}`}
                    strokeDashoffset={2 * Math.PI * 64 * 0.25} strokeLinecap="round"/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#191F28' }}>70</div>
                  <div style={{ fontSize: 13, color: '#6B7684' }}>양호</div>
                </div>
              </div>
              <button onClick={() => navigate('/resume/result')} style={{ background: '#2196F3', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                더보러 가기 <span>›</span>
              </button>
            </div>
            <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '20px', border: '1px solid #F2F4F7', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
              {[{ label: '스킬', value: 84 }, { label: '경력', value: 84 }, { label: '포트폴리오', value: 84 }, { label: '직무적합성', value: 84 }].map((stat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#4D5562', width: 64, flexShrink: 0 }}>{stat.label}</span>
                  <div style={{ flex: 1, height: 7, background: '#E5E8EB', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${stat.value}%`, height: '100%', background: '#2196F3', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#191F28', width: 24, textAlign: 'right' }}>{stat.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid #E5E8EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#4D5562' }}>내 이력서 총 점수 :</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#2196F3' }}>70점</span>
              </div>
            </div>
          </div>
        </div>

        {/* 취업 배너 2 */}
        <div style={{ background: 'linear-gradient(90deg, #1976D2 0%, #2196F3 60%, #64B5F6 100%)', borderRadius: 16, padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 180, top: 0, bottom: 0, width: 50, background: 'rgba(255,255,255,0.08)', transform: 'skewX(-12deg)' }} />
          <div style={{ position: 'absolute', right: 140, top: 0, bottom: 0, width: 25, background: 'rgba(255,255,255,0.05)', transform: 'skewX(-12deg)' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>취업이 하고 싶긴 하니?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>근데 니발은 왜 발레를 하나도 안해본 사람 발같아:?</div>
          </div>
          <button style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 10, padding: '9px 18px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>발레 배우러 가기 ›</button>
        </div>

        {/* 충청남도 지역별 공고 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>부산광역시 지역별 공고</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {regions.map((r) => (
              <button key={r} onClick={() => setSelectedRegion(r)}
                style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: selectedRegion === r ? 700 : 400, background: selectedRegion === r ? '#2196F3' : '#fff', color: selectedRegion === r ? '#fff' : '#6B7684', border: `1px solid ${selectedRegion === r ? '#2196F3' : '#E5E8EB'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                {r}
              </button>
            ))}
          </div>
          {regionJobsLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#ADB5BD' }}>불러오는 중...</div>
          ) : regionJobs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {regionJobs.map((job) => <RegionJobCard key={job.id} id={job.id} title={job.title} company={job.company} meta={job.location} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 30, color: '#ADB5BD', fontSize: 14 }}>해당 지역 공고가 없어요.</div>
          )}
        </div>

        {/* 전체 공고 */}
        <div ref={allJobsRef} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>전체 공고</div>
          {jobsLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#ADB5BD' }}>공고 불러오는 중...</div>
          ) : allJobs.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {allJobs.map((job, i) => <SmallJobCard key={`${job.id}-${i}`} id={job.id} title={job.title} company={job.company ?? ''} meta={`${job.company} · ${job.location}`} />)}
              </div>
              {hasMore && (
                <div ref={observerRef} style={{ textAlign: 'center', padding: 20, color: '#ADB5BD', fontSize: 13 }}>
                  {loadingMore ? '불러오는 중...' : ''}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {Array(16).fill(null).map((_, i) => <SmallJobCard key={i} id={`all-${i}`} title="[글로벌] 프로덕트 디자이너 (Product Designer / UIUX)" company="올투 천연수소" meta="올투 천연수소 · 경력 3년↑" />)}
            </div>
          )}
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

export default Home;