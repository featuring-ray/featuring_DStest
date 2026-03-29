// ─── 콘텐츠 타입 ───
export type ContentType = '피드' | '릴스' | '스토리' | '쇼츠' | '영상'

// ─── 광고 계정 ───
export interface AdAccount {
  id: number
  platform: AdPlatform
  accountId: string
  accountName: string
  status: 'connected' | 'disconnected' | 'error'
  connectedAt: string
  lastSyncedAt?: string
}

// ─── 광고 상태/목표/플랫폼/유형 ───
export type AdStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'completed' | 'rejected'
export type AdObjective = 'awareness' | 'traffic' | 'engagement' | 'conversions'
export type AdPlatform = 'meta' | 'google'
export type AdType = 'partnership' | 'standard'

// ─── 광고 성과 지표 ───
export interface AdMetrics {
  impressions: number
  reach: number
  clicks: number
  ctr: number
  spend: number
  cpc: number
  cpm: number
  conversions?: number
  roas?: number
  lastUpdatedAt: string
}

// ─── 광고 ───
export interface Ad {
  id: number
  campaignId: number
  adAccountId: number
  platform: AdPlatform
  adType: AdType
  status: AdStatus
  objective: AdObjective

  // 소재 (인플루언서 콘텐츠 참조)
  sourceContent: {
    influencerUsername: string
    influencerProfileImage?: string
    contentUrl: string
    contentType: ContentType
    thumbnailUrl?: string
    platformMediaId?: string
  }

  // Partnership Ad 전용
  partnershipStatus?: 'pending_approval' | 'approved' | 'rejected'
  partnershipRequestSentAt?: string

  // 타겟팅
  targeting: {
    mode: 'auto' | 'custom'
    locations?: string[]
    ageMin?: number
    ageMax?: number
    gender?: 'all' | 'male' | 'female'
    interests?: string[]
  }

  // 예산
  dailyBudget: number
  totalBudget: number
  startDate: string
  endDate: string

  // 성과 (폴링으로 주기적 업데이트)
  metrics?: AdMetrics

  // 플랫폼 참조
  externalAdId?: string
  externalCampaignId?: string
  reviewMessage?: string

  createdAt: string
  lastModified: string
}

// ─── 콘텐츠 광고 추천 ───
export interface ContentBoostRecommendation {
  contentId: number
  influencerUsername: string
  contentUrl: string
  contentType: ContentType
  thumbnailUrl?: string
  organicMetrics: {
    likes: number
    comments: number
    saves: number
    reach: number
    engagementRate: number
  }
  accountAvgEngagementRate: number
  performanceVsAvg: number
  isRecommended: boolean
}
