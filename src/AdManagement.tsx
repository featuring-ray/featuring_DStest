import './AdManagement.css'
import { useState } from 'react'
import { Flex, VStack, Typo, CoreButton, CoreTabs, CoreTabItem, CoreStatusBadge, CoreTag } from '@featuring-corp/components'
import { IconAddOutline, IconBullhornOutline } from '@featuring-corp/icons'
import type { AdAccount, Ad, AdStatus, AdPlatform } from './types/ad'
import AdCreateModal from './AdCreateModal'
import AdDetailDrawer from './AdDetailDrawer'

/* ── 상태 매핑 ── */
type BadgeStatus = 'default' | 'informative' | 'error' | 'warning' | 'success' | 'primary'

const AD_STATUS_LABEL: Record<AdStatus, string> = {
  draft: '임시 저장',
  pending_review: '검토 중',
  active: '진행 중',
  paused: '일시 중지',
  completed: '완료',
  rejected: '거절',
}

const AD_STATUS_BADGE: Record<AdStatus, BadgeStatus> = {
  draft: 'default',
  pending_review: 'warning',
  active: 'primary',
  paused: 'informative',
  completed: 'success',
  rejected: 'error',
}

const PLATFORM_TAG: Record<AdPlatform, { label: string; type: 'blue' | 'red' }> = {
  meta: { label: 'Meta', type: 'blue' },
  google: { label: 'Google', type: 'red' },
}

/* ── 탭 정의 ── */
type TabKey = '전체' | '진행 중' | '검토 중' | '완료' | '거절'

const TABS: { key: TabKey; label: string }[] = [
  { key: '전체', label: '전체' },
  { key: '진행 중', label: '진행 중' },
  { key: '검토 중', label: '검토 중' },
  { key: '완료', label: '완료' },
  { key: '거절', label: '거절' },
]

const TAB_STATUS_MAP: Record<TabKey, AdStatus[] | null> = {
  '전체': null,
  '진행 중': ['active'],
  '검토 중': ['pending_review'],
  '완료': ['completed'],
  '거절': ['rejected'],
}

/* ── Mock 광고 계정 ── */
const MOCK_ACCOUNTS: AdAccount[] = [
  {
    id: 1,
    platform: 'meta',
    accountId: 'act_123456789',
    accountName: '브랜드A 광고계정',
    status: 'connected',
    connectedAt: '2026-02-15',
    lastSyncedAt: '2026-03-29',
  },
  {
    id: 2,
    platform: 'google',
    accountId: '987-654-3210',
    accountName: '브랜드A MCC',
    status: 'connected',
    connectedAt: '2026-02-20',
    lastSyncedAt: '2026-03-29',
  },
]

