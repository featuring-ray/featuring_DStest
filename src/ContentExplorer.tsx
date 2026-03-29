import './ContentExplorer.css'
import { useState, useCallback, useRef, useEffect } from 'react'
import { Flex, VStack, Typo, CoreButton, CoreTag, CoreTabs, CoreTabItem, CoreSelect, CoreTextInput } from '@featuring-corp/components'
import {
  IconSearchAiOutline,
  IconAiSymbolFilled,
  IconInstagramColored,
  IconYoutubeColored,
  IconTiktokColored,
  IconPresentationOutline,
} from '@featuring-corp/icons'
import type {
  ExplorerTab,
  Platform,
  CreatorDiscoveryResult,
  TrendCard,
  PerformancePatternResult,
} from './types/content-explorer'

/* ── 탭 정의 ── */
interface TabDef {
  key: ExplorerTab
  label: string
  disabled: boolean
}

const TABS: TabDef[] = [
  { key: 'creator-discovery', label: '크리에이터 발굴', disabled: false },
  { key: 'trend-scanning', label: '트렌드 스캐닝', disabled: false },
  { key: 'performance-pattern', label: '성과 패턴', disabled: false },
]

const COMING_SOON_TABS = ['경쟁사 벤치마킹', '톤앤매너 정의']

/* ── 캠페인 목록 (기존 캠페인 Mock) ── */
const CAMPAIGN_OPTIONS = [
  { id: 1, label: '26.03 다이슨 에어랩 멀티 스타일러 캠페인', category: '뷰티', query: '20대 여성 뷰티 헤어 스타일링 자연스러운 톤' },
  { id: 2, label: '26.01 미닉스더플렌더 캠페인', category: '뷰티', query: '뷰티 블렌더 메이크업 도구 리뷰' },
  { id: 3, label: '25.10 베베바이옴 안티에이징 세럼 캠페인', category: '뷰티', query: '30대 여성 스킨케어 안티에이징' },
  { id: 4, label: '25.10 성수 팝업 방문 캠페인', category: '일상', query: '성수 팝업 스토어 방문 브이로그' },
  { id: 5, label: '25.09 겨울 패딩 스타일링', category: '패션', query: '겨울 아우터 패딩 스타일링 코디' },
]

/* ── 카테고리 옵션 ── */
const CATEGORY_OPTIONS = ['뷰티', '패션', '음식', '여행', 'IT/테크', '게임', '일상', '홈/리빙']

/* ── AI 메시지 (통합 분석) ── */
const AI_MESSAGES_UNIFIED = [
  '캠페인 콘텐츠를 분석하고 있습니다...',
  '카테고리 내 1,847개 콘텐츠를 스캔했습니다',
  '크리에이터 3명, 트렌드 6개, 성과 패턴 4개를 발견했습니다',
  '모든 탭에 결과가 준비되었습니다',
]

