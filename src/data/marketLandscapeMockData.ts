import type {
  ScopeConfig,
  BeautyCategory,
  Dimension,
  Metric,
  DimensionMetricData,
  BarChartItem,
  BrandComparisonRow,
  InfluencerTier,
  PromotionIntent,
  ScatterPoint,
  EfficiencyRow,
  TimeSeriesPoint,
  KeywordItem,
  AttributionEvent,
  DrilldownAnalysis,
} from '../types/marketLandscape'

// ==================== 옵션 데이터 ====================

export const PERIOD_OPTIONS = [
  { value: '2026-1Q', label: '2026 1Q' },
  { value: '2025-4Q', label: '2025 4Q' },
  { value: '2025-3Q', label: '2025 3Q' },
  { value: '2025-2Q', label: '2025 2Q' },
  { value: '2025-1Q', label: '2025 1Q' },
]

export const CATEGORY_OPTIONS: { value: BeautyCategory; label: string }[] = [
  { value: 'all', label: 'Beauty 전체' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'hair', label: 'Hair' },
  { value: 'body', label: 'Body' },
  { value: 'cleansing', label: 'Cleansing' },
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'beauty-device', label: 'Beauty Device' },
  { value: 'suncare', label: 'Suncare' },
  { value: 'beauty-tools', label: 'Beauty Tools' },
  { value: 'medical', label: 'Medical' },
  { value: 'lenses', label: 'Lenses' },
  { value: 'nails', label: 'Nails' },
  { value: 'men', label: 'Men' },
  { value: 'hair-services', label: 'Hair (Services)' },
]

export const PLATFORM_OPTIONS = [
  { value: 'instagram' as const, label: 'Instagram' },
  { value: 'youtube' as const, label: 'YouTube' },
  { value: 'tiktok' as const, label: 'TikTok' },
  { value: 'x' as const, label: 'X' },
]

export const BRAND_OPTIONS = [
  'Innisfree', 'Laneige', 'Sulwhasoo', 'Hera', 'Etude',
  'Missha', 'Clio', 'Peripera', 'Rom&nd', "d'Alba",
  'Anua', 'Torriden', 'Medicube', 'VT', 'Cosrx',
  'Banila Co', 'Espoir', 'Amuse', 'Numbuzin', 'Skin1004',
  'TIRTIR', 'Beauty of Joseon', 'Roundlab', 'Mary&May', 'Isntree',
]

export const INFLUENCER_TIERS: { key: InfluencerTier; label: string; range: string }[] = [
  { key: 'VIP', label: 'VIP', range: '5M+' },
  { key: 'Mega', label: 'Mega', range: '1M–5M' },
  { key: 'Macro', label: 'Macro', range: '250K–1M' },
  { key: 'Mid', label: 'Mid', range: '50K–250K' },
  { key: 'Micro', label: 'Micro', range: '10K–50K' },
  { key: 'Nano', label: 'Nano', range: '1K–10K' },
]

export const PROMOTION_INTENTS: { key: PromotionIntent; label: string }[] = [
  { key: 'Organic', label: 'Organic' },
  { key: 'Sponsored', label: 'Sponsored (AD)' },
  { key: 'Gifted', label: 'Gifted' },
  { key: 'Affiliate', label: 'Affiliate' },
  { key: 'GroupPurchase', label: 'Group Purchase' },
  { key: 'Ambassador', label: 'Ambassador' },
  { key: 'Supporter', label: 'Supporter' },
]