/* ── Mock 광고 데이터 ── */
const MOCK_ADS: Ad[] = [
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
    id: 2,
    campaignId: 1,
    adAccountId: 2,
    platform: 'google',
    adType: 'standard',
    status: 'pending_review',
    objective: 'awareness',
    sourceContent: {
      influencerUsername: '@style_jimin',
      contentUrl: 'https://instagram.com/p/def456',
      contentType: '피드',
    },
    targeting: { mode: 'custom', locations: ['대한민국'], ageMin: 18, ageMax: 35, gender: 'female' },
    dailyBudget: 30000,
    totalBudget: 300000,
    startDate: '2026-04-01',
    endDate: '2026-04-10',
    createdAt: '2026-03-28',
    lastModified: '2026-03-28',
  },
  {
    id: 3,
    campaignId: 2,
    adAccountId: 1,
    platform: 'meta',
    adType: 'partnership',
    status: 'completed',
    objective: 'engagement',
    sourceContent: {
      influencerUsername: '@daily_soyeon',
      contentUrl: 'https://instagram.com/p/ghi789',
      contentType: '릴스',
    },
    partnershipStatus: 'approved',
    targeting: { mode: 'auto' },
    dailyBudget: 40000,
    totalBudget: 400000,
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    metrics: {
      impressions: 450000,
      reach: 320000,
      clicks: 18000,
      ctr: 4.0,
      spend: 400000,
      cpc: 22,
      cpm: 889,
      conversions: 850,
      lastUpdatedAt: '2026-02-28',
    },
    createdAt: '2026-01-30',
    lastModified: '2026-02-28',
  },
  {
    id: 4,
    campaignId: 2,
    adAccountId: 1,
    platform: 'meta',
    adType: 'standard',
    status: 'rejected',
    objective: 'conversions',
    sourceContent: {
      influencerUsername: '@life_minjae',
      contentUrl: 'https://instagram.com/p/jkl012',
      contentType: '피드',
    },
    targeting: { mode: 'auto' },
    dailyBudget: 60000,
    totalBudget: 600000,
    startDate: '2026-03-01',
    endDate: '2026-03-15',
    reviewMessage: '광고 정책 위반: 과장 표현 포함',
    createdAt: '2026-02-28',
    lastModified: '2026-03-01',
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

/* ── 성과 요약 계산 ── */
const SUMMARY = {
  totalSpend: MOCK_ADS.reduce((s, a) => s + (a.metrics?.spend ?? 0), 0),
  totalImpressions: MOCK_ADS.reduce((s, a) => s + (a.metrics?.impressions ?? 0), 0),
  totalClicks: MOCK_ADS.reduce((s, a) => s + (a.metrics?.clicks ?? 0), 0),
  totalConversions: MOCK_ADS.reduce((s, a) => s + (a.metrics?.conversions ?? 0), 0),
}

const SUMMARY_CTR = SUMMARY.totalImpressions > 0
  ? ((SUMMARY.totalClicks / SUMMARY.totalImpressions) * 100).toFixed(1)
  : '0'

const SUMMARY_CPA = SUMMARY.totalConversions > 0
  ? Math.round(SUMMARY.totalSpend / SUMMARY.totalConversions)
  : 0

/* ── 유틸 ── */
function formatKRW(n: number): string {
  return '\u20A9' + n.toLocaleString('ko-KR')
}

function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR')
}

function getDaysLeft(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date('2026-03-29')
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

/* ── 서브: 광고 계정 카드 ── */
function AccountCard({ account }: { account: AdAccount }) {
  const platformConfig = PLATFORM_TAG[account.platform]
  const statusText = account.status === 'connected' ? '연결됨' : account.status === 'disconnected' ? '미연결' : '오류'
  const statusBadge: BadgeStatus = account.status === 'connected' ? 'success' : account.status === 'error' ? 'error' : 'default'

  return (
    <Flex className="am-account-card" style={{ alignItems: 'center', gap: 12 }}>
      <CoreTag tagType={platformConfig.type} size="xs">{platformConfig.label} Ads</CoreTag>
      <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', flex: 1 }}>{account.accountName}</Typo>
      <CoreStatusBadge status={statusBadge} type="subtle" size="sm" leadingElement={{ dot: true }} text={statusText} />
    </Flex>
  )
}

/* ── 서브: 통계 카드 ── */
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="am-stat-card">
      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>{label}</Typo>
      <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)', marginTop: 4 }}>{value}</Typo>
      {sub && <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)', marginTop: 2 }}>{sub}</Typo>}
    </div>
  )
}

