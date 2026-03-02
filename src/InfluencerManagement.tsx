import './InfluencerManagement.css'
import { useState, useMemo } from 'react'
import { Flex, CoreButton, CorePagination, CoreSelect, CoreTextInput, CoreAvatar } from '@featuring-corp/components'
import {
  IconInstagramColored,
  IconYoutubeColored,
  IconTiktokColored,
  IconXColored,
  IconSearchOutline,
  IconGroupListOutline,
  IconColumnOutline,
  IconDownloadOutline,
  IconSettingsOutline,
  IconArrowsVerticalOutline,
  IconArrowUpOutline,
  IconArrowDownOutline,
  IconAttachmentOutline,
} from '@featuring-corp/icons'

type ProgressStatus = '진행 전' | '진행 중' | '완료' | '보류' | null

interface Influencer {
  id: number
  name: string
  subname: string
  platform: 'instagram' | 'youtube' | 'tiktok' | 'x'
  email: string
  notes: string
  expectedPrice: string
  progress: ProgressStatus
  accountLink: string
  hasDocument: boolean
  hasFile: boolean
  categories: string[]
  followerCount: string
  er: string
  expectedReach: string
  avgFeedLikes: string
  avgVideoViews: string
  avgVideoLikes: string
  expectedCpr: string
  expectedAdFee: string
  language: string
}

const PROGRESS_STYLE: Record<NonNullable<ProgressStatus>, { color: string; bg: string; border: string }> = {
  '진행 전': { color: '#424242', bg: '#f6f6f6', border: '#e0e0e0' },
  '진행 중': { color: '#1f1551', bg: '#ecefff', border: '#dce2ff' },
  '완료':   { color: '#194731', bg: '#ebf6f1', border: '#a5d7bf' },
  '보류':   { color: '#5e3200', bg: '#fcf2e6', border: '#f5d5b0' },
}

