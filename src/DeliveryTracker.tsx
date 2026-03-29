import './DeliveryTracker.css'
import { useState } from 'react'
import { Flex, VStack, Typo, CoreButton, CoreTag, CoreSelect, CoreStatusBadge } from '@featuring-corp/components'
import {
  IconNotificationOutline,
} from '@featuring-corp/icons'

/* ── 타입 정의 ── */
type DeliveryStatus = '배송완료' | '배송중' | '배송지연' | '반송'
type BadgeStatus = 'default' | 'informative' | 'error' | 'warning' | 'success' | 'primary'
type ReceiptStatus = '확인' | '미확인' | '-'

interface DeliveryItem {
  id: number
  name: string
  courier: string
  trackingNo: string
  status: DeliveryStatus
  sentDate: string
  expectedDate: string
  receipt: ReceiptStatus
  alertMessage?: string
}

/* ── 상수 ── */
const STATUS_BADGE_MAP: Record<DeliveryStatus, BadgeStatus> = {
  '배송완료': 'success',
  '배송중': 'primary',
  '배송지연': 'warning',
  '반송': 'error',
}

const CAMPAIGN_OPTIONS = [
  { id: '1', label: '26.03 다이슨 에어랩 멀티 스타일러 캠페인' },
  { id: '2', label: '26.01 미닉스더플렌더 캠페인' },
  { id: '3', label: '25.10 성수 팝업 방문 캠페인' },
]

/* ── Mock 데이터 ── */
const MOCK_DELIVERIES: DeliveryItem[] = [
  { id: 1, name: 'TheAcacia_Hyurin', courier: 'CJ대한통운', trackingNo: '6012345678901', status: '배송완료', sentDate: '03.20', expectedDate: '03.22', receipt: '확인' },
  { id: 2, name: 'tteokbokkiyum', courier: '한진택배', trackingNo: '4501234567890', status: '배송완료', sentDate: '03.20', expectedDate: '03.22', receipt: '확인' },
  { id: 3, name: 'abb_revi', courier: 'CJ대한통운', trackingNo: '6012345678902', status: '배송완료', sentDate: '03.20', expectedDate: '03.22', receipt: '확인' },
  { id: 4, name: 'ctolook', courier: '로젠택배', trackingNo: '2012345678901', status: '배송완료', sentDate: '03.21', expectedDate: '03.23', receipt: '미확인' },
  { id: 5, name: 'deobeauty', courier: 'CJ대한통운', trackingNo: '6012345678903', status: '배송완료', sentDate: '03.21', expectedDate: '03.23', receipt: '확인' },
  { id: 6, name: 'starjelly_kr', courier: '한진택배', trackingNo: '4501234567891', status: '배송완료', sentDate: '03.21', expectedDate: '03.23', receipt: '미확인' },
  { id: 7, name: 'beauty.yun', courier: 'CJ대한통운', trackingNo: '6012345678904', status: '배송완료', sentDate: '03.19', expectedDate: '03.21', receipt: '확인' },
  { id: 8, name: 'upstagramc', courier: '로젠택배', trackingNo: '2012345678902', status: '배송완료', sentDate: '03.19', expectedDate: '03.21', receipt: '확인' },
  { id: 9, name: 'minzy_daily', courier: 'CJ대한통운', trackingNo: '6012345678905', status: '배송완료', sentDate: '03.22', expectedDate: '03.24', receipt: '확인' },
  { id: 10, name: 'cook_haneul', courier: '한진택배', trackingNo: '4501234567892', status: '배송완료', sentDate: '03.22', expectedDate: '03.24', receipt: '미확인' },
  { id: 11, name: 'jiyeon_fit', courier: 'CJ대한통운', trackingNo: '6012345678906', status: '배송중', sentDate: '03.26', expectedDate: '03.28', receipt: '-' },
  { id: 12, name: 'mango_studio', courier: '로젠택배', trackingNo: '2012345678903', status: '배송중', sentDate: '03.26', expectedDate: '03.28', receipt: '-' },
  {
    id: 13, name: 'hani_reviews', courier: 'CJ대한통운', trackingNo: '6012345678907', status: '배송지연',
    sentDate: '03.18', expectedDate: '03.20', receipt: '-',
    alertMessage: '배송 지연 3일 초과. 인플루언서에게 안내 메시지 발송을 권장합니다. 택배사 고객센터(1588-1255)에 문의하여 배송 상태를 확인해 주세요.',
  },
  {
    id: 14, name: 'travel_jaemin', courier: '한진택배', trackingNo: '4501234567893', status: '배송지연',
    sentDate: '03.17', expectedDate: '03.19', receipt: '-',
    alertMessage: '배송 지연 4일 초과. 인플루언서에게 일정 조정 안내가 필요합니다. 택배사 고객센터(1588-0011)에 문의하여 배송 상태를 확인해 주세요.',
  },
  {
    id: 15, name: 'seoul_foodie', courier: '로젠택배', trackingNo: '2012345678904', status: '반송',
    sentDate: '03.16', expectedDate: '03.18', receipt: '-',
    alertMessage: '수취인 부재로 반송 처리됨. 인플루언서에게 배송 주소 재확인 후 재발송이 필요합니다.',
  },
]

