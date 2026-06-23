import { useState } from 'react';

const STORE_ID = 'store-2b359459-0d4c-42ce-ad4c-0f42ce8d8ab8';
const CHANNEL_KEY = 'channel-key-fc7388b4-4a49-45d3-b282-aec1fa7f222d';

export function usePhoneVerification() {
  const [phone, setPhone] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationId, setVerificationId] = useState('');

  const requestVerification = async () => {
    if (phone.length < 10) {
      alert('핸드폰 번호를 입력해주세요.');
      return;
    }
    try {
      const response = await window.PortOne.requestIdentityVerification({
        storeId: STORE_ID,
        channelKey: CHANNEL_KEY,
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

  return { phone, setPhone, isVerified, verificationId, requestVerification };
}
