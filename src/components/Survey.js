import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Survey = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [answer, setAnswer] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [careerYear, setCareerYear] = useState('');
  const [company, setCompany] = useState('');
  const [joinYear, setJoinYear] = useState('');
  const [leaveYear, setLeaveYear] = useState('');
  const [education, setEducation] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [major, setMajor] = useState('');
  const [graduationStatus, setGraduationStatus] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const submitSurvey = async () => {
    const user_id = localStorage.getItem('user_id') || 'test_user';
    const token = localStorage.getItem('access_token');
    setIsSubmitting(true);
    setSubmitError('');
    try {
      // 1. 설문 데이터 저장 - 실패해도 2번은 무조건 호출
      try {
        await axios.post(
          `https://port-0-illo-on-server-mp2oa3fkd20c6566.sel3.cloudtype.app/api/v1/survey/${user_id}`,
          {
            job_type: selectedTags.length > 0 ? selectedTags.join(', ') : answer,
            region: selectedRegions.join(', '),
            occupation: selectedJob || '',
            career_type: selectedCareer || '',
            education: education || '',
            university: schoolName || null,
            major: major || null,
            career_years: careerYear || null,
            company_name: company || null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('설문 데이터 저장 실패:', err);
      }

      // 2. 설문 완료 API - 무조건 호출
      await axios.post(
        'https://illoon.cloud/api/survey/complete',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem(`survey_done_${user_id}`, 'true');
    } catch (err) {
      setSubmitError('전송 중 오류가 발생했어요. 다시 시도해 주세요.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const educationOptions = ['고등학교 졸업', '전문대 졸업', '대학교 졸업', '대학원 석사', '대학원 박사', '기타'];
  const careerYearOptions = ['1년 미만', '1년 이상', '2년 이상', '3년 이상', '4년 이상', '5년 이상', '6년 이상', '7년 이상', '8년 이상', '9년 이상', '10년 이상'];
  const yearOptions = Array.from({ length: 32 }, (_, i) => String(2026 - i));
  const leaveYearOptions = ['재직중', ...yearOptions.map(y => `${y}년`)];
  const designTags = ['북디자인','앱디자인','웹디자인','시각디자인','공간디자인','건축디자인','게임디자인','영상디자인','공예디자인','로고디자인','패키지디자인','브랜드디자인','제품디자인','그래픽디자인','공공디자인'];
  const regionTags = ['강서구','금정구','기장군','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'];
  const jobTags = ['직장인','전문직','자영업자','공무원','학생','주부','프리랜서','취업준비생','기타'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag));
    else if (selectedTags.length < 10) setSelectedTags([...selectedTags, tag]);
  };
  const toggleRegion = (r) => {
    if (selectedRegions.includes(r)) setSelectedRegions(selectedRegions.filter(x => x !== r));
    else if (selectedRegions.length < 10) setSelectedRegions([...selectedRegions, r]);
  };

  const Header = ({ stepNum, message, progress }) => (
    <div className="w-full flex-shrink-0 pt-10 px-0">
      <div className="w-full max-w-[900px] mx-auto px-10">
        <div className="relative flex items-end mb-3" style={{ height: '120px' }}>
          <div className="flex flex-col items-center flex-shrink-0 z-10">
            <div className="bg-[#2196F3] text-white text-[13px] font-bold px-3 py-1 rounded-[8px] mb-1.5 relative whitespace-nowrap">
              {stepNum}/5
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2196F3] rotate-45"></div>
            </div>
            <img src="/hi.png" alt="character" className="w-[90px] h-auto block" />
          </div>
          <h3 className="absolute left-0 right-0 bottom-[18px] text-center text-[21px] font-bold text-[#2196F3] tracking-tight whitespace-nowrap pointer-events-none">
            {message}
          </h3>
        </div>
        <div className="w-full h-[16px] bg-[#F2F8FF] rounded-full overflow-hidden">
          <div className="h-full bg-[#2196F3] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );

  const BottomSingle = ({ onNext, nextActive }) => (
    <div className="w-full flex-shrink-0 flex flex-col items-center pb-10">
      <div className="w-full max-w-[1000px] h-[1px] bg-[#F2F4F7] mb-8 mx-auto"></div>
      <button onClick={nextActive ? onNext : undefined}
        className={`w-[500px] h-[72px] font-bold rounded-[20px] text-[22px] transition-all active:scale-[0.98] ${
          nextActive ? 'bg-[#2196F3] text-white' : 'border border-[#E5E8EB] text-[#B0B8C1] bg-white'
        }`}>
        다음
      </button>
    </div>
  );

  const BottomDual = ({ onPrev, onNext, nextActive, nextLabel }) => (
    <div className="w-full flex-shrink-0 flex flex-col items-center pb-10">
      <div className="w-full max-w-[1000px] h-[1px] bg-[#F2F4F7] mb-8 mx-auto"></div>
      <div className="flex gap-4 w-full max-w-[760px] px-4">
        <button onClick={onPrev}
          className="flex-1 h-[72px] border border-[#E5E8EB] text-[#6B7684] font-bold rounded-[20px] text-[22px] bg-white hover:bg-[#F9FAFB] transition-all active:scale-[0.98]">
          이전
        </button>
        <button onClick={nextActive ? onNext : undefined}
          className={`flex-[2] h-[72px] font-bold rounded-[20px] text-[22px] transition-all active:scale-[0.98] ${
            nextActive ? 'bg-[#2196F3] text-white' : 'border border-[#E5E8EB] text-[#B0B8C1] bg-white'
          }`}>
          {nextLabel || '다음'}
        </button>
      </div>
    </div>
  );

  const Select = ({ value, onChange, placeholder, options }) => (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-[60px] px-5 border border-[#E5E8EB] rounded-[16px] outline-none text-[17px] appearance-none bg-white focus:border-[#2196F3] transition-all cursor-pointer"
        style={{ color: value ? '#333' : '#ADB5BD' }}>
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#ADB5BD]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
  );

  if (step === 1) {
    const showTags = answer === '디자인';
    return (
      <div className="flex flex-col w-full h-screen bg-white overflow-hidden font-sans">
        <Header stepNum={1} message="맞춤 공고 추천을 위해 설문 조사를 할게요!" progress={20} />
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-4">
          <h2 className="text-[28px] font-bold text-[#191F28] tracking-tight mb-8">원하는 직무가 있으신가요?</h2>
          <div className="w-full max-w-[640px] mb-6">
            <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}
              placeholder="예 : IT 기업에서 개발자로 일하고 싶어요"
              className="w-full h-[72px] px-8 border border-[#E5E8EB] rounded-[20px] outline-none text-center text-[20px] text-[#333] placeholder:text-[#ADB5BD] shadow-sm focus:border-[#2196F3] transition-all" />
          </div>
          {showTags && (
            <div className="w-full max-w-[860px] overflow-y-auto" style={{ maxHeight: '210px' }}>
              <div className="flex flex-wrap justify-center gap-3">
                {designTags.map((tag, i) => (
                  <button key={i} onClick={() => toggleTag(tag)}
                    className={`px-5 py-3 rounded-full border-2 text-[15px] font-medium transition-all ${
                      selectedTags.includes(tag) ? 'border-[#2196F3] border-dashed bg-[#F0F7FF] text-[#2196F3] font-bold' : 'border-[#E5E8EB] bg-white text-[#6B7684]'
                    }`}>{tag}</button>
                ))}
              </div>
              <div className="flex justify-end pr-2 pt-2">
                <span className="text-[14px] font-bold text-[#2196F3]">선택한 직무 {selectedTags.length}/10</span>
              </div>
            </div>
          )}
        </div>
        <BottomSingle onNext={() => setStep(2)} nextActive={!!answer} />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex flex-col w-full h-screen bg-white overflow-hidden font-sans">
        <Header stepNum={2} message="맞춤 공고 추천을 위해 설문 조사를 할게요!" progress={40} />
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-4">
          <h2 className="text-[28px] font-bold text-[#191F28] tracking-tight mb-5">원하는 근무 지역을 선택해주세요</h2>
          <div className="w-full max-w-[860px] mb-4">
            <p className="text-[17px] font-bold text-[#2196F3] text-center mb-3">부산광역시</p>
            <div className="w-full h-[1px] bg-[#E5E8EB]"></div>
          </div>
          <div className="w-full max-w-[860px] overflow-y-auto" style={{ maxHeight: '220px' }}>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {regionTags.map((r, i) => (
                <button key={i} onClick={() => toggleRegion(r)}
                  className={`px-5 py-3 rounded-full border-2 text-[15px] font-medium transition-all ${
                    selectedRegions.includes(r) ? 'border-[#2196F3] border-dashed bg-[#F0F7FF] text-[#2196F3] font-bold' : 'border-[#E5E8EB] bg-white text-[#6B7684]'
                  }`}>{r}</button>
              ))}
            </div>
            <div className="flex justify-end pr-2 pt-2">
              <span className="text-[14px] font-bold text-[#2196F3]">선택한 지역 {selectedRegions.length}/10</span>
            </div>
          </div>
        </div>
        <BottomDual onPrev={() => setStep(1)} onNext={() => setStep(3)} nextActive={true} />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="flex flex-col w-full h-screen bg-white overflow-hidden font-sans">
        <Header stepNum={3} message="거의 다 왔어요!" progress={60} />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h2 className="text-[28px] font-bold text-[#191F28] tracking-tight mb-10">현재 직업은 무엇인가요?</h2>
          <div className="w-full max-w-[860px] flex flex-wrap justify-center gap-3">
            {jobTags.map((job, i) => (
              <button key={i} onClick={() => setSelectedJob(job)}
                className={`px-6 py-3 rounded-full border-2 text-[16px] font-medium transition-all active:scale-[0.98] ${
                  selectedJob === job ? 'border-[#2196F3] border-dashed bg-[#F0F7FF] text-[#2196F3] font-bold' : 'border-[#E5E8EB] bg-white text-[#6B7684]'
                }`}>{job}</button>
            ))}
          </div>
        </div>
        <BottomDual onPrev={() => setStep(2)} onNext={() => setStep(4)} nextActive={!!selectedJob} />
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="flex flex-col w-full h-screen bg-white overflow-hidden font-sans">
        <Header stepNum={4} message="거의 다 왔어요!" progress={80} />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h2 className="text-[28px] font-bold text-[#191F28] tracking-tight mb-10">경력이 어떻게 되나요?</h2>
          <div className="flex flex-col gap-5 w-full max-w-[460px]">
            <button onClick={() => setSelectedCareer('신입')}
              className={`w-full h-[72px] rounded-[20px] border-2 text-[20px] font-semibold transition-all active:scale-[0.98] ${
                selectedCareer === '신입' ? 'border-[#2196F3] border-dashed bg-[#F0F7FF] text-[#2196F3]' : 'border-[#E5E8EB] bg-white text-[#333]'
              }`}>신입이에요</button>
            <button onClick={() => { setSelectedCareer('경력'); setStep(5); }}
              className={`w-full h-[72px] rounded-[20px] border-2 text-[20px] font-semibold transition-all active:scale-[0.98] ${
                selectedCareer === '경력' ? 'border-[#2196F3] border-dashed bg-[#F0F7FF] text-[#2196F3]' : 'border-[#E5E8EB] bg-white text-[#333]'
              }`}>경력이에요</button>
          </div>
        </div>
        <BottomDual onPrev={() => setStep(3)} onNext={() => setStep(selectedCareer === '경력' ? 5 : 6)} nextActive={!!selectedCareer} />
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="flex flex-col w-full h-screen bg-white overflow-hidden font-sans">
        <Header stepNum={5} message="거의 다 왔어요!" progress={90} />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-[600px]">
            <h2 className="text-[26px] font-bold text-[#191F28] tracking-tight mb-7 text-center">경력 정보를 입력해 주세요</h2>
            <div className="mb-5">
              <p className="text-[14px] font-semibold text-[#4D5562] mb-2">총 경력</p>
              <Select value={careerYear} onChange={setCareerYear} placeholder="총 경력 선택" options={careerYearOptions} />
            </div>
            <div className="mb-5">
              <p className="text-[14px] font-semibold text-[#4D5562] mb-2">회사명</p>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                placeholder="최근 회사 입력"
                className="w-full h-[60px] px-5 border border-[#E5E8EB] rounded-[16px] outline-none text-[17px] text-[#333] placeholder:text-[#ADB5BD] bg-white focus:border-[#2196F3] transition-all" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#4D5562] mb-2">재직 기간</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Select value={joinYear} onChange={setJoinYear} placeholder="입사 연도 선택" options={yearOptions.map(y => `${y}년`)} />
                </div>
                <div className="flex-1">
                  <Select value={leaveYear} onChange={setLeaveYear} placeholder="퇴사 연도 선택" options={leaveYearOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <BottomDual onPrev={() => setStep(4)} onNext={() => setStep(6)} nextActive={!!(careerYear && company && joinYear && leaveYear)} />
      </div>
    );
  }

  if (step === 6) {
    return (
      <div className="flex flex-col w-full h-screen bg-white overflow-hidden font-sans">
        <Header stepNum={4} message="거의 다 왔어요!" progress={80} />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-[600px]">
            <h2 className="text-[26px] font-bold text-[#191F28] tracking-tight mb-7 text-center">최종 학력을 선택해 주세요</h2>
            <div>
              <p className="text-[14px] font-semibold text-[#4D5562] mb-2">최종 학력</p>
              <Select value={education} onChange={setEducation} placeholder="최종 학력 선택" options={educationOptions} />
            </div>
          </div>
        </div>
        <BottomDual onPrev={() => setStep(selectedCareer === '경력' ? 5 : 4)} onNext={() => setStep(7)} nextActive={!!education} />
      </div>
    );
  }

  if (step === 7) {
    return (
      <div className="flex flex-col w-full h-screen bg-white overflow-hidden font-sans">
        <Header stepNum={4} message="거의 다 왔어요!" progress={80} />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-[600px]">
            <h2 className="text-[26px] font-bold text-[#191F28] tracking-tight mb-7 text-center">최종 학력을 선택해 주세요</h2>
            <div className="mb-5">
              <p className="text-[14px] font-semibold text-[#4D5562] mb-2">최종 학력</p>
              <Select value={education} onChange={setEducation} placeholder="최종 학력 선택" options={educationOptions} />
            </div>
            <div className="mb-5">
              <p className="text-[14px] font-semibold text-[#4D5562] mb-2">학교명</p>
              <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
                placeholder="학교명 입력"
                className="w-full h-[60px] px-5 border border-[#E5E8EB] rounded-[16px] outline-none text-[17px] text-[#333] placeholder:text-[#ADB5BD] bg-white focus:border-[#2196F3] transition-all" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#4D5562] mb-2">전공명</p>
              <div className="flex gap-3">
                <input type="text" value={major} onChange={(e) => setMajor(e.target.value)}
                  placeholder="전공명 입력"
                  className="flex-1 h-[60px] px-5 border border-[#E5E8EB] rounded-[16px] outline-none text-[17px] text-[#333] placeholder:text-[#ADB5BD] bg-white focus:border-[#2196F3] transition-all" />
                <div className="flex-1">
                  <Select value={graduationStatus} onChange={setGraduationStatus} placeholder="졸업 여부 선택" options={['졸업', '재학중', '휴학중', '중퇴']} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <BottomDual onPrev={() => setStep(6)} onNext={() => setStep(8)} nextActive={!!(education && schoolName && major && graduationStatus)} />
      </div>
    );
  }

  // STEP 8: 완료 화면
  return (
    <div className="flex flex-col w-full h-screen bg-white overflow-hidden font-sans">
      <Header stepNum={5} message="수고 많으셨어요! 설문이 다 끝났어요!" progress={100} />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <p className="text-[22px] font-bold text-[#191F28] text-center leading-relaxed mb-10">
          이제 이력서를 업로드하고<br />맞춤 공고 추천을 받아 보세요!
        </p>
        {submitError && (
          <p className="text-[14px] text-red-500 mb-4">{submitError}</p>
        )}
        <div className="flex flex-col gap-4 w-full max-w-[460px]">
          <button
            onClick={async () => {
              await submitSurvey();
              if (!submitError) navigate('/resume');
            }}
            disabled={isSubmitting}
            className="w-full h-[72px] rounded-[20px] border-2 border-[#E5E8EB] bg-white text-[20px] font-semibold text-[#333] hover:bg-[#F9FAFB] transition-all active:scale-[0.98] disabled:opacity-50">
            {isSubmitting ? '전송 중...' : '이력서 업로드 하기'}
          </button>
          <button
            onClick={async () => {
              await submitSurvey();
              if (!submitError) navigate('/home');
            }}
            disabled={isSubmitting}
            className="w-full h-[72px] rounded-[20px] border-2 border-[#E5E8EB] bg-white text-[20px] font-semibold text-[#333] hover:bg-[#F9FAFB] transition-all active:scale-[0.98] disabled:opacity-50">
            {isSubmitting ? '전송 중...' : '다음에 할게요'}
          </button>
        </div>
      </div>
      <BottomDual
        onPrev={() => setStep(7)}
        onNext={async () => {
          await submitSurvey();
          if (!submitError) navigate('/resume');
        }}
        nextActive={!isSubmitting}
        nextLabel={isSubmitting ? '전송 중...' : '다음'}
      />
    </div>
  );
};

export default Survey;