export const SUB_CATEGORIES: Record<string, string[]> = {
  skincare: ['Toner', 'Essence', 'Serum', 'Ampoule', 'Cream', 'Lotion', 'Mask Pack', 'Eye Cream', 'Mist', 'Sleeping Pack'],
  makeup: ['Base', 'Foundation', 'Concealer', 'Powder', 'Lip Tint', 'Lipstick', 'Lip Gloss', 'Eyeshadow', 'Mascara', 'Eyeliner', 'Blush', 'Highlighter', 'Brow'],
  hair: ['Shampoo', 'Conditioner', 'Hair Serum', 'Hair Oil', 'Scalp Care', 'Hair Mask', 'Dry Shampoo'],
  body: ['Body Lotion', 'Body Cream', 'Body Wash', 'Body Oil', 'Hand Cream', 'Body Scrub'],
  cleansing: ['Cleansing Foam', 'Cleansing Oil', 'Cleansing Water', 'Cleansing Balm', 'Peeling Gel'],
  fragrance: ['EDP', 'EDT', 'EDC', 'Body Mist', 'Perfume Oil', 'Solid Perfume'],
  suncare: ['Sunscreen', 'Sun Stick', 'Tone-up Sun', 'Sun Cushion', 'Sun Spray'],
}

// ==================== 시드 기반 난수 ====================

function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  }
  return () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff
    return h / 0x7fffffff
  }
}

// ==================== 차원 / 지표 레이블 ====================

export const DIMENSION_LABELS: Record<Dimension, string> = {
  'influencer-tier': '인플루언서 티어별',
  'top-category': '카테고리별',
  'sub-category': '서브 카테고리별 (Top 20)',
  'promotion-intent': '프로모션 의도별',
  'brand': '브랜드별 (Top 18)',
}

export const METRIC_LABELS: Record<Metric, string> = {
  'content-volume': '콘텐츠 발행량',
  'total-engagement': '인게이지먼트 총합',
  'total-views': '조회수 총합',
}

// ==================== 차트 색상 ====================

const TIER_COLORS: Record<InfluencerTier, string> = {
  VIP: '#6366f1',
  Mega: '#8b5cf6',
  Macro: '#a78bfa',
  Mid: '#60a5fa',
  Micro: '#34d399',
  Nano: '#94a3b8',
}

const INTENT_COLORS: Record<PromotionIntent, string> = {
  Organic: '#10b981',
  Sponsored: '#6366f1',
  Gifted: '#f59e0b',
  Affiliate: '#ec4899',
  GroupPurchase: '#14b8a6',
  Ambassador: '#8b5cf6',
  Supporter: '#64748b',
}

const BRAND_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#f97316', '#14b8a6', '#ef4444', '#84cc16',
  '#a78bfa', '#fb923c', '#2dd4bf', '#f472b6', '#facc15',
  '#60a5fa', '#4ade80', '#c084fc',
]

const DEFAULT_BAR_COLOR = '#94a3b8'
const HIGHLIGHT_COLOR = '#6366f1'

// ==================== 대시보드 데이터 생성 ====================

function generateItemsForDimension(
  dimension: Dimension,
  metric: Metric,
  scope: ScopeConfig,
): BarChartItem[] {
  const rand = seededRandom(`${dimension}-${metric}-${scope.period}-${scope.category}`)

  const scaleByMetric = (base: number): number => {
    if (metric === 'content-volume') return Math.round(base * (500 + rand() * 2000))
    if (metric === 'total-engagement') return Math.round(base * (50000 + rand() * 500000))
    return Math.round(base * (200000 + rand() * 3000000))
  }

  switch (dimension) {
    case 'influencer-tier':
      return INFLUENCER_TIERS.map((tier) => ({
        label: `${tier.label} (${tier.range})`,
        value: scaleByMetric(0.3 + rand() * 0.7),
        color: TIER_COLORS[tier.key],
      }))

    case 'top-category': {
      const cats = CATEGORY_OPTIONS.filter((c) => c.value !== 'all').slice(0, 10)
      return cats
        .map((c) => ({
          label: c.label,
          value: scaleByMetric(0.1 + rand()),
          color: DEFAULT_BAR_COLOR,
        }))
        .sort((a, b) => b.value - a.value)
    }

    case 'sub-category': {
      const catKey = scope.category === 'all' ? 'skincare' : scope.category
      const subs = SUB_CATEGORIES[catKey] || SUB_CATEGORIES.skincare
      const all = [...subs]
      if (all.length < 20) {
        const extra = SUB_CATEGORIES.makeup || []
        all.push(...extra.slice(0, 20 - all.length))
      }
      return all
        .slice(0, 20)
        .map((s) => ({
          label: s,
          value: scaleByMetric(0.05 + rand() * 0.5),
          color: DEFAULT_BAR_COLOR,
        }))
        .sort((a, b) => b.value - a.value)
    }

    case 'promotion-intent':
      return PROMOTION_INTENTS.map((p) => ({
        label: p.label,
        value: scaleByMetric(0.1 + rand()),
        color: INTENT_COLORS[p.key],
      })).sort((a, b) => b.value - a.value)

    case 'brand': {
      const brands = BRAND_OPTIONS.slice(0, 18)
      return brands
        .map((b) => ({
          label: b,
          value: scaleByMetric(0.05 + rand() * 0.4),
          color: b === scope.ownBrand ? HIGHLIGHT_COLOR : DEFAULT_BAR_COLOR,
          highlight: b === scope.ownBrand,
        }))
        .sort((a, b) => b.value - a.value)
    }
  }
}

