// ==================== 유니온 타입 ====================

export type MLStep = 'SCOPE_SETTING' | 'GENERATING' | 'DASHBOARD' | 'DRILLDOWN'

export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'x'

export type BeautyCategory =
  | 'all' | 'skincare' | 'makeup' | 'hair' | 'body' | 'cleansing'
  | 'fragrance' | 'beauty-device' | 'suncare' | 'beauty-tools'
  | 'medical' | 'lenses' | 'nails' | 'men' | 'hair-services'

export type Dimension =
  | 'influencer-tier' | 'top-category' | 'sub-category'
  | 'promotion-intent' | 'brand'

export type Metric = 'content-volume' | 'total-engagement' | 'total-views'

export type InfluencerTier = 'Nano' | 'Micro' | 'Mid' | 'Macro' | 'Mega' | 'VIP'

export type PromotionIntent =
  | 'Organic' | 'Sponsored' | 'Gifted' | 'Affiliate'
  | 'GroupPurchase' | 'Ambassador' | 'Supporter'

export type DrilldownTab = 'gap' | 'efficiency' | 'timeseries' | 'positioning' | 'keyword' | 'attribution'

// ==================== 스코프 설정 ====================

export interface ScopeConfig {
  period: string
  category: BeautyCategory
  platforms: Platform[]
  ownBrand: string
  competitors: string[]
}

// ==================== 차트 데이터 ====================

export interface BarChartItem {
  label: string
  value: number
  color?: string
  highlight?: boolean
}

export interface DimensionMetricData {
  dimension: Dimension
  dimensionLabel: string
  metric: Metric
  metricLabel: string
  items: BarChartItem[]
  maxValue: number
}

// ==================== 드릴다운 ====================

export interface DrilldownContext {
  dimension: Dimension
  dimensionLabel: string
  selectedLabel?: string
}

export interface BrandComparisonRow {
  rank: number
  brand: string
  contentVolume: number
  totalEngagement: number
  totalViews: number
  avgER: number
  avgViews: number
  sharePercent: number
  isOwnBrand: boolean
  volumeRank: number
  performanceRank: number
  hasGap: boolean
}

// ==================== 심층 분석 데이터 ====================

export interface ScatterPoint {
  label: string
  x: number // 발행량 순위 (또는 평균 팔로워)
  y: number // 인게이지먼트 순위 (또는 콘텐츠량)
  size: number // 버블 크기 (SOI)
  color: string
  isOwnBrand: boolean
}

export interface EfficiencyRow {
  label: string
  avgER: number
  avgViews: number
  engPerFollower: number
  viewsPerFollower: number
  color: string
  isOwnBrand: boolean
}

export interface TimeSeriesPoint {
  month: string
  items: { label: string; share: number; color: string }[]
}

export interface KeywordItem {
  keyword: string
  organicShare: number
  adShare: number
  engagementShare: number
  contentShare: number
}

export interface AttributionEvent {
  brand: string
  month: string
  shareBefore: number
  shareAfter: number
  delta: number
  cause: string
  content: string
}

export interface DrilldownAnalysis {
  brandComparison: BrandComparisonRow[]
  scatterData: ScatterPoint[]
  efficiencyData: EfficiencyRow[]
  timeSeriesData: TimeSeriesPoint[]
  positioningData: ScatterPoint[]
  keywordData: KeywordItem[]
  attributionData: AttributionEvent[]
}

// ==================== 상태 관리 ====================

export interface MLState {
  step: MLStep
  scope: ScopeConfig
  dashboardData: DimensionMetricData[]
  activeMetric: Metric
  drilldown: DrilldownContext | null
  drilldownAnalysis: DrilldownAnalysis | null
  generatingProgress: number
  generatingMessage: string
}

export type MLAction =
  | { type: 'SET_PERIOD'; value: string }
  | { type: 'SET_CATEGORY'; value: BeautyCategory }
  | { type: 'TOGGLE_PLATFORM'; value: Platform }
  | { type: 'SET_OWN_BRAND'; value: string }
  | { type: 'TOGGLE_COMPETITOR'; value: string }
  | { type: 'START_GENERATE' }
  | { type: 'SET_PROGRESS'; progress: number; message: string }
  | { type: 'SET_DASHBOARD'; data: DimensionMetricData[] }
  | { type: 'SET_ACTIVE_METRIC'; value: Metric }
  | { type: 'OPEN_DRILLDOWN'; context: DrilldownContext; analysis: DrilldownAnalysis }
  | { type: 'BACK_TO_DASHBOARD' }
  | { type: 'RESET' }
