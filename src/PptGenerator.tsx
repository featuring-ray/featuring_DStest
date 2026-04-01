import './PptGenerator.css'
import { useState, useCallback, useRef, useReducer } from 'react'
import { Flex, VStack, Typo, CoreButton, CoreTag } from '@featuring-corp/components'
import {
  IconAiLavelOutline,
  IconRecentOutline,
  IconSettingsOutline,
  IconPptOutline,
  IconLinkOutline,
  IconDocumentOutline,
  IconAddOutline,
  IconCloseOutline,
  IconChartBarOutline,
  IconDataOutline,
  IconTuneOutline,
  IconWidgetOutline,
  IconMagicWandOutline,
  IconCheckCircleFilled,
  IconSubtractOutline,
  IconZoomInAreaOutline,
  IconDraggableFilled,
  IconReportDataOutline,
  IconInsightOutline,
} from '@featuring-corp/icons'

/* ═══════════════════════ 타입 ═══════════════════════ */

type PptStatus = 'INIT' | 'LOADING' | 'ANALYZING' | 'GENERATING' | 'OUTLINE' | 'EDITING' | 'COMPLETE' | 'ERROR'
type SlideType = 'title' | 'kpi' | 'chart' | 'comparison' | 'insight' | 'recommendation'

interface SlideElement {
  id: string
  kind: 'text' | 'kpi-grid' | 'bar-chart' | 'list'
  content: string
  data?: Record<string, unknown>[]
}

interface Slide {
  id: string
  type: SlideType
  title: string
  summary: string
  elements: SlideElement[]
}

interface PptTheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  bg: string
}

interface PptState {
  status: PptStatus
  slides: Slide[]
  activeSlideIndex: number
  selectedElementId: string | null
  theme: PptTheme
  error: string | null
  sidebarTab: string
}

type PptAction =
  | { type: 'SET_STATUS'; status: PptStatus }
  | { type: 'SET_SLIDES'; slides: Slide[] }
  | { type: 'SET_ACTIVE_SLIDE'; index: number }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'SET_THEME'; theme: PptTheme }
  | { type: 'SET_SIDEBAR'; tab: string }
  | { type: 'UPDATE_ELEMENT'; slideIndex: number; elementId: string; content: string }
  | { type: 'UPDATE_SLIDE_TITLE'; slideIndex: number; title: string }
  | { type: 'ADD_SLIDE' }
  | { type: 'DELETE_SLIDE'; index: number }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESET' }

/* ═══════════════════════ 상수 / Mock ═══════════════════════ */

const THEMES: PptTheme[] = [
  { id: 'default', name: '프로페셔널', primary: '#4f46e5', secondary: '#374151', accent: '#0d9488', bg: '#ffffff' },
  { id: 'dark', name: '다크 모드', primary: '#60a5fa', secondary: '#e5e7eb', accent: '#34d399', bg: '#1f2937' },
  { id: 'warm', name: '웜 톤', primary: '#f59e0b', secondary: '#78350f', accent: '#ef4444', bg: '#fffbeb' },
  { id: 'cool', name: '쿨 톤', primary: '#6366f1', secondary: '#4b5563', accent: '#06b6d4', bg: '#f0f9ff' },
  { id: 'nature', name: '자연', primary: '#059669', secondary: '#374151', accent: '#84cc16', bg: '#f0fdf4' },
  { id: 'brand', name: '브랜드', primary: '#7c3aed', secondary: '#1e293b', accent: '#ec4899', bg: '#faf5ff' },
]

const CAMPAIGNS = [
  { label: '그린러브 비건스킨케어 캠페인', value: 'greenlove' },
  { label: '다이슨 에어랩 캠페인', value: 'dyson' },
  { label: '미닉스더플렌더 캠페인', value: 'minix' },
]

const QUICK_PROMPTS = ['캠페인 성과 리포트', '인플루언서 분석', '제안서 초안', '월간 트렌드 리포트']