/* ── Mock: 크리에이터 발굴 결과 ── */
const MOCK_CREATOR_RESULTS: CreatorDiscoveryResult[] = [
  {
    influencerId: 1,
    name: 'TheAcacia_Hyurin',
    handle: '@theacacia_hyurin',
    platform: 'instagram',
    followerCount: '9,204만',
    er: '10%',
    categories: ['뷰티', '패션'],
    brandFitScore: 92,
    matchReasons: [
      '자연스러운 톤 일관성 (최근 30개 콘텐츠 분석)',
      '뷰티/헤어 카테고리 전문성 67%',
      '20대 여성 팔로워 비율 78%',
    ],
    proofContents: [
      { id: 'p1', contentType: '릴스', caption: '자연광 스타일링 톤 일치', metrics: { likes: 11340, comments: 892, saves: 2104, engagementRate: 12.3 }, matchReason: '자연광 스타일링 톤 일치' },
      { id: 'p2', contentType: '피드', caption: '일상 뷰티 루틴 포맷', metrics: { likes: 7520, comments: 412, saves: 1830, engagementRate: 8.1 }, matchReason: '일상 뷰티 루틴 포맷' },
      { id: 'p3', contentType: '스토리', caption: '제품 자연스러운 노출 사례', metrics: { likes: 8800, comments: 520, saves: 1450, engagementRate: 9.5 }, matchReason: '제품 자연스러운 노출 사례' },
    ],
    estimatedPrice: '900,000',
  },
  {
    influencerId: 2,
    name: 'tteokbokkiyum',
    handle: '@tteokbokkiyum',
    platform: 'instagram',
    followerCount: '3,580만',
    er: '8.5%',
    categories: ['뷰티', '일상'],
    brandFitScore: 87,
    matchReasons: [
      '제품 자연 노출 스타일 (PPL 비율 23%)',
      '일상+뷰티 크로스 카테고리',
      '높은 저장률 (평균 4.2%)',
    ],
    proofContents: [
      { id: 'p4', contentType: '릴스', caption: '제품 자연 노출 스타일', metrics: { likes: 10200, comments: 780, saves: 1900, engagementRate: 11.2 }, matchReason: '제품 자연 노출 스타일' },
      { id: 'p5', contentType: '피드', caption: '일상+뷰티 크로스 콘텐츠', metrics: { likes: 6800, comments: 350, saves: 1200, engagementRate: 7.8 }, matchReason: '일상+뷰티 크로스 콘텐츠' },
      { id: 'p6', contentType: '릴스', caption: '높은 저장률 콘텐츠', metrics: { likes: 9200, comments: 650, saves: 1780, engagementRate: 10.1 }, matchReason: '높은 저장률 콘텐츠' },
    ],
    estimatedPrice: '800,000',
  },
  {
    influencerId: 3,
    name: 'abb_revi',
    handle: '@abb_revi',
    platform: 'instagram',
    followerCount: '1,340만',
    er: '9.1%',
    categories: ['뷰티'],
    brandFitScore: 85,
    matchReasons: [
      '상세 리뷰 전문 (평균 캡션 길이 상위 20%)',
      '뷰티 제품 리뷰 전환율 높음',
      '댓글 답변율 92% (높은 팬 소통)',
    ],
    proofContents: [
      { id: 'p7', contentType: '피드', caption: '상세 리뷰 콘텐츠', metrics: { likes: 8900, comments: 720, saves: 2050, engagementRate: 9.8 }, matchReason: '상세 리뷰 콘텐츠' },
      { id: 'p8', contentType: '릴스', caption: '비포/애프터 바이럴', metrics: { likes: 12100, comments: 980, saves: 2800, engagementRate: 13.2 }, matchReason: '비포/애프터 바이럴' },
      { id: 'p9', contentType: '피드', caption: '높은 팬 소통 콘텐츠', metrics: { likes: 7600, comments: 480, saves: 1650, engagementRate: 8.5 }, matchReason: '높은 팬 소통 콘텐츠' },
    ],
    estimatedPrice: '600,000',
  },
]

/* ── Mock: 트렌드 카드 ── */
const MOCK_TREND_CARDS: TrendCard[] = [
  { id: 't1', hashtag: '#GRWM', topic: '겟레디위드미', dominantFormat: '릴스', formatPercentage: 82, hookExample: '매일 쓰는 이 3가지...', avgEngagementRate: 8.2, contentCount: 2340, growthRate: 34, topCreators: [] },
  { id: 't2', hashtag: '#솔직리뷰', topic: '제품 솔직 리뷰', dominantFormat: '쇼츠', formatPercentage: 67, hookExample: '솔직히 이건...', avgEngagementRate: 6.5, contentCount: 1870, growthRate: 28, topCreators: [] },
  { id: 't3', hashtag: '#ASMR개봉기', topic: '언박싱 ASMR', dominantFormat: '릴스', formatPercentage: 75, hookExample: '드디어 도착했다...', avgEngagementRate: 9.1, contentCount: 980, growthRate: 52, topCreators: [] },
  { id: 't4', hashtag: '#일상브이로그', topic: '데일리 루틴', dominantFormat: '영상', formatPercentage: 58, hookExample: '하루 종일 같이...', avgEngagementRate: 5.8, contentCount: 3200, growthRate: 15, topCreators: [] },
  { id: 't5', hashtag: '#비포애프터', topic: '변화 과정', dominantFormat: '릴스', formatPercentage: 88, hookExample: '한 달 동안 써봤는데...', avgEngagementRate: 7.4, contentCount: 1540, growthRate: 41, topCreators: [] },
  { id: 't6', hashtag: '#꿀팁공유', topic: '생활 꿀팁', dominantFormat: '피드', formatPercentage: 45, hookExample: '이거 모르면 손해...', avgEngagementRate: 6.1, contentCount: 2100, growthRate: 22, topCreators: [] },
]

