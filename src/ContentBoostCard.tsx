import './ContentBoostCard.css'
import { Flex, VStack, HStack, Typo, CoreButton, CoreTag } from '@featuring-corp/components'
import type { ContentBoostRecommendation } from './types/ad'

/* ── Props ── */
interface ContentBoostCardProps {
  recommendation: ContentBoostRecommendation
  onCreateAd: (platform: 'meta' | 'google', recommendation: ContentBoostRecommendation) => void
}

/* ── 유틸 ── */
function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
  return n.toLocaleString('ko-KR')
}

/* ── 서브 컴포넌트: 지표 아이템 ── */
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="cbc-stat-item">
      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{label}</Typo>
      <Typo variant="$caption-1" style={{ fontWeight: 600 }}>{value}</Typo>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function ContentBoostCard({ recommendation, onCreateAd }: ContentBoostCardProps) {
  const { organicMetrics, performanceVsAvg, isRecommended } = recommendation

  return (
    <div className="cbc-card">
      {/* 상단: 썸네일 + 정보 */}
      <Flex style={{ gap: 16 }}>
        {/* 썸네일 placeholder */}
        <div className="cbc-thumbnail">
          {isRecommended && (
            <div className="cbc-recommended-badge">
              <CoreTag tagType="red" size="xs">AI 추천</CoreTag>
            </div>
          )}
        </div>

        {/* 콘텐츠 정보 */}
        <VStack style={{ gap: 8, flex: 1 }}>
          <HStack style={{ gap: 6, alignItems: 'center' }}>
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>@{recommendation.influencerUsername}</Typo>
            <CoreTag tagType="gray" size="xs">{recommendation.contentType}</CoreTag>
          </HStack>

          {/* 성과 지표 */}
          <div className="cbc-stats-grid">
            <StatItem label="좋아요" value={formatNumber(organicMetrics.likes)} />
            <StatItem label="댓글" value={formatNumber(organicMetrics.comments)} />
            <StatItem label="저장" value={formatNumber(organicMetrics.saves)} />
            <StatItem label="도달" value={formatNumber(organicMetrics.reach)} />
            <StatItem label="인게이지먼트" value={`${organicMetrics.engagementRate}%`} />
          </div>

          {/* AI 추천 시 성과 비교 */}
          {isRecommended && (
            <div className="cbc-performance-badge">
              <Typo variant="$caption-1" style={{ color: 'var(--global-colors-primary-60)' }}>
                계정 평균 대비 {Math.round(performanceVsAvg * 100)}% 성과
              </Typo>
            </div>
          )}
        </VStack>
      </Flex>

      {/* 하단: 액션 버튼 */}
      <div className="cbc-actions">
        <Flex style={{ gap: 8 }}>
          <CoreButton
            buttonType="primary"
            size="sm"
            text="Meta 광고 만들기"
            onClick={() => onCreateAd('meta', recommendation)}
          />
          <CoreButton
            buttonType="contrast"
            size="sm"
            text="Google 광고 만들기"
            onClick={() => onCreateAd('google', recommendation)}
          />
        </Flex>
      </div>
    </div>
  )
}