/* ── 요약 카드 계산 ── */
const completedConfirmed = MOCK_DELIVERIES.filter(d => d.status === '배송완료' && d.receipt === '확인').length
const completedUnconfirmed = MOCK_DELIVERIES.filter(d => d.status === '배송완료' && d.receipt === '미확인').length
const inTransit = MOCK_DELIVERIES.filter(d => d.status === '배송중').length
const delayedOrReturned = MOCK_DELIVERIES.filter(d => d.status === '배송지연' || d.status === '반송').length

const SUMMARY_CARDS = [
  { label: '배송완료 + 수령확인', value: completedConfirmed, color: 'var(--global-colors-teal-70)', bgClass: 'dt-card--green' },
  { label: '배송완료 + 미확인', value: completedUnconfirmed, color: '#f59e0b', bgClass: 'dt-card--yellow' },
  { label: '배송중', value: inTransit, color: 'var(--global-colors-primary-60)', bgClass: 'dt-card--blue' },
  { label: '배송지연 / 반송', value: delayedOrReturned, color: '#ef4444', bgClass: 'dt-card--red' },
]

/* ── 일일 리포트 Mock ── */
const DAILY_REPORT = `📦 배송 현황 일일 리포트 (03.29)
━━━━━━━━━━━━━━━━━━━━━
캠페인: 다이슨 에어랩 멀티 스타일러

✅ 배송완료: ${completedConfirmed + completedUnconfirmed}명
  ├ 수령확인: ${completedConfirmed}명
  └ 미확인: ${completedUnconfirmed}명
🚚 배송중: ${inTransit}명
⚠️ 배송지연: 2명
  ├ hani_reviews (CJ대한통운, 3일 초과)
  └ travel_jaemin (한진택배, 4일 초과)
🔴 반송: 1명
  └ seoul_foodie (로젠택배, 수취인 부재)

📌 조치 필요:
- 배송지연 2건: 택배사 확인 + 인플루언서 안내
- 반송 1건: 주소 재확인 후 재발송
- 미확인 ${completedUnconfirmed}건: 수령 확인 요청 DM 발송`