function generateMockSlides(): Slide[] {
  return [
    {
      id: 's1', type: 'title', title: '캠페인 성과 분석 리포트',
      summary: '그린러브 비건스킨케어 캠페인의 목표, 기간, 핵심 전략을 요약하는 도입부입니다.',
      elements: [
        { id: 'e1', kind: 'text', content: '그린러브 비건스킨케어 캠페인' },
        { id: 'e2', kind: 'text', content: '2026.02.15 – 2026.03.15 | 크리에이터 6명 | 예산 2,500만원' },
        { id: 'e3', kind: 'text', content: 'AI가 자동 생성한 성과 분석 프레젠테이션입니다.' },
      ],
    },
    {
      id: 's2', type: 'kpi', title: '핵심 성과 요약',
      summary: '도달, 참여, CPE, 전환율, ROI 등 주요 KPI를 한눈에 보여주는 요약 슬라이드입니다.',
      elements: [{
        id: 'e4', kind: 'kpi-grid', content: '',
        data: [
          { label: '총 도달', value: '1,247,000', sub: '+23% vs 목표' },
          { label: '총 참여', value: '85,200', sub: '참여율 6.8%' },
          { label: '평균 CPE', value: '214원', sub: '벤치마크 대비 우수' },
          { label: '전환율', value: '3.2%', sub: '업계 평균 2.1%' },
          { label: 'ROI', value: '287%', sub: '목표 200% 초과' },
          { label: '브랜드 언급', value: '1,840건', sub: '+45% vs 이전' },
        ],
      }],
    },
    {
      id: 's3', type: 'chart', title: '채널별 성과 비교',
      summary: 'Instagram, YouTube, TikTok 채널 간 도달·참여·CPE를 비교 분석합니다.',
      elements: [{
        id: 'e5', kind: 'bar-chart', content: '',
        data: [
          { label: 'Instagram 릴스', value: 434000, pct: 73, color: '#4f46e5' },
          { label: 'YouTube 쇼츠', value: 312000, pct: 53, color: '#0d9488' },
          { label: 'TikTok', value: 278000, pct: 47, color: '#ec4899' },
          { label: 'Instagram 피드', value: 223000, pct: 38, color: '#f59e0b' },
        ],
      }],
    },
    {
      id: 's4', type: 'comparison', title: 'Top 3 퍼포머',
      summary: 'CPE 효율 기준 상위 3인의 채널, 포맷, 도달, CPE를 상세 비교합니다.',
      elements: [
        { id: 'e6', kind: 'text', content: '1위: @creator_C — YouTube 쇼츠 | 도달 312,000 | CPE 113원' },
        { id: 'e7', kind: 'text', content: '2위: @creator_E — TikTok 쇼츠 | 도달 278,000 | CPE 128원' },
        { id: 'e8', kind: 'text', content: '3위: @creator_A — Instagram 릴스 | 도달 245,000 | CPE 137원' },
      ],
    },
    {
      id: 's5', type: 'insight', title: '핵심 인사이트',
      summary: 'AI가 분석한 주요 성과 패턴, 콘텐츠 구조 효과, 게시 시간 최적화 인사이트입니다.',
      elements: [{
        id: 'e9', kind: 'list', content: '',
        data: [
          { text: '숏폼(릴스+쇼츠)이 전체 참여의 87%를 차지하며, 피드 대비 CPE가 2.8배 효율적입니다.' },
          { text: '"제품 시연 + 비포/애프터" 구조에서 가장 높은 참여율을 기록했습니다.' },
          { text: '오후 8-10시 게시물의 참여율이 오전 대비 1.6배 높았습니다.' },
        ],
      }],
    },
    {
      id: 's6', type: 'recommendation', title: '향후 전략 제언',
      summary: '재협업 추천, 채널 확장 전략, 예산 재배분 등 데이터 기반 전략 제안입니다.',
      elements: [{
        id: 'e10', kind: 'list', content: '',
        data: [
          { text: '재협업 1순위: @creator_C (CPE 최저, 도달 최고) — 장기 앰배서더 계약 검토' },
          { text: '신규 채널 확장: TikTok 비중을 30%→50%로 확대 (CPE 효율 우수)' },
          { text: '예산 배분: 숏폼 70% / 피드 20% / 스토리 10% 비율로 재배분' },
        ],
      }],
    },
  ]
}

function formatNum(n: number): string { return n.toLocaleString('ko-KR') }

/* ═══════════════════════ Reducer ═══════════════════════ */

const VALID_TRANSITIONS: Record<PptStatus, PptStatus[]> = {
  INIT: ['LOADING'],
  LOADING: ['ANALYZING', 'ERROR'],
  ANALYZING: ['GENERATING', 'ERROR'],
  GENERATING: ['OUTLINE', 'ERROR'],
  OUTLINE: ['EDITING', 'GENERATING', 'ERROR'],
  EDITING: ['COMPLETE', 'OUTLINE', 'ERROR'],
  COMPLETE: ['INIT', 'EDITING', 'ERROR'],
  ERROR: ['INIT'],
}

const initialState: PptState = {
  status: 'INIT', slides: [], activeSlideIndex: 0,
  selectedElementId: null, theme: THEMES[0], error: null, sidebarTab: 'slides',
}

function pptReducer(state: PptState, action: PptAction): PptState {
  switch (action.type) {
    case 'SET_STATUS': {
      if (!VALID_TRANSITIONS[state.status].includes(action.status)) return state
      return { ...state, status: action.status, error: action.status === 'ERROR' ? state.error : null }
    }
    case 'SET_SLIDES': return { ...state, slides: action.slides }
    case 'SET_ACTIVE_SLIDE': return { ...state, activeSlideIndex: action.index, selectedElementId: null }
    case 'SELECT_ELEMENT': return { ...state, selectedElementId: action.id }
    case 'SET_THEME': return { ...state, theme: action.theme }
    case 'SET_SIDEBAR': return { ...state, sidebarTab: action.tab }
    case 'UPDATE_ELEMENT': {
      const s = [...state.slides]; const sl = { ...s[action.slideIndex] }
      sl.elements = sl.elements.map(e => e.id === action.elementId ? { ...e, content: action.content } : e)
      s[action.slideIndex] = sl; return { ...state, slides: s }
    }
    case 'UPDATE_SLIDE_TITLE': {
      const s = [...state.slides]; s[action.slideIndex] = { ...s[action.slideIndex], title: action.title }
      return { ...state, slides: s }
    }
    case 'ADD_SLIDE': {
      const ns: Slide = { id: `s${Date.now()}`, type: 'title', title: '새 슬라이드', summary: '새 슬라이드입니다.',
        elements: [{ id: `e${Date.now()}`, kind: 'text', content: '내용을 입력하세요.' }] }
      return { ...state, slides: [...state.slides, ns], activeSlideIndex: state.slides.length }
    }
    case 'DELETE_SLIDE': {
      if (state.slides.length <= 1) return state
      const ns = state.slides.filter((_, i) => i !== action.index)
      return { ...state, slides: ns, activeSlideIndex: Math.min(state.activeSlideIndex, ns.length - 1), selectedElementId: null }
    }
    case 'SET_ERROR': return { ...state, error: action.error, status: 'ERROR' }
    case 'RESET': return initialState
    default: return state
  }
}