/* ── Mock: 성과 패턴 결과 ── */
const MOCK_PERFORMANCE_RESULT: PerformancePatternResult = {
  patterns: [
    { id: 'pp1', insight: '포맷: 릴스가 피드 대비 2.3배 높은 인게이지먼트', dataPoint: '릴스 8.7% vs 피드 3.8%' },
    { id: 'pp2', insight: '길이: 15-30초가 최적 (ER 8.7%)', dataPoint: '15-30초 구간' },
    { id: 'pp3', insight: '훅: 질문형 시작이 38% 더 높은 인게이지먼트', dataPoint: '질문형 vs 서술형' },
    { id: 'pp4', insight: '편집: Fast cuts + 자막이 72%의 상위 콘텐츠에서 사용', dataPoint: '상위 10% 분석' },
  ],
  formatComparison: [
    { format: '릴스', avgEngagementRate: 8.7, sampleSize: 540 },
    { format: '쇼츠', avgEngagementRate: 7.2, sampleSize: 320 },
    { format: '피드', avgEngagementRate: 5.2, sampleSize: 890 },
    { format: '영상', avgEngagementRate: 4.8, sampleSize: 210 },
    { format: '스토리', avgEngagementRate: 4.1, sampleSize: 1200 },
  ],
  optimalDuration: '15-30초',
  topHookStyle: '질문형',
}

/* ── 포맷 라벨 ── */
const FORMAT_LABEL: Record<string, string> = {
  '릴스': '릴스', '쇼츠': '쇼츠', '피드': '피드', '영상': '영상', '스토리': '스토리',
}

/* ── 포맷별 바 색상 ── */
const FORMAT_COLOR: Record<string, string> = {
  '릴스': 'var(--global-colors-primary-60)',
  '쇼츠': 'var(--global-colors-teal-70)',
  '피드': 'var(--global-colors-magenta-40)',
  '영상': '#f59e0b',
  '스토리': '#94a3b8',
}

/* ── 플랫폼 필터 아이콘 ── */
const PLATFORM_FILTER: { key: Platform; Icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'instagram', Icon: IconInstagramColored },
  { key: 'youtube', Icon: IconYoutubeColored },
  { key: 'tiktok', Icon: IconTiktokColored },
]

/* ── BrandFit 색상 ── */
function brandFitColor(score: number): string {
  if (score >= 90) return 'var(--global-colors-teal-70)'
  if (score >= 80) return '#f59e0b'
  return '#94a3b8'
}

/* ══════════════════════════════════════════════
   서브 컴포넌트: AI 응답 패널
   ══════════════════════════════════════════════ */
function AiResponsePanel({ steps, isAnalyzing, campaignName }: { steps: string[]; isAnalyzing: boolean; campaignName: string | null }) {
  return (
    <div className="ce-ai-panel">
      <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <IconAiSymbolFilled size={20} />
        <Typo variant="$body-2" style={{ fontWeight: 600 }}>AI 분석</Typo>
      </Flex>

      {campaignName && (
        <div className="ce-ai-context">
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>분석 대상</Typo>
          <Typo variant="$caption-1" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600, marginTop: 2 }}>
            {campaignName}
          </Typo>
        </div>
      )}

      <VStack style={{ gap: 12 }}>
        {steps.map((step, i) => (
          <Flex key={i} style={{ alignItems: 'flex-start', gap: 8 }}>
            <div className={`ce-ai-dot ${i === steps.length - 1 && isAnalyzing ? 'ce-ai-dot--pulse' : ''}`} />
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>{step}</Typo>
          </Flex>
        ))}
        {isAnalyzing && (
          <div className="ce-ai-typing">
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>분석 중</Typo>
            <span className="ce-typing-dots" />
          </div>
        )}
      </VStack>

      {/* 시간 절약 배지 */}
      {!isAnalyzing && steps.length > 0 && (
        <div className="ce-time-saving">
          <Typo variant="$caption-1" style={{ fontWeight: 600, marginBottom: 8 }}>시간 절약</Typo>
          <VStack style={{ gap: 4 }}>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>수동 작업 시: 4시간 12분</Typo>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>AI 분석: 3초</Typo>
            <Typo variant="$caption-1" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600 }}>99.9% 시간 절약</Typo>
          </VStack>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   서브 컴포넌트: CreatorCard
   ══════════════════════════════════════════════ */
