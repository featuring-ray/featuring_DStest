import './ReactionAutomation.css'
import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Routes, Route, Link } from 'react-router-dom'
import { Flex, VStack, Typo, CoreButton, CoreSelect, CoreTextInput, CoreModal, CoreStatusBadge, CorePagination, CoreTabs, CoreTabItem, CoreTag, CoreCalendar, CoreDropdown } from '@featuring-corp/components'
import {
  IconSearchOutline,
  IconAddOutline,
  IconMoreHorizontalFilled,
  IconUserOutline,
  IconDocumentOutline,
  IconCaretDownFilled,
  IconCalendarOutline,
  IconChevronDownOutline,
} from '@featuring-corp/icons'
import ReactionAutomationDetail from './ReactionAutomationDetail'

/* ── 날짜 포맷 ── */
function formatDate(date: Date | null): string {
  if (!date) return ''
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}. ${mm}. ${dd}`
}

/* ── 상태별 스타일 ── */
type StatusKey = '진행 전' | '진행 중' | '종료'
type BadgeStatus = 'default' | 'informative' | 'error' | 'warning' | 'success' | 'primary'

const STATUS_BADGE: Record<StatusKey, BadgeStatus> = {
  '진행 전': 'default',
  '진행 중': 'primary',
  '종료':    'informative',
}

/* ── 자동화 타입 ── */
interface Automation {
  id: string
  name: string
  influencerCount: number
  status: StatusKey
  campaignName: string | null
  startDate: string | null
  endDate: string | null
  productName: string
  brandName: string
  contentUploaded: number
  contentTotal: number
}

/* ── Mock 데이터 ── */
const AUTOMATIONS: Automation[] = [
  {
    id: '1',
    name: '에어랩 캠페인',
    influencerCount: 264,
    status: '진행 전',
    campaignName: '26.03 다이슨 에어랩 멀티 스타일러 캠페인',
    startDate: '26. 02. 01',
    endDate: '26. 03. 01',
    productName: '다이슨',
    brandName: 'dyson',
    contentUploaded: 0,
    contentTotal: 200,
  },
  {
    id: '2',
    name: '미닉스 자동화',
    influencerCount: 144,
    status: '진행 중',
    campaignName: '26.01 미닉스더플렌더 캠페인',
    startDate: '25. 12. 25',
    endDate: '26. 01. 26',
    productName: '미닉스',
    brandName: '미닉스',
    contentUploaded: 30,
    contentTotal: 100,
  },
  {
    id: '3',
    name: '2026년 1월 성수 팝업 자동화',
    influencerCount: 200,
    status: '종료',
    campaignName: '25.10 성수 팝업 방문 캠페인',
    startDate: '26. 01. 01',
    endDate: '26. 01. 20',
    productName: '햇반',
    brandName: '햇반',
    contentUploaded: 100,
    contentTotal: 100,
  },
  {
    id: '4',
    name: '2025년 12월 성수 팝업 자동화',
    influencerCount: 164,
    status: '종료',
    campaignName: '25.10 성수 팝업 방문 캠페인',
    startDate: '25. 12. 01',
    endDate: '26. 01. 01',
    productName: 'CJ제일제당',
    brandName: '노스페이스',
    contentUploaded: 100,
    contentTotal: 100,
  },
]

/* ── 태그 컬러 (값 기반 결정론적 해시) ── */
type TagType = 'primary' | 'blue' | 'indigo' | 'teal' | 'lightGreen' | 'orange' | 'magenta' | 'red'

const TAG_COLORS: TagType[] = ['primary', 'blue', 'indigo', 'teal', 'lightGreen', 'orange', 'magenta', 'red']

function getTagColor(value: string): TagType {
  let h = 0
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0
  }
  return TAG_COLORS[h % TAG_COLORS.length]
}

/* ── 탭 ── */
type TabKey = '전체' | '진행 전' | '진행 중' | '종료'

const TABS: { key: TabKey; label: string }[] = [
  { key: '전체', label: '전체' },
  { key: '진행 전', label: '진행 전' },
  { key: '진행 중', label: '진행 중' },
  { key: '종료', label: '종료' },
]

/* ── 연결 캠페인 옵션 ── */
const CAMPAIGN_OPTIONS = [
  { value: 'c1', label: '26.03 다이슨 에어랩 멀티 스타일러 캠페인' },
  { value: 'c2', label: '26.01 미닉스더플렌더 캠페인' },
  { value: 'c3', label: '25.10 성수 팝업 방문 캠페인' },
]

export default function ReactionAutomation() {
  return (
    <Routes>
      <Route index element={<ReactionAutomationList />} />
      <Route path=":groupId" element={<ReactionAutomationDetail />} />
    </Routes>
  )
}

function ReactionAutomationList() {
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState<TabKey>('전체')
  const [showCreateModal, setShowCreateModal] = useState(false)

  /* ── 생성 폼 상태 ── */
  const [formName, setFormName] = useState('')
  const [, setFormCampaign] = useState('')
  const [formDateRange, setFormDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [pendingDateRange, setPendingDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [calendarOpen, setCalendarOpen] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)
  const [formProduct, setFormProduct] = useState('')
  const [formBrand, setFormBrand] = useState('')

  const isFormValid = formName.trim().length >= 1 && formName.length <= 20

  const openCalendar = () => {
    setPendingDateRange(formDateRange)
    setCalendarOpen(true)
  }

  const confirmDateRange = () => {
    setFormDateRange(pendingDateRange)
    setCalendarOpen(false)
  }

  const cancelDateRange = () => {
    setPendingDateRange(formDateRange)
    setCalendarOpen(false)
  }

  const resetForm = () => {
    setFormName('')
    setFormCampaign('')
    setFormDateRange([null, null])
    setPendingDateRange([null, null])
    setCalendarOpen(false)
    setFormProduct('')
    setFormBrand('')
  }

  const handleCreate = () => {
    if (!isFormValid) return
    setShowCreateModal(false)
    resetForm()
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    resetForm()
  }

  /* ── 탭 카운트 & 필터 ── */
  const tabCounts: Record<TabKey, number> = {
    '전체':   AUTOMATIONS.length,
    '진행 전': AUTOMATIONS.filter(a => a.status === '진행 전').length,
    '진행 중': AUTOMATIONS.filter(a => a.status === '진행 중').length,
    '종료':   AUTOMATIONS.filter(a => a.status === '종료').length,
  }

  const filtered = activeTab === '전체'
    ? AUTOMATIONS
    : AUTOMATIONS.filter(a => a.status === activeTab)

  return (
    <div className="ra-page">

      {/* ── 상단 헤더 바 ── */}
      <div className="ra-topbar">
        <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>반응 자동화 관리</Typo>
        <CoreButton
          buttonType="contrast"
          size="sm"
          prefix={<IconDocumentOutline size={14} />}
          text="반응 자동화 가이드"
        />
      </div>

      {/* ── 탭 바 ── */}
      <div className="ra-tabs-bar">
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
      </div>

      {/* ── 테이블 영역 ── */}
      <div className="ra-table-wrap">

        {/* 필터 행 */}
        <div className="ra-filter-row">
          <Flex style={{ gap: 6, alignItems: 'center' }}>
            <CoreSelect size="sm" placeholderText="상태" />
            <CoreSelect size="sm" placeholderText="태그" />
            <CoreSelect size="sm" placeholderText="연결 캠페인">
              {CAMPAIGN_OPTIONS.map(opt => (
                <CoreSelect.Item key={opt.value} value={opt.value}>{opt.label}</CoreSelect.Item>
              ))}
            </CoreSelect>
            <CoreSelect size="sm" placeholderText="인플루언서 카테고리" />
            <CoreSelect size="sm" placeholderText="담당자" />
          </Flex>
          <Flex style={{ gap: 8, alignItems: 'center' }}>
            <CoreTextInput
              placeholder="자동화명, 상품, 브랜드명 검색"
              size="md"
              leadingElement={<IconSearchOutline size={14} />}
            />
            <CoreButton
              buttonType="primary"
              size="md"
              prefix={<IconAddOutline size={14} />}
              text="새 자동화 관리"
              onClick={() => setShowCreateModal(true)}
            />
          </Flex>
        </div>

        {/* 테이블 */}
        <div className="ra-table-container">
          <table className="ra-table ra-sticky-first">
            <colgroup>
              <col className="ra-col-name" />
              <col className="ra-col-status" />
              <col className="ra-col-campaign" />
              <col className="ra-col-period" />
              <col className="ra-col-product" />
              <col className="ra-col-brand" />
              <col className="ra-col-upload" />
            </colgroup>
            <thead>
              <tr>
                <th>자동화명</th>
                <th>상태</th>
                <th>연결 캠페인</th>
                <th>캠페인 기간</th>
                <th>상품명</th>
                <th>브랜드명</th>
                <th>콘텐츠 업로드율</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const pct = a.contentTotal > 0
                  ? Math.round((a.contentUploaded / a.contentTotal) * 100)
                  : 0
                return (
                  <tr key={a.id} className="ra-tr">

                    {/* 자동화명 */}
                    <td className="ra-td-name">
                      <Flex style={{ alignItems: 'center', gap: 8 }}>
                        <Link className="ra-name-text" to={`/reaction-automation/${a.id}`}>{a.name}</Link>
                        <CoreTag
                          tagType="gray"
                          size="sm"
                          text={String(a.influencerCount)}
                          leadingElement={<IconUserOutline size={12} />}
                        />
                        <CoreButton buttonType="contrast" size="sm" prefix={<IconMoreHorizontalFilled size={16} />} />
                      </Flex>
                    </td>

                    {/* 상태 */}
                    <td>
                      <div className="ra-status-wrap">
                        <CoreStatusBadge
                          status={STATUS_BADGE[a.status]}
                          type="outline"
                          size="sm"
                          leadingElement={{ dot: true }}
                          trailingElement={<IconCaretDownFilled size={10} />}
                          text={a.status}
                        />
                      </div>
                    </td>

                    {/* 연결 캠페인 */}
                    <td>
                      {a.campaignName
                        ? <CoreTag tagType={getTagColor(a.campaignName)} size="sm" text={a.campaignName} hoverEffect maxWidth="100%" />
                        : <span style={{ color: '#BBBBBB' }}>-</span>
                      }
                    </td>

                    {/* 캠페인 기간 */}
                    <td>
                      {a.startDate && a.endDate
                        ? `${a.startDate} ~ ${a.endDate}`
                        : <span style={{ color: '#BBBBBB' }}>-</span>
                      }
                    </td>

                    {/* 상품명 */}
                    <td>
                      <CoreTag tagType={getTagColor(a.productName)} size="sm" text={a.productName} />
                    </td>

                    {/* 브랜드명 */}
                    <td>
                      <CoreTag tagType={getTagColor(a.brandName)} size="sm" text={a.brandName} />
                    </td>

                    {/* 콘텐츠 업로드율 */}
                    <td>{a.contentUploaded}/{a.contentTotal} ({pct}%)</td>

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

      {/* ── 자동화 생성 모달 ── */}
      {showCreateModal && createPortal(
        <CoreModal
          size="md"
          title="새 자동화 관리"
          handleClose={handleCloseModal}
          hasCloseButton
          isBgClose
          actionsChildren={[
            <CoreButton key="cancel" buttonType="contrast" size="md" text="취소" onClick={handleCloseModal} />,
            <CoreButton key="create" buttonType="primary" size="md" text="생성" onClick={handleCreate} disabled={!isFormValid} />,
          ]}
        >
          <VStack style={{ gap: 20 }}>
            <CoreTextInput
              label="자동화명"
              required
              placeholder="자동화명을 입력하세요 (최대 20자)"
              size="md"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              maxLength={20}
              status={formName.length > 20 ? 'error' : undefined}
              validationText={formName.length > 20 ? '최대 20자까지 입력 가능합니다' : undefined}
            />
            <div className="ra-form-field">
              <label className="ra-form-label">연결 캠페인</label>
              <CoreSelect size="md" placeholderText="캠페인을 선택하세요" setValue={setFormCampaign}>
                {CAMPAIGN_OPTIONS.map(opt => (
                  <CoreSelect.Item key={opt.value} value={opt.value}>{opt.label}</CoreSelect.Item>
                ))}
              </CoreSelect>
            </div>
            <div className="ra-form-field">
              <label className="ra-form-label">캠페인 기간</label>
              <div ref={datePickerRef}>
                <CoreTextInput
                  size="md"
                  placeholder="YYYY. MM. DD – YYYY. MM. DD"
                  readOnly
                  value={
                    formDateRange[0] && formDateRange[1]
                      ? `${formatDate(formDateRange[0])} – ${formatDate(formDateRange[1])}`
                      : ''
                  }
                  leadingElement={<IconCalendarOutline size={14} color="var(--semantic-color-icon-tertiary)" />}
                  trailingElement={<IconChevronDownOutline size={16} color="var(--semantic-color-icon-tertiary)" />}
                  inputDivClassName="ra-date-trigger-input"
                  onClick={openCalendar}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <CoreDropdown
                open={calendarOpen}
                handler={cancelDateRange}
                targetRef={datePickerRef}
                targetMargin="4px"
                placement="bottom-start"
                style={{ zIndex: 9999 }}
              >
                <CoreCalendar
                  selectsRange
                  monthsShown={2}
                  startDate={pendingDateRange[0] ?? undefined}
                  endDate={pendingDateRange[1] ?? undefined}
                  onChange={(dates) => setPendingDateRange(dates)}
                  actionsChildren={[
                    <CoreButton key="cancel" buttonType="contrast" size="sm" text="취소" onClick={cancelDateRange} />,
                    <CoreButton key="confirm" buttonType="primary" size="sm" text="확인" onClick={confirmDateRange} />,
                  ]}
                />
              </CoreDropdown>
            </div>
            <CoreTextInput
              label="상품명"
              placeholder="상품명을 입력하세요"
              size="md"
              value={formProduct}
              onChange={(e) => setFormProduct(e.target.value)}
            />
            <CoreTextInput
              label="브랜드명"
              placeholder="브랜드명을 입력하세요"
              size="md"
              value={formBrand}
              onChange={(e) => setFormBrand(e.target.value)}
            />
          </VStack>
        </CoreModal>,
        document.body
      )}
    </div>
  )
}