export function generateDashboardData(scope: ScopeConfig): DimensionMetricData[] {
  const dimensions: Dimension[] = [
    'influencer-tier',
    'top-category',
    'sub-category',
    'promotion-intent',
    'brand',
  ]
  const metrics: Metric[] = ['content-volume', 'total-engagement', 'total-views']
  const result: DimensionMetricData[] = []

  for (const dim of dimensions) {
    for (const met of metrics) {
      const items = generateItemsForDimension(dim, met, scope)
      const maxValue = Math.max(...items.map((i) => i.value), 1)
      result.push({
        dimension: dim,
        dimensionLabel: DIMENSION_LABELS[dim],
        metric: met,
        metricLabel: METRIC_LABELS[met],
        items,
        maxValue,
      })
    }
  }

  return result
}

// ==================== KPI 합산 ====================

export interface KpiSummary {
  totalContent: number
  totalEngagement: number
  totalViews: number
  brandCount: number
  topBrand: string
  topBrandContent: number
}

export function computeKpiSummary(data: DimensionMetricData[]): KpiSummary {
  const brandVolume = data.find((d) => d.dimension === 'brand' && d.metric === 'content-volume')
  const brandEng = data.find((d) => d.dimension === 'brand' && d.metric === 'total-engagement')
  const brandViews = data.find((d) => d.dimension === 'brand' && d.metric === 'total-views')

  const totalContent = brandVolume?.items.reduce((s, i) => s + i.value, 0) ?? 0
  const totalEngagement = brandEng?.items.reduce((s, i) => s + i.value, 0) ?? 0
  const totalViews = brandViews?.items.reduce((s, i) => s + i.value, 0) ?? 0
  const brandCount = brandVolume?.items.length ?? 0
  const top = brandVolume?.items[0]

  return {
    totalContent,
    totalEngagement,
    totalViews,
    brandCount,
    topBrand: top?.label ?? '-',
    topBrandContent: top?.value ?? 0,
  }
}

// ==================== 오버뷰 버블맵 데이터 ====================

export function generateOverviewBubble(scope: ScopeConfig): ScatterPoint[] {
  const rand = seededRandom(`overview-bubble-${scope.period}-${scope.category}`)
  return BRAND_OPTIONS.slice(0, 18).map((brand, i) => ({
    label: brand,
    x: Math.round(8 + rand() * 84),
    y: Math.round(8 + rand() * 84),
    size: Math.round(10 + rand() * 28),
    color: BRAND_COLORS[i % BRAND_COLORS.length],
    isOwnBrand: brand === scope.ownBrand,
  }))
}

// ==================== AI 인사이트 생성 ====================

