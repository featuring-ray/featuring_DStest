import './AdDetailDrawer.css'
import { Flex, VStack, HStack, Typo, CoreButton, CoreStatusBadge, CoreTag } from '@featuring-corp/components'
import { IconCloseOutline } from '@featuring-corp/icons'
import type { Ad, AdStatus } from './types/ad'

/* ── Props ── */
interface AdDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  ad: Ad | null
}

/* ── 상수 ── */
type BadgeStatus = 'default' | 'informative' | 'error' | 'warning' | 'success' | 'primary'

const STATUS_MAP: Record<AdStatus, { badge: BadgeStatus; label: string }> = {
  draft: { badge: 'default', label: '임시저장' },
  pending_review: { badge: 'warning', label: '검토 중' },
  active: { badge: 'primary', label: '진행 중' },
  paused: { badge: 'default', label: '일시 중지' },
  completed: { badge: 'informative', label: '완료' },
  rejected: { badge: 'error', label: '거절' },
}

const OBJECTIVE_LABEL: Record<string, string> = {
  awareness: '인지도',
  traffic: '트래픽',
  engagement: '인게이지먼트',
  conversions: '전환',
}

/* ── Mock 데이터 (ad.metrics가 없을 때 대비) ── */
const MOCK_METRICS = {
  impressions: 180000,
  reach: 120000,
  clicks: 5040,
  ctr: 4.2,
  spend: 350000,
  cpc: 69,
  cpm: 1944,
  roas: 5.2,
  lastUpdatedAt: '2026-03-29',
}

const MOCK_ORGANIC = {
  reach: 45000,
  clicks: 2100,
}

/* ── 유틸 ── */
function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR')
}

function formatCurrency(n: number): string {
  return `\u20A9${n.toLocaleString('ko-KR')}`
}

/* ── 서브 컴포넌트: 지표 그리드 아이템 ── */
function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="add-metric-item">
      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{label}</Typo>
      <Typo variant="$body-1" style={{ fontWeight: 600 }}>{value}</Typo>
    </div>
  )
}

/* ── 서브 컴포넌트: 비교 바 ── */
function CompareBar({ label, organic, paid }: { label: string; organic: number; paid: number }) {
  const total = organic + paid
  const organicPct = total > 0 ? (organic / total) * 100 : 50
  const paidPct = total > 0 ? (paid / total) * 100 : 50
  const increase = organic > 0 ? Math.round(((paid - organic) / organic) * 100) : 0

  return (
    <VStack style={{ gap: 4 }}>
      <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>{label}</Typo>
        {increase > 0 && (
          <Typo variant="$caption-2" style={{ color: 'var(--global-colors-primary-60)' }}>+{increase}%</Typo>
        )}
      </Flex>
      <div className="add-compare-bar">
        <div className="add-compare-bar-organic" style={{ width: `${organicPct}%` }} />
        <div className="add-compare-bar-paid" style={{ width: `${paidPct}%` }} />
      </div>
      <Flex style={{ justifyContent: 'space-between' }}>
        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>유기적: {formatNumber(organic)}</Typo>
        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>유료: {formatNumber(paid)}</Typo>
      </Flex>
    </VStack>
  )
}

/* ── 서브 컴포넌트: 설정 행 ── */
function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex style={{ gap: 8 }}>
      <Typo variant="$caption-1" style={{ width: 56, flexShrink: 0, color: 'var(--semantic-color-text-5)' }}>{label}</Typo>
      <Typo variant="$caption-1">{value}</Typo>
    </Flex>
  )
}

