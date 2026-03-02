import './Dashboard.css'
import { CoreButton, CoreAvatar, CoreAvatarGroup } from '@featuring-corp/components'
import {
  IconInstagramColored,
  IconAddOutline,
  IconHelpOutline,
  IconSearchAiOutline,
  IconAiSymbolFilled,
} from '@featuring-corp/icons'

// ==================== 타입 ====================

type ListupStatus = 'active' | 'urgent' | 'waiting'

interface ListupCardData {
  title: string
  status: 'active' | 'urgent'
  requester: string
  newCount: number
  totalCount: number
  dayCount: number
  buttonLabel: string
  isPrimary: boolean
}

// ==================== 데이터 ====================

const LISTUP_CARDS: ListupCardData[] = [
  {
    title: '20대 여성 스킨케어 체험 리스트업',
    status: 'active',
    requester: '요청인 : Sini',
    newCount: 19,
    totalCount: 39,
    dayCount: 5,
    buttonLabel: '그룹 바로가기',
    isPrimary: false,
  },
  {
    title: '스포츠 용품 홍보용 헬스 인플루언서',
    status: 'urgent',
    requester: '요청인 : Sini',
    newCount: 20,
    totalCount: 124,
    dayCount: 7,
    buttonLabel: '인플루언서 선정하기',
    isPrimary: true,
  },
]

const STAT_BOXES = [
  { label: '총 리스트업 요청 건수', value: '15회' },
  { label: '총 리스트업된 인플루언서 수', value: '402명', sub: '어제보다 +48' },
  { label: '평균 리스트업 진행 일수', value: '7일' },
]

const AVATAR_COLORS = ['A', 'B', 'C', 'D']

// ==================== 서브 컴포넌트 ====================

function StatusBadge({ status }: { status: ListupStatus }) {
  const config: Record<ListupStatus, { className: string; label: string }> = {
    active: { className: 'status-badge--primary', label: '진행 중' },
    urgent: { className: 'status-badge--orange', label: '종료 임박' },
    waiting: { className: 'status-badge--gray', label: '진행 대기' },
  }
  const { className, label } = config[status]

  return (
    <div className={`status-badge ${className}`}>
      <span className="status-badge-dot" />
      <span className="status-badge-text">{label}</span>
    </div>
  )
}

function ListupCard({ card }: { card: ListupCardData }) {
  return (
    <div className="listup-card">
      {/* 상단: 플랫폼 + 타이틀 + 뱃지 */}
      <div className="listup-card-top">
        <div className="listup-card-sns-icon">
          <IconInstagramColored size={24} />
        </div>
        <div className="listup-card-info">
          <div className="listup-card-title-row">
            <span className="listup-card-title">{card.title}</span>
            <StatusBadge status={card.status} />
          </div>
          <span className="listup-card-requester">{card.requester}</span>
        </div>
      </div>

      {/* 중단: 통계 */}
      <div className="listup-card-stats-section">
        <span className="listup-card-stats-label">AI가 리스트업한 인플루언서 수</span>
        <div className="listup-card-stats-row">
          <div className="listup-card-stat-item">
            <span className="listup-card-stat-value listup-card-stat-value--new">+{card.newCount}</span>
            <div className="listup-card-stat-sublabel">오늘</div>
          </div>
          <div className="listup-card-stat-item">
            <span className="listup-card-stat-value">{card.totalCount}</span>
            <div className="listup-card-stat-sublabel">
              누적
              <IconHelpOutline size={12} color="#bbbbbb" />
            </div>
          </div>
          <div className="listup-card-stat-divider">
            <div className="listup-card-stat-divider-line" />
          </div>
          <div className="listup-card-stat-item">
            <span className="listup-card-stat-value">{card.dayCount}</span>
            <div className="listup-card-stat-sublabel">
              진행 일수
              <IconHelpOutline size={12} color="#bbbbbb" />
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 아바타 + 버튼 */}
      <div className="listup-card-bottom">
        <div className="listup-card-divider" />
        <div className="listup-card-bottom-row">
          <CoreAvatarGroup max={4} total={5}>
            {AVATAR_COLORS.map((text) => (
              <CoreAvatar key={text} shape="circle" size="xs" text={text} />
            ))}
          </CoreAvatarGroup>
          {card.isPrimary ? (
            <CoreButton
              buttonType="primary"
              size="sm"
              prefix={<IconAddOutline size={14} />}
              text={card.buttonLabel}
            />
          ) : (
            <CoreButton
              buttonType="contrast"
              size="sm"
              text={card.buttonLabel}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyListupCard() {
  return (
    <div className="listup-card listup-card--empty">
      <div className="listup-card-empty-header">
        <StatusBadge status="waiting" />
      </div>
      <div className="listup-card-empty-body">
        <div className="listup-card-empty-icon">
          <IconSearchAiOutline size={20} color="#bbbbbb" />
        </div>
        <div className="listup-card-empty-text">
          <span className="listup-card-empty-title">진행 중인 리스트업이 없습니다.</span>
          <span className="listup-card-empty-desc">
            {'지금 AI에게 리스트업을 요청하고\n매일 손쉽게 인플루언서를 추천 받아 보세요.'}
          </span>
        </div>
        <div className="listup-card-empty-buttons">
          <CoreButton buttonType="tertiary" size="sm" text="새 리스트업 요청" />
          <CoreButton
            buttonType="contrast"
            size="sm"
            prefix={<IconAddOutline size={14} />}
            text="새 리스트업 시작"
          />
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat-box">
      <div className="stat-box-label-row">
        <span className="stat-box-label-text">{label}</span>
        <IconHelpOutline size={16} color="#bbbbbb" />
      </div>
      <div className="stat-box-value-row">
        <span className="stat-box-value">{value}</span>
        {sub && <span className="stat-box-sub">{sub}</span>}
      </div>
    </div>
  )
}

// ==================== 메인 컴포넌트 ====================

export default function Dashboard() {
  return (
    <div className="dashboard-wrapper">
      <div className="ai-listup-dashboard">
        {/* 타이틀 섹션 */}
        <div className="dashboard-title-section">
          <span className="dashboard-label">AI 프리 리스트업</span>
          <span className="dashboard-title">안녕하세요. Tina님</span>
          <div className="dashboard-notify-banner">
            <div className="dashboard-notify-icon">
              <IconAiSymbolFilled size={20} />
            </div>
            <span className="dashboard-notify-text">
              종료 임박한 리스트업이 있어요! 인플루언서를 선정하면 계속 찾아드릴 수 있어요.
            </span>
          </div>
        </div>

        {/* 리스트업 카드 영역 */}
        <div className="listup-cards-area">
          {LISTUP_CARDS.map((card) => (
            <ListupCard key={card.title} card={card} />
          ))}
          <EmptyListupCard />
        </div>

        {/* 누적 현황 */}
        <div className="dashboard-stats-section">
          <span className="dashboard-stats-title">AI 프리 리스트업 누적 현황</span>
          <div className="stat-boxes">
            {STAT_BOXES.map((stat) => (
              <StatBox key={stat.label} label={stat.label} value={stat.value} sub={stat.sub} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