export function generateDimensionInsight(
  dim: Dimension,
  data: DimensionMetricData[],
): string {
  const volume = data.find((d) => d.dimension === dim && d.metric === 'content-volume')
  const eng = data.find((d) => d.dimension === dim && d.metric === 'total-engagement')
  const views = data.find((d) => d.dimension === dim && d.metric === 'total-views')

  if (!volume || !eng || !views) return ''

  const top1Vol = volume.items[0]
  const top1Eng = eng.items[0]
  const top2Vol = volume.items[1]
  const totalVol = volume.items.reduce((s, i) => s + i.value, 0)
  const top1Share = totalVol > 0 ? Math.round((top1Vol.value / totalVol) * 100) : 0

  switch (dim) {
    case 'influencer-tier':
      if (top1Vol.label !== top1Eng.label) {
        return `발행량은 ${top1Vol.label}이 ${top1Share}%로 가장 많지만, 인게이지먼트는 ${top1Eng.label}이 선두입니다. 발행량과 성과 간 티어별 효율 차이가 뚜렷하며, 비용 대비 성과를 고려한 티어 믹스 전략이 필요합니다.`
      }
      return `${top1Vol.label}이 발행량(${top1Share}%)과 인게이지먼트 모두에서 1위를 차지하고 있습니다. ${top2Vol?.label ?? '2위 티어'}와의 격차가 크며, 상위 티어 집중 현상이 관찰됩니다.`

    case 'top-category':
      if (top1Vol.label !== top1Eng.label) {
        return `${top1Vol.label}이 콘텐츠 발행량 ${top1Share}%로 최대 카테고리이나, 인게이지먼트 기준으로는 ${top1Eng.label}이 앞섭니다. ${top1Eng.label} 카테고리의 콘텐츠 포맷이나 소구 방식이 더 높은 반응을 이끌어내고 있습니다.`
      }
      return `${top1Vol.label}이 발행량(${top1Share}%)과 인게이지먼트 모두에서 시장을 리드하고 있습니다. ${top2Vol?.label ?? '2위'}와의 차이가 ${top1Share > 30 ? '압도적이며' : '점차 좁혀지고 있으며'}, 카테고리 내 세부 전략 점검이 권장됩니다.`

    case 'sub-category':
      return `서브 카테고리 중 ${top1Vol.label}이 발행량 ${top1Share}%로 선두입니다. 상위 5개 서브 카테고리가 전체 볼륨의 과반을 차지하며, 나머지 카테고리는 니치 시장으로서 효율 기반 접근이 유효합니다.`

    case 'promotion-intent': {
      const organicVol = volume.items.find((i) => i.label === 'Organic')
      const sponsoredVol = volume.items.find((i) => i.label.includes('Sponsored'))
      if (organicVol && sponsoredVol) {
        const ratio = totalVol > 0 ? Math.round((organicVol.value / totalVol) * 100) : 0
        return `Organic 콘텐츠가 전체의 ${ratio}%를 차지하며, Sponsored(AD) 콘텐츠 대비 ${organicVol.value > sponsoredVol.value ? '높은' : '낮은'} 비중입니다. 프로모션 의도별 인게이지먼트 효율 차이를 고려하여 광고/오가닉 믹스를 최적화할 필요가 있습니다.`
      }
      return `${top1Vol.label}이 프로모션 의도별 발행량의 ${top1Share}%를 차지합니다. 의도별 인게이지먼트 효율 차이를 분석하여 최적 믹스를 도출할 필요가 있습니다.`
    }

    case 'brand':
      if (top1Vol.label !== top1Eng.label) {
        return `발행량 기준 ${top1Vol.label}이 ${top1Share}%로 1위이나, 인게이지먼트에서는 ${top1Eng.label}이 선두입니다. 브랜드별 볼륨-퍼포먼스 갩이 존재하며, 심층 분석에서 효율 및 포지셔닝을 확인하세요.`
      }
      return `${top1Vol.label}이 발행량과 인게이지먼트 모두 ${top1Share}% 이상의 점유율로 시장을 리드합니다. 상위 3개 브랜드가 전체 볼륨의 상당 부분을 차지하고 있습니다.`
  }
}