function CreatorCard({ creator }: { creator: CreatorDiscoveryResult }) {
  return (
    <div className="ce-creator-card">
      <Flex style={{ gap: 12, marginBottom: 12 }}>
        <div className="ce-creator-avatar">
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)' }}>
            {creator.name[0]}
          </Typo>
        </div>
        <VStack style={{ gap: 4, flex: 1 }}>
          <Flex style={{ alignItems: 'center', gap: 8 }}>
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>{creator.name}</Typo>
            <CoreTag tagType="magenta" size="xs">{creator.platform === 'instagram' ? 'IG' : creator.platform === 'youtube' ? 'YT' : 'TT'}</CoreTag>
          </Flex>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{creator.handle}</Typo>
          <Flex style={{ gap: 12 }}>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>팔로워 {creator.followerCount}</Typo>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>ER {creator.er}</Typo>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>예상 단가 ₩{creator.estimatedPrice}</Typo>
          </Flex>
          <Flex style={{ gap: 4 }}>
            {creator.categories.map((cat, i) => (
              <CoreTag key={i} tagType="teal" size="xs">{cat}</CoreTag>
            ))}
          </Flex>
        </VStack>
      </Flex>

      {/* BrandFitScore 바 */}
      <div className="ce-brandfit">
        <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>Brand Fit Score</Typo>
          <Typo variant="$caption-1" style={{ fontWeight: 600, color: brandFitColor(creator.brandFitScore) }}>{creator.brandFitScore}%</Typo>
        </Flex>
        <div className="ce-brandfit-track">
          <div className="ce-brandfit-fill" style={{ width: `${creator.brandFitScore}%`, background: brandFitColor(creator.brandFitScore) }} />
        </div>
      </div>

      {/* Proof 콘텐츠 썸네일 */}
      <div className="ce-proof-section">
        <Typo variant="$caption-1" style={{ fontWeight: 600, marginBottom: 6 }}>Proof 콘텐츠</Typo>
        <div className="ce-proof-row">
          {creator.proofContents.map((proof) => (
            <div key={proof.id} className="ce-proof-item">
              <div className="ce-proof-thumb">
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
                  {FORMAT_LABEL[proof.contentType] || proof.contentType}
                </Typo>
              </div>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
                ER {proof.metrics.engagementRate}%
              </Typo>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)', textAlign: 'center' }}>
                {proof.matchReason}
              </Typo>
            </div>
          ))}
        </div>
      </div>

      {/* 매칭 근거 */}
      <div className="ce-match-reasons">
        <Typo variant="$caption-1" style={{ fontWeight: 600, marginBottom: 4 }}>AI 매칭 근거</Typo>
        <ul className="ce-match-list">
          {creator.matchReasons.map((reason, i) => (
            <li key={i}>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>{reason}</Typo>
            </li>
          ))}
        </ul>
      </div>

      {/* 액션 */}
      <div className="ce-creator-actions">
        <CoreButton
          buttonType="primary"
          size="sm"
          text="제안서에 추가"
          onClick={() => { window.location.href = `/proposal-builder?creators=${creator.influencerId}` }}
        />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   서브 컴포넌트: TrendCardItem
   ══════════════════════════════════════════════ */
function TrendCardItem({ trend }: { trend: TrendCard }) {
  return (
    <div className="ce-trend-card">
      <Typo variant="$body-2" style={{ fontWeight: 700 }}>{trend.hashtag}</Typo>
      <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginTop: 2 }}>{trend.topic}</Typo>

      <div className="ce-trend-meta">
        <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
            주요 포맷: {FORMAT_LABEL[trend.dominantFormat] || trend.dominantFormat} {trend.formatPercentage}%
          </Typo>
          <CoreTag tagType="lightGreen" size="xs">+{trend.growthRate}%</CoreTag>
        </Flex>
      </div>

      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', fontStyle: 'italic', marginTop: 8 }}>
        &ldquo;{trend.hookExample}&rdquo;
      </Typo>

      <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>평균 ER</Typo>
        <Typo variant="$caption-1" style={{ fontWeight: 600 }}>{trend.avgEngagementRate}%</Typo>
      </Flex>
    </div>
  )
}

/* ══════════════════════════════════════════════
   서브 컴포넌트: PerformancePanel
   ══════════════════════════════════════════════ */
