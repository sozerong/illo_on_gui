import React from 'react';
import { usePhoneVerification } from '../hooks/usePhoneVerification';

export default function PhoneVerifyBlock({ onVerified }) {
  const { phone, setPhone, isVerified, verificationId, requestVerification } = usePhoneVerification();

  React.useEffect(() => {
    if (isVerified) onVerified(verificationId);
  }, [isVerified, verificationId, onVerified]);

  return (
    <div className="space-y-2.5">
      <label className="text-[15px] font-bold text-[#333]">휴대폰</label>
      {!isVerified ? (
        <div className="space-y-2.5">
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="핸드폰 번호를 입력해주세요."
            className="w-full h-[56px] px-5 bg-[#F2F4F7] rounded-[12px] outline-none" />
          <button onClick={requestVerification}
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
  );
}
