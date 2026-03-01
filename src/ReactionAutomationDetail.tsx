import './ReactionAutomationDetail.css'
import { useState, useEffect, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Flex, VStack, HStack, Box, CoreButton, CoreModal, CoreTextInput, CoreStatusBadge, CoreAvatar, CoreTag, CorePagination, CoreSelect, Typo } from '@featuring-corp/components'
import {
  IconChevronLeftOutline,
  IconAddOutline,
  IconSearchOutline,
  IconLinkOutline,
  IconTrashOutline,
  IconDownloadOutline,
} from '@featuring-corp/icons'

/* ── 타입 정의 ── */
type GuideDeliveryStatus = 'draft' | 'pending' | 'delivered' | 'failed'
type BadgeStatus = 'default' | 'informative' | 'error' | 'warning' | 'success' | 'primary'

const GUIDE_STATUS_MAP: Record<GuideDeliveryStatus, { label: string; badge: BadgeStatus }> = {
  draft:     { label: '임시 저장', badge: 'default' },
  pending:   { label: '대기중',   badge: 'warning' },
  delivered: { label: '전달 완료', badge: 'success' },
  failed:    { label: '실패',     badge: 'error' },
}

/* ── Mock 그룹 데이터 ── */
const GROUP_DATA: Record<string, { name: string; campaignName: string | null }> = {
  '1': { name: '다이슨 에어랩 DM 자동화', campaignName: '26.03 다이슨 에어랩 캠페인' },
  '2': { name: '미닉스 신제품 홍보', campaignName: '26.01 미닉스더플렌더 캠페인' },
  '3': { name: '베베바이옴 세럼 자동화', campaignName: null },
  '4': { name: 'FIG 팝업 방문 자동화', campaignName: '25.10 성수 팝업 방문 캠페인' },
  '5': { name: '노스페이스 겨울 패딩 자동화', campaignName: '25.09 겨울 패딩 스타일링' },
}

/* ── Mock 인플루언서 데이터 ── */
interface Influencer {
  id: string
  handle: string
  name: string
  followers: string
  guideStatus: GuideDeliveryStatus
  guideLink: string | null
}

const MOCK_INFLUENCERS: Influencer[] = [
  { id: 'i1', handle: '@beauty_rosie', name: 'Rosie Kim', followers: '125K', guideStatus: 'delivered', guideLink: 'https://studio.featuring.co/guide/abc123' },
  { id: 'i2', handle: '@style_jimin', name: 'Jimin Park', followers: '89K', guideStatus: 'pending', guideLink: 'https://studio.featuring.co/guide/def456' },
  { id: 'i3', handle: '@daily_soyeon', name: 'Soyeon Lee', followers: '210K', guideStatus: 'draft', guideLink: null },
  { id: 'i4', handle: '@life_minjae', name: 'Minjae Choi', followers: '56K', guideStatus: 'delivered', guideLink: 'https://studio.featuring.co/guide/ghi789' },
  { id: 'i5', handle: '@vlog_yuna', name: 'Yuna Han', followers: '340K', guideStatus: 'failed', guideLink: null },
]

/* ── Mock 성과 데이터 ── */
interface PerformanceRow {
  id: string
  handle: string
  likes: number
  comments: number
  saves: number
  reposts: number
  shares: number
  uniqueRecipients: number
  uniqueClicks: number
  followConversions: number
  buttons: { slot: number; buttonName: string; url: string; uniqueClicks: number; totalClicks: number }[]
}

const MOCK_PERFORMANCE: PerformanceRow[] = [
  {
    id: 'p1', handle: '@beauty_rosie', likes: 1250, comments: 89, saves: 320, reposts: 45, shares: 67,
    uniqueRecipients: 4500, uniqueClicks: 890, followConversions: 120,
    buttons: [
      { slot: 1, buttonName: '제품 보러가기', url: 'https://dyson.com/airap', uniqueClicks: 560, totalClicks: 780 },
      { slot: 2, buttonName: '할인 쿠폰 받기', url: 'https://dyson.com/coupon', uniqueClicks: 330, totalClicks: 450 },
    ],
  },
  {
    id: 'p2', handle: '@style_jimin', likes: 890, comments: 56, saves: 210, reposts: 23, shares: 34,
    uniqueRecipients: 3200, uniqueClicks: 640, followConversions: 85,
    buttons: [
      { slot: 1, buttonName: '제품 보러가기', url: 'https://dyson.com/airap', uniqueClicks: 420, totalClicks: 580 },
      { slot: 2, buttonName: '할인 쿠폰 받기', url: 'https://dyson.com/coupon', uniqueClicks: 220, totalClicks: 310 },
    ],
  },
  {
    id: 'p3', handle: '@life_minjae', likes: 456, comments: 34, saves: 98, reposts: 12, shares: 19,
    uniqueRecipients: 1800, uniqueClicks: 310, followConversions: 42,
    buttons: [
      { slot: 1, buttonName: '제품 보러가기', url: 'https://dyson.com/airap', uniqueClicks: 200, totalClicks: 260 },
    ],
  },
]

