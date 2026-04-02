import './MarketLandscape.css'
import { useState, useMemo, useReducer, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { VStack, Typo, CoreButton, CoreTag, CoreSelect } from '@featuring-corp/components'
import { IconAiSymbolFilled, IconChevronLeftOutline } from '@featuring-corp/icons'
import type {
  MLState,
  MLAction,
  MLStep,
  BeautyCategory,
  Dimension,
  Metric,
  DimensionMetricData,
  DrilldownContext,
  DrilldownTab,
  ScatterPoint,
  EfficiencyRow,
  TimeSeriesPoint,
  KeywordItem,
  AttributionEvent,
} from './types/marketLandscape'
import {
  PERIOD_OPTIONS,
  CATEGORY_OPTIONS,
  PLATFORM_OPTIONS,
  BRAND_OPTIONS,
  DIMENSION_LABELS,
  METRIC_LABELS,
  generateDashboardData,
  generateDrilldownAnalysis,
  generateDimensionInsight,
  generateOverviewBubble,
  computeKpiSummary,
} from './data/marketLandscapeMockData'

// ==================== 상수 ====================

const AI_MESSAGES = [
  '분석 스코프 확인 중...',
  '카테고리 분류 데이터 집계 중...',
  '인플루언서 티어별 분포 계산 중...',
  '프로모션 의도 분석 중...',
  '브랜드별 성과 메트릭 산출 중...',
  '대시보드 생성 완료',
]

const VALID_TRANSITIONS: Record<MLStep, MLStep[]> = {
  SCOPE_SETTING: ['GENERATING'],
  GENERATING: ['DASHBOARD', 'SCOPE_SETTING'],
  DASHBOARD: ['DRILLDOWN', 'SCOPE_SETTING'],
  DRILLDOWN: ['DASHBOARD'],
}

const DIMENSIONS_ORDER: Dimension[] = [
  'influencer-tier',
  'top-category',
  'sub-category',
  'promotion-intent',
  'brand',
]

const METRICS_ORDER: Metric[] = ['content-volume', 'total-engagement', 'total-views']

const DRILLDOWN_TABS: { key: DrilldownTab; label: string }[] = [
  { key: 'gap', label: 'Vol vs Perf Gap' },
  { key: 'efficiency', label: '효율 비교' },
  { key: 'timeseries', label: '시계열 점유율' },
  { key: 'positioning', label: '포지셔닝 맵' },
  { key: 'keyword', label: '키워드 비교' },
  { key: 'attribution', label: '원인 귀속' },
]

// ==================== Reducer ====================

const initialState: MLState = {
  step: 'SCOPE_SETTING',
  scope: {
    period: '2025-4Q',
    category: 'all',
    platforms: ['instagram', 'youtube', 'tiktok'],
    ownBrand: '',
    competitors: [],
  },
  dashboardData: [],
  activeMetric: 'content-volume',
  drilldown: null,
  drilldownAnalysis: null,
  generatingProgress: 0,
  generatingMessage: '',
}

function canTransition(from: MLStep, to: MLStep): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

function mlReducer(state: MLState, action: MLAction): MLState {
  switch (action.type) {
    case 'SET_PERIOD':
      return { ...state, scope: { ...state.scope, period: action.value } }
    case 'SET_CATEGORY':
      return { ...state, scope: { ...state.scope, category: action.value } }
    case 'TOGGLE_PLATFORM': {
      const p = action.value
      const current = state.scope.platforms
      const next = current.includes(p) ? current.filter((x) => x !== p) : [...current, p]
      return { ...state, scope: { ...state.scope, platforms: next.length > 0 ? next : current } }
    }
    case 'SET_OWN_BRAND':
      return { ...state, scope: { ...state.scope, ownBrand: action.value, competitors: state.scope.competitors.filter((c) => c !== action.value) } }
    case 'TOGGLE_COMPETITOR': {
      const b = action.value
      if (b === state.scope.ownBrand) return state
      const comps = state.scope.competitors
      const next = comps.includes(b) ? comps.filter((c) => c !== b) : [...comps, b]
      return { ...state, scope: { ...state.scope, competitors: next } }
    }
    case 'START_GENERATE':
      if (!canTransition(state.step, 'GENERATING')) return state
      return { ...state, step: 'GENERATING', generatingProgress: 0, generatingMessage: AI_MESSAGES[0] }
    case 'SET_PROGRESS':
      return { ...state, generatingProgress: action.progress, generatingMessage: action.message }
    case 'SET_DASHBOARD':
      if (!canTransition(state.step, 'DASHBOARD')) return state
      return { ...state, step: 'DASHBOARD', dashboardData: action.data, activeMetric: 'content-volume' }
    case 'SET_ACTIVE_METRIC':
      return { ...state, activeMetric: action.value }
    case 'OPEN_DRILLDOWN':
      if (!canTransition(state.step, 'DRILLDOWN')) return state
      return { ...state, step: 'DRILLDOWN', drilldown: action.context, drilldownAnalysis: action.analysis }
    case 'BACK_TO_DASHBOARD':
      if (!canTransition(state.step, 'DASHBOARD')) return state
      return { ...state, step: 'DASHBOARD', drilldown: null, drilldownAnalysis: null }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

// ==================== 유틸 ====================

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

// ==================== ScopeSettingView ====================

function ScopeSettingView({ state, dispatch, onGenerate }: { state: MLState; dispatch: React.Dispatch<MLAction>; onGenerate: () => void }) {
  const { scope } = state
  return (
    <div className="ml-scope">
      <div className="ml-scope__card">
        <Typo variant="$heading-5" className="ml-scope__title" style={{ color: 'var(--semantic-color-text-1)' }}>분석 스코프 설정</Typo>
        <Typo variant="$body-2" className="ml-scope__desc" style={{ color: 'var(--semantic-color-text-4)' }}>분석할 기간, 카테고리, 플랫폼, 브랜드를 선택하여 맞춤형 시장 분석 대시보드를 생성합니다.</Typo>
        <div className="ml-scope__grid">
          <div className="ml-scope__field">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', fontWeight: 600 }}>기간 *</Typo>
            <CoreSelect size="md" placeholderText="기간 선택" setValue={(v: string) => dispatch({ type: 'SET_PERIOD', value: v })}>
              {PERIOD_OPTIONS.map((p) => <CoreSelect.Item key={p.value} value={p.value}>{p.label}</CoreSelect.Item>)}
            </CoreSelect>
          </div>
          <div className="ml-scope__field">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', fontWeight: 600 }}>카테고리 범위 *</Typo>
            <CoreSelect size="md" placeholderText="카테고리 선택" setValue={(v: string) => dispatch({ type: 'SET_CATEGORY', value: v as BeautyCategory })}>
              {CATEGORY_OPTIONS.map((c) => <CoreSelect.Item key={c.value} value={c.value}>{c.label}</CoreSelect.Item>)}
            </CoreSelect>
          </div>
          <div className="ml-scope__field ml-scope__field--full">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', fontWeight: 600 }}>플랫폼</Typo>
            <div className="ml-scope__chips">
              {PLATFORM_OPTIONS.map((p) => (
                <button key={p.value} className={`ml-scope__chip${scope.platforms.includes(p.value) ? ' ml-scope__chip--active' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_PLATFORM', value: p.value })}>{p.label}</button>
              ))}
            </div>
          </div>
          <div className="ml-scope__field">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', fontWeight: 600 }}>자사 브랜드</Typo>
            <CoreSelect size="md" placeholderText="브랜드 선택" setValue={(v: string) => dispatch({ type: 'SET_OWN_BRAND', value: v })}>
              <CoreSelect.Item value="">선택 안 함</CoreSelect.Item>
              {BRAND_OPTIONS.map((b) => <CoreSelect.Item key={b} value={b}>{b}</CoreSelect.Item>)}
            </CoreSelect>
          </div>
          <div className="ml-scope__field">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', fontWeight: 600 }}>비교 브랜드</Typo>
            <div className="ml-scope__chips">
              {BRAND_OPTIONS.filter((b) => b !== scope.ownBrand).slice(0, 10).map((b) => (
                <button key={b} className={`ml-scope__chip${scope.competitors.includes(b) ? ' ml-scope__chip--active' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_COMPETITOR', value: b })}>{b}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="ml-scope__actions">
          <CoreButton buttonType="primary" size="lg" text="대시보드 생성" onClick={onGenerate} />
        </div>
      </div>
    </div>
  )
}

// ==================== GeneratingView ====================

function GeneratingView({ state }: { state: MLState }) {
  return (
    <div className="ml-generating">
      <div className="ml-generating__icon"><IconAiSymbolFilled size={32} color="#fff" /></div>
      <VStack style={{ alignItems: 'center', gap: 8 }}>
        <Typo variant="$heading-5" style={{ color: 'var(--semantic-color-text-1)' }}>시장 분석 대시보드 생성 중</Typo>
        <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)' }}>{state.generatingMessage}</Typo>
      </VStack>
      <div className="ml-generating__progress">
        <div className="ml-generating__bar" style={{ width: `${state.generatingProgress}%` }} />
      </div>
    </div>
  )
}

// ==================== KpiCards ====================

function KpiCards({ data }: { data: DimensionMetricData[] }) {
  const kpi = computeKpiSummary(data)
  const cards = [
    { label: '총 콘텐츠', value: formatNumber(kpi.totalContent), sub: `${kpi.brandCount}개 브랜드` },
    { label: '총 인게이지먼트', value: formatNumber(kpi.totalEngagement), sub: `Top: ${kpi.topBrand}` },
    { label: '총 조회수', value: formatNumber(kpi.totalViews), sub: `콘텐츠당 평균 ${formatNumber(Math.round(kpi.totalViews / (kpi.totalContent || 1)))}` },
  ]
  return (
    <div className="ml-kpi-row">
      {cards.map((c) => (
        <div key={c.label} className="ml-kpi-card">
          <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-4)', fontWeight: 500 }}>{c.label}</Typo>
          <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)', marginTop: 4 }}>{c.value}</Typo>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)', marginTop: 4 }}>{c.sub}</Typo>
        </div>
      ))}
    </div>
  )
}

// ==================== 차원별 시각화: 도넛 (티어별) ====================

function DonutChart({ items }: { items: DimensionMetricData['items'] }) {
  const total = items.reduce((s, i) => s + i.value, 0)
  // Build conic-gradient segments
  let acc = 0
  const stops = items.map((item) => {
    const pct = (item.value / total) * 100
    const start = acc
    acc += pct
    return { ...item, pct, start, end: acc }
  })
  const gradient = stops.map((s) => `${s.color || '#94a3b8'} ${s.start}% ${s.end}%`).join(', ')

  return (
    <div className="ml-donut">
      <div className="ml-donut__ring" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="ml-donut__hole">
          <Typo variant="$heading-5" style={{ color: 'var(--semantic-color-text-1)' }}>{formatNumber(total)}</Typo>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>합계</Typo>
        </div>
      </div>
      <div className="ml-donut__legend">
        {items.map((item) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
          return (
            <div key={item.label} className="ml-donut__legend-row">
              <div className="ml-donut__legend-dot" style={{ background: item.color || '#94a3b8' }} />
              <span className="ml-donut__legend-label">{item.label}</span>
              <span className="ml-donut__legend-val">{formatNumber(item.value)}</span>
              <span className="ml-donut__legend-pct">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== 차원별 시각화: 트리맵 (서브카테고리별) ====================

const TREEMAP_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#60a5fa', '#34d399',
  '#14b8a6', '#f59e0b', '#ec4899', '#f97316', '#06b6d4',
  '#84cc16', '#ef4444', '#2dd4bf', '#fb923c', '#c084fc',
  '#facc15', '#4ade80', '#f472b6', '#64748b', '#38bdf8',
]

function TreeMap({ items }: { items: DimensionMetricData['items'] }) {
  const total = items.reduce((s, i) => s + i.value, 0)
  // Squarified-ish layout: just use flex-basis proportional to value
  return (
    <div className="ml-treemap">
      {items.map((item, idx) => {
        const pct = total > 0 ? (item.value / total) * 100 : 0
        // Min width to keep labels readable
        const basis = Math.max(pct, 4)
        return (
          <div
            key={item.label}
            className="ml-treemap__cell"
            style={{
              flexBasis: `${basis}%`,
              flexGrow: basis,
              background: TREEMAP_COLORS[idx % TREEMAP_COLORS.length],
              minHeight: pct > 8 ? 80 : 50,
            }}
            title={`${item.label}: ${formatNumber(item.value)} (${pct.toFixed(1)}%)`}
          >
            {pct > 5 && <span className="ml-treemap__cell-label">{item.label}</span>}
            {pct > 8 && <span className="ml-treemap__cell-val">{formatNumber(item.value)}</span>}
          </div>
        )
      })}
    </div>
  )
}

// ==================== 차원별 시각화: 스택 바 (프로모션 의도별) ====================

function StackBar({ items }: { items: DimensionMetricData['items'] }) {
  const total = items.reduce((s, i) => s + i.value, 0)
  return (
    <div className="ml-stack">
      <div className="ml-stack__bar-wrap">
        {items.map((item) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div
              key={item.label}
              className="ml-stack__segment"
              style={{ width: `${pct}%`, background: item.color || '#94a3b8' }}
              title={`${item.label}: ${formatNumber(item.value)} (${pct.toFixed(1)}%)`}
            >
              {pct > 8 && <span className="ml-stack__segment-text">{pct.toFixed(0)}%</span>}
            </div>
          )
        })}
      </div>
      <div className="ml-stack__legend">
        {items.map((item) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
          return (
            <div key={item.label} className="ml-stack__legend-item">
              <div className="ml-stack__legend-dot" style={{ background: item.color || '#94a3b8' }} />
              {item.label}
              <span className="ml-stack__legend-val">{formatNumber(item.value)}</span>
              <span style={{ color: 'var(--semantic-color-text-5)' }}>({pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== 차원별 시각화: 미니 버블맵 (브랜드별) ====================

function MiniBubbleMap({ items, bubbleData }: { items: DimensionMetricData['items']; bubbleData: ScatterPoint[] }) {
  return (
    <div>
      <div className="ml-mini-scatter">
        <span className="ml-mini-scatter__axis ml-mini-scatter__axis--x">콘텐츠 발행량 →</span>
        <span className="ml-mini-scatter__axis ml-mini-scatter__axis--y">인게이지먼트 →</span>
        <div className="ml-mini-scatter__mid-h" />
        <div className="ml-mini-scatter__mid-v" />
        {bubbleData.map((pt) => (
          <div
            key={pt.label}
            className={`ml-mini-scatter__dot${pt.isOwnBrand ? ' ml-mini-scatter__dot--own' : ''}`}
            style={{ left: `${pt.x}%`, bottom: `${pt.y}%`, width: pt.size, height: pt.size, background: pt.color }}
            title={pt.label}
          >
            <span className="ml-mini-scatter__dot-label">{pt.label}</span>
          </div>
        ))}
      </div>
      <div className="ml-scatter__legend" style={{ marginTop: 12 }}>
        {items.slice(0, 6).map((item, i) => (
          <div key={item.label} className="ml-scatter__legend-item">
            <div className="ml-scatter__legend-dot" style={{ background: bubbleData[i]?.color || '#94a3b8' }} />
            {item.label} ({formatNumber(item.value)})
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 차원별 시각화: 바 차트 (카테고리별 — 기존) ====================

function BarChartViz({ items, maxValue, expanded, onToggle, totalCount }: {
  items: DimensionMetricData['items']; maxValue: number; expanded: boolean; onToggle: () => void; totalCount: number
}) {
  const displayItems = expanded ? items : items.slice(0, 10)
  return (
    <>
      <div className="ml-dim-card__chart">
        {displayItems.map((item, idx) => (
          <div key={item.label} className={`ml-bar-chart__row${item.highlight ? ' ml-bar-chart__row--highlight' : ''}${idx === 0 ? ' ml-bar-chart__row--top' : ''}`}>
            <span className="ml-bar-chart__rank">{idx + 1}</span>
            <span className="ml-bar-chart__label" title={item.label}>{item.label}</span>
            <div className="ml-bar-chart__track">
              <div className="ml-bar-chart__fill" style={{ width: `${(item.value / maxValue) * 100}%`, background: idx === 0 ? 'var(--global-colors-primary-60)' : (item.color || '#cbd5e1') }} />
            </div>
            <span className="ml-bar-chart__value">{formatNumber(item.value)}</span>
          </div>
        ))}
      </div>
      {totalCount > 10 && (
        <button className="ml-dim-card__toggle" onClick={onToggle}>
          {expanded ? '접기' : `+${totalCount - 10}개 더보기`}
        </button>
      )}
    </>
  )
}

// ==================== DimensionCard (차원별 다른 시각화 + AI Insight) ====================

function DimensionCard({ dim, cell, insight, onDrilldown, bubbleData }: {
  dim: Dimension; cell: DimensionMetricData; insight: string; onDrilldown: (dim: Dimension) => void; bubbleData: ScatterPoint[]
}) {
  const [expanded, setExpanded] = useState(false)

  const renderViz = () => {
    switch (dim) {
      case 'influencer-tier':
        return <DonutChart items={cell.items} />
      case 'top-category':
        return <BarChartViz items={cell.items} maxValue={cell.maxValue} expanded={expanded} onToggle={() => setExpanded(!expanded)} totalCount={cell.items.length} />
      case 'sub-category':
        return <TreeMap items={cell.items} />
      case 'promotion-intent':
        return <StackBar items={cell.items} />
      case 'brand':
        return <MiniBubbleMap items={cell.items} bubbleData={bubbleData} />
    }
  }

  return (
    <div className="ml-dim-card">
      <div className="ml-dim-card__header">
        <div>
          <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{DIMENSION_LABELS[dim]}</Typo>
          {cell.items[0] && (
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', marginTop: 2 }}>1위: {cell.items[0].label} ({formatNumber(cell.items[0].value)})</Typo>
          )}
        </div>
        <CoreButton buttonType="tertiary" size="sm" text="심층 분석" onClick={() => onDrilldown(dim)} />
      </div>
      {insight && (
        <div className="ml-dim-card__insight">
          <Typo variant="$caption-1" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600, marginBottom: 4 }}>AI 인사이트</Typo>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-2)' }}>{insight}</Typo>
        </div>
      )}
      {renderViz()}
    </div>
  )
}

// ==================== DashboardView ====================

function DashboardView({ state, dispatch, onReset }: { state: MLState; dispatch: React.Dispatch<MLAction>; onReset: () => void }) {
  const { scope, dashboardData, activeMetric } = state
  const bubbleData = useMemo(() => generateOverviewBubble(scope), [scope])

  const handleDrilldown = useCallback((dim: Dimension) => {
    const ctx: DrilldownContext = { dimension: dim, dimensionLabel: DIMENSION_LABELS[dim] }
    const analysis = generateDrilldownAnalysis(scope)
    dispatch({ type: 'OPEN_DRILLDOWN', context: ctx, analysis })
  }, [scope, dispatch])

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === scope.period)?.label || scope.period
  const categoryLabel = CATEGORY_OPTIONS.find((c) => c.value === scope.category)?.label || scope.category

  return (
    <div>
      <div className="ml-dashboard__header">
        <div className="ml-dashboard__scope-tags">
          <CoreTag tagType="primary" size="sm" text={periodLabel} />
          <CoreTag tagType="blue" size="sm" text={categoryLabel} />
          {scope.platforms.map((p) => <CoreTag key={p} tagType="gray" size="sm" text={p} />)}
          {scope.ownBrand && <CoreTag tagType="teal" size="sm" text={`자사: ${scope.ownBrand}`} />}
        </div>
        <div className="ml-dashboard__actions">
          <CoreButton buttonType="secondary" size="sm" text="스코프 변경" onClick={onReset} />
        </div>
      </div>

      <KpiCards data={dashboardData} />

      <div className="ml-metric-tabs">
        {METRICS_ORDER.map((met) => (
          <button key={met} className={`ml-metric-tab${activeMetric === met ? ' ml-metric-tab--active' : ''}`} onClick={() => dispatch({ type: 'SET_ACTIVE_METRIC', value: met })}>{METRIC_LABELS[met]}</button>
        ))}
      </div>

      <div className="ml-dim-list">
        {DIMENSIONS_ORDER.map((dim) => {
          const cell = dashboardData.find((d) => d.dimension === dim && d.metric === activeMetric)
          if (!cell) return null
          const insight = generateDimensionInsight(dim, dashboardData)
          return <DimensionCard key={dim} dim={dim} cell={cell} insight={insight} onDrilldown={handleDrilldown} bubbleData={bubbleData} />
        })}
      </div>
    </div>
  )
}

// ==================== 심층 분석 패널: Gap 맵 ====================

function GapScatterPanel({ data }: { data: ScatterPoint[] }) {
  return (
    <div className="ml-analysis-panel">
      <Typo variant="$body-1" className="ml-analysis-panel__title" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>볼륨 vs 퍼포먼스 Gap 포지셔닝</Typo>
      <Typo variant="$body-2" className="ml-analysis-panel__desc" style={{ color: 'var(--semantic-color-text-4)' }}>X축: 콘텐츠 발행량 (볼륨), Y축: 인게이지먼트 성과. 대각선 위는 효율 우위, 아래는 볼륨 대비 성과 부족.</Typo>
      <div className="ml-scatter">
        <span className="ml-scatter__axis-x">콘텐츠 발행량 (볼륨) →</span>
        <span className="ml-scatter__axis-y">인게이지먼트 (성과) →</span>
        <div className="ml-scatter__gridline ml-scatter__gridline--h" style={{ top: '50%' }} />
        <div className="ml-scatter__gridline ml-scatter__gridline--v" style={{ left: '50%' }} />
        <span className="ml-scatter__quadrant-label" style={{ top: 12, left: 12 }}>저볼륨 / 고성과</span>
        <span className="ml-scatter__quadrant-label" style={{ top: 12, right: 12 }}>고볼륨 / 고성과</span>
        <span className="ml-scatter__quadrant-label" style={{ bottom: 28, left: 12 }}>저볼륨 / 저성과</span>
        <span className="ml-scatter__quadrant-label" style={{ bottom: 28, right: 12 }}>고볼륨 / 저성과</span>
        {data.map((pt) => (
          <div key={pt.label} className={`ml-scatter__dot${pt.isOwnBrand ? ' ml-scatter__dot--own' : ''}`} style={{ left: `${pt.x}%`, bottom: `${pt.y}%`, width: pt.size, height: pt.size, background: pt.color }} title={pt.label}>
            <span className="ml-scatter__dot-label">{pt.label}</span>
          </div>
        ))}
      </div>
      <div className="ml-scatter__legend">
        {data.slice(0, 8).map((pt) => (
          <div key={pt.label} className="ml-scatter__legend-item">
            <div className="ml-scatter__legend-dot" style={{ background: pt.color }} />
            {pt.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 심층 분석 패널: 효율 비교 ====================

function EfficiencyPanel({ data }: { data: EfficiencyRow[] }) {
  const sorted = [...data].sort((a, b) => b.avgER - a.avgER)
  return (
    <div className="ml-analysis-panel">
      <Typo variant="$body-1" className="ml-analysis-panel__title" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>비용/단위 효율 비교</Typo>
      <Typo variant="$body-2" className="ml-analysis-panel__desc" style={{ color: 'var(--semantic-color-text-4)' }}>브랜드별 평균 ER, 평균 조회수, Engagement/Follower, Views/Follower 효율을 비교합니다.</Typo>
      <div style={{ overflowX: 'auto' }}>
        <table className="ml-eff-table">
          <thead>
            <tr>
              <th>브랜드</th>
              <th>평균 ER (%)</th>
              <th>평균 조회수</th>
              <th>Eng/Follower</th>
              <th>Views/Follower</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.label} className={row.isOwnBrand ? 'ml-eff-table__own' : ''}>
                <td>{row.label}</td>
                <td>{row.avgER.toFixed(2)}</td>
                <td>{formatNumber(row.avgViews)}</td>
                <td>{row.engPerFollower.toFixed(3)}</td>
                <td>{row.viewsPerFollower.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== 심층 분석 패널: 시계열 점유율 ====================

function TimeSeriesPanel({ data }: { data: TimeSeriesPoint[] }) {
  const maxShare = Math.max(...data.flatMap((m) => m.items.map((i) => i.share)), 1)
  return (
    <div className="ml-analysis-panel">
      <Typo variant="$body-1" className="ml-analysis-panel__title" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>월별 점유율 추이</Typo>
      <Typo variant="$body-2" className="ml-analysis-panel__desc" style={{ color: 'var(--semantic-color-text-4)' }}>주요 브랜드의 월별 콘텐츠/인게이지먼트 점유율(share%) 변화를 추적합니다.</Typo>
      <div className="ml-timeseries">
        {data.map((month) => (
          <div key={month.month} className="ml-timeseries__month">
            <div className="ml-timeseries__bars">
              {month.items.map((item) => (
                <div
                  key={item.label}
                  className="ml-timeseries__bar"
                  style={{ height: `${(item.share / maxShare) * 100}%`, background: item.color }}
                  data-tooltip={`${item.label}: ${item.share}%`}
                />
              ))}
            </div>
            <span className="ml-timeseries__label">{month.month}</span>
          </div>
        ))}
      </div>
      {data[0] && (
        <div className="ml-scatter__legend" style={{ marginTop: 16 }}>
          {data[0].items.map((item) => (
            <div key={item.label} className="ml-scatter__legend-item">
              <div className="ml-scatter__legend-dot" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== 심층 분석 패널: 포지셔닝 맵 ====================

function PositioningPanel({ data }: { data: ScatterPoint[] }) {
  return (
    <div className="ml-analysis-panel">
      <Typo variant="$body-1" className="ml-analysis-panel__title" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>브랜드 포지셔닝 맵</Typo>
      <Typo variant="$body-2" className="ml-analysis-panel__desc" style={{ color: 'var(--semantic-color-text-4)' }}>X축: 평균 팔로워 규모, Y축: 콘텐츠 발행량, 버블 크기: SOI(Share of Influence). AD 기반 vs Organic 기반 브랜드 포지셔닝을 비교합니다.</Typo>
      <div className="ml-scatter">
        <span className="ml-scatter__axis-x">평균 팔로워 규모 →</span>
        <span className="ml-scatter__axis-y">콘텐츠 발행량 →</span>
        <div className="ml-scatter__gridline ml-scatter__gridline--h" style={{ top: '50%' }} />
        <div className="ml-scatter__gridline ml-scatter__gridline--v" style={{ left: '50%' }} />
        <span className="ml-scatter__quadrant-label" style={{ top: 12, left: 12 }}>소규모 / 다발행</span>
        <span className="ml-scatter__quadrant-label" style={{ top: 12, right: 12 }}>대규모 / 다발행</span>
        <span className="ml-scatter__quadrant-label" style={{ bottom: 28, left: 12 }}>소규모 / 소발행</span>
        <span className="ml-scatter__quadrant-label" style={{ bottom: 28, right: 12 }}>대규모 / 소발행</span>
        {data.map((pt) => (
          <div key={pt.label} className={`ml-scatter__dot${pt.isOwnBrand ? ' ml-scatter__dot--own' : ''}`} style={{ left: `${pt.x}%`, bottom: `${pt.y}%`, width: pt.size, height: pt.size, background: pt.color }} title={`${pt.label} (SOI: ${pt.size})`}>
            <span className="ml-scatter__dot-label">{pt.label}</span>
          </div>
        ))}
      </div>
      <div className="ml-scatter__legend">
        {data.slice(0, 8).map((pt) => (
          <div key={pt.label} className="ml-scatter__legend-item">
            <div className="ml-scatter__legend-dot" style={{ background: pt.color }} />
            {pt.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 심층 분석 패널: 키워드 비교 ====================

function KeywordPanel({ data }: { data: KeywordItem[] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.organicShare, d.adShare]), 1)
  return (
    <div className="ml-analysis-panel">
      <Typo variant="$body-1" className="ml-analysis-panel__title" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>키워드 비교 분석 (Organic vs AD)</Typo>
      <Typo variant="$body-2" className="ml-analysis-panel__desc" style={{ color: 'var(--semantic-color-text-4)' }}>키워드별 Organic / Sponsored(AD) 콘텐츠의 Engagement Share와 Content Share를 비교합니다.</Typo>
      <div className="ml-keyword-legend">
        <div className="ml-keyword-legend__item"><div className="ml-keyword-legend__dot" style={{ background: '#10b981' }} />Organic</div>
        <div className="ml-keyword-legend__item"><div className="ml-keyword-legend__dot" style={{ background: '#6366f1' }} />Sponsored (AD)</div>
      </div>
      {data.map((kw) => (
        <div key={kw.keyword} className="ml-keyword-row">
          <span className="ml-keyword-row__label">{kw.keyword}</span>
          <div className="ml-keyword-row__bars">
            <div className="ml-keyword-row__bar ml-keyword-row__bar--organic" style={{ width: `${(kw.organicShare / maxVal) * 100}%` }} />
            <div className="ml-keyword-row__bar ml-keyword-row__bar--ad" style={{ width: `${(kw.adShare / maxVal) * 100}%` }} />
          </div>
          <span className="ml-keyword-row__val">O:{kw.organicShare.toFixed(1)}% / A:{kw.adShare.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

// ==================== 심층 분석 패널: 원인 귀속 ====================

function AttributionPanel({ data }: { data: AttributionEvent[] }) {
  return (
    <div className="ml-analysis-panel">
      <Typo variant="$body-1" className="ml-analysis-panel__title" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>점유율 급변 원인 귀속</Typo>
      <Typo variant="$body-2" className="ml-analysis-panel__desc" style={{ color: 'var(--semantic-color-text-4)' }}>점유율이 급변한 시점의 원인 콘텐츠/콜라보를 자동 식별합니다.</Typo>
      <div className="ml-attribution-list">
        {data.map((evt, i) => (
          <div key={i} className="ml-attribution-card">
            <div className="ml-attribution-card__delta ml-attribution-card__delta--up">
              <Typo variant="$heading-5" style={{ color: '#059669' }}>+{evt.delta}%</Typo>
              <Typo variant="$caption-2" style={{ color: '#059669' }}>SOI</Typo>
            </div>
            <div className="ml-attribution-card__body">
              <div className="ml-attribution-card__meta">
                <CoreTag tagType="primary" size="xs" text={evt.brand} />
                <CoreTag tagType="gray" size="xs" text={evt.month} />
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{evt.shareBefore}% → {evt.shareAfter}%</Typo>
              </div>
              <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 500, marginBottom: 4 }}>{evt.cause}</Typo>
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-4)' }}>{evt.content}</Typo>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== DrilldownView (6개 탭) ====================

function DrilldownView({ state, dispatch }: { state: MLState; dispatch: React.Dispatch<MLAction> }) {
  const { drilldown, drilldownAnalysis } = state
  const [activeTab, setActiveTab] = useState<DrilldownTab>('gap')

  if (!drilldown || !drilldownAnalysis) return null

  return (
    <div>
      <div className="ml-drilldown__header">
        <CoreButton buttonType="tertiary" size="sm" text="← 대시보드로 돌아가기" onClick={() => dispatch({ type: 'BACK_TO_DASHBOARD' })} />
        <Typo variant="$heading-5" style={{ color: 'var(--semantic-color-text-1)' }}>{drilldown.dimensionLabel} 심층 분석</Typo>
      </div>

      <div className="ml-pattern-tabs">
        {DRILLDOWN_TABS.map((tab) => (
          <button key={tab.key} className={`ml-pattern-tab${activeTab === tab.key ? ' ml-pattern-tab--active' : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'gap' && <GapScatterPanel data={drilldownAnalysis.scatterData} />}
      {activeTab === 'efficiency' && <EfficiencyPanel data={drilldownAnalysis.efficiencyData} />}
      {activeTab === 'timeseries' && <TimeSeriesPanel data={drilldownAnalysis.timeSeriesData} />}
      {activeTab === 'positioning' && <PositioningPanel data={drilldownAnalysis.positioningData} />}
      {activeTab === 'keyword' && <KeywordPanel data={drilldownAnalysis.keywordData} />}
      {activeTab === 'attribution' && <AttributionPanel data={drilldownAnalysis.attributionData} />}
    </div>
  )
}

// ==================== 메인 컴포넌트 ====================

export default function MarketLandscape() {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(mlReducer, initialState)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout) }
  }, [])

  const handleGenerate = useCallback(() => {
    dispatch({ type: 'START_GENERATE' })
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    AI_MESSAGES.forEach((msg, i) => {
      const timer = setTimeout(() => {
        const progress = Math.round(((i + 1) / AI_MESSAGES.length) * 100)
        dispatch({ type: 'SET_PROGRESS', progress, message: msg })
        if (i === AI_MESSAGES.length - 1) {
          const finishTimer = setTimeout(() => {
            const data = generateDashboardData(state.scope)
            dispatch({ type: 'SET_DASHBOARD', data })
          }, 400)
          timersRef.current.push(finishTimer)
        }
      }, 600 * (i + 1))
      timersRef.current.push(timer)
    })
  }, [state.scope])

  const handleReset = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <div className="ml-page">
      <div className="ml-topbar">
        <button className="ml-topbar__back" onClick={() => navigate('/ai-playground')}>
          <IconChevronLeftOutline size={16} />
          <span>AI 실험실</span>
        </button>
        <Typo variant="$body-1" style={{ fontWeight: 600, color: 'var(--semantic-color-text-1)' }}>마켓 랜드스케이프</Typo>
      </div>

      <div className="ml-content">
        {state.step === 'SCOPE_SETTING' && <ScopeSettingView state={state} dispatch={dispatch} onGenerate={handleGenerate} />}
        {state.step === 'GENERATING' && <GeneratingView state={state} />}
        {state.step === 'DASHBOARD' && <DashboardView state={state} dispatch={dispatch} onReset={handleReset} />}
        {state.step === 'DRILLDOWN' && <DrilldownView state={state} dispatch={dispatch} />}
      </div>
    </div>
  )
}