// ==================== 심층 분석 데이터 생성 ====================

function generateBrandComparison(scope: ScopeConfig): BrandComparisonRow[] {
  const rand = seededRandom(`drilldown-${scope.period}-${scope.category}`)
  const brands = BRAND_OPTIONS.slice(0, 18)

  const rows: BrandComparisonRow[] = brands.map((brand) => {
    const contentVolume = Math.round(200 + rand() * 3000)
    const totalEngagement = Math.round(contentVolume * (80 + rand() * 400))
    const totalViews = Math.round(contentVolume * (500 + rand() * 5000))
    const avgER = Math.round((1 + rand() * 8) * 100) / 100
    const avgViews = Math.round(totalViews / contentVolume)
    const sharePercent = Math.round((2 + rand() * 15) * 10) / 10

    return {
      rank: 0, brand, contentVolume, totalEngagement, totalViews,
      avgER, avgViews, sharePercent,
      isOwnBrand: brand === scope.ownBrand,
      volumeRank: 0, performanceRank: 0, hasGap: false,
    }
  })

  rows.sort((a, b) => b.contentVolume - a.contentVolume)
  rows.forEach((r, i) => { r.rank = i + 1; r.volumeRank = i + 1 })

  const byPerf = [...rows].sort((a, b) => b.totalEngagement - a.totalEngagement)
  byPerf.forEach((r, i) => { r.performanceRank = i + 1 })

  rows.forEach((r) => { r.hasGap = Math.abs(r.volumeRank - r.performanceRank) >= 5 })

  const totalShare = rows.reduce((s, r) => s + r.sharePercent, 0)
  rows.forEach((r) => { r.sharePercent = Math.round((r.sharePercent / totalShare) * 1000) / 10 })

  return rows
}

function generateScatterData(scope: ScopeConfig): ScatterPoint[] {
  const rand = seededRandom(`scatter-${scope.period}-${scope.category}`)
  return BRAND_OPTIONS.slice(0, 18).map((brand, i) => ({
    label: brand,
    x: Math.round(10 + rand() * 80),
    y: Math.round(10 + rand() * 80),
    size: Math.round(8 + rand() * 30),
    color: BRAND_COLORS[i % BRAND_COLORS.length],
    isOwnBrand: brand === scope.ownBrand,
  }))
}

function generateEfficiencyData(scope: ScopeConfig): EfficiencyRow[] {
  const rand = seededRandom(`efficiency-${scope.period}-${scope.category}`)
  return BRAND_OPTIONS.slice(0, 12).map((brand, i) => ({
    label: brand,
    avgER: Math.round((0.5 + rand() * 9) * 100) / 100,
    avgViews: Math.round(500 + rand() * 50000),
    engPerFollower: Math.round((0.01 + rand() * 0.15) * 1000) / 1000,
    viewsPerFollower: Math.round((0.05 + rand() * 1.5) * 100) / 100,
    color: BRAND_COLORS[i % BRAND_COLORS.length],
    isOwnBrand: brand === scope.ownBrand,
  }))
}

function generateTimeSeriesData(scope: ScopeConfig): TimeSeriesPoint[] {
  const rand = seededRandom(`timeseries-${scope.period}-${scope.category}`)
  const months = ['10월', '11월', '12월']
  const topBrands = BRAND_OPTIONS.slice(0, 6)

  return months.map((month) => ({
    month,
    items: topBrands.map((brand, i) => ({
      label: brand,
      share: Math.round((5 + rand() * 25) * 10) / 10,
      color: BRAND_COLORS[i % BRAND_COLORS.length],
    })),
  }))
}

function generatePositioningData(scope: ScopeConfig): ScatterPoint[] {
  const rand = seededRandom(`positioning-${scope.period}-${scope.category}`)
  return BRAND_OPTIONS.slice(0, 14).map((brand, i) => ({
    label: brand,
    x: Math.round(5 + rand() * 90), // 평균 팔로워
    y: Math.round(5 + rand() * 90), // 콘텐츠량
    size: Math.round(10 + rand() * 28),
    color: BRAND_COLORS[i % BRAND_COLORS.length],
    isOwnBrand: brand === scope.ownBrand,
  }))
}