function PerformancePanel({ result }: { result: PerformancePatternResult }) {
  const maxER = Math.max(...result.formatComparison.map(f => f.avgEngagementRate))

  return (
    <VStack style={{ gap: 24 }}>
      <div className="ce-pattern-card">
        <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 12 }}>핵심 인사이트</Typo>
        <ol className="ce-pattern-list">
          {result.patterns.map((p) => (
            <li key={p.id}>
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>{p.insight}</Typo>
            </li>
          ))}
        </ol>
      </div>

      <div className="ce-chart-card">
        <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 12 }}>포맷별 평균 ER 비교</Typo>
        <VStack style={{ gap: 10 }}>
          {result.formatComparison.map((fc) => (
            <div key={fc.format} className="ce-bar-row">
              <Typo variant="$caption-2" className="ce-bar-label">
                {FORMAT_LABEL[fc.format] || fc.format}
              </Typo>
              <div className="ce-bar-track">
                <div
                  className="ce-bar-fill"
                  style={{ width: `${(fc.avgEngagementRate / maxER) * 100}%`, background: FORMAT_COLOR[fc.format] || '#94a3b8' }}
                />
              </div>
              <Typo variant="$caption-1" className="ce-bar-value" style={{ fontWeight: 600 }}>
                {fc.avgEngagementRate}%
              </Typo>
            </div>
          ))}
        </VStack>
      </div>
    </VStack>
  )
}

/* ══════════════════════════════════════════════
   메인 컴포넌트
   ══════════════════════════════════════════════ */