const INFLUENCERS: Influencer[] = [
  {
    id: 1, name: 'TheAcacia_Hyurin', subname: '코알라 혀린',
    platform: 'instagram', email: '', notes: '미입력',
    expectedPrice: '900,000', progress: '진행 중',
    accountLink: 'www.instagram.com/theacacia_hyurin',
    hasDocument: false, hasFile: false,
    categories: ['뷰티', '패션'], followerCount: '9,204만',
    er: '10%', expectedReach: '920,400', avgFeedLikes: '92,040',
    avgVideoViews: '184,080', avgVideoLikes: '18,408',
    expectedCpr: '10,000', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 2, name: 'tteokbokkiyum', subname: '떡볶이욤',
    platform: 'instagram', email: 'tteok@example.com', notes: '미입력',
    expectedPrice: '900,000', progress: '진행 전',
    accountLink: 'www.instagram.com/tteokbokkiyum',
    hasDocument: true, hasFile: false,
    categories: ['음식', '일상'], followerCount: '3,580만',
    er: '8.5%', expectedReach: '304,300', avgFeedLikes: '30,430',
    avgVideoViews: '71,600', avgVideoLikes: '7,160',
    expectedCpr: '12,000', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 3, name: 'guchou4', subname: '구초우',
    platform: 'instagram', email: '', notes: '미입력',
    expectedPrice: '900,000', progress: null,
    accountLink: 'www.instagram.com/guchou4',
    hasDocument: false, hasFile: false,
    categories: ['여행', '음식'], followerCount: '2,100만',
    er: '6.2%', expectedReach: '130,200', avgFeedLikes: '13,020',
    avgVideoViews: '42,000', avgVideoLikes: '4,200',
    expectedCpr: '15,000', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 4, name: 'pbaerk11', subname: '박이레',
    platform: 'youtube', email: 'pbaerk@example.com', notes: '미입력',
    expectedPrice: '900,000', progress: '진행 전',
    accountLink: 'www.youtube.com/@pbaerk11',
    hasDocument: false, hasFile: true,
    categories: ['IT/테크', '리뷰'], followerCount: '1,850만',
    er: '5.7%', expectedReach: '105,450', avgFeedLikes: '10,545',
    avgVideoViews: '370,000', avgVideoLikes: '37,000',
    expectedCpr: '18,000', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 5, name: 'abb_revi', subname: '에비리뷰',
    platform: 'instagram', email: '', notes: '미입력',
    expectedPrice: '900,000', progress: '완료',
    accountLink: 'www.instagram.com/abb_revi',
    hasDocument: false, hasFile: false,
    categories: ['뷰티', '스킨케어'], followerCount: '1,340만',
    er: '9.1%', expectedReach: '121,940', avgFeedLikes: '12,194',
    avgVideoViews: '26,800', avgVideoLikes: '2,680',
    expectedCpr: '9,000', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 6, name: 'kisscityme', subname: '키스시티미',
    platform: 'instagram', email: 'kisscity@example.com', notes: '미입력',
    expectedPrice: '900,000', progress: '보류',
    accountLink: 'www.instagram.com/kisscityme',
    hasDocument: true, hasFile: false,
    categories: ['패션', '라이프스타일'], followerCount: '980만',
    er: '7.3%', expectedReach: '71,540', avgFeedLikes: '7,154',
    avgVideoViews: '19,600', avgVideoLikes: '1,960',
    expectedCpr: '11,000', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 7, name: 'ctolook', subname: '씨투룩',
    platform: 'instagram', email: '', notes: '미입력',
    expectedPrice: '900,000', progress: '진행 중',
    accountLink: 'www.instagram.com/ctolook',
    hasDocument: false, hasFile: false,
    categories: ['패션', '뷰티'], followerCount: '780만',
    er: '11.2%', expectedReach: '87,360', avgFeedLikes: '8,736',
    avgVideoViews: '15,600', avgVideoLikes: '1,560',
    expectedCpr: '8,500', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 8, name: 'deobeauty', subname: '디오뷰티',
    platform: 'youtube', email: 'deo@example.com', notes: '미입력',
    expectedPrice: '900,000', progress: null,
    accountLink: 'www.youtube.com/@deobeauty',
    hasDocument: false, hasFile: true,
    categories: ['뷰티', '메이크업'], followerCount: '640만',
    er: '6.8%', expectedReach: '43,520', avgFeedLikes: '4,352',
    avgVideoViews: '128,000', avgVideoLikes: '12,800',
    expectedCpr: '14,000', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 9, name: 'upstagramc', subname: '업스타그램씨',
    platform: 'instagram', email: '', notes: '미입력',
    expectedPrice: '900,000', progress: '진행 전',
    accountLink: 'www.instagram.com/upstagramc',
    hasDocument: false, hasFile: false,
    categories: ['요리', '홈/리빙'], followerCount: '520만',
    er: '8.0%', expectedReach: '41,600', avgFeedLikes: '4,160',
    avgVideoViews: '10,400', avgVideoLikes: '1,040',
    expectedCpr: '13,000', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 10, name: 'split_sg7', subname: '스플릿에스지',
    platform: 'instagram', email: 'split@example.com', notes: '미입력',
    expectedPrice: '900,000', progress: '완료',
    accountLink: 'www.instagram.com/split_sg7',
    hasDocument: true, hasFile: false,
    categories: ['게임', 'IT/테크'], followerCount: '380만',
    er: '4.5%', expectedReach: '17,100', avgFeedLikes: '1,710',
    avgVideoViews: '76,000', avgVideoLikes: '7,600',
    expectedCpr: '20,000', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 11, name: 'starjelly_kr', subname: '스타젤리',
    platform: 'tiktok', email: '', notes: '미입력',
    expectedPrice: '900,000', progress: '진행 중',
    accountLink: 'www.tiktok.com/@starjelly_kr',
    hasDocument: false, hasFile: false,
    categories: ['댄스', '일상'], followerCount: '290만',
    er: '12.4%', expectedReach: '35,960', avgFeedLikes: '3,596',
    avgVideoViews: '58,000', avgVideoLikes: '5,800',
    expectedCpr: '7,500', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 12, name: 'dailylook_kr', subname: '데일리룩케이알',
    platform: 'instagram', email: 'daily@example.com', notes: '미입력',
    expectedPrice: '900,000', progress: '보류',
    accountLink: 'www.instagram.com/dailylook_kr',
    hasDocument: false, hasFile: false,
    categories: ['패션', 'OOTD'], followerCount: '210만',
    er: '7.8%', expectedReach: '16,380', avgFeedLikes: '1,638',
    avgVideoViews: '4,200', avgVideoLikes: '420',
    expectedCpr: '11,500', expectedAdFee: '미지정', language: '한국어',
  },
  {
    id: 13, name: 'beauty.yun', subname: '뷰티윤',
    platform: 'instagram', email: '', notes: '미입력',
    expectedPrice: '900,000', progress: null,
    accountLink: 'www.instagram.com/beauty.yun',
    hasDocument: false, hasFile: false,
    categories: ['뷰티', '스킨케어'], followerCount: '170만',
    er: '9.6%', expectedReach: '16,320', avgFeedLikes: '1,632',
    avgVideoViews: '3,400', avgVideoLikes: '340',
    expectedCpr: '9,500', expectedAdFee: '미지정', language: '한국어',
  },
]