/* ── 서브: 광고 아이템 카드 ── */
function AdItemCard({ ad, onClick }: { ad: Ad; onClick: () => void }) {
  const platformConfig = PLATFORM_TAG[ad.platform]
  const daysLeft = getDaysLeft(ad.endDate)

  return (
    <div className="am-ad-item" onClick={onClick}>
      <Flex style={{ alignItems: 'center', gap: 12 }}>
        <div className="am-ad-thumbnail">
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>📷</Typo>
        </div>
        <VStack style={{ flex: 1, gap: 4 }}>
          <Flex style={{ alignItems: 'center', gap: 8 }}>
            <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>
              {ad.sourceContent.influencerUsername}
            </Typo>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
              {ad.sourceContent.contentType}
            </Typo>
          </Flex>
          <Flex style={{ alignItems: 'center', gap: 6 }}>
            <CoreTag tagType={platformConfig.type} size="xs">{platformConfig.label}</CoreTag>
            <CoreStatusBadge
              status={AD_STATUS_BADGE[ad.status]}
              type="subtle"
              size="sm"
              leadingElement={{ dot: true }}
              text={AD_STATUS_LABEL[ad.status]}
            />
          </Flex>
        </VStack>
        <VStack style={{ alignItems: 'flex-end', gap: 4 }}>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>
            {formatKRW(ad.totalBudget)}
          </Typo>
          {ad.status === 'active' && (
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
              {daysLeft}일 남음 · CTR {ad.metrics?.ctr ?? '-'}%
            </Typo>
          )}
          {ad.status === 'rejected' && ad.reviewMessage && (
            <Typo variant="$caption-2" style={{ color: 'var(--global-colors-magenta-40)' }}>
              {ad.reviewMessage}
            </Typo>
          )}
        </VStack>
      </Flex>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function AdManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>('전체')
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const statusFilter = TAB_STATUS_MAP[activeTab]
  const filteredAds = statusFilter
    ? MOCK_ADS.filter(ad => statusFilter.includes(ad.status))
    : MOCK_ADS

  const tabCounts: Record<TabKey, number> = {
    '전체': MOCK_ADS.length,
    '진행 중': MOCK_ADS.filter(a => a.status === 'active').length,
    '검토 중': MOCK_ADS.filter(a => a.status === 'pending_review').length,
    '완료': MOCK_ADS.filter(a => a.status === 'completed').length,
    '거절': MOCK_ADS.filter(a => a.status === 'rejected').length,
  }

  const handleAdSelect = (ad: Ad) => {
    setSelectedAd(ad)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }

  return (
    <div className="am-page">
      {/* ── 상단 헤더 바 ── */}
      <div className="am-topbar">
        <Flex style={{ alignItems: 'center', gap: 8 }}>
          <IconBullhornOutline size={20} color="var(--semantic-color-text-1)" />
          <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>광고 관리</Typo>
        </Flex>
        <CoreButton
          buttonType="primary"
          size="md"
          prefix={<IconAddOutline size={14} />}
          text="새 광고"
          onClick={() => setIsCreateModalOpen(true)}
        />
      </div>

      {/* ── 본문 ── */}
      <div className="am-content">

        {/* 연결된 광고 계정 */}
        <div className="am-section">
          <Flex className="am-section-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>연결된 광고 계정</Typo>
            <CoreButton buttonType="tertiary" size="sm" prefix={<IconAddOutline size={14} />} text="계정 추가" />
          </Flex>
          <VStack style={{ gap: 8 }}>
            {MOCK_ACCOUNTS.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </VStack>
        </div>

        {/* 성과 요약 */}
        <div className="am-section">
          <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 12 }}>
            성과 요약 (최근 30일)
          </Typo>
          <Flex className="am-stats-grid" style={{ gap: 16 }}>
            <StatCard label="총 광고비" value={formatKRW(SUMMARY.totalSpend)} />
            <StatCard label="노출수" value={formatNumber(SUMMARY.totalImpressions)} />
            <StatCard label="클릭수" value={formatNumber(SUMMARY.totalClicks)} sub={`CTR ${SUMMARY_CTR}%`} />
            <StatCard label="전환수" value={formatNumber(SUMMARY.totalConversions)} sub={`CPA ${formatKRW(SUMMARY_CPA)}`} />
          </Flex>
        </div>

        {/* 광고 목록 */}
        <div className="am-section am-section--list">
          <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 12 }}>
            광고 목록
          </Typo>
          <CoreTabs>
            {TABS.map(tab => (
              <CoreTabItem
                key={tab.key}
                size="md"
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} ({tabCounts[tab.key]})
              </CoreTabItem>
            ))}
          </CoreTabs>

          <VStack className="am-ad-list" style={{ gap: 0 }}>
            {filteredAds.length > 0 ? (
              filteredAds.map(ad => (
                <AdItemCard key={ad.id} ad={ad} onClick={() => handleAdSelect(ad)} />
              ))
            ) : (
              <div className="am-empty">
                <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)' }}>
                  해당 상태의 광고가 없습니다.
                </Typo>
              </div>
            )}
          </VStack>
        </div>
      </div>

      {/* ── AdCreateModal 통합 ── */}
      <AdCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* ── AdDetailDrawer 통합 ── */}
      <AdDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        ad={selectedAd}
      />
    </div>
  )
}
