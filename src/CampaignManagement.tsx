import './CampaignManagement.css'
import { useState } from 'react'
import { Flex, CoreButton, CoreTag, CorePagination, CoreSelect, CoreTextInput, CoreStatusBadge, CoreAvatar } from '@featuring-corp/components'
import {
  IconCaretDownFilled,
  IconSearchOutline,
  IconInstagramColored,
  IconYoutubeColored,
  IconTiktokColored,
  IconReelsColored,
  IconShortsColored,
  IconXColored,
  IconMoreHorizontalFilled,
  IconUserOutline,
  IconDataOutline,
  IconAssignmentOutline,
  IconAddOutline,
} from '@featuring-corp/icons'

/* ── 상태별 스타일 ── */
type StatusKey = '진행 전' | '진행 중' | '보류' | '종료'
type BadgeStatus = 'default' | 'informative' | 'error' | 'warning' | 'success' | 'primary'

const STATUS_BADGE: Record<StatusKey, BadgeStatus> = {
  '진행 전': 'default',
  '진행 중': 'primary',
  '보류':    'warning',
  '종료':    'informative',
}

/* ── 통계 데이터 ── */
const STATS: { label: string; value: string; suffix: string | null; badgeStatus: BadgeStatus | null }[] = [
  { label: '이번 달 생성 캠페인 수', value: '5', suffix: '/10 개', badgeStatus: null },
  { label: '진행 전',  value: '1 건', suffix: null, badgeStatus: 'default' },
  { label: '진행 중',  value: '1 건', suffix: null, badgeStatus: 'primary' },
  { label: '보류',     value: '0 건', suffix: null, badgeStatus: 'warning' },
  { label: '종료',     value: '2 건', suffix: null, badgeStatus: 'informative' },
]

/* ── 캠페인 타입 ── */
type TagType = 'primary' | 'gray' | 'red' | 'orange' | 'lightGreen' | 'teal' | 'blue' | 'indigo' | 'magenta' | 'contrast'

interface Campaign {
  title: string
  desc: string
  influencerCount: number
  status: StatusKey
  tags: { label: string; type: TagType }[]
  period: string
  type: string
  typeTag: TagType | null
  brand: string
  secondaryUse: string
  platforms: string[]
  uploadRate: string
  adFee: string
  categories: string[]
  manager: string
  managerExtra?: number
}

const CAMPAIGNS: Campaign[] = [
  {
    title: '26.03 다이슨 에어랩 멀티 스타일러 캠페인',
    desc: '새학기 헤어 스타일링 꿀팁 및 똥손 탈출 웨이브 가이드',
    influencerCount: 100,
    status: '진행 전',
    tags: [{ label: 'Sponsored Content', type: 'magenta' }, { label: 'Ambassadors', type: 'teal' }],
    period: '26. 02. 01 ~ 26. 03. 01',
    type: '오프라인/방문', typeTag: 'indigo',
    brand: 'dyson', secondaryUse: '6',
    platforms: ['instagram', 'reels', 'youtube', 'shorts', 'x', 'tiktok'],
    uploadRate: '0/200 (0%)', adFee: '100,000,000',
    categories: ['뷰티', '패션', '일상'],
    manager: 'Rosie', managerExtra: 2,
  },
  {
    title: '26.01 미닉스더플렌더 캠페인',
    desc: '미닉스더플렌더 신규 제품 홍보를 위한 인플루언서 캠페인',
    influencerCount: 100,
    status: '진행 중',
    tags: [{ label: 'Engagement', type: 'blue' }, { label: 'Reach', type: 'teal' }, { label: 'UGC', type: 'teal' }],
    period: '25. 12. 25 ~ 26. 01. 26',
    type: '유가 시딩', typeTag: 'indigo',
    brand: '미닉스', secondaryUse: '3',
    platforms: ['instagram', 'reels', 'tiktok'],
    uploadRate: '30/100 (30%)', adFee: '100,000,000',
    categories: ['홈/리빙', '취미', '일상'],
    manager: 'Rosie',
  },
  {
    title: '25.10 베베바이옴 안티에이징 세럼 캠페인',
    desc: '-',
    influencerCount: 0,
    status: '진행 전',
    tags: [],
    period: '-',
    type: '-', typeTag: null,
    brand: '-', secondaryUse: '-',
    platforms: [],
    uploadRate: '-', adFee: '-',
    categories: [],
    manager: '-',
  },
  {
    title: '25.10 성수 팝업 방문 캠페인',
    desc: '10월 연말 성수동 오프라인 팝업 행사 방문형',
    influencerCount: 100,
    status: '종료',
    tags: [{ label: 'KOLs', type: 'teal' }, { label: 'Ambassadors', type: 'teal' }],
    period: '25. 12. 01 ~ 26. 01. 01',
    type: '어필리에이트', typeTag: 'indigo',
    brand: 'FIG', secondaryUse: '3',
    platforms: ['instagram', 'youtube', 'tiktok', 'x'],
    uploadRate: '100/100 (100%)', adFee: '100,000,000',
    categories: ['IT/테크', '게임', '사진/영상'],
    manager: 'Rosie',
  },
  {
    title: '25.09 겨울 패딩 스타일링',
    desc: 'Y2K 무드 숏패딩 코디 제안, 데일리룩 OOTD 인증 캠페인',
    influencerCount: 100,
    status: '종료',
    tags: [{ label: 'KOLs', type: 'teal' }, { label: 'Ambassadors', type: 'teal' }],
    period: '25. 12. 01 ~ 26. 01. 01',
    type: '어필리에이트', typeTag: 'indigo',
    brand: '노스페이스', secondaryUse: '3',
    platforms: ['instagram', 'reels', 'youtube', 'tiktok'],
    uploadRate: '100/100 (100%)', adFee: '100,000,000',
    categories: ['여행/관광', '취미', 'F&B'],
    manager: 'Rosie',
  },
]

