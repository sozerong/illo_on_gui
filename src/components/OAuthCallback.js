import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneVerifyBlock from './PhoneVerifyBlock';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isNewUser, setIsNewUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fullUrl = window.location.href;
    const queryString = fullUrl.includes('?')
      ? fullUrl.split('?')[1]
      : fullUrl.split('/oauth2/redirect')[1];

    const params = new URLSearchParams(queryString);
    const tokenParam = params.get('token');
    const refreshTokenParam = params.get('refreshToken');
    const isNewUserParam = params.get('isNewUser');

    if (!tokenParam) {
      setError('로그인 정보를 받아오지 못했어요. 다시 시도해 주세요.');
      return;
    }

    localStorage.setItem('access_token', tokenParam);
    if (refreshTokenParam) localStorage.setItem('refresh_token', refreshTokenParam);
    setToken(tokenParam);
    setIsNewUser(isNewUserParam === 'true');

    if (isNewUserParam === 'false') {
      try {
        const b64 = tokenParam.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(b64));
        if (payload.sub) localStorage.setItem('user_id', payload.sub);
      } catch (e) {}
      navigate('/home');
    }
  }, [navigate]);

  const handleIntegrate = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://illoon.cloud/api/auth/oauth2/integrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ verificationId }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) localStorage.setItem('access_token', data.accessToken);
        if (data.userId) localStorage.setItem('user_id', String(data.userId));
        navigate('/survey');
      }
    } catch (err) {
      console.error(err);
      setError('계정 연동에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <div style={{ fontSize: 16, color: '#4D5562' }}>{error}</div>
        <button onClick={() => navigate('/login')}
          style={{ background: '#2196F3', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
          로그인으로 돌아가기
        </button>
      </div>
    );
  }

  if (isNewUser === null) return null;

  return (
    <div className="flex flex-col items-center w-[440px] mx-auto py-12">
      <h2 className="text-[24px] font-bold text-[#333] mb-3">휴대폰 인증</h2>
      <p className="text-[14px] text-[#6B7684] mb-10 text-center">
        로그인이 완료됐어요! 😊<br />
        본인 확인을 위해 휴대폰 인증이 필요해요.
      </p>

      <div className="w-full space-y-7">
        <PhoneVerifyBlock onVerified={(vid) => { setVerificationId(vid); setIsVerified(true); }} />

        <button
          onClick={handleIntegrate}
          disabled={!isVerified || loading}
          className={`w-full h-[60px] font-bold rounded-[12px] text-[18px] transition-all ${isVerified && !loading ? 'bg-[#2196F3] text-white cursor-pointer' : 'bg-[#E5E8EB] text-[#B0B8C1] cursor-not-allowed'}`}
        >
          {loading ? '처리중...' : '가입 완료'}
        </button>
      </div>
    </div>
  );
};

export default OAuthCallback;
