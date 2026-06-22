import React from 'react';

const Survey = () => {
  return (
    // h-screen과 overflow-hidden으로 스크롤 절대 방지
    <div className="flex flex-col w-full h-screen bg-white overflow-hidden font-sans">
      
      {/* 1. 상단 여백 조정 (전체 높이를 조절하기 위해 최소화) */}
      <div className="w-full h-[40px] flex-shrink-0"></div>

      {/* 2. 중앙 메인 영역: -mt-40으로 전체적인 위치를 위로 확 끌어올렸습니다 */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-40">
        
        <div className="w-full max-w-[800px] flex flex-col items-center">
          
          {/* 문구: 프로그레스 바 위 */}
          <h3 className="text-[24px] font-bold text-[#2196F3] mb-12 tracking-tight">
            맞춤 공고 추천을 위해 설문 조사를 할게요!
          </h3>

          {/* 프로그레스 바 컨테이너 */}
          <div className="relative w-full h-[18px] bg-[#F2F8FF] rounded-full shadow-inner">
            
            {/* 파란색 진행 바 (20%) */}
            <div className="relative w-[20%] h-full bg-[#2196F3] rounded-full transition-all duration-500">
              
              {/* 캐릭터 + 말풍선: 파란 바의 '가운데' 정렬 */}
              <div className="absolute left-1/2 bottom-full -translate-x-1/2 flex flex-col items-center pb-2">
                
                {/* 단계 말풍선 */}
                <div className="bg-[#2196F3] text-white text-[13px] font-bold px-3 py-1.5 rounded-[8px] mb-2 relative shadow-sm">
                  1/5
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2196F3] rotate-45"></div>
                </div>

                {/* 캐릭터 이미지 (public 폴더에 hi.png 필수!) */}
                <img 
                  src="/hi.png" 
                  alt="character" 
                  className="w-[110px] h-auto block"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 질문 영역 */}
        <div className="w-full flex flex-col items-center gap-10 mt-20">
          <h2 className="text-[28px] font-bold text-[#333] tracking-tight">원하는 직무가 있으신가요?</h2>
          <div className="w-full max-w-[620px]">
            <input 
              type="text" 
              placeholder="예 : IT 기업에서 개발자로 일하고 싶어요" 
              className="w-full h-[76px] px-8 border border-[#E5E8EB] rounded-[20px] outline-none text-center text-[20px] text-[#333] placeholder:text-[#ADB5BD] shadow-sm focus:border-[#2196F3] transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. 하단 버튼 영역: 하단 여백을 충분히 확보해서 위로 올라간 느낌을 강조 */}
      <div className="w-full h-[200px] flex flex-shrink-0 flex-col items-center justify-start">
        <div className="w-full max-w-[1000px] h-[1px] bg-[#F2F4F7] mb-12"></div>
        <button className="w-[500px] h-[76px] border border-[#E5E8EB] text-[#B0B8C1] font-bold rounded-[18px] text-[22px] bg-white transition-all hover:bg-[#F9FAFB] active:scale-[0.98]">
          다음
        </button>
      </div>
    </div>
  );
};

export default Survey;