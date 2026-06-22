import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-[#F8F9FA] py-6 flex-shrink-0 flex justify-center bg-[#FCFDFF]">
      <div className="w-full max-w-[1200px] px-8 flex justify-between items-center text-[11px] text-[#B0B8C1]">
        <span>© Illo-on Lab, Inc</span>
        <div className="flex gap-8 items-center text-[#8B95A1]">
          <div className="flex gap-5">
            <span>이용약관</span>
            <span className="font-bold text-[#6B7684]">개인정보처리방침</span>
          </div>
          <div className="flex items-center border border-[#E5E8EB] rounded-[6px] px-3 py-1.5 gap-3 text-[#6B7684] bg-white cursor-pointer">
            <span>한국어</span>
            <span className="text-[8px]">▼</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;