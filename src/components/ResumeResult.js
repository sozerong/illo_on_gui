import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const levelToScore = (level) => {
  if (!level) return 60;
  const l = level.toLowerCase();
  if (l.includes('상') || l.includes('high') || l.includes('excel') || l.includes('good')) return 82;
  if (l.includes('중') || l.includes('med') || l.includes('average')) return 62;
  if (l.includes('하') || l.includes('low') || l.includes('poor')) return 38;
  return 60;
};

const ResumeResult = () => {
  const navigate = useNavigate();
  const [animated, setAnimated] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('resume_data');
    if (saved) {
      try { setResumeData(JSON.parse(saved)); } catch {}
    }

    const resumeId = localStorage.getItem('resume_id');
    const token = localStorage.getItem('access_token');
    if (resumeId && token && token !== 'test-token-root') {
      fetch(`https://illoon.cloud/api/v1/resumes/${resumeId}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setAnalysis(data); })
        .catch(() => {});
    }

    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const profile = resumeData?.profile ?? {};
  const careers = resumeData?.careers ?? [];
  const educations = resumeData?.educations ?? [];
  const awards = resumeData?.awards ?? [];
  const portfolios = resumeData?.portfolios ?? [];
  const selfIntro = resumeData?.selfIntro ?? '';
  const resumeTitle = resumeData?.resumeTitle ?? '내 이력서';
  const userName = profile.name || '지원자';

  const n = 4;
  const cx = 150, cy = 150, R = 100;
  const items = analysis?.items;
  const scores = items ? [
    levelToScore(items.document_quality?.level),
    levelToScore(items.experience_specificity?.level),
    levelToScore(items.job_fit?.level),
    levelToScore(items.technical_competency?.level),
  ] : [75, 80, 55, 60];
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const labels = [
    { text: ['포트폴리오'], angle: -Math.PI / 2 },
    { text: ['경험'], angle: 0 },
    { text: ['직무적합성'], angle: Math.PI / 2 },
    { text: ['스킬'], angle: Math.PI },
  ];

  const getPoint = (i, pct) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + R * pct * Math.cos(angle), y: cy + R * pct * Math.sin(angle) };
  };

  const gridPoly = (pct) =>
    Array.from({ length: n }, (_, i) => {
      const p = getPoint(i, pct);
      return `${p.x},${p.y}`;
    }).join(' ');

  const dataPoly = (scale = 1) =>
    scores.map((v, i) => {
      const p = getPoint(i, (v / 100) * scale);
      return `${p.x},${p.y}`;
    }).join(' ');

  const getLabelPos = (i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = R + 32;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const yMin = 20, yMax = 90, chartH = 160;
  const barH = (v) => animated ? ((v - yMin) / (yMax - yMin)) * chartH : 0;

  const card = (dashed = false) => ({
    border: `1.5px ${dashed ? 'dashed' : 'solid'} ${dashed ? '#D1D5DB' : '#E5E8EB'}`,
    borderRadius: 14, padding: '14px 16px', marginBottom: 10, background: '#fff',
  });

  const iconBox = () => ({
    width: 36, height: 36, borderRadius: 10, background: '#EEF6FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  });

  const divider = { height: 1, background: '#F2F4F7', margin: '10px 0' };
  const metaText = { fontSize: 12, color: '#6B7684' };
  const boldTitle = { fontSize: 14, fontWeight: 700, color: '#191F28' };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 120px' }}>

        {/* 프로필 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 20, gap: 16 }}>
          <div style={{ width: 88, height: 110, borderRadius: 12, background: '#EEF6FF', overflow: 'hidden', flexShrink: 0 }}>
            <img src="/profile.png" alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => e.target.style.display = 'none'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#191F28' }}>{profile.name || '이름 미입력'}</span>
              {profile.rank && <span style={{ border: '1px solid #E5E8EB', borderRadius: 7, padding: '2px 10px', fontSize: 12, color: '#4D5562' }}>{profile.rank}</span>}
            </div>
            {profile.birth && <div style={{ fontSize: 13, color: '#6B7684', marginBottom: 7 }}>{profile.birth}{profile.age ? ` (${profile.age}세)` : ''}</div>}
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              {profile.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4a2 2 0 0 1 1.91-2.18h3a2 2 0 0 1 2 1.72c.13 1 .38 1.97.72 2.9a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.93.34 1.9.59 2.9.72A2 2 0 0 1 22 16.92z"/></svg>
                  <span style={{ fontSize: 12, color: '#4D5562' }}>{profile.phone}</span>
                </div>
              )}
              {profile.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span style={{ fontSize: 12, color: '#4D5562' }}>{profile.email}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/resume')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #E5E8EB', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#4D5562', background: '#fff', cursor: 'pointer' }}>
              수정하기
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4D5562" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </div>

        {/* 경력 */}
        {careers.length > 0 && (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', margin: '28px 0 12px' }}>경력</h2>
            {careers.map((career, idx) => (
              <div key={idx} style={card()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={iconBox()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  </div>
                  <div>
                    <div style={boldTitle}>{career.company}</div>
                    <div style={{ ...metaText, marginTop: 2 }}>{career.startDate} - {career.endDate}&nbsp;|&nbsp;{career.type}&nbsp;|&nbsp;{career.role}&nbsp;{career.rank}</div>
                  </div>
                </div>
                {career.tasks?.map((task, ti) => (
                  <div key={ti}>
                    <div style={divider} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#191F28', marginBottom: 3 }}>{task.title}</div>
                    <div style={{ ...metaText, marginBottom: 7 }}>{task.startDate} - {task.endDate}&nbsp;|&nbsp;{task.role}&nbsp;{task.rank}</div>
                    <p style={{ fontSize: 13, color: '#4D5562', lineHeight: 1.75, margin: 0 }}>{task.description}</p>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* 학력 */}
        {educations.length > 0 && (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', margin: '28px 0 12px' }}>학력</h2>
            {educations.map((edu, idx) => (
              <div key={idx} style={card()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={iconBox()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5"/></svg>
                  </div>
                  <div>
                    <div style={boldTitle}>{edu.school}</div>
                    <div style={{ ...metaText, marginTop: 2 }}>{edu.startDate} - {edu.endDate}&nbsp;|&nbsp;{edu.status}&nbsp;|&nbsp;{edu.major}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* 수상/자격증 */}
        {awards.length > 0 && (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', margin: '28px 0 12px' }}>수상/자격증/기타</h2>
            {awards.map((award, idx) => (
              <div key={idx} style={card()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={iconBox()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                  </div>
                  <div>
                    <div style={boldTitle}>{award.name}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                      <span style={metaText}>{award.date}</span>
                      <span style={{ fontSize: 12, color: '#ADB5BD' }}>|</span>
                      <span style={{ fontSize: 12, color: '#2196F3', fontWeight: 600 }}>{award.type}</span>
                    </div>
                    {award.detail && <div style={{ fontSize: 12, color: '#6B7684', marginTop: 2 }}>{award.detail}</div>}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* 포트폴리오 */}
        {portfolios.filter(p => p.fileName).length > 0 && (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', margin: '28px 0 12px' }}>포트폴리오</h2>
            {portfolios.filter(p => p.fileName).map((p, idx) => (
              <div key={idx} style={card()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={iconBox()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={boldTitle}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7684', marginTop: 2 }}>{p.fileName}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* 자기소개서 */}
        {selfIntro && (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', margin: '28px 0 12px' }}>자기소개서</h2>
            <div style={card()}>
              <p style={{ fontSize: 13, color: '#4D5562', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-line' }}>{selfIntro}</p>
            </div>
          </>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#191F28', margin: '40px 0 16px' }}>이력서 분석 결과</h2>

        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 16, padding: '20px', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#2196F3', marginBottom: 12 }}>AI 종합 분석</div>
          <p style={{ fontSize: 13, color: '#4D5562', lineHeight: 1.8, margin: '0 0 16px' }}>일리온 AI가 예측한 문제 해결 확률과 점수를 토대로 앞으로의 이력서 수정 방향을 제안해드릴게요.</p>
          <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: '#4D5562', lineHeight: 1.8, margin: 0 }}>
              {analysis?.overall_summary?.summary_text ||
                <>전체적으로 이력서를 분석해본 결과, <strong style={{ color: '#2196F3' }}>{userName}</strong> 님은 경력, <strong>경험/활동/교육 부분</strong>에서 높은 역량을 갖추고 있어요 !<br />하지만 <strong>기타 스펙, 자격증, 어학시험 영역 부분</strong>에서는 남들보다 조금 부족해요. 관련된 추천활동을 같이 추천해 드릴게요.</>}
            </p>
          </div>
        </div>

        <div style={{ background: '#EFF6FF', borderRadius: 18, padding: '24px', marginBottom: 14, border: '1px solid #BFDBFE' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#2196F3', marginBottom: 6 }}>내 이력서 분석</div>
          <p style={{ fontSize: 13, color: '#4D5562', margin: '0 0 24px', lineHeight: 1.7 }}>현재 종합 점수는 {overallScore}점으로, 평균 대비 보완이 필요한 지점이 확인되었습니다. 분석 내용을 확인하고 서류의 완성도를 높여보세요.</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280, background: '#fff', borderRadius: 16, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', marginBottom: 4 }}>영역별 분석</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="280" height="280" viewBox="0 0 300 300">
                  {[0.25, 0.5, 0.75, 1.0].map((pct, i) => (
                    <polygon key={i} points={gridPoly(pct)} fill="none" stroke="#C8D8EA" strokeWidth="1" strokeDasharray="5,4" />
                  ))}
                  {Array.from({ length: n }, (_, i) => {
                    const p = getPoint(i, 1);
                    return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#C8D8EA" strokeWidth="1" strokeDasharray="5,4" />;
                  })}
                  <polygon
                    points={dataPoly(animated ? 1 : 0.01)}
                    fill="rgba(33,150,243,0.18)"
                    stroke="#2196F3"
                    strokeWidth="2.5"
                    style={{ transition: 'points 1s cubic-bezier(0.34,1.56,0.64,1)' }}
                  />
                  {scores.map((v, i) => {
                    const p = getPoint(i, animated ? v / 100 : 0.01);
                    return <circle key={i} cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#2196F3" strokeWidth="2.5" style={{ transition: 'cx 1s, cy 1s' }} />;
                  })}
                  {labels.map((label, i) => {
                    const pos = getLabelPos(i);
                    return (
                      <text key={i} x={pos.x} y={pos.y} textAnchor="middle" fontSize="12" fill="#4D5562" fontWeight="500">
                        {label.text.map((line, j) => (
                          <tspan key={j} x={pos.x} dy={j === 0 ? `-${(label.text.length - 1) * 8}` : '16'}>{line}</tspan>
                        ))}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 16, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', marginBottom: 16 }}>종합 점수</div>
              <div style={{ position: 'relative', height: 260 }}>
                {[90, 80, 70, 60, 50, 40, 30, 20].map(v => {
                  const bot = ((v - yMin) / (yMax - yMin)) * chartH + 44;
                  return (
                    <div key={v} style={{ position: 'absolute', left: 0, right: 0, bottom: bot, display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: '#ADB5BD', width: 24, textAlign: 'right', flexShrink: 0 }}>{v}</span>
                      <div style={{ flex: 1, marginLeft: 8, borderTop: '1px dashed #E5E8EB' }} />
                    </div>
                  );
                })}
                <div style={{ position: 'absolute', left: 32, right: 0, bottom: 44, borderTop: '1.5px solid #D1D9E6' }} />
                <div style={{ position: 'absolute', bottom: 44, left: 60, display: 'flex', gap: 40, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#2196F3', marginBottom: 8 }}>{overallScore}점</span>
                    <div style={{ width: 70, height: `${barH(overallScore)}px`, background: '#2196F3', borderRadius: '35px 35px 0 0', transition: 'height 1s cubic-bezier(0.34,1.56,0.64,1)', minHeight: 0 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#9CA3AF', marginBottom: 8 }}>80점</span>
                    <div style={{ width: 70, height: `${barH(80)}px`, background: '#D1D5DB', borderRadius: '35px 35px 0 0', transition: 'height 1s cubic-bezier(0.34,1.56,0.64,1) 0.1s', minHeight: 0 }} />
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 16, left: 60, display: 'flex', gap: 40 }}>
                  <div style={{ width: 70, textAlign: 'center' }}>
                    <span style={{ fontSize: 13, color: '#2196F3', fontWeight: 700 }}>{userName} 님</span>
                  </div>
                  <div style={{ width: 70, textAlign: 'center' }}>
                    <span style={{ fontSize: 13, color: '#6B7684' }}>평균</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 16, padding: '20px', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2196F3', marginBottom: 6 }}>분석 내용 설명</div>
          <p style={{ fontSize: 13, color: '#4D5562', margin: '0 0 20px', lineHeight: 1.7 }}>분석된 합격 확률과 점수를 토대로, 서류의 완성도를 한층 더 높여줄 핵심 포인트를 정리해 드릴게요.</p>
          {(analysis?.items ? [
            { title: '직무 적합도', content: analysis.items.job_fit?.analysis_text || analysis.items.job_fit?.reason },
            { title: '경험 구체성', content: analysis.items.experience_specificity?.analysis_text || analysis.items.experience_specificity?.reason },
            { title: '기술 역량', content: analysis.items.technical_competency?.analysis_text || analysis.items.technical_competency?.reason },
            { title: '문서 완성도', content: analysis.items.document_quality?.analysis_text || analysis.items.document_quality?.reason },
            { title: '신뢰성 · 일관성', content: analysis.items.consistency_uniqueness?.analysis_text || analysis.items.consistency_uniqueness?.reason },
          ].filter(item => item.content) : [
            { title: '1.직무의 적합도', content: '지원하는 공고의 직무기술서(JD)에서 요구하는 필수 기술과 핵심 역량이 이력서와 포트폴리오에 선명하게 드러나야 해요.\n단순히 경험을 나열하는 것이 아니라, 회사가 찾고 있는 \'문제 해결사\'의 모습과 본인의 과거 경험이 얼마나 일치하는지를 증명하는 것이 핵심이에요.' },
            { title: '2.경험성 · 구체성', content: '프로젝트 내에서 본인이 담당한 역할과 구체적인 행동, 그리고 그로 인해 창출된 결과를 명확히 기술해야 해요.' },
            { title: '3.문제해결능력 · 기술역량', content: 'IT 직무에서는 단순히 \'사용해 본 기술\'을 넘어, 특정 기술이나 스택을 선택한 타당한 근거가 제시되어야 해요.' },
            { title: '4.문서의 완성도', content: '아무리 좋은 내용이라도 가독성이 떨어지면 매력이 반감돼요. 올바른 맞춤법과 간결한 문장 구조를 유지하세요.' },
            { title: '5.신뢰성 · 차별성 · 일관성', content: '이력서와 자기소개서, 포트폴리오의 내용이 서로 충돌하지 않고 하나의 일관된 직무 정체성을 향해야 해요.' },
          ]).map((item, i, arr) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', marginBottom: i < arr.length - 1 ? 10 : 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>{item.title}</div>
              <p style={{ fontSize: 13, color: '#4D5562', lineHeight: 1.8, margin: 0, paddingLeft: 16, whiteSpace: 'pre-line' }}>{item.content}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 16, padding: '20px', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2196F3', marginBottom: 6 }}>관련 추천활동</div>
          <p style={{ fontSize: 13, color: '#4D5562', margin: '0 0 20px', lineHeight: 1.7 }}>역량 그래프에서 보완이 필요한 영역을 강화하기 위한 관련 추천 활동이에요.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(analysis?.recommended_activities?.length > 0 ? analysis.recommended_activities : [
              { title: '언어 자격증 취득', description: '디자인 실무 협업 시 소통 능력을 증명할 수 있는 TOEIC Speaking이나 OPIc 점수 확보를 추천해요.' },
              { title: '디자인 자격증 취득', description: 'GTQ 1급이나 컴퓨터그래픽스운용기능사 등 공인된 자격증을 통해 툴 활용 능력을 증명해 보세요.' },
              { title: '디자인 공모전 수상', description: '수상 경력은 기타 스펙 영역을 가장 강력하게 채워줄 수 있는 요소입니다.' },
            ]).map((rec, i) => (
              <div key={i} style={{ flex: 1, minWidth: 160, background: '#fff', borderRadius: 14, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#2196F3', color: '#fff', fontSize: 13, fontWeight: 700, padding: '7px 18px', borderRadius: 20, marginBottom: 20, whiteSpace: 'nowrap' }}>
                  {rec.title}
                </div>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#EEF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <p style={{ fontSize: 13, color: '#4D5562', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line', textAlign: 'center' }}>{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #F2F4F7', padding: '12px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7684' }}>이력서 제목</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>{resumeTitle}</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/resume')}
              style={{ width: 90, height: 42, border: '1px solid #E5E8EB', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#6B7684', background: '#fff', cursor: 'pointer' }}>
              수정하기
            </button>
            <button
              onClick={() => navigate('/home')}
              style={{ width: 90, height: 42, background: '#2196F3', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer' }}>
              제출하기
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResumeResult;
