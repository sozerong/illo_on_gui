import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Survey from './components/Survey';
import Resume from './components/Resume';
import ResumeResult from './components/ResumeResult';
import ResumeManage from './components/ResumeManage';
import OAuthCallback from './components/OAuthCallback';
import Home from './components/Home';
import JobDetail from './components/JobDetail';
import BookmarkPage from './components/BookmarkPage';
import SearchResult from './components/SearchResult';

function RootRedirect() {
  return <Navigate to="/home" replace />;
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');
  if (!token || !userId) return <Navigate to="/login" replace />;
  return children;
}

function MainLayout({ showFooter }) {
  return (
    <div className="h-screen w-full bg-white flex flex-col font-['Noto_Sans_KR']">
      <Header />
      <main className="flex-grow overflow-y-auto bg-white">
        <div className="flex items-start justify-center min-h-full">
          <Outlet />
        </div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  const [bookmarks, setBookmarks] = useState({});
  const [allJobs, setAllJobs] = useState([]);

  const toggleBookmark = async (id) => {
    if (String(id).startsWith('rec-') || String(id).startsWith('illione-') || String(id).startsWith('featured-') || String(id).startsWith('region-') || String(id).startsWith('all-')) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const res = await fetch(`https://illoon.cloud/api/jobs/${id}/scrap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('스크랩 요청 실패');
      setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));
    } catch (err) {
      console.error(err);
      alert('스크랩 처리 중 오류가 발생했어요.');
    }
  };

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Header + Footer */}
      <Route element={<MainLayout showFooter={true} />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Header only */}
      <Route element={<MainLayout showFooter={false} />}>
        <Route path="/survey" element={<Survey />} />
        <Route path="/oauth2/redirect" element={<OAuthCallback />} />
        {/* 이력서/북마크 - 로그인 필요 */}
        <Route path="/resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
        <Route path="/resume/result" element={<ProtectedRoute><ResumeResult /></ProtectedRoute>} />
      </Route>

      {/* Full-page (no global header/footer) */}
      <Route path="/home" element={
        <Home
          bookmarks={bookmarks}
          toggleBookmark={toggleBookmark}
          allJobs={allJobs}
          setAllJobs={setAllJobs}
        />
      } />
      <Route path="/job/:id" element={<JobDetail />} />
      <Route path="/search" element={
        <SearchResult bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
      } />
      {/* 이력서/북마크 - 로그인 필요 */}
      <Route path="/bookmark" element={
        <ProtectedRoute><BookmarkPage /></ProtectedRoute>
      } />
      <Route path="/resume/manage" element={
        <ProtectedRoute><ResumeManage /></ProtectedRoute>
      } />
    </Routes>
  );
}
