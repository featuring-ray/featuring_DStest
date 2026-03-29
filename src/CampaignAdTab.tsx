import './CampaignAdTab.css'
import { Flex, VStack, HStack, Typo, CoreButton, CoreTag, CoreStatusBadge } from '@featuring-corp/components'
import type { Ad, ContentBoostRecommendation, AdPlatform } from './types/ad'
import ContentBoostCard from './ContentBoostCard'

/* ── 상태 매핑 ── */
const PLATFORM_TAG: Record<AdPlatform, { label: string; type: 'blue' | 'red' }> = {
  meta: { label: 'Meta', type: 'blue' },
  google: { label: 'Google', type: 'red' },
}

/* ── Mock: 광고 가능 콘텐츠 추천 ── */
const MOCK_RECOMMENDATIONS: ContentBoostRecommendation[] = [
  {
    contentId: 101,
    influencerUsername: '@beauty_rosie',
    contentUrl: 'https://instagram.com/p/abc123',
    contentType: '릴스',
    organicMetrics: {
      likes: 12400,
      comments: 890,
      saves: 2100,
      reach: 45000,
      engagementRate: 34.2,
    },
    accountAvgEngagementRate: 12.2,
    performanceVsAvg: 280,
    isRecommended: true,
  },
  {
    contentId: 102,
    influencerUsername: '@style_jimin',
    contentUrl: 'https://instagram.com/p/def456',
    contentType: '피드',
    organicMetrics: {
      likes: 5200,
      comments: 340,
      saves: 980,
      reach: 22000,
      engagementRate: 29.5,
    },
    accountAvgEngagementRate: 12.2,
    performanceVsAvg: 142,
    isRecommended: true,
  },
  {
    contentId: 103,
    influencerUsername: '@daily_soyeon',
    contentUrl: 'https://instagram.com/p/ghi789',
    contentType: '릴스',
    organicMetrics: {
      likes: 3800,
      comments: 210,
      saves: 620,
      reach: 18000,
      engagementRate: 25.7,
    },
    accountAvgEngagementRate: 12.2,
    performanceVsAvg: 110,
    isRecommended: false,
  },
  {
    contentId: 104,
    influencerUsername: '@life_minjae',
    contentUrl: 'https://instagram.com/p/jkl012',
    contentType: '피드',
    organicMetrics: {
      likes: 2100,
      comments: 150,
      saves: 340,
      reach: 11000,
      engagementRate: 23.5,
    },
    accountAvgEngagementRate: 12.2,
    performanceVsAvg: 93,
    isRecommended: false,
  },
]

/* ── Mock: 진행 중 광고 ── */
const MOCK_ACTIVE_ADS: Ad[] = [
  {
    id: 1,
    campaignId: 1,
    adAccountId: 1,
    platform: 'meta',
    adType: 'partnership',
    status: 'active',
    objective: 'traffic',
    sourceContent: {
      influencerUsername: '@beauty_rosie',
      contentUrl: 'https://instagram.com/p/abc123',
      contentType: '릴스',
    },
    partnershipStatus: 'approved',
    targeting: { mode: 'auto' },
    dailyBudget: 50000,
    totalBudget: 500000,
    startDate: '2026-03-20',
    endDate: '2026-04-08',
    metrics: {
      impressions: 120000,
      reach: 89000,
      clicks: 5040,
      ctr: 4.2,
      spend: 350000,
      cpc: 69,
      cpm: 2917,
      conversions: 210,
      lastUpdatedAt: '2026-03-29',
    },
    createdAt: '2026-03-19',
    lastModified: '2026-03-29',
  },
  {
    id: 5,
    campaignId: 1,
    adAccountId: 2,
    platform: 'google',
    adType: 'standard',
    status: 'active',
    objective: 'traffic',
    sourceContent: {
      influencerUsername: '@vlog_yuna',
      contentUrl: 'https://youtube.com/watch?v=xyz',
      contentType: '영상',
    },
    targeting: { mode: 'auto' },
    dailyBudget: 70000,
    totalBudget: 700000,
    startDate: '2026-03-25',
    endDate: '2026-04-15',
    metrics: {
      impressions: 85000,
      reach: 62000,
      clicks: 3200,
      ctr: 3.8,
      spend: 280000,
      cpc: 88,
      cpm: 3294,
      conversions: 150,
      lastUpdatedAt: '2026-03-29',
    },
    createdAt: '2026-03-24',
    lastModified: '2026-03-29',
  },
]

/* ── Mock: 유기적 vs 유료 비교 ── */
const COMPARISON_DATA = {
  organicReach: 45000,
  paidReach: 120000,
  organicClicks: 2100,
  paidClicks: 5040,
}

const TOTAL_REACH = COMPARISON_DATA.organicReach + COMPARISON_DATA.paidReach
const REACH_BOOST_PCT = Math.round(((COMPARISON_DATA.paidReach) / COMPARISON_DATA.organicReach) * 100)