/* ── 정렬 ── */
type SortKey = 'name' | 'email' | 'expectedPrice' | 'progress' | 'followerCount' |
  'er' | 'expectedReach' | 'avgFeedLikes' | 'avgVideoViews' | 'avgVideoLikes' |
  'expectedCpr' | 'language'

const NUMERIC_KEYS: ReadonlySet<SortKey> = new Set([
  'expectedPrice', 'followerCount', 'er', 'expectedReach',
  'avgFeedLikes', 'avgVideoViews', 'avgVideoLikes', 'expectedCpr',
])

function parseNumeric(val: string): number {
  if (val.includes('만')) return parseFloat(val.replace(/[,만]/g, '')) * 10000
  if (val.endsWith('%')) return parseFloat(val.slice(0, -1))
  const n = parseFloat(val.replace(/,/g, ''))
  return isNaN(n) ? 0 : n
}

function compareInfluencers(a: Influencer, b: Influencer, key: SortKey, dir: 'asc' | 'desc'): number {
  const EMPTY = ['미지정', '미입력', '']
  const aRaw = a[key] ?? ''
  const bRaw = b[key] ?? ''
  const aStr = String(aRaw)
  const bStr = String(bRaw)
  const aEmpty = !aRaw || EMPTY.includes(aStr)
  const bEmpty = !bRaw || EMPTY.includes(bStr)
  if (aEmpty && bEmpty) return 0
  if (aEmpty) return 1   // null always last
  if (bEmpty) return -1
  const sign = dir === 'asc' ? 1 : -1
  if (NUMERIC_KEYS.has(key)) return sign * (parseNumeric(aStr) - parseNumeric(bStr))
  return sign * aStr.localeCompare(bStr, 'ko')
}

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey | null; dir: 'asc' | 'desc' }) {
  if (sortKey !== col) return <IconArrowsVerticalOutline size={11} color="#d2d2d2" />
  return dir === 'asc'
    ? <IconArrowUpOutline size={11} color="#5e51ff" />
    : <IconArrowDownOutline size={11} color="#5e51ff" />
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  instagram: IconInstagramColored,
  youtube:   IconYoutubeColored,
  tiktok:    IconTiktokColored,
  x:         IconXColored,
}