function generateKeywordData(scope: ScopeConfig): KeywordItem[] {
  const rand = seededRandom(`keyword-${scope.period}-${scope.category}`)
  const keywords = [
    '수분크림', '톤업선크림', '립틴트', '클렌징밤', '세럼', '쿠션팩트',
    '아이크림', '마스크팩', '헤어세럼', '바디로션', '향수', '네일',
  ]
  return keywords.map((kw) => ({
    keyword: kw,
    organicShare: Math.round(rand() * 60 * 10) / 10,
    adShare: Math.round(rand() * 60 * 10) / 10,
    engagementShare: Math.round(rand() * 40 * 10) / 10,
    contentShare: Math.round(rand() * 40 * 10) / 10,
  }))
}

function generateAttributionData(scope: ScopeConfig): AttributionEvent[] {
  const rand = seededRandom(`attribution-${scope.period}-${scope.category}`)
  const events: AttributionEvent[] = [
    {
      brand: BRAND_OPTIONS[Math.floor(rand() * 8)],
      month: '12월',
      shareBefore: Math.round(rand() * 15 * 10) / 10,
      shareAfter: 0, delta: 0,
      cause: 'Mega 인플루언서 콜라보 (팔로워 3.2M)',
      content: '크리스마스 한정판 언박싱 릴스, 조회수 850만 돌파',
    },
    {
      brand: BRAND_OPTIONS[Math.floor(rand() * 8 + 2)],
      month: '11월',
      shareBefore: Math.round(rand() * 10 * 10) / 10,
      shareAfter: 0, delta: 0,
      cause: 'VIP 앰버서더 연간 계약 체결',
      content: '브랜드 필름 시리즈 3편, 총 인게이지먼트 120만+',
    },
    {
      brand: BRAND_OPTIONS[Math.floor(rand() * 8 + 4)],
      month: '12월',
      shareBefore: Math.round(rand() * 12 * 10) / 10,
      shareAfter: 0, delta: 0,
      cause: 'TikTok 바이럴 챌린지 (#글로우업챌린지)',
      content: '사용자 생성 콘텐츠 2,400건 이상, 누적 조회수 4,200만',
    },
    {
      brand: BRAND_OPTIONS[Math.floor(rand() * 8 + 1)],
      month: '10월',
      shareBefore: Math.round(rand() * 18 * 10) / 10,
      shareAfter: 0, delta: 0,
      cause: '신제품 론칭 시딩 캠페인 (Micro 50인)',
      content: 'Serum 카테고리 집중, 평균 ER 8.2%',
    },
    {
      brand: BRAND_OPTIONS[Math.floor(rand() * 8 + 6)],
      month: '11월',
      shareBefore: Math.round(rand() * 8 * 10) / 10,
      shareAfter: 0, delta: 0,
      cause: '블랙프라이데이 공동구매 캠페인',
      content: 'Affiliate 링크 기반, 전환율 4.7%',
    },
  ]
  events.forEach((e) => {
    e.shareAfter = Math.round((e.shareBefore + 3 + rand() * 12) * 10) / 10
    e.delta = Math.round((e.shareAfter - e.shareBefore) * 10) / 10
  })
  return events
}

// ==================== 통합 드릴다운 데이터 ====================

export function generateDrilldownAnalysis(scope: ScopeConfig): DrilldownAnalysis {
  return {
    brandComparison: generateBrandComparison(scope),
    scatterData: generateScatterData(scope),
    efficiencyData: generateEfficiencyData(scope),
    timeSeriesData: generateTimeSeriesData(scope),
    positioningData: generatePositioningData(scope),
    keywordData: generateKeywordData(scope),
    attributionData: generateAttributionData(scope),
  }
}