export default function ContentExplorer() {
  const [activeTab, setActiveTab] = useState(0)
  const [queryText, setQueryText] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiSteps, setAiSteps] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [activeCampaignName, setActiveCampaignName] = useState<string | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const currentTabKey: ExplorerTab = TABS[activeTab]?.key ?? 'creator-discovery'

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }, [])

  /* ── 통합 분석 실행 (한 번 분석 → 모든 탭 결과) ── */
  const runAnalysis = useCallback((campaignName: string | null) => {
    clearTimers()
    setIsAnalyzing(true)
    setShowResults(false)
    setAiSteps([])
    setActiveCampaignName(campaignName)

    AI_MESSAGES_UNIFIED.forEach((msg, i) => {
      const timer = setTimeout(() => {
        setAiSteps(prev => [...prev, msg])
        if (i === AI_MESSAGES_UNIFIED.length - 1) {
          setIsAnalyzing(false)
          setShowResults(true)
        }
      }, (i + 1) * 800)
      timersRef.current.push(timer)
    })
  }, [clearTimers])

  /* ── 캠페인 선택 시 자동 분석 ── */
  const handleCampaignSelect = useCallback((value: string) => {
    setSelectedCampaign(value)
    const campaign = CAMPAIGN_OPTIONS.find(c => String(c.id) === value)
    if (campaign) {
      setQueryText(campaign.query)
      runAnalysis(campaign.label)
    }
  }, [runAnalysis])

  /* ── 자연어 검색 (Enter 또는 버튼) ── */
  const handleSearch = useCallback(() => {
    if (!queryText.trim() && !selectedCampaign) return
    const campaign = CAMPAIGN_OPTIONS.find(c => String(c.id) === selectedCampaign)
    runAnalysis(campaign?.label ?? null)
  }, [queryText, selectedCampaign, runAnalysis])

  /* ── Enter 키 핸들링 ── */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }, [handleSearch])

  /* ── 탭 전환 (결과 유지!) ── */
  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index)
  }, [])

  const handlePlatformToggle = useCallback((platform: Platform) => {
    setSelectedPlatform(prev => prev === platform ? null : platform)
  }, [])

  /* ── 컴포넌트 언마운트 시 타이머 정리 ── */
  useEffect(() => {
    return () => { timersRef.current.forEach(t => clearTimeout(t)) }
  }, [])

  return (
    <div className="ce-page">

      {/* ── 상단 헤더 ── */}
      <div className="ce-topbar">
        <Flex style={{ alignItems: 'center', gap: 8 }}>
          <IconSearchAiOutline size={20} />
          <Typo variant="$body-1" style={{ fontWeight: 600 }}>콘텐츠 기반 탐색</Typo>
        </Flex>
        <CoreTag tagType="primary" size="xs">AI</CoreTag>
      </div>

      {/* ── 캠페인 연결 + 자연어 입력 ── */}
      <div className="ce-context-bar">
        <Flex style={{ gap: 12, alignItems: 'center' }}>
          <Flex style={{ alignItems: 'center', gap: 6 }}>
            <IconPresentationOutline size={16} color="var(--semantic-color-icon-secondary)" />
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', whiteSpace: 'nowrap' }}>캠페인 연결</Typo>
          </Flex>
          <div className="ce-campaign-select">
            <CoreSelect
              size="sm"
              placeholderText="캠페인을 선택하면 자동 분석됩니다"
              value={selectedCampaign}
              setValue={(v: string) => handleCampaignSelect(v)}
            >
              {CAMPAIGN_OPTIONS.map(c => (
                <CoreSelect.Item key={c.id} value={String(c.id)}>{c.label}</CoreSelect.Item>
              ))}
            </CoreSelect>
          </div>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)', whiteSpace: 'nowrap' }}>또는</Typo>
          <div className="ce-search-input">
            <CoreTextInput
              placeholder="자연어로 입력하세요 (예: 20대 여성 뷰티 크리에이터 찾아줘)"
              size="md"
              leadingElement={<IconSearchAiOutline size={16} />}
              value={queryText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQueryText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <CoreButton
            buttonType="primary"
            size="md"
            text="분석"
            onClick={handleSearch}
          />
        </Flex>
      </div>

      {/* ── 필터 (카테고리 + 플랫폼) ── */}
      <div className="ce-filter-bar">
        <Flex style={{ gap: 8, alignItems: 'center' }}>
          <CoreSelect size="sm" placeholderText="카테고리">
            {CATEGORY_OPTIONS.map(cat => (
              <CoreSelect.Item key={cat} value={cat}>{cat}</CoreSelect.Item>
            ))}
          </CoreSelect>
          <div className="ce-platform-filter">
            {PLATFORM_FILTER.map(({ key, Icon }) => (
              <button
                key={key}
                className={`ce-pf-btn ${selectedPlatform === key ? 'ce-pf-btn--active' : ''}`}
                onClick={() => handlePlatformToggle(key)}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </Flex>
      </div>

      {/* ── 탭 ── */}
      <div className="ce-tabs">
        <CoreTabs>
          {TABS.map((tab, i) => (
            <CoreTabItem
              key={tab.key}
              active={activeTab === i}
              onClick={() => handleTabChange(i)}
            >
              {tab.label}
              {showResults && <span className="ce-tab-dot" />}
            </CoreTabItem>
          ))}
          {COMING_SOON_TABS.map((label) => (
            <CoreTabItem key={label} active={false} disabled>
              {label}
              <CoreTag tagType="gray" size="xs" style={{ marginLeft: 4 }}>Soon</CoreTag>
            </CoreTabItem>
          ))}
        </CoreTabs>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div className="ce-main">
        {/* 좌측: AI 응답 패널 */}
        <AiResponsePanel steps={aiSteps} isAnalyzing={isAnalyzing} campaignName={activeCampaignName} />

        {/* 우측: 결과 패널 */}
        <div className="ce-result-panel">
          {!showResults && !isAnalyzing && aiSteps.length === 0 && (
            <div className="ce-empty-state">
              <IconSearchAiOutline size={48} color="#d2d2d2" />
              <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)', marginTop: 12 }}>
                캠페인을 선택하거나 자연어를 입력하면
              </Typo>
              <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)' }}>
                모든 탭에 분석 결과가 자동으로 채워집니다
              </Typo>
            </div>
          )}

          {isAnalyzing && (
            <div className="ce-empty-state">
              <div className="ce-spinner" />
              <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)', marginTop: 12 }}>
                AI가 전체 분석 중입니다...
              </Typo>
            </div>
          )}

          {/* 크리에이터 발굴 */}
          {showResults && currentTabKey === 'creator-discovery' && (
            <VStack style={{ gap: 16 }}>
              <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typo variant="$body-2" style={{ fontWeight: 600 }}>추천 크리에이터 3명</Typo>
                <CoreButton
                  buttonType="contrast"
                  size="sm"
                  text="전체 제안서 생성"
                  onClick={() => {
                    const ids = MOCK_CREATOR_RESULTS.map(c => c.influencerId).join(',')
                    window.location.href = `/proposal-builder?creators=${ids}`
                  }}
                />
              </Flex>
              {MOCK_CREATOR_RESULTS.map(creator => (
                <CreatorCard key={creator.influencerId} creator={creator} />
              ))}
            </VStack>
          )}

          {/* 트렌드 스캐닝 */}
          {showResults && currentTabKey === 'trend-scanning' && (
            <VStack style={{ gap: 16 }}>
              <Typo variant="$body-2" style={{ fontWeight: 600 }}>주요 트렌드 6개</Typo>
              <div className="ce-trend-grid">
                {MOCK_TREND_CARDS.map(trend => (
                  <TrendCardItem key={trend.id} trend={trend} />
                ))}
              </div>
            </VStack>
          )}

          {/* 성과 패턴 */}
          {showResults && currentTabKey === 'performance-pattern' && (
            <PerformancePanel result={MOCK_PERFORMANCE_RESULT} />
          )}
        </div>
      </div>
    </div>
  )
}