export default function InfluencerManagement() {
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedInfluencers = useMemo(() => {
    if (!sortKey) return INFLUENCERS
    return [...INFLUENCERS].sort((a, b) => compareInfluencers(a, b, sortKey, sortDir))
  }, [sortKey, sortDir])

  return (
    <div className="im-page">

      {/* ── 상단 바 ── */}
      <div className="im-topbar">
        <span className="im-topbar-title">인플루언서 관리</span>
      </div>

      {/* ── 로컬 헤더 ── */}
      <div className="im-local-header">
        <Flex style={{ alignItems: 'center', gap: 12 }}>
          <Flex style={{ alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <IconGroupListOutline size={14} color="#707070" />
            <span className="im-lh-group-label">그룹 목록</span>
          </Flex>
          <div className="im-lh-divider" />
          <span className="im-lh-title">인플루언서 관리</span>
          <div className="im-platform-filter">
            <button className="im-pf-btn im-pf-btn--active">
              <IconInstagramColored size={16} />
            </button>
            <button className="im-pf-btn im-pf-btn--active">
              <IconYoutubeColored size={16} />
            </button>
            <button className="im-pf-btn">
              <IconTiktokColored size={16} />
            </button>
            <button className="im-pf-btn">
              <IconXColored size={16} />
            </button>
          </div>
          <Flex style={{ alignItems: 'baseline', gap: 4 }}>
            <span className="im-lh-count">총 100명</span>
            <span className="im-lh-count-sub">/ 500명</span>
          </Flex>
        </Flex>
        <Flex style={{ alignItems: 'center', gap: 8 }}>
          <CoreButton
            buttonType="contrast"
            size="sm"
            prefix={<IconColumnOutline size={14} />}
            text="컬럼 설정"
          />
          <CoreButton
            buttonType="contrast"
            size="sm"
            prefix={<IconSettingsOutline size={14} />}
            text="민감 데이터 설정"
          />
          <CoreButton
            buttonType="contrast"
            size="sm"
            prefix={<IconArrowsVerticalOutline size={14} />}
            text="인플루언서 대량 추가"
          />
          <CoreButton
            buttonType="contrast"
            size="sm"
            prefix={<IconDownloadOutline size={14} />}
            text="엑셀 다운로드"
          />
        </Flex>
      </div>

      {/* ── 테이블 영역 ── */}
      <div className="im-table-wrap">

        {/* 필터 행 */}
        <div className="im-filter-row">
          <CoreButton buttonType="contrast" size="sm" text="필터" />
          <CoreTextInput
            placeholder="인플루언서명, 계정 검색"
            size="md"
            leadingElement={<IconSearchOutline size={14} />}
            style={{ width: 260 }}
          />
        </div>

        {/* 테이블 */}
        <div className="im-table-container">
          <table className="im-table">
            <colgroup>
              <col className="im-col-check" />
              <col className="im-col-account" />
              <col className="im-col-email" />
              <col className="im-col-notes" />
              <col className="im-col-price" />
              <col className="im-col-progress" />
              <col className="im-col-link" />
              <col className="im-col-doc" />
              <col className="im-col-file" />
              <col className="im-col-cat" />
              <col className="im-col-follower" />
              <col className="im-col-er" />
              <col className="im-col-reach" />
              <col className="im-col-feed" />
              <col className="im-col-vview" />
              <col className="im-col-vlike" />
              <col className="im-col-cpr" />
              <col className="im-col-adfee" />
              <col className="im-col-lang" />
            </colgroup>
            <thead>
              <tr>
                <th className="im-th-check"></th>
                <th className="im-th-sort" onClick={() => handleSort('name')}>
                  계정 <SortIcon col="name" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className="im-th-sort" onClick={() => handleSort('email')}>
                  이메일 <SortIcon col="email" sortKey={sortKey} dir={sortDir} />
                </th>
                <th>참고사항</th>
                <th className="im-th-sort" onClick={() => handleSort('expectedPrice')}>
                  예상 단가 <SortIcon col="expectedPrice" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className="im-th-sort" onClick={() => handleSort('progress')}>
                  진행 여부 <SortIcon col="progress" sortKey={sortKey} dir={sortDir} />
                </th>
                <th>계정 링크</th>
                <th>문서</th>
                <th>파일첨부</th>
                <th>카테고리</th>
                <th className="im-th-sort" onClick={() => handleSort('followerCount')}>
                  팔로워 수 <SortIcon col="followerCount" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className="im-th-sort" onClick={() => handleSort('er')}>
                  ER <SortIcon col="er" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className="im-th-sort" onClick={() => handleSort('expectedReach')}>
                  예상 평균 도달 수 <SortIcon col="expectedReach" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className="im-th-sort" onClick={() => handleSort('avgFeedLikes')}>
                  평균 피드 좋아요 수 <SortIcon col="avgFeedLikes" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className="im-th-sort" onClick={() => handleSort('avgVideoViews')}>
                  평균 동영상 조회 수 <SortIcon col="avgVideoViews" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className="im-th-sort" onClick={() => handleSort('avgVideoLikes')}>
                  평균 동영상 좋아요 수 <SortIcon col="avgVideoLikes" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className="im-th-sort" onClick={() => handleSort('expectedCpr')}>
                  예상 CPR <SortIcon col="expectedCpr" sortKey={sortKey} dir={sortDir} />
                </th>
                <th>예상 광고비</th>
                <th className="im-th-sort" onClick={() => handleSort('language')}>
                  사용 언어 <SortIcon col="language" sortKey={sortKey} dir={sortDir} />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedInfluencers.map((inf) => {
                const PlatformIcon = PLATFORM_ICONS[inf.platform]
                const progressStyle = inf.progress ? PROGRESS_STYLE[inf.progress] : null

                return (
                  <tr key={inf.id} className="im-tr">

                    {/* 체크박스 */}
                    <td className="im-td-check">
                      <input type="checkbox" className="im-checkbox" />
                    </td>

                    {/* 계정 */}
                    <td className="im-td-account">
                      <Flex style={{ alignItems: 'center', gap: 8 }}>
                        <CoreAvatar shape="circle" size="sm" text={inf.name[0]} />
                        <div className="im-account-info">
                          <div className="im-account-name">{inf.name}</div>
                          <Flex style={{ alignItems: 'center', gap: 4 }}>
                            <PlatformIcon size={12} />
                            <span className="im-account-sub">{inf.subname}</span>
                          </Flex>
                        </div>
                      </Flex>
                    </td>

                    {/* 이메일 */}
                    <td>
                      <span className={inf.email ? 'im-cell-text' : 'im-cell-empty'}>
                        {inf.email || '미입력'}
                      </span>
                    </td>

                    {/* 참고사항 */}
                    <td>
                      <span className="im-cell-empty">미입력</span>
                    </td>

                    {/* 예상 단가 */}
                    <td>
                      <span className="im-cell-number">{inf.expectedPrice}</span>
                    </td>

                    {/* 진행 여부 */}
                    <td>
                      {progressStyle ? (
                        <span
                          className="im-progress-badge"
                          style={{ color: progressStyle.color, background: progressStyle.bg, borderColor: progressStyle.border }}
                        >
                          <span
                            className="im-progress-dot"
                            style={{ background: progressStyle.color }}
                          />
                          {inf.progress}
                        </span>
                      ) : (
                        <span className="im-cell-empty">미지정</span>
                      )}
                    </td>

                    {/* 계정 링크 */}
                    <td>
                      <span className="im-cell-link">{inf.accountLink}</span>
                    </td>

                    {/* 문서 */}
                    <td className="im-td-center">
                      {inf.hasDocument
                        ? <IconAttachmentOutline size={14} color="#5e51ff" />
                        : <span className="im-cell-empty">-</span>
                      }
                    </td>

                    {/* 파일첨부 */}
                    <td className="im-td-center">
                      {inf.hasFile
                        ? <IconAttachmentOutline size={14} color="#5e51ff" />
                        : <span className="im-cell-empty">-</span>
                      }
                    </td>

                    {/* 카테고리 */}
                    <td>
                      <Flex style={{ gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        {inf.categories.slice(0, 2).map((cat, ci) => (
                          <span key={ci} className="im-cat-tag">{cat}</span>
                        ))}
                      </Flex>
                    </td>

                    {/* 팔로워 수 */}
                    <td>
                      <span className="im-cell-number">{inf.followerCount}</span>
                    </td>

                    {/* ER */}
                    <td>
                      <span className="im-cell-number">{inf.er}</span>
                    </td>

                    {/* 예상 평균 도달 수 */}
                    <td>
                      <span className="im-cell-number">{inf.expectedReach}</span>
                    </td>

                    {/* 평균 피드 좋아요 수 */}
                    <td>
                      <span className="im-cell-number">{inf.avgFeedLikes}</span>
                    </td>

                    {/* 평균 동영상 조회 수 */}
                    <td>
                      <span className="im-cell-number">{inf.avgVideoViews}</span>
                    </td>

                    {/* 평균 동영상 좋아요 수 */}
                    <td>
                      <span className="im-cell-number">{inf.avgVideoLikes}</span>
                    </td>

                    {/* 예상 CPR */}
                    <td>
                      <span className="im-cell-number">{inf.expectedCpr}</span>
                    </td>

                    {/* 예상 광고비 */}
                    <td>
                      <span className="im-cell-empty">{inf.expectedAdFee}</span>
                    </td>

                    {/* 사용 언어 */}
                    <td>
                      <span className="im-cell-text">{inf.language}</span>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 페이지 하단 */}
        <div className="im-page-bottom">
          <CoreSelect defaultValue="50" size="sm" width={120}>
            <CoreSelect.Item value="10">10 / page</CoreSelect.Item>
            <CoreSelect.Item value="20">20 / page</CoreSelect.Item>
            <CoreSelect.Item value="50">50 / page</CoreSelect.Item>
            <CoreSelect.Item value="100">100 / page</CoreSelect.Item>
          </CoreSelect>
          <CorePagination totalPage={3} activePage={page} onPageChange={setPage} showMoveGroupIcon={false} />
          <Flex style={{ alignItems: 'center', gap: 8 }}>
            <div style={{ width: 120 }}>
              <CoreTextInput placeholder="페이지 입력" size="md" />
            </div>
            <CoreButton buttonType="contrast" size="sm" text="이동" />
          </Flex>
        </div>

      </div>
    </div>
  )
}
