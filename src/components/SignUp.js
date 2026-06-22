import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [agreements, setAgreements] = useState({
    all: false, term1: false, term2: false, term3: false, term4: false,
  });

  // 포트원 V2 휴대폰 인증
  const handleVerifyRequest = async () => {
    if (phone.length < 10) {
      alert("핸드폰 번호를 입력해주세요.");
      return;
    }
    try {
      const response = await window.PortOne.requestIdentityVerification({
        storeId: "store-2b359459-0d4c-42ce-ad4c-0f42ce8d8ab8",
        channelKey: "channel-key-fc7388b4-4a49-45d3-b282-aec1fa7f222d",
        identityVerificationId: `verify-${Date.now()}`,
        verificationRequest: { phoneNumber: phone },
      });
      if (response.code) {
        alert(`본인인증 실패: ${response.message}`);
      } else {
        setVerificationId(response.identityVerificationId);
        setIsVerified(true);
      }
    } catch (err) {
      console.error(err);
      alert('본인인증 중 오류가 발생했어요.');
    }
  };

  const handleToggle = (key) => {
    setAgreements(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      newState.all = newState.term1 && newState.term2 && newState.term3 && newState.term4;
      return newState;
    });
  };

  const handleAllToggle = () => {
    const nextState = !agreements.all;
    setAgreements({ all: nextState, term1: nextState, term2: nextState, term3: nextState, term4: nextState });
  };

  const isSubmitEnabled = agreements.term1 && isVerified;

  // 이메일 회원가입만 - email, password, verificationId
  const handleSubmit = async () => {
    try {
      const response = await axios.post('https://illoon.cloud/api/auth/signup/email', {
        email: email,
        password: password,
        verificationId: verificationId,
      });
      if (response.status === 200 || response.status === 201) {
        if (response.data.accessToken) localStorage.setItem('access_token', response.data.accessToken);
        if (response.data.userId) localStorage.setItem('user_id', String(response.data.userId));
        navigate('/survey');
      }
    } catch (error) {
      console.error(error);
      alert('회원가입에 실패했어요. 다시 시도해 주세요.');
    }
  };

  const terms = [
    { id: 'term1', text: '(필수) 개인회원 약관에 동의', bold: true },
    { id: 'term2', text: '(선택) 위치기반서비스 이용약관에 동의' },
    { id: 'term3', text: '(선택) 마케팅 정보 수신 동의 · 이메일' },
    { id: 'term4', text: '(선택) 마케팅 정보 수신 동의 · SMS/MMS' },
  ];

  return (
    <div className="flex flex-col items-center w-[440px] mx-auto py-12">
      <h2 className="text-[24px] font-bold text-[#333] mb-10">회원가입</h2>
      <div className="w-full space-y-7">

        {/* 이메일 */}
        <div className="space-y-2.5">
          <label className="text-[15px] font-bold text-[#333]">이메일</label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요."
            className="w-full h-[56px] px-5 bg-[#F2F4F7] rounded-[12px] outline-none" />
        </div>

        {/* 비밀번호 */}
        <div className="space-y-2.5">
          <label className="text-[15px] font-bold text-[#333]">비밀번호</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요."
              className="w-full h-[56px] px-5 bg-[#F2F4F7] rounded-[12px] outline-none" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20">
              <img src="/eye.png" alt="toggle" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 휴대폰 인증 */}
        <div className="space-y-2.5">
          <label className="text-[15px] font-bold text-[#333]">휴대폰</label>
          {!isVerified ? (
            <div className="space-y-2.5">
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="핸드폰 번호를 입력해주세요."
                className="w-full h-[56px] px-5 bg-[#F2F4F7] rounded-[12px] outline-none" />
              <button onClick={handleVerifyRequest}
                className="w-full h-[56px] bg-[#2196F3] text-white font-bold rounded-[12px]">
                인증요청
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-full h-[56px] px-5 bg-[#F2F4F7] rounded-[12px] flex items-center">{phone}</div>
              <p className="text-[13px] text-[#8B95A1]">인증이 완료되었습니다.</p>
            </div>
          )}
        </div>

        {/* 약관 동의 */}
        <div className="pt-2 space-y-4">
          <div className="border border-[#E5E8EB] rounded-[12px] p-5 bg-white cursor-pointer" onClick={handleAllToggle}>
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center mt-1 ${agreements.all ? 'bg-[#2196F3] border-[#2196F3]' : 'border-[#E5E8EB]'}`}>
                <span className="text-[10px] text-white">✓</span>
              </div>
              <p className="text-[15px] font-bold text-[#333]">모두 동의합니다.</p>
            </div>
          </div>
          <div className="border border-[#E5E8EB] rounded-[12px] divide-y divide-[#F2F4F7] bg-white overflow-hidden">
            {terms.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-[#F9FAFB]"
                onClick={() => handleToggle(item.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center ${agreements[item.id] ? 'bg-[#2196F3]' : 'bg-[#F2F4F7]'}`}>
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                  <span className={`text-[14px] ${item.bold ? 'font-bold text-[#333]' : 'text-[#4E5968]'}`}>{item.text}</span>
                </div>
                <span className="text-[#B0B8C1]">〉</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!isSubmitEnabled}
          className={`w-full h-[60px] font-bold rounded-[12px] text-[18px] transition-all ${isSubmitEnabled ? 'bg-[#2196F3] text-white cursor-pointer' : 'bg-[#E5E8EB] text-[#B0B8C1] cursor-not-allowed'}`}>
          가입 완료
        </button>
      </div>
    </div>
  );
};

export default SignUp;