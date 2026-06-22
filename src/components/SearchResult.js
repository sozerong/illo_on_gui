import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SearchResult = ({ bookmarks, toggleBookmark }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);

  const fetchJobsPage = async (pageNum, keyword) => {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams({ 'condition.keyword': keyword, 'condition.page': pageNum, 'condition.size': 8 });
    const res = await fetch(`https://illoon.cloud/api/jobs?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.jobs ?? data ?? [];
  };

  const runSearch = async (keyword) => {
    setLoading(true);
    try {
      const newJobs = await fetchJobsPage(0, keyword);
      if (newJobs === null) return;
      setJobs(newJobs);
      setPage(0);
      setHasMore(newJobs.length > 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(queryFromUrl);
    if (queryFromUrl) runSearch(queryFromUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFromUrl]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreJobs();
      }
    }, { threshold: 0 });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, page, searchQuery]);

  const loadMoreJobs = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newJobs = await fetchJobsPage(nextPage, searchQuery);
      if (newJobs === null) return;
      if (newJobs.length === 0) {
        setHasMore(false);
        return;
      }
      setJobs(prev => [...prev, ...newJobs]);
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

  const handleJobClick = (jobId) => navigate('/job/' + jobId);

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

  const BookmarkIcon = ({ filled }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#2196F3' : 'none'} stroke={filled ? '#2196F3' : '#ADB5BD'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const JobCard = ({ id, title, meta }) => (
    <div className="job-card" onClick={() => handleJobClick(id)}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: 12 }}>
        <div onClick={(e) => { e.stopPropagation(); toggleBookmark(id); }} style={{ cursor: 'pointer' }}><BookmarkIcon filled={!!bookmarks[id]} /></div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', lineHeight: 1.5, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#ADB5BD' }}>{meta}</div>
      <button className="apply-btn" onClick={(e) => { e.stopPropagation(); handleJobClick(id); }}>
        지원하러 가기 ›
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif", width: '100%' }}>
      <style>{`
        .job-card { background: #fff; border-radius: 16px; padding: 20px; cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; transition: box-shadow 0.2s ease; }
        .job-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
        .job-card .apply-btn { width: 100%; padding: 10px 0; background: #2196F3; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transform: translateY(50px); opacity: 0; transition: transform 0.25s ease, opacity 0.2s ease; display: block; margin-top: 8px; }
        .job-card:hover .apply-btn { transform: translateY(0); opacity: 1; }
      `}</style>

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
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 32px 80px' }}>

        {/* 검색바 */}
        <div style={{ display: 'flex', alignItems: 'center', height: 56, border: '1px solid #E5E8EB', borderRadius: 14, padding: '0 20px', marginBottom: 28, gap: 12 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="공고 검색"
            style={{ flex: 1, height: '100%', border: 'none', outline: 'none', fontSize: 15, color: '#333', background: 'transparent' }}
          />
          <svg onClick={handleSearch} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4D5562" strokeWidth="2" style={{ cursor: 'pointer' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 16 }}>
          '{searchQuery}' 검색 결과
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#ADB5BD' }}>검색 중...</div>
        ) : jobs.length === 0 ? (
          <div style={{ background: '#F8FAFC', borderRadius: 20, padding: '60px 20px', textAlign: 'center', border: '1px solid #F2F4F7' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>검색 결과가 없어요</div>
            <div style={{ fontSize: 14, color: '#ADB5BD' }}>다른 키워드로 검색해보세요!</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {jobs.map((job, i) => (
                <JobCard key={`${job.id}-${i}`} id={job.id} title={job.title} meta={`${job.company} · ${job.location}`} />
              ))}
            </div>
            {hasMore && (
              <div ref={observerRef} style={{ textAlign: 'center', padding: 20, color: '#ADB5BD', fontSize: 13 }}>
                {loadingMore ? '불러오는 중...' : ''}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResult;