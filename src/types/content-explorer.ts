import type { ContentType } from './ad'

// ─── 공통 ───
export type Platform = 'instagram' | 'youtube' | 'tiktok'
export type ContentFormat = ContentType
export type ExplorerTab = 'creator-discovery' | 'trend-scanning' | 'performance-pattern'

// ─── 검색 쿼리 ───
export interface ExplorerQuery {
  text: string
  category: string | null
  platform: Platform | null
}

// ─── AI 응답 시뮬레이션 ───
export interface AiResponseStep {
  message: string
  delayMs: number
}

export interface TimeSavingMetric {
  manualHours: number
  manualMinutes: number
  aiSeconds: number
  description: string
}

// ─── 근거 콘텐츠 ───
export interface ProofContent {
  id: string
  contentType: ContentFormat
  caption: string
  metrics: {
    likes: number
    comments: number
    saves: number
    engagementRate: number
  }
  matchReason: string
}

// ─── 크리에이터 발굴 결과 ───
export interface CreatorDiscoveryResult {
  influencerId: number
  name: string
  handle: string
  platform: Platform
  followerCount: string
  er: string
  categories: string[]
  brandFitScore: number
  matchReasons: string[]
  proofContents: ProofContent[]
  estimatedPrice: string
}

// ─── 트렌드 스캐닝 결과 ───
export interface TrendCard {
  id: string
  hashtag: string
  topic: string
  dominantFormat: ContentFormat
  formatPercentage: number
  hookExample: string
  avgEngagementRate: number
  contentCount: number
  growthRate: number
  topCreators: string[]
}

// ─── 성과 패턴 학습 결과 ───
export interface PerformancePattern {
  id: string
  insight: string
  dataPoint: string
}

export interface FormatPerformance {
  format: ContentFormat
  avgEngagementRate: number
  sampleSize: number
}

export interface PerformancePatternResult {
  patterns: PerformancePattern[]
  formatComparison: FormatPerformance[]
  optimalDuration: string
  topHookStyle: string
}