/* ── 유틸 ── */
function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR')
}

function formatKRW(n: number): string {
  return '\u20A9' + n.toLocaleString('ko-KR')
}

function getDaysLeft(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date('2026-03-29')
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

/* ── 서브: 진행 중 광고 카드 ── */
function ActiveAdCard({ ad }: { ad: Ad }) {
  const platformConfig = PLATFORM_TAG[ad.platform]
  const daysLeft = getDaysLeft(ad.endDate)

  return (
    <div className="cat-active-ad">
      <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Flex style={{ alignItems: 'center', gap: 8 }}>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>
            {ad.sourceContent.influencerUsername}
          </Typo>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
            {ad.sourceContent.contentType}
          </Typo>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>→</Typo>
          <CoreTag tagType={platformConfig.type} size="xs">{platformConfig.label}</CoreTag>
          <CoreStatusBadge status="primary" type="subtle" size="sm" leadingElement={{ dot: true }} text="진행 중" />
        </Flex>
        <HStack style={{ gap: 8 }}>
          <CoreButton buttonType="tertiary" size="sm" text="상세" />
          <CoreButton buttonType="contrast" size="sm" text="중지" />
        </HStack>
      </Flex>
      <Flex className="cat-active-ad-metrics" style={{ gap: 16, marginTop: 8 }}>
        <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>
          예산 {formatKRW(ad.totalBudget)}
        </Typo>
        <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>
          {daysLeft}일 남음
        </Typo>
        <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>
          노출 {formatNumber(ad.metrics?.impressions ?? 0)}
        </Typo>
        <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>
          CTR {ad.metrics?.ctr ?? 0}%
        </Typo>
      </Flex>
    </div>
  )
}

/* ── 서브: 비교 바 차트 (순수 CSS) ── */
function ComparisonBarChart() {
  const maxVal = Math.max(
    COMPARISON_DATA.organicReach,
    COMPARISON_DATA.paidReach,
    COMPARISON_DATA.organicClicks,
    COMPARISON_DATA.paidClicks
  )

  const bars = [
    { label: '유기적 도달', value: COMPARISON_DATA.organicReach, color: 'var(--global-colors-teal-70)' },
    { label: '유료 도달', value: COMPARISON_DATA.paidReach, color: 'var(--global-colors-primary-60)' },
    { label: '유기적 클릭', value: COMPARISON_DATA.organicClicks, color: 'var(--global-colors-teal-70)' },
    { label: '유료 클릭', value: COMPARISON_DATA.paidClicks, color: 'var(--global-colors-primary-60)' },
  ]

  return (
    <VStack style={{ gap: 12 }}>
      {bars.map((bar) => (
        <div key={bar.label} className="cat-bar-row">
          <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', width: 80, flexShrink: 0 }}>
            {bar.label}
          </Typo>
          <div className="cat-bar-track">
            <div
              className="cat-bar-fill"
              style={{
                width: `${(bar.value / maxVal) * 100}%`,
                background: bar.color,
              }}
            />
          </div>
          <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)', width: 70, textAlign: 'right', flexShrink: 0 }}>
            {formatNumber(bar.value)}
          </Typo>
        </div>
      ))}
    </VStack>
  )
}

/* ── Props ── */
interface CampaignAdTabProps {
  campaignId?: number
}

/* ── 메인 컴포넌트 ── */
export default function CampaignAdTab(_props: CampaignAdTabProps) {
  const handleCreateAd = (platform: 'meta' | 'google', _rec: ContentBoostRecommendation) => {
    // TODO: open AdCreateModal with rec data and platform
    console.log('Create ad on', platform)
  }

  return (
    <div className="cat-page">
      {/* 광고 가능 콘텐츠 (ContentBoostCard 통합) */}
      <div className="cat-section">
        <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 16 }}>
          광고 가능 콘텐츠
        </Typo>
        <VStack style={{ gap: 12 }}>
          {MOCK_RECOMMENDATIONS.map(rec => (
            <ContentBoostCard
              key={rec.contentId}
              recommendation={rec}
              onCreateAd={handleCreateAd}
            />
          ))}
        </VStack>
      </div>

      {/* 진행 중 광고 */}
      <div className="cat-section">
        <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 16 }}>
          진행 중 광고
        </Typo>
        <VStack style={{ gap: 0 }}>
          {MOCK_ACTIVE_ADS.map(ad => (
            <ActiveAdCard key={ad.id} ad={ad} />
          ))}
        </VStack>
      </div>

      {/* 유기적 vs 유료 성과 비교 */}
      <div className="cat-section">
        <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 4 }}>
          유기적 vs 유료 성과 비교
        </Typo>
        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)', marginBottom: 16 }}>
          총 도달: {formatNumber(TOTAL_REACH)} (유료 증폭으로 {REACH_BOOST_PCT}% 증가)
        </Typo>
        <ComparisonBarChart />
      </div>
    </div>
  )
}
