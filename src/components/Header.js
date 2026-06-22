import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="w-full h-[65px] border-b border-[#F8F9FA] flex-shrink-0 flex justify-center items-center px-8 bg-white z-10">
      <div className="w-full max-w-[1200px] flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
          <img src="/fish.png" alt="logo" className="h-4 w-auto" />
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#46484D] cursor-pointer" onClick={() => navigate('/home')}>
          <img src="/home.png" alt="home" className="w-4 h-4 opacity-60" />
          <span>일로온 홈</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
