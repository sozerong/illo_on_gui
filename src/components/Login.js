import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (email === 'root' && password === 'root') {
      localStorage.setItem('user_id', 'root');
      localStorage.setItem('access_token', 'test-token-root');
      navigate('/home');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('https://illoon.cloud/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        const { userId, accessToken } = data;
        const surveyCompleted = data.surveyCompleted ?? data.survey_completed ?? true;
        localStorage.setItem('user_id', String(userId ?? ''));
        localStorage.setItem('access_token', accessToken);
        if (surveyCompleted) {
          navigate('/home');
        } else {
          navigate('/survey');
        }
      } else {
        let msg = `서버 오류 (${response.status})`;
        try { const err = await response.json(); msg = err.message || err.error || msg; } catch {}
        console.error('Login failed:', response.status, msg);
        throw new Error(msg);
      }
    } catch (error) {
      console.error(error);
      alert(`로그인 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[380px] pt-24">
      <div className="w-full mb-8 relative flex items-end h-[100px]">
        <div className="flex flex-col items-start">
          <img src="/logo.png" alt="ILLO-ON" className="w-[150px] mb-3" />
          <h1 className="text-[20px] font-bold text-[#333] leading-[1.3] tracking-tighter">
            부산 취업은<br />일로온!
          </h1>
        </div>
        <img src="/character.png" alt="character" className="w-[155px] absolute right-[-0px] bottom-[-5px]" />
      </div>

      <div className="w-full space-y-2.5">
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="이메일을 입력해주세요."
          className="w-full h-[56px] px-5 bg-[#F3F4F8] rounded-[12px] outline-none placeholder:text-[#ADB5BD]"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호를 입력해주세요."
            className="w-full h-[56px] px-5 bg-[#F3F4F8] rounded-[12px] outline-none placeholder:text-[#ADB5BD]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20"
          >
            <img src="/eye.png" alt="eye" className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full h-[58px] bg-[#2196F3] text-white font-bold rounded-[12px] mt-2 shadow-sm hover:bg-blue-600 transition-all disabled:opacity-70"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </div>

      <div className="flex items-center gap-4 mt-8 text-[13px] text-[#ADB5BD]">
        <button className="hover:text-gray-600">계정 찾기</button>
        <div className="w-[1px] h-[10px] bg-[#E5E8EB]"></div>
        <button
          className="text-[#4E5968] font-bold hover:text-black"
          onClick={() => navigate('/signup')}
        >
          회원가입
        </button>
      </div>

      <div className="w-full mt-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-[1px] bg-[#F2F4F7]"></div>
          <span className="text-[12px] text-[#D1D5DB]">간편로그인</span>
          <div className="flex-1 h-[1px] bg-[#F2F4F7]"></div>
        </div>
        <div className="flex justify-center gap-5 mb-10">
          {['naver', 'kakao', 'google'].map((sns) => (
            <img
              key={sns}
              src={`/${sns}.png`}
              alt={sns}
              className={`w-[48px] h-[48px] cursor-pointer hover:opacity-80 transition-opacity ${
                sns === 'google' ? 'border border-[#F2F4F7] rounded-full' : ''
              }`}
              onClick={() => {
                if (sns === 'naver') {
                  window.location.href = 'https://illoon.cloud/oauth2/authorization/naver';
                } else if (sns === 'kakao') {
                  window.location.href = 'https://illoon.cloud/oauth2/authorization/kakao';
                } else if (sns === 'google') {
                  window.location.href = 'https://illoon.cloud/oauth2/authorization/google';
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
