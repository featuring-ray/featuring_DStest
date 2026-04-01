/* ═══════════════════════ 인플루언서 데이터 모듈 ═══════════════════════ */

export interface InfluencerData {
  id: number
  name: string
  subname: string
  platform: 'instagram' | 'youtube' | 'tiktok' | 'x'
  accountLink: string
  categories: string[]
  followerCount: string
  er: string
  expectedReach: string
  avgFeedLikes: string
  avgVideoViews: string
  avgVideoLikes: string
  expectedCpr: string
  audience: {
    gender: { label: string; pct: number; color: string }[]
    age: { label: string; pct: number; color: string }[]
  }
  topContents: { title: string; likes: string; comments: string; date: string }[]
  adPerformance: { label: string; value: string; pct: number; color: string }[]
}

export const INFLUENCERS: InfluencerData[] = [
  {
    id: 1, name: 'TheAcacia_Hyurin', subname: '코알라 혀린',
    platform: 'instagram', accountLink: 'www.instagram.com/theacacia_hyurin',
    categories: ['뷰티', '패션'], followerCount: '9,204만', er: '10%',
    expectedReach: '920,400', avgFeedLikes: '92,040', avgVideoViews: '184,080', avgVideoLikes: '18,408',
    expectedCpr: '10,000',
    audience: {
      gender: [{ label: '여성', pct: 72, color: '#ec4899' }, { label: '남성', pct: 25, color: '#3b82f6' }, { label: '기타', pct: 3, color: '#9ca3af' }],
      age: [{ label: '13-17', pct: 8, color: '#c084fc' }, { label: '18-24', pct: 35, color: '#818cf8' }, { label: '25-34', pct: 38, color: '#4f46e5' }, { label: '35-44', pct: 14, color: '#6366f1' }, { label: '45+', pct: 5, color: '#a5b4fc' }],
    },
    topContents: [
      { title: '봄 메이크업 루틴 GRWM', likes: '245,000', comments: '3,200', date: '2026.03.12' },
      { title: '신상 파운데이션 비교 리뷰', likes: '198,000', comments: '2,800', date: '2026.03.05' },
      { title: '일주일 데일리룩 모아보기', likes: '176,000', comments: '2,100', date: '2026.02.28' },
      { title: '비건 스킨케어 추천 TOP5', likes: '165,000', comments: '1,950', date: '2026.02.20' },
    ],
    adPerformance: [
      { label: '평균 CPE', value: '137원', pct: 45, color: '#4f46e5' },
      { label: '광고 참여율', value: '8.2%', pct: 82, color: '#0d9488' },
      { label: '브랜드 언급률', value: '94%', pct: 94, color: '#7c3aed' },
      { label: '광고 ROI', value: '312%', pct: 78, color: '#f59e0b' },
    ],
  },
  {
    id: 2, name: 'tteokbokkiyum', subname: '떡볶이욤',
    platform: 'instagram', accountLink: 'www.instagram.com/tteokbokkiyum',
    categories: ['음식', '일상'], followerCount: '3,580만', er: '8.5%',
    expectedReach: '304,300', avgFeedLikes: '30,430', avgVideoViews: '71,600', avgVideoLikes: '7,160',
    expectedCpr: '12,000',
    audience: {
      gender: [{ label: '여성', pct: 65, color: '#ec4899' }, { label: '남성', pct: 32, color: '#3b82f6' }, { label: '기타', pct: 3, color: '#9ca3af' }],
      age: [{ label: '13-17', pct: 12, color: '#c084fc' }, { label: '18-24', pct: 42, color: '#818cf8' }, { label: '25-34', pct: 30, color: '#4f46e5' }, { label: '35-44', pct: 11, color: '#6366f1' }, { label: '45+', pct: 5, color: '#a5b4fc' }],
    },
    topContents: [
      { title: '서울 떡볶이 맛집 투어', likes: '89,000', comments: '4,200', date: '2026.03.10' },
      { title: '엽떡 신메뉴 솔직 리뷰', likes: '72,000', comments: '3,800', date: '2026.03.03' },
      { title: '편의점 야식 조합 BEST', likes: '65,000', comments: '2,900', date: '2026.02.25' },
      { title: '홈쿡 레시피: 로제떡볶이', likes: '58,000', comments: '2,100', date: '2026.02.18' },
    ],
    adPerformance: [
      { label: '평균 CPE', value: '198원', pct: 55, color: '#4f46e5' },
      { label: '광고 참여율', value: '6.8%', pct: 68, color: '#0d9488' },
      { label: '브랜드 언급률', value: '88%', pct: 88, color: '#7c3aed' },
      { label: '광고 ROI', value: '245%', pct: 61, color: '#f59e0b' },
    ],
  },
  {
    id: 3, name: 'guchou4', subname: '구초우',
    platform: 'instagram', accountLink: 'www.instagram.com/guchou4',
    categories: ['여행', '음식'], followerCount: '2,100만', er: '6.2%',
    expectedReach: '130,200', avgFeedLikes: '13,020', avgVideoViews: '42,000', avgVideoLikes: '4,200',
    expectedCpr: '15,000',
    audience: {
      gender: [{ label: '여성', pct: 58, color: '#ec4899' }, { label: '남성', pct: 39, color: '#3b82f6' }, { label: '기타', pct: 3, color: '#9ca3af' }],
      age: [{ label: '13-17', pct: 5, color: '#c084fc' }, { label: '18-24', pct: 28, color: '#818cf8' }, { label: '25-34', pct: 40, color: '#4f46e5' }, { label: '35-44', pct: 20, color: '#6366f1' }, { label: '45+', pct: 7, color: '#a5b4fc' }],
    },
    topContents: [
      { title: '제주도 3박4일 브이로그', likes: '45,000', comments: '1,800', date: '2026.03.08' },
      { title: '도쿄 현지인 맛집 리스트', likes: '38,000', comments: '2,200', date: '2026.02.28' },
      { title: '부산 감천문화마을 투어', likes: '32,000', comments: '1,500', date: '2026.02.20' },
      { title: '태국 방콕 길거리 음식', likes: '29,000', comments: '1,200', date: '2026.02.12' },
    ],
    adPerformance: [
      { label: '평균 CPE', value: '245원', pct: 65, color: '#4f46e5' },
      { label: '광고 참여율', value: '5.1%', pct: 51, color: '#0d9488' },
      { label: '브랜드 언급률', value: '82%', pct: 82, color: '#7c3aed' },
      { label: '광고 ROI', value: '198%', pct: 50, color: '#f59e0b' },
    ],
  },
  {
    id: 4, name: 'pbaerk11', subname: '박이레',
    platform: 'youtube', accountLink: 'www.youtube.com/@pbaerk11',
    categories: ['IT/테크', '리뷰'], followerCount: '1,850만', er: '5.7%',
    expectedReach: '105,450', avgFeedLikes: '10,545', avgVideoViews: '370,000', avgVideoLikes: '37,000',
    expectedCpr: '18,000',
    audience: {
      gender: [{ label: '여성', pct: 28, color: '#ec4899' }, { label: '남성', pct: 69, color: '#3b82f6' }, { label: '기타', pct: 3, color: '#9ca3af' }],
      age: [{ label: '13-17', pct: 10, color: '#c084fc' }, { label: '18-24', pct: 32, color: '#818cf8' }, { label: '25-34', pct: 35, color: '#4f46e5' }, { label: '35-44', pct: 18, color: '#6366f1' }, { label: '45+', pct: 5, color: '#a5b4fc' }],
    },
    topContents: [
      { title: '맥북 프로 M4 Max 리뷰', likes: '120,000', comments: '5,600', date: '2026.03.15' },
      { title: '갤럭시 S26 vs 아이폰 17', likes: '95,000', comments: '8,200', date: '2026.03.08' },
      { title: '10만원대 가성비 이어폰 TOP5', likes: '78,000', comments: '3,400', date: '2026.02.25' },
      { title: '코딩 입문자 노트북 추천', likes: '62,000', comments: '2,800', date: '2026.02.18' },
    ],
    adPerformance: [
      { label: '평균 CPE', value: '312원', pct: 78, color: '#4f46e5' },
      { label: '광고 참여율', value: '4.8%', pct: 48, color: '#0d9488' },
      { label: '브랜드 언급률', value: '91%', pct: 91, color: '#7c3aed' },
      { label: '광고 ROI', value: '276%', pct: 69, color: '#f59e0b' },
    ],
  },
  {
    id: 5, name: 'starjelly_kr', subname: '스타젤리',
    platform: 'tiktok', accountLink: 'www.tiktok.com/@starjelly_kr',
    categories: ['댄스', '일상'], followerCount: '290만', er: '12.4%',
    expectedReach: '35,960', avgFeedLikes: '3,596', avgVideoViews: '58,000', avgVideoLikes: '5,800',
    expectedCpr: '7,500',
    audience: {
      gender: [{ label: '여성', pct: 68, color: '#ec4899' }, { label: '남성', pct: 29, color: '#3b82f6' }, { label: '기타', pct: 3, color: '#9ca3af' }],
      age: [{ label: '13-17', pct: 28, color: '#c084fc' }, { label: '18-24', pct: 45, color: '#818cf8' }, { label: '25-34', pct: 18, color: '#4f46e5' }, { label: '35-44', pct: 7, color: '#6366f1' }, { label: '45+', pct: 2, color: '#a5b4fc' }],
    },
    topContents: [
      { title: '틱톡 댄스 챌린지 모음', likes: '28,000', comments: '1,200', date: '2026.03.12' },
      { title: '하루 브이로그 with 고양이', likes: '22,000', comments: '980', date: '2026.03.05' },
      { title: '신곡 커버 댄스', likes: '18,000', comments: '750', date: '2026.02.28' },
      { title: 'OOTD 일주일 코디', likes: '15,000', comments: '620', date: '2026.02.20' },
    ],
    adPerformance: [
      { label: '평균 CPE', value: '95원', pct: 32, color: '#4f46e5' },
      { label: '광고 참여율', value: '10.5%', pct: 100, color: '#0d9488' },
      { label: '브랜드 언급률', value: '96%', pct: 96, color: '#7c3aed' },
      { label: '광고 ROI', value: '425%', pct: 100, color: '#f59e0b' },
    ],
  },
]