/* ── 메인 컴포넌트 ── */
export default function AdDetailDrawer({ isOpen, onClose, ad }: AdDetailDrawerProps) {
  if (!ad) return null

  const metrics = ad.metrics ?? MOCK_METRICS
  const status = STATUS_MAP[ad.status]
  const platformLabel = ad.platform === 'meta' ? 'Meta' : 'Google'
  const adTypeLabel = ad.adType === 'partnership' ? 'Partnership Ad' : '일반 광고'

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`add-overlay ${isOpen ? 'add-overlay--visible' : ''}`}
        onClick={onClose}
      />

      {/* 드로어 패널 */}
      <div className={`add-drawer ${isOpen ? 'add-drawer--open' : ''}`}>

        {/* 헤더 */}
        <div className="add-header">
          <VStack style={{ gap: 4, flex: 1 }}>
            <HStack style={{ gap: 8, alignItems: 'center' }}>
              <Typo variant="$heading-4">@{ad.sourceContent.influencerUsername}</Typo>
              <CoreTag tagType="gray" size="xs">{ad.sourceContent.contentType}</CoreTag>
            </HStack>
            <HStack style={{ gap: 8, alignItems: 'center' }}>
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>
                {platformLabel} {adTypeLabel}
              </Typo>
              <CoreStatusBadge
                status={status.badge}
                type="subtle"
                size="sm"
                leadingElement={{ dot: true }}
                text={status.label}
              />
            </HStack>
          </VStack>
          <div className="add-close-btn" onClick={onClose}>
            <IconCloseOutline size={20} color="var(--semantic-color-icon-secondary)" />
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div className="add-body">

          {/* 성과 섹션 */}
          <VStack style={{ gap: 12 }}>
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>성과</Typo>
            <div className="add-metrics-grid">
              <MetricItem label="노출" value={formatNumber(metrics.impressions)} />
              <MetricItem label="도달" value={formatNumber(metrics.reach)} />
              <MetricItem label="클릭" value={formatNumber(metrics.clicks)} />
              <MetricItem label="CTR" value={`${metrics.ctr}%`} />
            </div>
            <div className="add-metrics-grid">
              <MetricItem label="비용" value={formatCurrency(metrics.spend)} />
              <MetricItem label="CPC" value={formatCurrency(metrics.cpc)} />
              <MetricItem label="CPM" value={formatCurrency(metrics.cpm)} />
              <MetricItem label="ROAS" value={metrics.roas ? `${metrics.roas}x` : '-'} />
            </div>
          </VStack>

          <div className="add-divider" />

          {/* 유기적 vs 유료 비교 */}
          <VStack style={{ gap: 12 }}>
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>유기적 vs 유료</Typo>
            <CompareBar label="도달" organic={MOCK_ORGANIC.reach} paid={metrics.reach} />
            <CompareBar label="클릭" organic={MOCK_ORGANIC.clicks} paid={metrics.clicks} />
            <div className="add-total-reach">
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>
                총 도달: {formatNumber(MOCK_ORGANIC.reach + metrics.reach)}
              </Typo>
              <Typo variant="$caption-2" style={{ color: 'var(--global-colors-primary-60)' }}>
                유료 증폭으로 {Math.round((metrics.reach / MOCK_ORGANIC.reach) * 100)}% 증가
              </Typo>
            </div>
          </VStack>

          <div className="add-divider" />

          {/* 설정 섹션 */}
          <VStack style={{ gap: 12 }}>
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>설정</Typo>
            <VStack style={{ gap: 8 }}>
              <SettingRow label="플랫폼" value={`${platformLabel} (${adTypeLabel})`} />
              <SettingRow label="목표" value={OBJECTIVE_LABEL[ad.objective] ?? ad.objective} />
              <SettingRow label="타겟" value={ad.targeting.mode === 'auto' ? '자동' : '커스텀'} />
              <SettingRow
                label="예산"
                value={`${formatCurrency(ad.dailyBudget)}/일 (총 ${formatCurrency(ad.totalBudget)})`}
              />
              <SettingRow label="기간" value={`${ad.startDate} ~ ${ad.endDate}`} />
            </VStack>
          </VStack>
        </div>

        {/* 하단 액션 */}
        <div className="add-footer">
          <Flex style={{ gap: 8 }}>
            <CoreButton buttonType="tertiary" size="sm">예산 수정</CoreButton>
            <CoreButton buttonType="contrast" size="sm">일시 중지</CoreButton>
            <CoreButton buttonType="contrast" size="sm">광고 종료</CoreButton>
          </Flex>
        </div>
      </div>
    </>
  )
}
