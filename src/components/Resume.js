import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const calcDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  try {
    const [sy, sm] = startDate.split('.').map(Number);
    const [ey, em] = endDate.split('.').map(Number);
    const totalMonths = (ey - sy) * 12 + (em - sm);
    if (totalMonths < 0) return '';
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years === 0) return `${months}개월`;
    if (months === 0) return `${years}년`;
    return `${years}년 ${months}개월`;
  } catch { return ''; }
};

const Resume = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: '', rank: '신입', birth: '', age: '',
    phone: '', email: '',
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ ...profile });

  const [careers, setCareers] = useState([]);
  const [editingCareer, setEditingCareer] = useState(null);
  const [addingCareer, setAddingCareer] = useState(false);
  const [newCareer, setNewCareer] = useState({ company: '', startDate: '', endDate: '', type: '정규직', role: '', rank: '', taskTitle: '', taskDesc: '' });

  const [educations, setEducations] = useState([]);
  const [editingEdu, setEditingEdu] = useState(null);
  const [addingEdu, setAddingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ school: '', startDate: '', endDate: '', status: '졸업', major: '', detail: '' });

  const [resumeTitle, setResumeTitle] = useState('내 이력서');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('내 이력서');

  const [awards, setAwards] = useState([]);
  const [editingAward, setEditingAward] = useState(null);

  const [langs, setLangs] = useState([]);
  const [editingLang, setEditingLang] = useState(null);

  const [portfolios, setPortfolios] = useState([]);

  // 배너 이력서 업로드
  const [uploadedResume, setUploadedResume] = useState(null);
  const bannerFileRef = useRef(null);

  const [selfIntro, setSelfIntro] = useState('');
  const [editingSelfIntro, setEditingSelfIntro] = useState(false);
  const [selfIntroDraft, setSelfIntroDraft] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [completing, setCompleting] = useState(false);

  const toDate = (s) => {
    if (!s) return null;
    const [y, m] = s.split('.');
    if (!y || !m) return null;
    return `${y}-${m.padStart(2, '0')}-01`;
  };

  const handleComplete = async () => {
    if (completing) return;
    setCompleting(true);
    const token = localStorage.getItem('access_token');
    const isTest = token === 'test-token-root';

    let portfolioUrls = {};
    if (!isTest) {
      const filesToUpload = portfolios.filter(p => p.file);
      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach(p => formData.append('files', p.file));
        try {
          const uploadRes = await fetch('https://illoon.cloud/api/v1/files/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });
          if (uploadRes.ok) {
            const urls = await uploadRes.json();
            filesToUpload.forEach((p, i) => { portfolioUrls[p.id] = urls[i]; });
          }
        } catch (err) { console.error(err); }
      }
    }

    const educationStatusMap = { '졸업': 'GRADUATED', '재학중': 'ATTENDING', '휴학중': 'ON_LEAVE', '중퇴': 'DROPPED_OUT' };

    const dto = {
      title: resumeTitle || '내 이력서',
      isDefault: false,
      workExperiences: careers.map(c => ({
        companyName: c.company,
        role: c.role,
        position: c.rank,
        employmentType: c.type,
        startDate: toDate(c.startDate),
        endDate: toDate(c.endDate),
        description: c.taskDesc,
      })),
      educations: educations.map(e => ({
        schoolName: e.school,
        major: e.major,
        startDate: toDate(e.startDate),
        endDate: toDate(e.endDate),
        status: educationStatusMap[e.status] || 'GRADUATED',
        description: e.detail,
      })),
      awards: awards.map(a => ({
        awardName: a.name,
        awardDate: toDate(a.date),
        description: a.detail,
      })),
      languages: langs.map(l => ({
        languageName: l.name,
        testDate: toDate(l.date) || '2000-01-01',
      })),
      portfolios: portfolios
        .filter(p => portfolioUrls[p.id])
        .map(p => ({ portfolioName: p.name, url: portfolioUrls[p.id] })),
      coverLetter: selfIntro ? { content: selfIntro } : undefined,
    };

    let resumeId = null;
    if (!isTest) {
      try {
        const res = await fetch('https://illoon.cloud/api/resumes', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(dto),
        });
        if (res.ok) resumeId = await res.json();
      } catch (err) { console.error(err); }
    }

    const user_id = localStorage.getItem('user_id') || 'test_user';
    localStorage.setItem(`resume_done_${user_id}`, 'true');
    localStorage.setItem('resume_data', JSON.stringify({ profile, careers, educations, awards, langs, portfolios: portfolios.map(p => ({ ...p, file: undefined })), selfIntro, resumeTitle }));
    if (resumeId) localStorage.setItem('resume_id', String(resumeId));
    setCompleting(false);
    navigate('/resume/result');
  };

  const s = {
    card: (dashed) => ({
      border: `1.5px ${dashed ? 'dashed' : 'solid'} ${dashed ? '#D1D5DB' : '#E5E8EB'}`,
      borderRadius: 14, padding: '14px 16px', marginBottom: 10, background: '#fff',
    }),
    iconBox: (color = '#EEF6FF', op = 1) => ({
      width: 36, height: 36, borderRadius: 10, background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, opacity: op,
    }),
    metaText: { fontSize: 12, color: '#6B7684' },
    boldTitle: { fontSize: 14, fontWeight: 700, color: '#191F28' },
    divider: { height: 1, background: '#F2F4F7', margin: '10px 0' },
    input: {
      border: '1px solid #E5E8EB', borderRadius: 8, padding: '6px 10px',
      fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
    },
    textarea: {
      border: '1px solid #E5E8EB', borderRadius: 8, padding: '8px 10px',
      fontSize: 13, outline: 'none', width: '100%', resize: 'vertical',
      boxSizing: 'border-box', lineHeight: 1.7, minHeight: 80,
    },
    saveBtn: {
      background: '#2196F3', color: '#fff', border: 'none', borderRadius: 8,
      padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
    },
    cancelBtn: {
      background: '#fff', color: '#6B7684', border: '1px solid #E5E8EB',
      borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer',
    },
    blueText: { fontSize: 12, color: '#2196F3', background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  };

  const Img = ({ src, size = 18, op = 1 }) => (
    <img src={src} alt="" width={size} height={size} style={{ opacity: op, display: 'block' }}
      onError={(e) => e.target.style.display = 'none'} />
  );

  const IconBox = ({ src, color, op }) => (
    <div style={s.iconBox(color, op)}><Img src={src} /></div>
  );

  const SectionTitle = ({ children }) => (
    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', margin: '28px 0 12px' }}>{children}</h2>
  );

  const FolderIcon = ({ color = '#2196F3' }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const PreviewModal = () => {
    const pCard = { border: '1px solid #E5E8EB', borderRadius: 12, padding: '14px 16px', marginBottom: 10, background: '#fff' };
    const pIconBox = { width: 32, height: 32, borderRadius: 8, background: '#EEF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
    const pMeta = { fontSize: 11, color: '#6B7684' };
    const pTitle = { fontSize: 13, fontWeight: 700, color: '#191F28' };
    const pDivider = { height: 1, background: '#F2F4F7', margin: '8px 0' };

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#F8FAFC', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#fff', borderBottom: '1px solid #F2F4F7' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#191F28' }}>이력서 미리보기</span>
            <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24, background: '#fff', borderRadius: 14, padding: '16px' }}>
              <div style={{ width: 72, height: 90, borderRadius: 10, background: '#EEF6FF', overflow: 'hidden', flexShrink: 0 }}>
                <img src="/profile.png" alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#191F28' }}>{profile.name}</span>
                  <span style={{ border: '1px solid #E5E8EB', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#4D5562' }}>{profile.rank}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6B7684', marginBottom: 6 }}>{profile.birth} ({profile.age}세)</div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span style={{ fontSize: 11, color: '#4D5562' }}>{profile.phone}</span>
                  <span style={{ fontSize: 11, color: '#4D5562' }}>{profile.email}</span>
                </div>
              </div>
            </div>
            {careers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>경력</div>
                {careers.map(career => (
                  <div key={career.id} style={pCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={pIconBox}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
                      <div>
                        <div style={pTitle}>{career.company}</div>
                        <div style={pMeta}>{career.startDate} - {career.endDate} | {career.type} | {career.role} {career.rank}</div>
                      </div>
                    </div>
                    {career.tasks.map((task, i) => (
                      <div key={i}><div style={pDivider} />
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#191F28', marginBottom: 3 }}>{task.title}</div>
                        <p style={{ fontSize: 12, color: '#4D5562', lineHeight: 1.7, margin: 0 }}>{task.description}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {educations.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>학력</div>
                {educations.map(edu => (
                  <div key={edu.id} style={pCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={pIconBox}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5"/></svg></div>
                      <div><div style={pTitle}>{edu.school}</div><div style={pMeta}>{edu.startDate} - {edu.endDate} | {edu.status} | {edu.major}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {awards.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>수상/자격증/기타</div>
                {awards.map(award => (
                  <div key={award.id} style={pCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={pIconBox}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>
                      <div>
                        <div style={pTitle}>{award.name}</div>
                        <div style={{ fontSize: 11, color: '#2196F3', fontWeight: 600 }}>{award.type} · {award.date}</div>
                        <div style={{ fontSize: 11, color: '#6B7684' }}>{award.detail}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {portfolios.filter(p => p.fileName).length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>포트폴리오</div>
                {portfolios.filter(p => p.fileName).map(p => (
                  <div key={p.id} style={pCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={pIconBox}><FolderIcon /></div>
                      <div><div style={pTitle}>{p.name}</div><div style={{ fontSize: 11, color: '#6B7684' }}>{p.fileName}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selfIntro && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>자기소개서</div>
                <div style={pCard}><p style={{ fontSize: 12, color: '#4D5562', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{selfIntro}</p></div>
              </div>
            )}
          </div>
          <div style={{ padding: '12px 20px', background: '#fff', borderTop: '1px solid #F2F4F7', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setShowPreview(false)} style={{ padding: '10px 24px', border: '1px solid #E5E8EB', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#6B7684', background: '#fff', cursor: 'pointer' }}>닫기</button>
            <button onClick={() => { setShowPreview(false); handleComplete(); }} disabled={completing} style={{ padding: '10px 24px', background: completing ? '#ADB5BD' : '#2196F3', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', border: 'none', cursor: completing ? 'not-allowed' : 'pointer' }}>{completing ? '저장중...' : '작성완료'}</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>

      {showPreview && <PreviewModal />}

      {/* 배너 - 이동 버튼 누르면 파일 업로드 */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 16px 0' }}>
        {/* 숨겨진 파일 input */}
        <input
          ref={bannerFileRef}
          type="file"
          accept=".pdf,.ppt,.pptx,.doc,.docx,.hwp,.zip"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            setUploadedResume(file);
            e.target.value = '';
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '9px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#2196F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>!</span>
            </div>
            <span style={{ fontSize: 13, color: '#4D5562' }}>
              {uploadedResume ? `업로드됨: ${uploadedResume.name}` : '따로 작성한 이력서를 업로드 할게요'}
            </span>
          </div>
          <button
            onClick={() => bannerFileRef.current && bannerFileRef.current.click()}
            style={{ fontSize: 13, color: '#2196F3', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            이동
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 120px' }}>

        {/* 프로필 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1 }}>
            <div style={{ width: 88, height: 110, borderRadius: 12, background: '#EEF6FF', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/profile.png" alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={(e) => e.target.style.display = 'none'} />
            </div>
            <div style={{ flex: 1 }}>
              {editingProfile ? (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <input value={profileDraft.name} onChange={e => setProfileDraft({ ...profileDraft, name: e.target.value })} placeholder="이름" style={{ ...s.input, width: 100 }} />
                    <select value={profileDraft.rank} onChange={e => setProfileDraft({ ...profileDraft, rank: e.target.value })} style={{ ...s.input, width: 80 }}>
                      <option>신입</option><option>경력</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <input value={profileDraft.birth} onChange={e => setProfileDraft({ ...profileDraft, birth: e.target.value })} placeholder="생년월일 (YYYY.MM.DD)" style={{ ...s.input, width: 160 }} />
                    <input value={profileDraft.age} onChange={e => setProfileDraft({ ...profileDraft, age: e.target.value })} placeholder="나이" style={{ ...s.input, width: 60 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <input value={profileDraft.phone} onChange={e => setProfileDraft({ ...profileDraft, phone: e.target.value })} placeholder="전화번호" style={{ ...s.input, width: 140 }} />
                    <input value={profileDraft.email} onChange={e => setProfileDraft({ ...profileDraft, email: e.target.value })} placeholder="이메일" style={{ ...s.input, width: 180 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={s.saveBtn} onClick={() => { setProfile({ ...profileDraft }); setEditingProfile(false); }}>저장</button>
                    <button style={s.cancelBtn} onClick={() => { setProfileDraft({ ...profile }); setEditingProfile(false); }}>취소</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#191F28' }}>{profile.name}</span>
                    <span style={{ border: '1px solid #E5E8EB', borderRadius: 7, padding: '2px 10px', fontSize: 12, color: '#4D5562' }}>{profile.rank}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7684', marginBottom: 7 }}>{profile.birth} ({profile.age}세)</div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#4D5562' }}>{profile.phone}</span>
                    <span style={{ fontSize: 12, color: '#4D5562' }}>{profile.email}</span>
                  </div>
                  <button onClick={() => { setProfileDraft({ ...profile }); setEditingProfile(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #E5E8EB', borderRadius: 8, padding: '5px 12px', fontSize: 12, color: '#4D5562', background: '#fff', cursor: 'pointer' }}>
                    수정하기 <Img src="/correction.png" size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
            <div style={{ background: '#2196F3', color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 12px', borderRadius: 10, textAlign: 'center', lineHeight: 1.5 }}>
              이력서를<br />작성해 봐요!
            </div>
            <img src="/wink.png" alt="" style={{ width: 70 }} onError={(e) => e.target.style.display = 'none'} />
          </div>
        </div>

        {/* 경력 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#191F28' }}>경력</span>
            <span style={{ fontSize: 13, color: '#6B7684' }}>1년 1개월</span>
          </div>
          <select style={{ border: '1px solid #E5E8EB', borderRadius: 8, padding: '3px 8px', fontSize: 12, color: '#4D5562', outline: 'none', background: '#fff' }}>
            <option>신입</option><option>경력</option>
          </select>
        </div>

        {careers.map((career) => (
          <div key={career.id} style={s.card(false)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconBox src="/connection.png" color="#EEF6FF" />
                <div>
                  <div style={s.boldTitle}>{career.company}</div>
                  <div style={{ ...s.metaText, marginTop: 2 }}>
                    {career.startDate} - {career.endDate}{calcDuration(career.startDate, career.endDate) ? ` (${calcDuration(career.startDate, career.endDate)})` : ''}&nbsp;&nbsp;|&nbsp;&nbsp;{career.type}&nbsp;&nbsp;|&nbsp;&nbsp;{career.role}&nbsp;&nbsp;{career.rank}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button style={s.blueText} onClick={() => setEditingCareer(editingCareer === career.id ? null : career.id)}>
                  {editingCareer === career.id ? '접기' : '수정'}
                </button>
                <button onClick={() => setCareers(careers.filter(c => c.id !== career.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>
            {editingCareer === career.id ? (
              <div style={{ marginTop: 8 }}>
                <div style={s.divider} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>회사명</div>
                    <input value={career.company} onChange={e => setCareers(careers.map(c => c.id === career.id ? { ...c, company: e.target.value } : c))} style={s.input} /></div>
                  <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>재직형태</div>
                    <select value={career.type} onChange={e => setCareers(careers.map(c => c.id === career.id ? { ...c, type: e.target.value } : c))} style={s.input}>
                      <option>계약직</option><option>정규직</option><option>인턴</option><option>프리랜서</option>
                    </select></div>
                  <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>입사일</div>
                    <input value={career.startDate} onChange={e => setCareers(careers.map(c => c.id === career.id ? { ...c, startDate: e.target.value } : c))} placeholder="YYYY.MM" style={s.input} /></div>
                  <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>퇴사일</div>
                    <input value={career.endDate} onChange={e => setCareers(careers.map(c => c.id === career.id ? { ...c, endDate: e.target.value } : c))} placeholder="YYYY.MM" style={s.input} /></div>
                  <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>직무</div>
                    <input value={career.role} onChange={e => setCareers(careers.map(c => c.id === career.id ? { ...c, role: e.target.value } : c))} style={s.input} /></div>
                  <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>직책</div>
                    <input value={career.rank} onChange={e => setCareers(careers.map(c => c.id === career.id ? { ...c, rank: e.target.value } : c))} style={s.input} /></div>
                </div>
                {career.tasks.map((task, ti) => (
                  <div key={task.id}>
                    <div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>주요 성과</div>
                    <input value={task.title} onChange={e => setCareers(careers.map(c => c.id === career.id ? { ...c, tasks: c.tasks.map((t, i) => i === ti ? { ...t, title: e.target.value } : t) } : c))}
                      placeholder="성과 제목" style={{ ...s.input, marginBottom: 6 }} />
                    <textarea value={task.description} onChange={e => setCareers(careers.map(c => c.id === career.id ? { ...c, tasks: c.tasks.map((t, i) => i === ti ? { ...t, description: e.target.value } : t) } : c))}
                      placeholder="업무 내용을 입력해주세요." style={{ ...s.textarea, marginBottom: 8 }} />
                  </div>
                ))}
                <button style={s.saveBtn} onClick={() => setEditingCareer(null)}>저장</button>
              </div>
            ) : (
              career.tasks.map((task, ti) => (
                <div key={ti}>
                  <div style={s.divider} />
                  <div style={{ ...s.boldTitle, fontSize: 13, marginBottom: 3 }}>{task.title}</div>
                  <div style={{ ...s.metaText, marginBottom: 7 }}>{task.startDate} - {task.endDate}&nbsp;&nbsp;|&nbsp;&nbsp;{task.role}&nbsp;&nbsp;{task.rank}</div>
                  <p style={{ fontSize: 13, color: '#4D5562', lineHeight: 1.75, margin: 0 }}>{task.description}</p>
                </div>
              ))
            )}
          </div>
        ))}

        {addingCareer ? (
          <div style={s.card(true)}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#191F28', marginBottom: 10 }}>경력 추가</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>회사명</div><input value={newCareer.company} onChange={e => setNewCareer({ ...newCareer, company: e.target.value })} placeholder="회사명 입력" style={s.input} /></div>
              <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>입사일</div><input value={newCareer.startDate} onChange={e => setNewCareer({ ...newCareer, startDate: e.target.value })} placeholder="YYYY.MM" style={s.input} /></div>
              <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>퇴사일</div><input value={newCareer.endDate} onChange={e => setNewCareer({ ...newCareer, endDate: e.target.value })} placeholder="YYYY.MM" style={s.input} /></div>
              <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>재직형태</div>
                <select value={newCareer.type} onChange={e => setNewCareer({ ...newCareer, type: e.target.value })} style={s.input}>
                  <option>정규직</option><option>계약직</option><option>인턴</option><option>프리랜서</option>
                </select></div>
              <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>직무</div><input value={newCareer.role} onChange={e => setNewCareer({ ...newCareer, role: e.target.value })} placeholder="직무" style={s.input} /></div>
              <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>직책</div><input value={newCareer.rank} onChange={e => setNewCareer({ ...newCareer, rank: e.target.value })} placeholder="직책" style={s.input} /></div>
              <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>주요 성과 제목</div><input value={newCareer.taskTitle} onChange={e => setNewCareer({ ...newCareer, taskTitle: e.target.value })} placeholder="성과 제목" style={s.input} /></div>
              <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>업무 내용</div><textarea value={newCareer.taskDesc} onChange={e => setNewCareer({ ...newCareer, taskDesc: e.target.value })} placeholder="업무 경험과 성과를 작성해보세요." style={s.textarea} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.saveBtn} onClick={() => {
                if (!newCareer.company) return;
                const id = Date.now();
                setCareers([...careers, { id, company: newCareer.company, startDate: newCareer.startDate, endDate: newCareer.endDate, duration: '', type: newCareer.type, role: newCareer.role, rank: newCareer.rank, tasks: [{ id: id + 1, title: newCareer.taskTitle, startDate: newCareer.startDate, endDate: newCareer.endDate, role: newCareer.role, rank: newCareer.rank, description: newCareer.taskDesc }] }]);
                setNewCareer({ company: '', startDate: '', endDate: '', type: '정규직', role: '', rank: '', taskTitle: '', taskDesc: '' });
                setAddingCareer(false);
              }}>저장</button>
              <button style={s.cancelBtn} onClick={() => setAddingCareer(false)}>취소</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingCareer(true)} style={{ ...s.card(true), display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={s.iconBox('#F2F4F7', 0.5)}></div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>+ 경력 추가</div>
                <div style={{ fontSize: 12, color: '#ADB5BD' }}>YYYY.MM - YYYY.MM&nbsp;&nbsp;|&nbsp;&nbsp;재직형태&nbsp;&nbsp;|&nbsp;&nbsp;직무&nbsp;&nbsp;|&nbsp;&nbsp;직책</div>
              </div>
            </div>
          </button>
        )}

        {/* 학력 */}
        <SectionTitle>학력</SectionTitle>
        {educations.map(edu => (
          <div key={edu.id} style={s.card(false)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editingEdu === edu.id ? 8 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconBox src="/University.png" color="#EEF6FF" />
                <div>
                  <div style={s.boldTitle}>{edu.school}</div>
                  <div style={{ ...s.metaText, marginTop: 2 }}>{edu.startDate} - {edu.endDate}&nbsp;&nbsp;|&nbsp;&nbsp;{edu.status}&nbsp;&nbsp;|&nbsp;&nbsp;{edu.major}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button style={s.blueText} onClick={() => setEditingEdu(editingEdu === edu.id ? null : edu.id)}>
                  {editingEdu === edu.id ? '접기' : '수정'}
                </button>
                <button onClick={() => setEducations(educations.filter(d => d.id !== edu.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>
            {editingEdu === edu.id ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>학교명</div><input value={edu.school} onChange={e => setEducations(educations.map(d => d.id === edu.id ? { ...d, school: e.target.value } : d))} style={s.input} /></div>
                  <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>졸업상태</div>
                    <select value={edu.status} onChange={e => setEducations(educations.map(d => d.id === edu.id ? { ...d, status: e.target.value } : d))} style={s.input}>
                      <option>졸업</option><option>재학중</option><option>휴학중</option><option>중퇴</option>
                    </select></div>
                  <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>입학일</div><input value={edu.startDate} onChange={e => setEducations(educations.map(d => d.id === edu.id ? { ...d, startDate: e.target.value } : d))} placeholder="YYYY.MM" style={s.input} /></div>
                  <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>졸업일</div><input value={edu.endDate} onChange={e => setEducations(educations.map(d => d.id === edu.id ? { ...d, endDate: e.target.value } : d))} placeholder="YYYY.MM" style={s.input} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>전공</div><input value={edu.major} onChange={e => setEducations(educations.map(d => d.id === edu.id ? { ...d, major: e.target.value } : d))} style={s.input} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>이수 과목 / 연구 내용</div><textarea value={edu.detail} onChange={e => setEducations(educations.map(d => d.id === edu.id ? { ...d, detail: e.target.value } : d))} style={s.textarea} /></div>
                </div>
                <button style={s.saveBtn} onClick={() => setEditingEdu(null)}>저장</button>
              </div>
            ) : (
              <div>
                <div style={s.divider} />
                {edu.detail ? <p style={{ fontSize: 13, color: '#4D5562', margin: 0 }}>{edu.detail}</p>
                  : <button style={s.blueText}>+ 이수 과목 또는 연구 내용을 작성해보세요.</button>}
              </div>
            )}
          </div>
        ))}

        {addingEdu ? (
          <div style={s.card(true)}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#191F28', marginBottom: 10 }}>학력 추가</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>학교명</div><input value={newEdu.school} onChange={e => setNewEdu({ ...newEdu, school: e.target.value })} placeholder="학교명 입력" style={s.input} /></div>
              <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>입학일</div><input value={newEdu.startDate} onChange={e => setNewEdu({ ...newEdu, startDate: e.target.value })} placeholder="YYYY.MM" style={s.input} /></div>
              <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>졸업일</div><input value={newEdu.endDate} onChange={e => setNewEdu({ ...newEdu, endDate: e.target.value })} placeholder="YYYY.MM" style={s.input} /></div>
              <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>졸업상태</div>
                <select value={newEdu.status} onChange={e => setNewEdu({ ...newEdu, status: e.target.value })} style={s.input}>
                  <option>졸업</option><option>재학중</option><option>휴학중</option><option>중퇴</option>
                </select></div>
              <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>전공</div><input value={newEdu.major} onChange={e => setNewEdu({ ...newEdu, major: e.target.value })} placeholder="전공명" style={s.input} /></div>
              <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>이수 과목 / 연구 내용</div><textarea value={newEdu.detail} onChange={e => setNewEdu({ ...newEdu, detail: e.target.value })} placeholder="이수 과목이나 연구 내용을 작성해보세요." style={s.textarea} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.saveBtn} onClick={() => {
                if (!newEdu.school) return;
                setEducations([...educations, { id: Date.now(), ...newEdu }]);
                setNewEdu({ school: '', startDate: '', endDate: '', status: '졸업', major: '', detail: '' });
                setAddingEdu(false);
              }}>저장</button>
              <button style={s.cancelBtn} onClick={() => setAddingEdu(false)}>취소</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingEdu(true)} style={{ ...s.card(true), display: 'flex', alignItems: 'center', gap: 10, width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <div style={s.iconBox('#F2F4F7', 0.4)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>+ 학력 추가</div>
              <div style={{ fontSize: 12, color: '#ADB5BD' }}>YYYY.MM - YYYY.MM&nbsp;&nbsp;|&nbsp;&nbsp;졸업상태&nbsp;&nbsp;|&nbsp;&nbsp;전공 및 학위</div>
            </div>
          </button>
        )}

        {/* 수상/자격증 + 언어 */}
        <div style={{ display: 'flex', gap: 18, marginTop: 28 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>수상/자격증/기타</h2>
            {awards.map(award => {
              const AwardIcon = () => {
                if (award.type === '수상') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
                if (award.type === '자격증') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M9 10l2 2 4-4"/></svg>;
                if (award.type === '교육') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="#2196F3"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
              };
              return (
                <div key={award.id} style={s.card(false)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={s.iconBox('#EEF6FF')}><AwardIcon /></div>
                      <div>
                        <div style={s.boldTitle}>{award.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                          <span style={s.metaText}>{award.date}</span>
                          <span style={{ fontSize: 12, color: '#ADB5BD' }}>|</span>
                          <span style={{ fontSize: 12, color: '#2196F3', fontWeight: 600 }}>{award.type}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#6B7684', marginTop: 3 }}>{award.detail}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button style={s.blueText} onClick={() => setEditingAward(editingAward === award.id ? null : award.id)}>
                        {editingAward === award.id ? '접기' : '수정'}
                      </button>
                      <button onClick={() => setAwards(awards.filter(a => a.id !== award.id))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  {editingAward === award.id && (
                    <div style={{ marginTop: 10 }}>
                      <div style={s.divider} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <div style={{ gridColumn: '1 / -1' }}><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>활동명</div><input value={award.name} onChange={e => setAwards(awards.map(a => a.id === award.id ? { ...a, name: e.target.value } : a))} style={s.input} /></div>
                        <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>날짜</div><input value={award.date} onChange={e => setAwards(awards.map(a => a.id === award.id ? { ...a, date: e.target.value } : a))} placeholder="YYYY.MM" style={s.input} /></div>
                        <div><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>타입</div>
                          <select value={award.type} onChange={e => setAwards(awards.map(a => a.id === award.id ? { ...a, type: e.target.value } : a))} style={s.input}>
                            <option>수상</option><option>자격증</option><option>교육</option><option>기타</option>
                          </select></div>
                        <div style={{ gridColumn: '1 / -1' }}><div style={{ fontSize: 11, color: '#6B7684', marginBottom: 3 }}>상세 내용</div><input value={award.detail} onChange={e => setAwards(awards.map(a => a.id === award.id ? { ...a, detail: e.target.value } : a))} style={s.input} /></div>
                      </div>
                      <button style={s.saveBtn} onClick={() => setEditingAward(null)}>저장</button>
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={() => setAwards([...awards, { id: Date.now(), name: '활동명', date: 'YYYY.MM', type: '기타', detail: '' }])}
              style={{ ...s.card(true), display: 'flex', alignItems: 'center', gap: 10, width: '100%', cursor: 'pointer', textAlign: 'left' }}>
              <div style={s.iconBox('#F2F4F7')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ADB5BD"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>+ 수상/자격증/기타 추가</div>
                <div style={{ fontSize: 12, color: '#ADB5BD' }}>YYYY.MM&nbsp;&nbsp;|&nbsp;&nbsp;타입</div>
              </div>
            </button>
          </div>

          {/* 언어 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>언어</h2>
            {langs.map(lang => (
              <div key={lang.id} style={s.card(true)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={s.iconBox('#EEF6FF')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>{lang.name}</div>
                      <div style={{ fontSize: 12, color: '#ADB5BD' }}>{lang.date}&nbsp;&nbsp;|&nbsp;&nbsp;{lang.type}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button style={s.blueText} onClick={() => setEditingLang(editingLang === lang.id ? null : lang.id)}>
                      {editingLang === lang.id ? '접기' : '수정'}
                    </button>
                    <button onClick={() => setLangs(langs.filter(l => l.id !== lang.id))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.4 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div style={s.divider} />
                {editingLang === lang.id ? (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                      <input value={lang.name} onChange={e => setLangs(langs.map(l => l.id === lang.id ? { ...l, name: e.target.value } : l))} placeholder="시험명" style={s.input} />
                      <input value={lang.date} onChange={e => setLangs(langs.map(l => l.id === lang.id ? { ...l, date: e.target.value } : l))} placeholder="YYYY.MM" style={s.input} />
                      <input value={lang.type} onChange={e => setLangs(langs.map(l => l.id === lang.id ? { ...l, type: e.target.value } : l))} placeholder="타입" style={s.input} />
                    </div>
                    <button style={s.saveBtn} onClick={() => setEditingLang(null)}>저장</button>
                  </div>
                ) : (
                  <button style={s.blueText}>+ 이수 과목 또는 연구 내용을 작성해보세요.</button>
                )}
              </div>
            ))}
            <button onClick={() => setLangs([...langs, { id: Date.now(), name: '시험명', date: 'YYYY.MM', type: '타입', detail: '' }])}
              style={{ ...s.card(true), display: 'flex', alignItems: 'center', gap: 10, width: '100%', cursor: 'pointer' }}>
              <div style={s.iconBox('#F2F4F7')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#ADB5BD' }}>언어 추가</span>
            </button>
          </div>
        </div>

        {/* 포트폴리오 */}
        <SectionTitle>포트폴리오</SectionTitle>

        {/* 업로드된 포트폴리오 목록 */}
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} style={s.card(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={s.iconBox('#EEF6FF')}>
                <FolderIcon />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>{portfolio.name}</div>
                {portfolio.fileName && (
                  <div style={{ fontSize: 12, color: '#6B7684', marginTop: 2 }}>{portfolio.fileName}</div>
                )}
              </div>
              <button
                onClick={() => setPortfolios(portfolios.filter(p => p.id !== portfolio.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* + 포트폴리오 추가 - 네모칸 안에 폴더 아이콘 + 텍스트 */}
        <label style={{ display: 'block', cursor: 'pointer' }}>
          <input
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.hwp,.zip,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setPortfolios([...portfolios, {
                id: Date.now(),
                name: '포트폴리오',
                file,
                fileName: file.name,
              }]);
              e.target.value = '';
            }}
          />
          <div style={{ ...s.card(true), display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={s.iconBox('#EEF6FF')}>
              <FolderIcon />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#2196F3', fontWeight: 600 }}>+ 포트폴리오 추가</span>
            </div>
          </div>
        </label>

        {/* 자기소개서 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#191F28' }}>자기소개서</span>
          <button onClick={() => { setSelfIntroDraft(selfIntro); setEditingSelfIntro(!editingSelfIntro); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Img src="/correction.png" size={15} op={0.5} />
          </button>
        </div>
        <div style={s.card(false)}>
          {editingSelfIntro ? (
            <div>
              <textarea value={selfIntroDraft} onChange={e => setSelfIntroDraft(e.target.value)} style={{ ...s.textarea, minHeight: 160 }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button style={s.saveBtn} onClick={() => { setSelfIntro(selfIntroDraft); setEditingSelfIntro(false); }}>저장</button>
                <button style={s.cancelBtn} onClick={() => setEditingSelfIntro(false)}>취소</button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#4D5562', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-line' }}>{selfIntro}</p>
          )}
        </div>

      </div>

      {/* 하단 고정 버튼 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #F2F4F7', padding: '12px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7684' }}>이력서 제목</span>
            {editingTitle ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input value={titleDraft} onChange={e => setTitleDraft(e.target.value)}
                  style={{ ...s.input, width: 180, height: 30, fontSize: 13 }} autoFocus />
                <button style={s.saveBtn} onClick={() => { setResumeTitle(titleDraft); setEditingTitle(false); }}>저장</button>
                <button style={s.cancelBtn} onClick={() => { setTitleDraft(resumeTitle); setEditingTitle(false); }}>취소</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => { setTitleDraft(resumeTitle); setEditingTitle(true); }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>{resumeTitle}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowPreview(true)}
              style={{ width: 90, height: 42, border: '1px solid #E5E8EB', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#6B7684', background: '#fff', cursor: 'pointer' }}>
              미리보기
            </button>
            <button onClick={handleComplete} disabled={completing}
              style={{ width: 90, height: 42, background: completing ? '#ADB5BD' : '#2196F3', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', border: 'none', cursor: completing ? 'not-allowed' : 'pointer' }}>
              {completing ? '저장중...' : '작성완료'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Resume;