/* ── 메인 컴포넌트 ── */
export default function DeliveryTracker() {
  const [, setSelectedCampaign] = useState('')
  const [showReport, setShowReport] = useState(false)

  const alertItems = MOCK_DELIVERIES.filter(d => d.alertMessage)

  return (
    <div className="dt-page">

      {/* ── 상단 헤더 ── */}
      <div className="dt-topbar">
        <Flex style={{ alignItems: 'center', gap: 12, flex: 1 }}>
          <Typo variant="$heading-4" style={{ fontWeight: 700 }}>제품 배송 트래커</Typo>
          <div style={{ width: 320 }}>
            <CoreSelect size="sm" placeholderText="캠페인 선택" setValue={(v: string) => setSelectedCampaign(v)}>
              {CAMPAIGN_OPTIONS.map(c => (
                <CoreSelect.Item key={c.id} value={c.id}>{c.label}</CoreSelect.Item>
              ))}
            </CoreSelect>
          </div>
        </Flex>
      </div>

      {/* ── 요약 카드 ── */}
      <div className="dt-summary-row">
        {SUMMARY_CARDS.map((card, i) => (
          <div key={i} className={`dt-summary-card ${card.bgClass}`}>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>{card.label}</Typo>
            <Typo variant="$heading-3" style={{ fontWeight: 700, color: card.color, marginTop: 4 }}>
              {card.value}
            </Typo>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>명</Typo>
          </div>
        ))}
      </div>

      {/* ── 배송 테이블 ── */}
      <div className="dt-table-wrap">
        <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 12 }}>인플루언서 배송 현황</Typo>
        <div className="dt-table-container">
          <table className="dt-table">
            <thead>
              <tr>
                <th>인플루언서</th>
                <th>택배사</th>
                <th>송장번호</th>
                <th>상태</th>
                <th>발송일</th>
                <th>예상도착</th>
                <th>수령확인</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DELIVERIES.map(d => (
                <tr key={d.id}>
                  <td>
                    <Typo variant="$body-1" style={{ fontWeight: 500 }}>{d.name}</Typo>
                  </td>
                  <td>
                    <Typo variant="$caption-1">{d.courier}</Typo>
                  </td>
                  <td>
                    <Typo variant="$caption-1" style={{ fontFamily: 'monospace' }}>{d.trackingNo}</Typo>
                  </td>
                  <td>
                    <CoreStatusBadge
                      status={STATUS_BADGE_MAP[d.status]}
                      text={d.status}
                      size="sm"
                      type="subtle"
                      leadingElement={{ dot: true }}
                    />
                  </td>
                  <td>
                    <Typo variant="$caption-1">{d.sentDate}</Typo>
                  </td>
                  <td>
                    <Typo variant="$caption-1">{d.expectedDate}</Typo>
                  </td>
                  <td>
                    {d.receipt === '확인' ? (
                      <CoreStatusBadge status="success" text="확인" size="sm" type="subtle" />
                    ) : d.receipt === '미확인' ? (
                      <CoreStatusBadge status="warning" text="미확인" size="sm" type="subtle" />
                    ) : (
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>-</Typo>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 이상 알림 패널 ── */}
      {alertItems.length > 0 && (
        <div className="dt-alert-panel">
          <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <IconNotificationOutline size={18} />
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>이상 알림</Typo>
            <CoreTag tagType="red" size="xs">{alertItems.length}건</CoreTag>
          </Flex>
          <VStack style={{ gap: 12 }}>
            {alertItems.map(item => (
              <div key={item.id} className="dt-alert-item">
                <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Typo variant="$body-1" style={{ fontWeight: 600 }}>{item.name}</Typo>
                  <CoreStatusBadge status={STATUS_BADGE_MAP[item.status]} text={item.status} size="sm" type="subtle" leadingElement={{ dot: true }} />
                  <CoreTag tagType="gray" size="xs">{item.courier}</CoreTag>
                </Flex>
                <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', lineHeight: '1.5' }}>
                  {item.alertMessage}
                </Typo>
              </div>
            ))}
          </VStack>
        </div>
      )}

      {/* ── 일일 요약 리포트 ── */}
      <div className="dt-report-section">
        <Flex style={{ alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Typo variant="$body-2" style={{ fontWeight: 600 }}>일일 요약 리포트</Typo>
          <CoreButton
            buttonType="tertiary"
            size="sm"
            text={showReport ? '리포트 접기' : '리포트 보기'}
            onClick={() => setShowReport(!showReport)}
          />
        </Flex>
        {showReport && (
          <div className="dt-report-preview">
            <div className="dt-report-slack-header">
              <div className="dt-slack-icon" />
              <VStack style={{ gap: 2 }}>
                <Typo variant="$caption-1" style={{ fontWeight: 600 }}>featuring-bot</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>오늘 09:00</Typo>
              </VStack>
            </div>
            <pre className="dt-report-content">{DAILY_REPORT}</pre>
            <Flex style={{ gap: 8, marginTop: 12 }}>
              <CoreButton buttonType="primary" size="sm" text="Slack 발송" />
              <CoreButton buttonType="tertiary" size="sm" text="복사" />
            </Flex>
          </div>
        )}
      </div>
    </div>
  )
}