/** 이름, subname, accountLink로 인플루언서 검색 */
export function searchInfluencers(query: string): InfluencerData[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().replace('@', '')
  return INFLUENCERS.filter(inf =>
    inf.name.toLowerCase().includes(q) ||
    inf.subname.toLowerCase().includes(q) ||
    inf.accountLink.toLowerCase().includes(q)
  )
}

/** 선택된 인플루언서 데이터를 프롬프트 텍스트로 변환 */
export function influencersToPromptText(influencers: InfluencerData[]): string {
  return influencers.map(inf => {
    const profile = [
      `=== 인플루언서: @${inf.name} (${inf.subname}) ===`,
      `플랫폼: ${inf.platform} | 카테고리: ${inf.categories.join(', ')}`,
      `팔로워: ${inf.followerCount} | 참여율: ${inf.er} | 예상 도달: ${inf.expectedReach}`,
      `평균 피드 좋아요: ${inf.avgFeedLikes} | 평균 영상 조회: ${inf.avgVideoViews}`,
      `예상 CPR: ${inf.expectedCpr}`,
    ].join('\n')

    const audience = [
      '\n[오디언스 분석]',
      `성별: ${inf.audience.gender.map(g => `${g.label} ${g.pct}%`).join(', ')}`,
      `연령: ${inf.audience.age.map(a => `${a.label}세 ${a.pct}%`).join(', ')}`,
    ].join('\n')

    const contents = [
      '\n[인기 콘텐츠]',
      ...inf.topContents.map((c, i) => `${i + 1}. ${c.title} (좋아요 ${c.likes}, 댓글 ${c.comments}, ${c.date})`),
    ].join('\n')

    const ad = [
      '\n[광고 성과]',
      ...inf.adPerformance.map(a => `${a.label}: ${a.value}`),
    ].join('\n')

    return [profile, audience, contents, ad].join('\n')
  }).join('\n\n')
}