const GUIDE_LINK_BASE = 'https://studio.featuring.co/guide/'

/* ── 탭 타입 ── */
type TabKey = 'influencers' | 'performance'

export default function ReactionAutomationDetail() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const group = GROUP_DATA[groupId || '']

  const [activeTab, setActiveTab] = useState<TabKey>('influencers')
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [addHandle, setAddHandle] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  /* US-P0-03: 사용 가이드 안내 모달 */
  useEffect(() => {
    const dismissed = localStorage.getItem('ra-guide-dismissed')
    if (!dismissed) {
      setShowGuideModal(true)
    }
  }, [])

  const handleDismissGuide = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('ra-guide-dismissed', 'true')
    }
    setShowGuideModal(false)
  }

  /* US-P0-05: 링크 복사 */
  const handleCopyLink = (influencerId: string, link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(influencerId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  /* 체크박스 토글 */
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    if (selectedIds.size === MOCK_INFLUENCERS.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(MOCK_INFLUENCERS.map(i => i.id)))
    }
  }

  /* 성과 행 확장 토글 */
  const toggleExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /* CTR 계산 */
  const calcCtr = (clicks: number, recipients: number) =>
    recipients > 0 ? `${((clicks / recipients) * 100).toFixed(1)}%` : '-'

  if (!group) {
    return (
      <div className="ra-page">
        <div className="ra-topbar">
          <span className="ra-topbar-title">자동화를 찾을 수 없습니다</span>
        </div>
      </div>
    )
  }

  return (
    <div className="ra-page">

      {/* ── 상단 헤더 바 ── */}
      <div className="ra-topbar">
        <Flex style={{ alignItems: 'center', gap: 12 }}>
          <Box className="ra-back-btn" onClick={() => navigate('/reaction-automation')}>
            <IconChevronLeftOutline size={16} color="#424242" />
          </Box>
          <Flex style={{ alignItems: 'center', gap: 8 }}>
            <Typo variant="$heading-5" style={{ color: 'var(--semantic-color-text-1)' }}>
              {group.name}
            </Typo>
            {group.campaignName && (
              <CoreTag tagType="teal" size="xs" text={group.campaignName} />
            )}
          </Flex>
        </Flex>
      </div>

      {/* ── 탭 ── */}
      <div className="ra-detail-tabs">
        <div
          className={`ra-detail-tab${activeTab === 'influencers' ? ' ra-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('influencers')}
        >
          인플루언서 목록
        </div>
        <div
          className={`ra-detail-tab${activeTab === 'performance' ? ' ra-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          자동화 성과
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      {activeTab === 'influencers' && (
        <div className="ra-table-wrap">
          {/* 액션 바 */}
          <div className="ra-detail-action-bar">
            <Flex style={{ gap: 8, alignItems: 'center' }}>
              {selectedIds.size > 0 && (
                <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-3)' }}>
                  {selectedIds.size}명 선택됨
                </Typo>
              )}
            </Flex>
            <Flex style={{ gap: 8, alignItems: 'center' }}>
              {selectedIds.size > 0 && (
                <CoreButton
                  buttonType="contrast"
                  size="sm"
                  prefix={<IconTrashOutline size={14} />}
                  text="삭제"
                  onClick={() => setShowDeleteModal(true)}
                />
              )}
              <CoreButton
                buttonType="contrast"
                size="sm"
                prefix={<IconAddOutline size={14} />}
                text="인플루언서 추가"
                onClick={() => setShowAddModal(true)}
              />
            </Flex>
          </div>

          {/* 인플루언서 테이블 */}
          <div className="ra-table-container">
            <table className="ra-table">
              <colgroup>
                <col style={{ width: 40 }} />
                <col style={{ width: 200 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 200 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === MOCK_INFLUENCERS.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>인플루언서</th>
                  <th>이름</th>
                  <th>팔로워</th>
                  <th>가이드 상태</th>
                  <th>가이드 링크</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INFLUENCERS.map(inf => {
                  const statusInfo = GUIDE_STATUS_MAP[inf.guideStatus]
                  return (
                    <tr key={inf.id} className="ra-tr">
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(inf.id)}
                          onChange={() => toggleSelect(inf.id)}
                        />
                      </td>
                      <td>
                        <Flex style={{ alignItems: 'center', gap: 8 }}>
                          <CoreAvatar shape="circle" size="sm" text={inf.handle[1].toUpperCase()} />
                          <span style={{ fontSize: 13, color: '#242424', fontWeight: 500 }}>{inf.handle}</span>
                        </Flex>
                      </td>
                      <td>{inf.name}</td>
                      <td>{inf.followers}</td>
                      <td>
                        <CoreStatusBadge
                          status={statusInfo.badge}
                          type="outline"
                          size="sm"
                          leadingElement={{ dot: true }}
                          text={statusInfo.label}
                        />
                      </td>
                      <td>
                        {inf.guideLink ? (
                          <Flex style={{ alignItems: 'center', gap: 4 }}>
                            <span className="ra-link-text">{inf.guideLink}</span>
                            <CoreButton
                              buttonType="contrast"
                              size="xs"
                              prefix={<IconLinkOutline size={12} />}
                              text={copiedId === inf.id ? '복사됨' : '복사'}
                              onClick={() => handleCopyLink(inf.id, inf.guideLink!)}
                            />
                          </Flex>
                        ) : (
                          <span style={{ color: '#BBBBBB' }}>-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="ra-page-bottom">
            <CoreSelect defaultValue="50" size="sm" width={120}>
              <CoreSelect.Item value="10">10 / page</CoreSelect.Item>
              <CoreSelect.Item value="20">20 / page</CoreSelect.Item>
              <CoreSelect.Item value="50">50 / page</CoreSelect.Item>
              <CoreSelect.Item value="100">100 / page</CoreSelect.Item>
            </CoreSelect>
            <CorePagination totalPage={1} activePage={page} onPageChange={setPage} showMoveGroupIcon={false} />
            <Flex style={{ alignItems: 'center', gap: 8 }}>
              <div style={{ width: 120 }}>
                <CoreTextInput placeholder="페이지 입력" size="md" />
              </div>
              <CoreButton buttonType="contrast" size="sm" text="이동" />
            </Flex>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="ra-table-wrap">
          {/* 액션 바 */}
          <div className="ra-detail-action-bar">
            <div />
            <CoreButton
              buttonType="contrast"
              size="sm"
              prefix={<IconDownloadOutline size={14} />}
              text="엑셀 다운로드"
            />
          </div>

          {/* 성과 테이블 */}
          <div className="ra-table-container">
            <table className="ra-table ra-perf-table ra-sticky-first">
              <colgroup>
                <col style={{ width: 180 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 70 }} />
                <col style={{ width: 70 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 70 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 100 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>인플루언서 계정</th>
                  <th>좋아요</th>
                  <th>댓글</th>
                  <th>저장</th>
                  <th>리포스트</th>
                  <th>공유</th>
                  <th>수신 인원</th>
                  <th>클릭 인원</th>
                  <th>CTR</th>
                  <th>팔로우 전환 인원</th>
                  <th>팔로우 전환율</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PERFORMANCE.map(row => {
                  const isExpanded = expandedRows.has(row.id)
                  return (
                    <Fragment key={row.id}>
                      <tr className="ra-tr ra-perf-row" onClick={() => toggleExpand(row.id)}>
                        <td>
                          <Flex style={{ alignItems: 'center', gap: 8 }}>
                            <CoreAvatar shape="circle" size="sm" text={row.handle[1].toUpperCase()} />
                            <span style={{ fontSize: 13, color: '#242424', fontWeight: 500 }}>{row.handle}</span>
                          </Flex>
                        </td>
                        <td>{row.likes.toLocaleString()}</td>
                        <td>{row.comments.toLocaleString()}</td>
                        <td>{row.saves.toLocaleString()}</td>
                        <td>{row.reposts.toLocaleString()}</td>
                        <td>{row.shares.toLocaleString()}</td>
                        <td>{row.uniqueRecipients.toLocaleString()}</td>
                        <td>{row.uniqueClicks.toLocaleString()}</td>
                        <td>{calcCtr(row.uniqueClicks, row.uniqueRecipients)}</td>
                        <td>{row.followConversions.toLocaleString()}</td>
                        <td>{calcCtr(row.followConversions, row.uniqueRecipients)}</td>
                      </tr>

                      {/* 버튼별 성과 서브 테이블 */}
                      {isExpanded && (
                        <tr className="ra-perf-sub-row">
                          <td colSpan={11}>
                            <div className="ra-sub-table-wrap">
                              <table className="ra-sub-table">
                                <thead>
                                  <tr>
                                    <th>No</th>
                                    <th>버튼명</th>
                                    <th>URL</th>
                                    <th>클릭 인원</th>
                                    <th>총 클릭 횟수</th>
                                    <th>CTR</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {row.buttons.map(btn => (
                                    <tr key={btn.slot}>
                                      <td>{btn.slot}</td>
                                      <td>{btn.buttonName}</td>
                                      <td>
                                        <span className="ra-link-text">{btn.url}</span>
                                      </td>
                                      <td>{btn.uniqueClicks.toLocaleString()}</td>
                                      <td>{btn.totalClicks.toLocaleString()}</td>
                                      <td>{calcCtr(btn.uniqueClicks, row.uniqueRecipients)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── US-P0-03: 사용 가이드 안내 모달 ── */}
      {showGuideModal && <GuideModal onClose={handleDismissGuide} />}

      {/* ── US-P0-04: 인플루언서 추가 모달 ── */}
      {showAddModal && (
        <CoreModal
          size="md"
          title="인플루언서 추가"
          handleClose={() => { setShowAddModal(false); setAddHandle('') }}
          hasCloseButton
          isBgClose
          actionsChildren={[
            <CoreButton key="cancel" buttonType="contrast" size="md" text="취소" onClick={() => { setShowAddModal(false); setAddHandle('') }} />,
            <CoreButton key="add" buttonType="primary" size="md" text="추가" disabled={!addHandle.trim()} />,
          ]}
        >
          <VStack style={{ gap: 16 }}>
            <CoreTextInput
              label="인스타그램 핸들"
              required
              placeholder="@username"
              size="md"
              value={addHandle}
              onChange={(e) => setAddHandle(e.target.value)}
              helperText="인플루언서의 인스타그램 핸들을 입력하세요"
            />
          </VStack>
        </CoreModal>
      )}

      {/* ── US-P0-04: 인플루언서 삭제 확인 모달 ── */}
      {showDeleteModal && (
        <CoreModal
          size="sm"
          title="인플루언서 삭제"
          status="danger"
          handleClose={() => setShowDeleteModal(false)}
          hasCloseButton
          isBgClose
          actionsChildren={[
            <CoreButton key="cancel" buttonType="contrast" size="md" text="취소" onClick={() => setShowDeleteModal(false)} />,
            <CoreButton key="delete" buttonType="primary" size="md" text="삭제" onClick={() => { setSelectedIds(new Set()); setShowDeleteModal(false) }} />,
          ]}
        >
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-3)' }}>
            선택한 {selectedIds.size}명의 인플루언서를 삭제하시겠습니까?
          </Typo>
        </CoreModal>
      )}
    </div>
  )
}

/* ── 사용 가이드 안내 모달 컴포넌트 (US-P0-03) ── */
function GuideModal({ onClose }: { onClose: (dontShowAgain: boolean) => void }) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  return (
    <CoreModal
      size="md"
      title="반응 자동화 사용 가이드"
      handleClose={() => onClose(dontShowAgain)}
      hasCloseButton
      isBgClose
      actionsChildren={[
        <CoreButton key="ok" buttonType="primary" size="md" text="확인" onClick={() => onClose(dontShowAgain)} />,
      ]}
    >
      <VStack style={{ gap: 16 }}>
        <Box className="ra-guide-image">
          <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-4)', textAlign: 'center' }}>
            반응 자동화 기능 소개 이미지
          </Typo>
        </Box>

        <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-2)' }}>
          반응 자동화를 통해 인플루언서에게 DM 자동 답장 가이드를 전달하고 성과를 추적할 수 있습니다.
        </Typo>

        <HStack style={{ gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            id="ra-dont-show"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <label htmlFor="ra-dont-show">
            <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-3)', cursor: 'pointer' }}>
              다시 보지 않기
            </Typo>
          </label>
        </HStack>
      </VStack>
    </CoreModal>
  )
}