/* ═══════════════════════ 공통 서브 컴포넌트 ═══════════════════════ */

function GNB({ title, onGenerate, showGenerate = true }: { title: string; onGenerate?: () => void; showGenerate?: boolean }) {
  return (
    <div className="ppt-gnb">
      <div className="ppt-gnb__left">
        <Typo variant="$heading-5" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 700 }}>{title}</Typo>
      </div>
      <div className="ppt-gnb__right">
        <button className="ppt-gnb__icon-btn"><IconRecentOutline size={20} /></button>
        <button className="ppt-gnb__icon-btn"><IconSettingsOutline size={20} /></button>
        {showGenerate && onGenerate && (
          <CoreButton buttonType="primary" size="sm" text="Generate Presentation" onClick={onGenerate} />
        )}
      </div>
    </div>
  )
}

function IconSidebar({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  const items = [
    { id: 'slides', icon: IconPptOutline, label: 'SLIDES' },
    { id: 'layouts', icon: IconWidgetOutline, label: 'LAYOUTS' },
    { id: 'data', icon: IconDataOutline, label: 'DATA' },
    { id: 'themes', icon: IconTuneOutline, label: 'THEMES' },
    { id: 'ai', icon: IconAiLavelOutline, label: 'AI ASSIST' },
  ]
  return (
    <div className="ppt-outline__sidebar">
      {items.map(it => (
        <button key={it.id} className={`ppt-sidebar-btn ${active === it.id ? 'ppt-sidebar-btn--active' : ''}`}
          onClick={() => onChange(it.id)}>
          <it.icon size={20} />
          {it.label}
        </button>
      ))}
    </div>
  )
}

/* ═══════════════════════ 메인 컴포넌트 ═══════════════════════ */

export default function PptGenerator() {
  const [state, dispatch] = useReducer(pptReducer, initialState)
  const [prompt, setPrompt] = useState('')
  const [targetId, setTargetId] = useState('greenlove')
  const [showTheme, setShowTheme] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [magicInput, setMagicInput] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeSlide = state.slides[state.activeSlideIndex] || null

  const handleGenerate = useCallback(() => {
    dispatch({ type: 'SET_STATUS', status: 'LOADING' })
    timerRef.current = setTimeout(() => {
      dispatch({ type: 'SET_STATUS', status: 'ANALYZING' })
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'SET_STATUS', status: 'GENERATING' })
        timerRef.current = setTimeout(() => {
          dispatch({ type: 'SET_SLIDES', slides: generateMockSlides() })
          dispatch({ type: 'SET_STATUS', status: 'OUTLINE' })
        }, 1200)
      }, 1200)
    }, 1000)
  }, [])

  const handleMagicEdit = useCallback(() => {
    if (!magicInput.trim() || !activeSlide) return
    dispatch({ type: 'UPDATE_SLIDE_TITLE', slideIndex: state.activeSlideIndex, title: activeSlide.title + ' ✨' })
    setMagicInput('')
  }, [magicInput, state.activeSlideIndex, activeSlide])

  const handleExport = useCallback((f: string) => {
    dispatch({ type: 'SET_STATUS', status: 'COMPLETE' })
    alert(`${f.toUpperCase()} 다운로드가 시작되었습니다. (Mock)`)
    setShowExport(false)
  }, [])

  /* ═══════ INIT ═══════ */
  if (state.status === 'INIT') {
    return (
      <div className="ppt-page">
        <GNB title="AI PPT Studio" onGenerate={handleGenerate} showGenerate={!!prompt.trim()} />

        {/* 히어로 */}
        <div className="ppt-hero">
          <Typo variant="$heading-1" style={{ color: 'var(--semantic-color-text-1)', marginBottom: 8 }}>
            다음 프레젠테이션은{'\n'}
            <span className="ppt-hero__accent">어떤 이야기</span>를 담을까요?
          </Typo>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)', maxWidth: 520, margin: '0 auto' }}>
            분석 방향을 설명하고, 데이터를 연결하거나, 최근 프로젝트에서 시작하세요.
          </Typo>
        </div>

        {/* AI 엔진 + 사이드 패널 */}
        <div className="ppt-init-content">
          {/* 좌: AI Creative Engine */}
          <VStack style={{ gap: 16 }}>
            <div className="ppt-engine-card">
              <Flex style={{ alignItems: 'center', gap: 8 }}>
                <IconAiLavelOutline size={16} color="var(--global-colors-primary-60)" />
                <Typo variant="$caption-1" style={{ fontWeight: 700, letterSpacing: '0.05em', color: 'var(--semantic-color-text-3)', textTransform: 'uppercase' as const }}>
                  AI Creative Engine
                </Typo>
              </Flex>

              <textarea
                className="ppt-engine-card__prompt"
                placeholder="예: '이번 Q4 인플루언서 캠페인을 분석하고, 고임팩트 비주얼 중심 리포트를 생성해줘'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="ppt-engine-card__actions">
                <button className="ppt-gnb__icon-btn" title="파일 첨부"><IconDocumentOutline size={18} /></button>
                <CoreButton buttonType="primary" size="md" text="프레젠테이션 생성 →" onClick={handleGenerate} />
              </div>

              <div className="ppt-engine-card__chips">
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', fontWeight: 600 }}>TRY:</Typo>
                {QUICK_PROMPTS.map(p => (
                  <button key={p} className="ppt-chip" onClick={() => setPrompt(p)}>{p}</button>
                ))}
              </div>
            </div>

            {/* 소스 카드 */}
            <div className="ppt-source-cards">
              <div className="ppt-source-card">
                <Flex style={{ alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <IconDocumentOutline size={20} color="var(--semantic-color-icon-secondary)" />
                  <IconAddOutline size={14} color="var(--semantic-color-text-4)" style={{ marginLeft: 'auto' }} />
                </Flex>
                <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 4 }}>Notion 페이지 동기화</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>Notion 워크스페이스의 기획서·회의록을 불러와 슬라이드 기반으로 변환합니다.</Typo>
              </div>
              <div className="ppt-source-card">
                <Flex style={{ alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <IconLinkOutline size={20} color="var(--semantic-color-icon-secondary)" />
                  <IconAddOutline size={14} color="var(--semantic-color-text-4)" style={{ marginLeft: 'auto' }} />
                </Flex>
                <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 4 }}>웹 URL 분석</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>경쟁사 URL이나 뉴스 기사를 붙여넣어 슬라이드 덱으로 변환합니다.</Typo>
              </div>
            </div>
          </VStack>

          {/* 우: 데이터 소스 + AI 팁 */}
          <div className="ppt-side-cards">
            <div className="ppt-side-card">
              <div className="ppt-side-card__title">데이터 소스</div>
              <VStack style={{ gap: 0 }}>
                <div className="ppt-data-row">
                  <div className="ppt-data-icon" style={{ background: 'var(--global-colors-primary-10)' }}>
                    <IconReportDataOutline size={18} color="var(--global-colors-primary-60)" />
                  </div>
                  <VStack style={{ gap: 2, flex: 1 }}>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>캠페인 성과 데이터</Typo>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>피처링 내부 데이터</Typo>
                  </VStack>
                  <IconCheckCircleFilled size={16} color="var(--global-colors-primary-60)" />
                </div>
                <div className="ppt-data-row">
                  <div className="ppt-data-icon" style={{ background: 'var(--global-colors-teal-10)' }}>
                    <IconInsightOutline size={18} color="var(--global-colors-teal-70)" />
                  </div>
                  <VStack style={{ gap: 2, flex: 1 }}>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>인플루언서 프로필</Typo>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>팔로워/참여율 데이터</Typo>
                  </VStack>
                  <IconCheckCircleFilled size={16} color="var(--global-colors-teal-70)" />
                </div>
              </VStack>
              <VStack style={{ gap: 8, marginTop: 12 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', fontWeight: 600 }}>대상 캠페인</Typo>
                <select className="ppt-engine-card__prompt" style={{ minHeight: 'auto', padding: '8px 12px', fontSize: 13, borderRadius: 'var(--global-radius-200)' }}
                  value={targetId} onChange={e => setTargetId(e.target.value)}>
                  {CAMPAIGNS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </VStack>
            </div>

            <div className="ppt-ai-tip">
              <Flex style={{ alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <IconAiLavelOutline size={14} color="var(--global-colors-primary-60)" />
                <Typo variant="$caption-1" style={{ fontWeight: 700, color: 'var(--global-colors-primary-60)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>AI TIP</Typo>
              </Flex>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-2)', lineHeight: 1.5 }}>
                프롬프트에 '톤'을 지정해보세요. '미니멀', '임원용', '데이터 중심' 같은 키워드를 넣으면 더 나은 스타일 결과를 얻을 수 있습니다.
              </Typo>
            </div>
          </div>
        </div>

        {/* 최근 프레젠테이션 */}
        <div className="ppt-recent">
          <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <VStack style={{ gap: 4 }}>
              <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)' }}>최근 프레젠테이션</Typo>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>이전 작업을 이어가거나 스타일을 복제하세요.</Typo>
            </VStack>
            <CoreButton buttonType="tertiary" size="sm" text="모든 프로젝트 보기 →" />
          </Flex>
          <div className="ppt-recent__grid">
            {[
              { name: 'Q4 마케팅 전략', time: '2시간 전', slides: 12, gradient: true },
              { name: '제품 런칭 로드맵', time: '1일 전', slides: 8, gradient: false },
              { name: '브랜드 가이드라인 v2', time: '3일 전', slides: 24, gradient: true },
            ].map((p, i) => (
              <div key={i} className="ppt-recent-card" onClick={handleGenerate}>
                <div className={`ppt-recent-card__thumb ${p.gradient ? 'ppt-recent-card__thumb--gradient' : ''}`}>
                  {!p.gradient && <IconPptOutline size={32} color="var(--semantic-color-text-4)" />}
                </div>
                <div className="ppt-recent-card__info">
                  <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{p.name}</Typo>
                  <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', marginTop: 2 }}>수정 {p.time} · {p.slides} Slides</Typo>
                </div>
              </div>
            ))}
            <div className="ppt-recent-card ppt-recent-card--empty" onClick={handleGenerate}>
              <VStack style={{ alignItems: 'center', gap: 6 }}>
                <IconAddOutline size={24} color="var(--semantic-color-text-4)" />
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>빈 캔버스</Typo>
              </VStack>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════ LOADING / ANALYZING / GENERATING ═══════ */
  if (['LOADING', 'ANALYZING', 'GENERATING'].includes(state.status)) {
    const steps = [
      { key: 'LOADING', label: '데이터 수집' },
      { key: 'ANALYZING', label: '인사이트 분석' },
      { key: 'GENERATING', label: '슬라이드 생성' },
    ]
    const ci = steps.findIndex(s => s.key === state.status)
    return (
      <div className="ppt-page">
        <GNB title="AI PPT Studio" showGenerate={false} />
        <div className="ppt-generating">
          <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>프레젠테이션을 제작하고 있습니다</Typo>
          <div className="ppt-generating__steps">
            {steps.map((step, i) => (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div className="ppt-step__connector" />}
                <div className={`ppt-step ${i === ci ? 'ppt-step--active' : i < ci ? 'ppt-step--done' : ''}`}>
                  <div className="ppt-step__icon">
                    {i < ci ? <IconCheckCircleFilled size={24} color="var(--global-colors-teal-70)" /> :
                      i === 0 ? <IconDataOutline size={24} /> : i === 1 ? <IconInsightOutline size={24} /> : <IconPptOutline size={24} />}
                  </div>
                  <Typo variant="$caption-1" style={{ color: i === ci ? 'var(--global-colors-primary-60)' : 'var(--semantic-color-text-4)', fontWeight: i === ci ? 700 : 500 }}>
                    {step.label}
                  </Typo>
                </div>
              </div>
            ))}
          </div>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)' }}>
            {state.status === 'LOADING' && '캠페인 데이터를 수집하고 있습니다...'}
            {state.status === 'ANALYZING' && 'AI가 성과를 분석하고 인사이트를 도출하고 있습니다...'}
            {state.status === 'GENERATING' && '슬라이드 구조와 콘텐츠를 생성하고 있습니다...'}
          </Typo>
        </div>
      </div>
    )
  }

  /* ═══════ ERROR ═══════ */
  if (state.status === 'ERROR') {
    return (
      <div className="ppt-page">
        <GNB title="AI PPT Studio" showGenerate={false} />
        <div className="ppt-generating">
          <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-support-error-1)' }}>오류가 발생했습니다</Typo>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)' }}>{state.error || '알 수 없는 오류'}</Typo>
          <CoreButton buttonType="primary" size="md" text="다시 시도" onClick={() => dispatch({ type: 'RESET' })} />
        </div>
      </div>
    )
  }

  /* ═══════ OUTLINE ═══════ */
  if (state.status === 'OUTLINE') {
    return (
      <div className="ppt-page">
        <GNB title="AI PPT Studio" onGenerate={() => dispatch({ type: 'SET_STATUS', status: 'EDITING' })} />
        <div className="ppt-outline">
          <IconSidebar active="slides" onChange={() => {}} />

          {/* 중앙: 아웃라인 목록 */}
          <div className="ppt-outline__main">
            <div className="ppt-outline__header">
              <VStack style={{ gap: 8 }}>
                <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>프레젠테이션 아웃라인</Typo>
                <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)' }}>
                  AI가 "{CAMPAIGNS.find(c => c.value === targetId)?.label}" 분석을 위한 전략적 구성을 생성했습니다. 슬라이드 흐름과 요약을 검토하세요.
                </Typo>
              </VStack>
              <CoreButton buttonType="secondary" size="md" text="↻ 아웃라인 재생성" onClick={handleGenerate} />
            </div>

            {state.slides.map((slide, i) => (
              <div key={slide.id}
                className={`ppt-outline__card ${i === state.activeSlideIndex ? 'ppt-outline__card--active' : ''}`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_SLIDE', index: i })}>
                <IconDraggableFilled size={16} color="var(--semantic-color-text-5)" style={{ marginTop: 4 }} />
                <VStack style={{ gap: 6, flex: 1 }}>
                  <Flex style={{ alignItems: 'center', gap: 8 }}>
                    <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{slide.title}</Typo>
                  </Flex>
                  <Flex style={{ alignItems: 'center', gap: 6 }}>
                    <span className="ppt-outline__card-num">{String(i + 1).padStart(2, '0')}</span>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-3)' }}>{slide.summary}</Typo>
                  </Flex>
                </VStack>
                <button className="ppt-outline__card-edit"><IconMagicWandOutline size={16} /></button>
              </div>
            ))}

            <div className="ppt-outline__add" onClick={() => dispatch({ type: 'ADD_SLIDE' })}>
              <IconAddOutline size={16} /> 새 슬라이드 섹션 추가
            </div>

            <Flex style={{ justifyContent: 'flex-end', marginTop: 24, gap: 8 }}>
              <CoreButton buttonType="primary" size="md" text="슬라이드 편집 시작 →"
                onClick={() => dispatch({ type: 'SET_STATUS', status: 'EDITING' })} />
            </Flex>
          </div>

          {/* 우측: Narrative Flow */}
          <div className="ppt-outline__right">
            <div className="ppt-side-card__title">NARRATIVE FLOW</div>
            <div className="ppt-narrative-card">
              <Flex style={{ alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <IconAiLavelOutline size={14} color="var(--global-colors-primary-60)" />
                <Typo variant="$caption-1" style={{ fontWeight: 700, color: 'var(--global-colors-primary-60)', textTransform: 'uppercase' as const }}>AI 전략</Typo>
              </Flex>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-2)', lineHeight: 1.6 }}>
                이 흐름은 <strong>성과 지표</strong>를 먼저 제시하고 <strong>채널 분석</strong> → <strong>전략 제언</strong> 순으로 구성하여
                이해관계자의 초반 동의를 확보합니다.
              </Typo>
            </div>

            <VStack style={{ gap: 12, marginTop: 8 }}>
              {state.slides.slice(0, 3).map((slide, i) => (
                <VStack key={slide.id} style={{ gap: 4 }}>
                  <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--global-radius-200)', background: i === 0 ? 'linear-gradient(135deg, #4f46e5, #0d9488)' : 'var(--semantic-color-background-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i > 0 && <IconChartBarOutline size={24} color="var(--semantic-color-text-4)" />}
                  </div>
                  <Typo variant="$caption-2" style={{ fontWeight: 600, color: 'var(--semantic-color-text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.03em' }}>
                    {i === 0 ? 'HOOK: 캠페인 개요' : i === 1 ? 'EVIDENCE: 성과 데이터' : 'VALIDATION: 채널 분석'}
                  </Typo>
                </VStack>
              ))}
            </VStack>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════ EDITING / COMPLETE ═══════ */
  return (
    <div className="ppt-page">
      <GNB title="AI PPT Studio" onGenerate={() => setShowExport(true)} showGenerate={false} />

      {/* 에디터 GNB 대체: 타이틀 + 액션 */}
      <div className="ppt-gnb" style={{ borderBottom: '1px solid var(--semantic-color-border-default)' }}>
        <div className="ppt-gnb__left">
          <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>
            {state.slides[0]?.title || '프레젠테이션'}
          </Typo>
          {state.status === 'COMPLETE' && <CoreTag tagType="primary" size="xs">완료</CoreTag>}
        </div>
        <div className="ppt-gnb__right">
          <CoreButton buttonType="tertiary" size="sm" text="Share" />
          <CoreButton buttonType="primary" size="sm" text="Export" onClick={() => setShowExport(true)} />
        </div>
      </div>

      <div className="ppt-editor">
        {/* 아이콘 사이드바 */}
        <div className="ppt-editor__sidebar">
          <IconSidebar active={state.sidebarTab} onChange={(t) => dispatch({ type: 'SET_SIDEBAR', tab: t })} />
        </div>

        {/* 슬라이드 패널 */}
        <div className="ppt-editor__panel">
          <div className="ppt-editor__panel-header">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{state.slides[0]?.title}</Typo>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', marginTop: 2 }}>LAST EDITED 2M AGO</Typo>
          </div>
          <div className="ppt-editor__panel-slides">
            {state.slides.map((slide, i) => (
              <div key={slide.id} className={`ppt-thumb ${i === state.activeSlideIndex ? 'ppt-thumb--active' : ''}`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_SLIDE', index: i })}>
                <span className="ppt-thumb__number">{String(i + 1).padStart(2, '0')}</span>
                <div className="ppt-thumb__preview">
                  <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, fontSize: 9 }}>{slide.title}</Typo>
                </div>
              </div>
            ))}
          </div>
          <button className="ppt-panel__add" onClick={() => dispatch({ type: 'ADD_SLIDE' })}>
            <IconAddOutline size={14} /> ADD SLIDE
          </button>
        </div>

        {/* 캔버스 영역 */}
        <div className="ppt-editor__canvas-area">
          <div className="ppt-canvas">
            {activeSlide && (
              <div className="ppt-canvas__slide">
                <div className={`ppt-canvas__element ${state.selectedElementId === 'title' ? 'ppt-canvas__element--selected' : ''}`}
                  onClick={() => dispatch({ type: 'SELECT_ELEMENT', id: 'title' })}>
                  <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)' }}>{activeSlide.title}</Typo>
                  {activeSlide.type === 'title' && (
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-3)', marginTop: 4 }}>{activeSlide.summary}</Typo>
                  )}
                </div>

                <VStack style={{ gap: 8, marginTop: 16, flex: 1 }}>
                  {activeSlide.elements.map((el) => (
                    <div key={el.id} className={`ppt-canvas__element ${state.selectedElementId === el.id ? 'ppt-canvas__element--selected' : ''}`}
                      onClick={() => dispatch({ type: 'SELECT_ELEMENT', id: el.id })}>
                      {el.kind === 'text' && <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>{el.content}</Typo>}
                      {el.kind === 'kpi-grid' && el.data && (
                        <div className="ppt-slide-kpi-grid">
                          {(el.data as { label: string; value: string; sub: string }[]).map((k, ki) => (
                            <div key={ki} className="ppt-slide-kpi">
                              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>{k.label}</Typo>
                              <Typo variant="$heading-5" style={{ color: 'var(--semantic-color-text-1)', marginTop: 2 }}>{k.value}</Typo>
                              <Typo variant="$caption-2" style={{ color: 'var(--global-colors-teal-70)', marginTop: 2 }}>{k.sub}</Typo>
                            </div>
                          ))}
                        </div>
                      )}
                      {el.kind === 'bar-chart' && el.data && (
                        <VStack style={{ gap: 6, marginTop: 8 }}>
                          {(el.data as { label: string; value: number; pct: number; color: string }[]).map((b, bi) => (
                            <div key={bi} className="ppt-slide-bar">
                              <div className="ppt-slide-bar__label">
                                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 500 }}>{b.label}</Typo>
                              </div>
                              <div className="ppt-slide-bar__track">
                                <div className="ppt-slide-bar__fill" style={{ width: `${b.pct}%`, background: b.color }} />
                              </div>
                              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', width: 60, textAlign: 'right', flexShrink: 0 }}>{formatNum(b.value)}</Typo>
                            </div>
                          ))}
                        </VStack>
                      )}
                      {el.kind === 'list' && el.data && (
                        <VStack style={{ gap: 6 }}>
                          {(el.data as { text: string }[]).map((item, li) => (
                            <Flex key={li} style={{ gap: 8, alignItems: 'flex-start' }}>
                              <Typo variant="$body-2" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 700, flexShrink: 0 }}>{li + 1}.</Typo>
                              <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>{item.text}</Typo>
                            </Flex>
                          ))}
                        </VStack>
                      )}
                    </div>
                  ))}
                </VStack>

                {activeSlide.type === 'title' && (
                  <Flex style={{ justifyContent: 'flex-end', marginTop: 'auto' }}>
                    <CoreTag tagType="gray" size="xs">Confidential Internal Report</CoreTag>
                  </Flex>
                )}
              </div>
            )}
          </div>

          {/* Magic Edit Bar */}
          <div className="ppt-magic-bar">
            <IconAiLavelOutline size={20} color="var(--global-colors-primary-60)" />
            <input className="ppt-magic-bar__input" placeholder="더 간결하게 만들거나 핵심 성과를 강조해줘..."
              value={magicInput} onChange={e => setMagicInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleMagicEdit()} />
            <CoreButton buttonType="contrast" size="sm" text="MAGIC EDIT" onClick={handleMagicEdit} />
          </div>

          {/* Zoom Bar */}
          <div className="ppt-zoom-bar">
            <button className="ppt-zoom-bar__btn"><IconSubtractOutline size={14} /></button>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', width: 40, textAlign: 'center' }}>85%</Typo>
            <button className="ppt-zoom-bar__btn"><IconAddOutline size={14} /></button>
            <button className="ppt-zoom-bar__btn" style={{ marginLeft: 8 }}><IconZoomInAreaOutline size={14} /></button>
          </div>
        </div>

        {/* Inspector */}
        <div className="ppt-inspector">
          <div className="ppt-inspector__header">
            <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>
              {state.selectedElementId === 'title' ? '슬라이드 속성' :
                state.selectedElementId ? '요소 속성' : '슬라이드 속성'}
            </Typo>
          </div>

          <div className="ppt-inspector__body">
            {/* 차트 속성 (차트 슬라이드일 때) */}
            {activeSlide?.type === 'chart' && (
              <>
                <div>
                  <div className="ppt-inspector__section-title">LAYOUT & STYLE</div>
                  <div className="ppt-style-options">
                    <div className="ppt-style-option ppt-style-option--active">
                      <IconChartBarOutline size={20} color="var(--global-colors-primary-60)" />
                      <Typo variant="$caption-2" style={{ marginTop: 4, color: 'var(--semantic-color-text-1)' }}>Bar Chart</Typo>
                    </div>
                    <div className="ppt-style-option">
                      <IconDataOutline size={20} color="var(--semantic-color-text-3)" />
                      <Typo variant="$caption-2" style={{ marginTop: 4, color: 'var(--semantic-color-text-3)' }}>Line Chart</Typo>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="ppt-inspector__section-title">DATA FILTERS</div>
                  <VStack style={{ gap: 8 }}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>Time Range</Typo>
                    <select className="ppt-inspector__input" defaultValue="3m">
                      <option value="1m">Last 1 Month</option>
                      <option value="3m">Last 3 Months</option>
                      <option value="6m">Last 6 Months</option>
                    </select>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', marginTop: 4 }}>Metric</Typo>
                    <Flex style={{ gap: 6 }}>
                      <CoreTag tagType="primary" size="xs">Total Reach</CoreTag>
                      <CoreTag tagType="gray" size="xs">Conversions</CoreTag>
                    </Flex>
                  </VStack>
                </div>
              </>
            )}

            {/* 텍스트 속성 */}
            {(state.selectedElementId === 'title' || (state.selectedElementId && activeSlide?.elements.find(e => e.id === state.selectedElementId)?.kind === 'text')) && (
              <>
                <div>
                  <div className="ppt-inspector__section-title">TEXT SETTINGS</div>
                  <VStack style={{ gap: 8 }}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>Font Family</Typo>
                    <select className="ppt-inspector__input" defaultValue="pretendard">
                      <option value="pretendard">Pretendard</option>
                      <option value="inter">Inter</option>
                    </select>
                    <Flex style={{ gap: 8 }}>
                      <VStack style={{ gap: 4, flex: 1 }}>
                        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>Weight</Typo>
                        <select className="ppt-inspector__input" defaultValue="bold">
                          <option value="normal">Regular</option>
                          <option value="600">Semibold</option>
                          <option value="bold">Bold</option>
                        </select>
                      </VStack>
                      <VStack style={{ gap: 4, flex: 1 }}>
                        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>Size</Typo>
                        <input className="ppt-inspector__input" type="text" defaultValue="24px" />
                      </VStack>
                    </Flex>
                  </VStack>
                </div>
                {state.selectedElementId === 'title' && activeSlide && (
                  <div>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 6 }}>제목 편집</Typo>
                    <input className="ppt-inspector__input" style={{ width: '100%' }} value={activeSlide.title}
                      onChange={e => dispatch({ type: 'UPDATE_SLIDE_TITLE', slideIndex: state.activeSlideIndex, title: e.target.value })} />
                  </div>
                )}
              </>
            )}

            {/* 테마 색상 */}
            <div>
              <div className="ppt-inspector__section-title">VISUAL THEME</div>
              <div className="ppt-color-swatches">
                {THEMES.slice(0, 5).map(t => (
                  <div key={t.id} className={`ppt-swatch ${state.theme.id === t.id ? 'ppt-swatch--active' : ''}`}
                    style={{ background: t.primary }} onClick={() => dispatch({ type: 'SET_THEME', theme: t })} />
                ))}
                <Typo variant="$caption-2" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600, cursor: 'pointer', marginLeft: 4 }}
                  onClick={() => setShowTheme(true)}>EDIT</Typo>
              </div>
            </div>

            {/* AI Suggestion */}
            <div className="ppt-ai-suggest">
              <Flex style={{ alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <IconAiLavelOutline size={14} color="var(--global-colors-primary-60)" />
                <Typo variant="$caption-1" style={{ fontWeight: 700, color: 'var(--global-colors-primary-60)', textTransform: 'uppercase' as const }}>AI SUGGESTION</Typo>
              </Flex>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-2)', lineHeight: 1.5 }}>
                "Q4 데이터가 강한 상승 추세를 보이고 있습니다. 현재 성장률 기반으로 <strong>Q1 예측선</strong>을 추가하시겠습니까?"
              </Typo>
              <CoreButton buttonType="primary" size="sm" text="APPLY SUGGESTION" style={{ width: '100%', marginTop: 10 }} />
            </div>
          </div>

          <div className="ppt-inspector__footer">
            <CoreButton buttonType="tertiary" size="sm" text="RESET" style={{ flex: 1 }} />
            <CoreButton buttonType="primary" size="sm" text="UPDATE SLIDE" style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      {/* 테마 모달 */}
      {showTheme && (
        <div className="ppt-overlay" onClick={() => setShowTheme(false)}>
          <div className="ppt-modal" onClick={e => e.stopPropagation()}>
            <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Typo variant="$heading-5" style={{ color: 'var(--semantic-color-text-1)' }}>테마 선택</Typo>
              <button className="ppt-gnb__icon-btn" onClick={() => setShowTheme(false)}><IconCloseOutline size={20} /></button>
            </Flex>
            <div className="ppt-theme-grid">
              {THEMES.map(t => (
                <div key={t.id} className={`ppt-theme-card ${state.theme.id === t.id ? 'ppt-theme-card--active' : ''}`}
                  onClick={() => { dispatch({ type: 'SET_THEME', theme: t }); setShowTheme(false) }}>
                  <div className="ppt-theme-preview">
                    <div className="ppt-theme-swatch" style={{ background: t.primary }} />
                    <div className="ppt-theme-swatch" style={{ background: t.secondary }} />
                    <div className="ppt-theme-swatch" style={{ background: t.accent }} />
                  </div>
                  <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{t.name}</Typo>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 내보내기 모달 */}
      {showExport && (
        <div className="ppt-overlay" onClick={() => setShowExport(false)}>
          <div className="ppt-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Typo variant="$heading-5" style={{ color: 'var(--semantic-color-text-1)' }}>내보내기</Typo>
              <button className="ppt-gnb__icon-btn" onClick={() => setShowExport(false)}><IconCloseOutline size={20} /></button>
            </Flex>
            <div className="ppt-export-checklist">
              <div className="ppt-side-card__title">사전 체크리스트</div>
              {['맞춤법 확인 완료', '브랜드 색상 일관성 확인', '데이터 정확성 확인'].map(c => (
                <div key={c} className="ppt-export-check">
                  <IconCheckCircleFilled size={16} color="var(--global-colors-teal-70)" />
                  <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>{c}</Typo>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--semantic-color-border-default)', paddingTop: 16 }}>
              <Flex style={{ gap: 8 }}>
                <CoreButton buttonType="primary" size="md" text="PPTX 다운로드" onClick={() => handleExport('pptx')} style={{ flex: 1 }} />
                <CoreButton buttonType="tertiary" size="md" text="PDF 다운로드" onClick={() => handleExport('pdf')} style={{ flex: 1 }} />
              </Flex>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