const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  instagram: IconInstagramColored,
  youtube:   IconYoutubeColored,
  tiktok:    IconTiktokColored,
  reels:     IconReelsColored,
  shorts:    IconShortsColored,
  x:         IconXColored,
}

const FILTERS = ['상태', '태그', '캠페인 유형', '콘텐츠 유형', '인플루언서 카테고리', '담당자']

export default function CampaignManagement() {
  const [page, setPage] = useState(1)

  return (
    <div className="cm-page">

      {/* ── 상단 헤더 바 ── */}
      <div className="cm-topbar">
        <span className="cm-topbar-title">캠페인 관리</span>
      </div>

      {/* ── 통계 바 ── */}
      <div className="cm-stats-bar">
        {STATS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div className="cm-stat-divider" />}
            <div className="cm-stat-item">
              <div>
                <div className="cm-stat-label">
                  {i === 0 && <IconAssignmentOutline size={16} color="#959595" />}
                  {s.badgeStatus
                    ? <CoreStatusBadge status={s.badgeStatus} type="subtle" size="sm" leadingElement={{ dot: true }} text={s.label} />
                    : <span>{s.label}</span>
                  }
                </div>
                <Flex style={{ alignItems: 'baseline', gap: 2 }}>
                  <span className="cm-stat-value">{s.value}</span>
                  {s.suffix && <span className="cm-stat-suffix">{s.suffix}</span>}
                </Flex>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 테이블 영역 ── */}
      <div className="cm-table-wrap">

        {/* 로컬 헤더 */}
        <div className="cm-local-header">

          {/* 필터 + 액션 통합 행 (Figma: 1행, 56px) */}
          <div className="cm-filter-row">
            <Flex style={{ gap: 6, alignItems: 'center' }}>
              {FILTERS.map(f => (
                <CoreSelect key={f} size="sm" placeholderText={f} />
              ))}
            </Flex>
            <Flex style={{ gap: 8, alignItems: 'center' }}>
              <CoreTextInput
                placeholder="캠페인명, 설명, 브랜드명 검색"
                size="md"
                leadingElement={<IconSearchOutline size={14} />}
              />
              <CoreButton buttonType="primary" size="md" prefix={<IconAddOutline size={14} />} text="새 캠페인 시작" />
            </Flex>
          </div>
        </div>

        {/* 테이블 */}
        <div className="cm-table-container">
          <table className="cm-table">
            <colgroup>
              <col className="cm-col-num" />
              <col className="cm-col-title" />
              <col className="cm-col-status" />
              <col className="cm-col-tag" />
              <col className="cm-col-period" />
              <col className="cm-col-type" />
              <col className="cm-col-brand" />
              <col className="cm-col-2nd" />
              <col className="cm-col-platform" />
              <col className="cm-col-upload" />
              <col className="cm-col-fee" />
              <col className="cm-col-cat" />
              <col className="cm-col-manager" />
            </colgroup>
            <thead>
              <tr>
                <th className="cm-th-check"></th>
                <th>캠페인명</th>
                <th>상태</th>
                <th>태그</th>
                <th>캠페인 기간</th>
                <th>캠페인 유형</th>
                <th>브랜드명</th>
                <th>2차 활용(개월)</th>
                <th>콘텐츠 유형</th>
                <th>콘텐츠 업로드율</th>
                <th>광고비</th>
                <th>인플루언서 카테고리</th>
                <th>담당자</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c, i) => {
                return (
                  <tr key={i} className="cm-tr">

                    {/* 번호 */}
                    <td className="cm-td-check">-</td>

                    {/* 캠페인명 */}
                    <td className="cm-td-title">
                      <div className="cm-title-inner">
                        <div className="cm-title-text-area">
                          <div className="cm-title-text">{c.title}</div>
                          <div className="cm-desc-text">{c.desc}</div>
                        </div>
                        <div className="cm-title-badges">
                          <IconDataOutline size={14} color="#707070" />
                          <div className="cm-count-badge">
                            <IconUserOutline size={12} color="#424242" />
                            <span>{c.influencerCount}</span>
                          </div>
                        </div>
                        <div className="cm-more-btn">
                          <IconMoreHorizontalFilled size={14} color="#707070" />
                        </div>
                      </div>
                    </td>

                    {/* 상태: CoreStatusBadge outline + caret */}
                    <td>
                      <CoreStatusBadge
                        status={STATUS_BADGE[c.status]}
                        type="outline"
                        size="sm"
                        leadingElement={{ dot: true }}
                        text={c.status}
                        trailingElement={<IconCaretDownFilled size={10} color="#707070" />}
                      />
                    </td>

                    {/* 태그 */}
                    <td>
                      <Flex style={{ gap: 4, flexWrap: 'wrap' }}>
                        {c.tags.map((t, ti) => (
                          <CoreTag key={ti} tagType={t.type} size="xs" text={t.label} />
                        ))}
                      </Flex>
                    </td>

                    {/* 캠페인 기간 */}
                    <td>{c.period}</td>

                    {/* 캠페인 유형 */}
                    <td>
                      {c.typeTag
                        ? <CoreTag tagType={c.typeTag} size="xs" text={c.type} />
                        : <span style={{ color: '#BBBBBB' }}>-</span>
                      }
                    </td>

                    {/* 브랜드명 */}
                    <td>{c.brand}</td>

                    {/* 2차 활용 */}
                    <td>{c.secondaryUse || '-'}</td>

                    {/* 콘텐츠 유형 (플랫폼 아이콘) */}
                    <td>
                      <Flex style={{ gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                        {c.platforms.length > 0
                          ? c.platforms.map(p => {
                              const Icon = PLATFORM_ICONS[p]
                              return Icon ? <Icon key={p} size={16} /> : null
                            })
                          : <span style={{ color: '#BBBBBB' }}>-</span>
                        }
                      </Flex>
                    </td>

                    {/* 콘텐츠 업로드율 */}
                    <td>{c.uploadRate || '-'}</td>

                    {/* 광고비 */}
                    <td>{c.adFee || '-'}</td>

                    {/* 인플루언서 카테고리 */}
                    <td>
                      <Flex style={{ gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        {c.categories.slice(0, 2).map((cat, ci) => (
                          <CoreTag key={ci} tagType="teal" size="xs" text={cat} />
                        ))}
                        {c.categories.length > 2 && (
                          <span style={{ fontSize: 11, color: '#707070', fontWeight: 500 }}>
                            +{c.categories.length - 2}
                          </span>
                        )}
                      </Flex>
                    </td>

                    {/* 담당자 */}
                    <td>
                      {c.manager !== '-' ? (
                        <Flex style={{ alignItems: 'center', gap: 4 }}>
                          <CoreAvatar shape="circle" size="xs" text={c.manager[0]} />
                          <span style={{ fontSize: 12, color: '#242424' }}>{c.manager}</span>
                          {c.managerExtra && (
                            <span style={{ fontSize: 11, color: '#707070', fontWeight: 500 }}>
                              +{c.managerExtra}
                            </span>
                          )}
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

        {/* 페이지 하단: Figma padding T32 R32 B16 L32 */}
        <div className="cm-page-bottom">
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
    </div>
  )
}
