import './RemindScheduler.css'
import { useState, useCallback, useRef } from 'react'
import { Flex, VStack, HStack, Typo, CoreButton, CoreTag, CoreSelect, CoreStatusBadge, CoreTabs, CoreTabItem } from '@featuring-corp/components'
import { IconAiSymbolFilled, IconCloseOutline, IconCalendarOutline, IconTimerOutline } from '@featuring-corp/icons'

/* ── 타입 정의 ── */
type ResponseStatus = '응답완료' | '미응답' | '진행중'

interface Influencer {
  id: number
  name: string
  handle: string
  currentStep: string
  deadline: string
  responseStatus: ResponseStatus
  remindCount: number
  nextRemind: string
  channel: string
  hasPattern: boolean
  patternNote?: string
  optimalTime?: string
  dmDrafts?: { type: string; content: string }[]
}

interface Campaign {
  id: string
  name: string
}

const STATUS_MAP: Record<ResponseStatus, 'success' | 'error' | 'primary'> = {
  '응답완료': 'success',
  '미응답': 'error',
  '진행중': 'primary',
}

/* ── 캠페인 옵션 ── */
const CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: '26.03 그린러브 비건 스킨케어 캠페인 C' },
  { id: 'c2', name: '26.02 다이슨 에어랩 캠페인' },
  { id: 'c3', name: '26.01 미닉스 블렌더 캠페인' },
]

/* ── 타임라인 단계 ── */
const TIMELINE_PHASES = [
  { id: 'outreach', label: '섭외 응답', day: 'D-7', color: 'var(--global-colors-primary-60)' },
  { id: 'draft', label: '초안 마감', day: 'D-3', color: 'var(--global-colors-teal-70)' },
  { id: 'upload', label: '업로드일', day: 'D-Day', color: 'var(--global-colors-magenta-40)' },
  { id: 'insight', label: '인사이트 수집', day: 'D+3', color: '#f59e0b' },
]

/* ── Mock 인플루언서 10명 ── */
const MOCK_INFLUENCERS: Influencer[] = [
  {
    id: 1, name: '뷰티지나', handle: '@beauty_jina', currentStep: '초안 마감', deadline: '2026-04-01',
    responseStatus: '미응답', remindCount: 2, nextRemind: '2026-03-30 10:00', channel: 'Instagram DM',
    hasPattern: true,
    patternNote: '과거 3회 캠페인 참여, 평균 응답 시간 6시간. 오전 10시-11시 응답률 85%. 마감 전 1회 리마인드 시 100% 제출.',
    optimalTime: '오전 10:00',
    dmDrafts: [
      { type: '기본', content: '안녕하세요 지나님! 그린러브 캠페인 초안 마감일이 4/1(화)인데요, 진행 상황이 궁금해서 연락드려요. 혹시 어려운 점 있으시면 편하게 말씀해주세요 :)' },
      { type: '가벼운', content: '지나님~ 초안 준비는 잘 되고 계신가요? 마감이 4/1이라 살짝 체크드려봐요! 화이팅 😊' },
      { type: '긴급', content: '지나님, 초안 마감이 내일(4/1)입니다! 제출이 어려우시면 미리 말씀해주시면 일정 조율 도와드릴게요. 확인 부탁드립니다!' },
    ],
  },
  {
    id: 2, name: '에코뷰티', handle: '@eco_beauty', currentStep: '섭외 응답', deadline: '2026-03-31',
    responseStatus: '응답완료', remindCount: 0, nextRemind: '-', channel: 'Instagram DM',
    hasPattern: true,
    patternNote: '과거 5회 참여, 섭외 DM 발송 후 평균 2시간 내 응답. 매우 적극적인 참여자.',
    optimalTime: '오후 2:00',
    dmDrafts: [
      { type: '기본', content: '에코뷰티님 안녕하세요! 섭외 관련 회신 감사합니다. 다음 단계 안내드릴게요!' },
    ],
  },
  {
    id: 3, name: '소연의하루', handle: '@daily_soyeon', currentStep: '초안 마감', deadline: '2026-04-01',
    responseStatus: '응답완료', remindCount: 1, nextRemind: '-', channel: 'Instagram DM',
    hasPattern: false, optimalTime: undefined, dmDrafts: undefined,
  },
  {
    id: 4, name: '지민스타일', handle: '@style_jimin', currentStep: '섭외 응답', deadline: '2026-03-31',
    responseStatus: '응답완료', remindCount: 0, nextRemind: '-', channel: 'Instagram DM',
    hasPattern: false,
  },
  {
    id: 5, name: '하늘뷰티', handle: '@sky_beauty', currentStep: '초안 마감', deadline: '2026-04-01',
    responseStatus: '미응답', remindCount: 3, nextRemind: '2026-03-30 14:00', channel: 'Instagram DM',
    hasPattern: false,
  },
  {
    id: 6, name: '민지룩', handle: '@minji_look', currentStep: '업로드일', deadline: '2026-04-03',
    responseStatus: '응답완료', remindCount: 1, nextRemind: '-', channel: 'Instagram DM',
    hasPattern: false,
  },
  {
    id: 7, name: '유라데일리', handle: '@yura_daily', currentStep: '섭외 응답', deadline: '2026-03-31',
    responseStatus: '미응답', remindCount: 2, nextRemind: '2026-03-30 11:00', channel: 'Instagram DM',
    hasPattern: false,
  },
  {
    id: 8, name: '채린뷰티', handle: '@chaerin_bty', currentStep: '초안 마감', deadline: '2026-04-01',
    responseStatus: '응답완료', remindCount: 0, nextRemind: '-', channel: 'Instagram DM',
    hasPattern: false,
  },
  {
    id: 9, name: '서아리빙', handle: '@seoa_living', currentStep: '인사이트 수집', deadline: '2026-04-06',
    responseStatus: '진행중', remindCount: 0, nextRemind: '2026-04-04 10:00', channel: 'Instagram DM',
    hasPattern: false,
  },
  {
    id: 10, name: '현지패션', handle: '@hyunji_fashion', currentStep: '섭외 응답', deadline: '2026-03-31',
    responseStatus: '응답완료', remindCount: 1, nextRemind: '-', channel: 'Instagram DM',
    hasPattern: false,
  },
]

const AI_STEPS = [
  '캠페인 일정을 분석하고 있습니다...',
  '인플루언서 과거 응답 패턴을 스캔 중입니다...',
  '최적 리마인드 타이밍을 계산하고 있습니다...',
  '리마인드 DM 초안을 생성하고 있습니다...',
  '10명의 리마인드 스케줄이 준비되었습니다!',
]

/* ── 서브 컴포넌트: AI 진행 패널 ── */
function AiProgressPanel({ steps, isLoading }: { steps: string[]; isLoading: boolean }) {
  return (
    <div className="rs-ai-panel">
      <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <IconAiSymbolFilled size={20} />
        <Typo variant="$body-2" style={{ fontWeight: 600 }}>AI 스케줄 분석</Typo>
      </Flex>
      <VStack style={{ gap: 10 }}>
        {steps.map((step, i) => (
          <Flex key={i} style={{ alignItems: 'flex-start', gap: 8 }}>
            <div className={`rs-ai-dot ${i === steps.length - 1 && isLoading ? 'rs-ai-dot--pulse' : ''}`} />
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>{step}</Typo>
          </Flex>
        ))}
        {isLoading && (
          <div className="rs-ai-typing">
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>분석 중</Typo>
            <span className="rs-typing-dots" />
          </div>
        )}
      </VStack>
    </div>
  )
}

/* ── 서브 컴포넌트: 타임라인 ── */
function TimelineView() {
  return (
    <div className="rs-timeline">
      <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 16 }}>리마인드 스케줄 타임라인</Typo>
      <div className="rs-timeline-track">
        {TIMELINE_PHASES.map((phase, i) => (
          <div key={phase.id} className="rs-timeline-phase">
            <div className="rs-timeline-node" style={{ background: phase.color }} />
            {i < TIMELINE_PHASES.length - 1 && <div className="rs-timeline-connector" />}
            <VStack style={{ gap: 2, marginTop: 8 }}>
              <Typo variant="$caption-1" style={{ fontWeight: 600, color: phase.color }}>{phase.label}</Typo>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{phase.day}</Typo>
            </VStack>
            {/* 리마인드 마커 */}
            <div className="rs-remind-markers">
              {i === 0 && (
                <>
                  <div className="rs-remind-marker" style={{ left: '30%' }}>
                    <Typo variant="$caption-2" style={{ fontSize: 10 }}>D-5</Typo>
                  </div>
                  <div className="rs-remind-marker" style={{ left: '70%' }}>
                    <Typo variant="$caption-2" style={{ fontSize: 10 }}>D-2</Typo>
                  </div>
                </>
              )}
              {i === 1 && (
                <div className="rs-remind-marker" style={{ left: '50%' }}>
                  <Typo variant="$caption-2" style={{ fontSize: 10 }}>D-1</Typo>
                </div>
              )}
              {i === 2 && (
                <div className="rs-remind-marker" style={{ left: '60%' }}>
                  <Typo variant="$caption-2" style={{ fontSize: 10 }}>D+1</Typo>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 서브 컴포넌트: 상세 패널 ── */
function DetailPanel({ inf, onClose }: { inf: Influencer; onClose: () => void }) {
  const [dmTab, setDmTab] = useState(0)

  return (
    <div className="rs-detail-panel">
      <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <HStack style={{ gap: 8, alignItems: 'center' }}>
          <Typo variant="$body-1" style={{ fontWeight: 600 }}>{inf.name}</Typo>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{inf.handle}</Typo>
        </HStack>
        <CoreButton buttonType="tertiary" size="sm" prefix={<IconCloseOutline size={14} />} onClick={onClose} />
      </Flex>

      <VStack style={{ gap: 16 }}>
        {/* 과거 응답 패턴 */}
        {inf.hasPattern && inf.patternNote && (
          <div className="rs-detail-card">
            <Flex style={{ alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <IconTimerOutline size={14} color="var(--global-colors-primary-60)" />
              <Typo variant="$caption-1" style={{ fontWeight: 600, color: 'var(--global-colors-primary-60)' }}>과거 응답 패턴 분석</Typo>
            </Flex>
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', lineHeight: 1.6 }}>{inf.patternNote}</Typo>
          </div>
        )}

        {/* 최적 리마인드 시간 */}
        {inf.optimalTime && (
          <div className="rs-detail-card rs-detail-optimal">
            <Flex style={{ alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <IconCalendarOutline size={14} color="var(--global-colors-teal-70)" />
              <Typo variant="$caption-1" style={{ fontWeight: 600, color: 'var(--global-colors-teal-70)' }}>최적 리마인드 시간</Typo>
            </Flex>
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>{inf.optimalTime}</Typo>
          </div>
        )}

        {/* 리마인드 DM 초안 */}
        {inf.dmDrafts && inf.dmDrafts.length > 0 && (
          <div className="rs-detail-dm">
            <Typo variant="$caption-1" style={{ fontWeight: 600, marginBottom: 8 }}>리마인드 DM 초안</Typo>
            <CoreTabs>
              {inf.dmDrafts.map((draft, i) => (
                <CoreTabItem key={i} size="sm" active={dmTab === i} onClick={() => setDmTab(i)}>
                  {draft.type}
                </CoreTabItem>
              ))}
            </CoreTabs>
            <div className="rs-dm-preview">
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {inf.dmDrafts[dmTab]?.content}
              </Typo>
            </div>
          </div>
        )}

        {/* 패턴 없음 */}
        {!inf.hasPattern && (
          <div className="rs-detail-card">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-5)' }}>
              과거 응답 패턴 데이터가 없습니다. 기본 리마인드 스케줄이 적용됩니다.
            </Typo>
          </div>
        )}
      </VStack>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function RemindScheduler() {
  const [, setSelectedCampaign] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiSteps, setAiSteps] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedInf, setSelectedInf] = useState<Influencer | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }, [])

  const handleCampaignSelect = useCallback((value: string) => {
    setSelectedCampaign(value)
    setSelectedInf(null)
    clearTimers()
    setIsLoading(true)
    setShowResults(false)
    setAiSteps([])

    AI_STEPS.forEach((msg, i) => {
      const timer = setTimeout(() => {
        setAiSteps(prev => [...prev, msg])
        if (i === AI_STEPS.length - 1) {
          setIsLoading(false)
          setShowResults(true)
        }
      }, (i + 1) * 600)
      timersRef.current.push(timer)
    })
  }, [clearTimers])

  const respondedCount = MOCK_INFLUENCERS.filter(i => i.responseStatus === '응답완료').length
  const noResponseCount = MOCK_INFLUENCERS.filter(i => i.responseStatus === '미응답').length
  const inProgressCount = MOCK_INFLUENCERS.filter(i => i.responseStatus === '진행중').length

  return (
    <div className="rs-page">
      {/* 상단 헤더 */}
      <div className="rs-topbar">
        <Flex style={{ alignItems: 'center', gap: 10 }}>
          <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>리마인드 타이밍 최적화</Typo>
          <CoreTag tagType="primary" size="xs">AI</CoreTag>
        </Flex>
      </div>

      {/* 캠페인 선택 */}
      <div className="rs-campaign-bar">
        <Flex style={{ alignItems: 'center', gap: 12 }}>
          <Typo variant="$body-2" style={{ fontWeight: 600, flexShrink: 0 }}>캠페인</Typo>
          <div style={{ width: 400 }}>
            <CoreSelect size="md" placeholderText="캠페인을 선택하세요" setValue={handleCampaignSelect}>
              {CAMPAIGNS.map(c => (
                <CoreSelect.Item key={c.id} value={c.id}>{c.name}</CoreSelect.Item>
              ))}
            </CoreSelect>
          </div>
        </Flex>
      </div>

      {/* AI 진행 상태 */}
      {(isLoading || aiSteps.length > 0) && (
        <div className="rs-ai-bar">
          <AiProgressPanel steps={aiSteps} isLoading={isLoading} />
        </div>
      )}

      {/* 초기 상태 */}
      {!showResults && !isLoading && aiSteps.length === 0 && (
        <div className="rs-empty">
          <IconAiSymbolFilled size={40} color="var(--semantic-color-text-5)" />
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)', marginTop: 12 }}>
            캠페인을 선택하면 리마인드 스케줄이 자동으로 생성됩니다
          </Typo>
        </div>
      )}

      {/* 결과 영역 */}
      {showResults && (
        <div className="rs-content">
          <div className="rs-main-area">
            {/* 상태 요약 */}
            <Flex className="rs-summary-bar" style={{ gap: 16, marginBottom: 20 }}>
              <div className="rs-summary-chip rs-chip-success">
                <Typo variant="$caption-1" style={{ fontWeight: 600 }}>응답완료 {respondedCount}명</Typo>
              </div>
              <div className="rs-summary-chip rs-chip-error">
                <Typo variant="$caption-1" style={{ fontWeight: 600 }}>미응답 {noResponseCount}명</Typo>
              </div>
              <div className="rs-summary-chip rs-chip-primary">
                <Typo variant="$caption-1" style={{ fontWeight: 600 }}>진행중 {inProgressCount}명</Typo>
              </div>
            </Flex>

            {/* 타임라인 */}
            <TimelineView />

            {/* 테이블 */}
            <div className="rs-table-wrap">
              <table className="rs-table">
                <thead>
                  <tr>
                    <th>인플루언서</th>
                    <th>현재 단계</th>
                    <th>마감일</th>
                    <th>응답 상태</th>
                    <th>리마인드 횟수</th>
                    <th>다음 리마인드</th>
                    <th>채널</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_INFLUENCERS.map(inf => (
                    <tr
                      key={inf.id}
                      className={`rs-tr ${selectedInf?.id === inf.id ? 'rs-tr--selected' : ''}`}
                      onClick={() => setSelectedInf(inf)}
                    >
                      <td>
                        <VStack style={{ gap: 2 }}>
                          <Flex style={{ alignItems: 'center', gap: 6 }}>
                            <Typo variant="$caption-1" style={{ fontWeight: 600 }}>{inf.name}</Typo>
                            {inf.hasPattern && <CoreTag tagType="teal" size="xs">패턴</CoreTag>}
                          </Flex>
                          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{inf.handle}</Typo>
                        </VStack>
                      </td>
                      <td>
                        <CoreTag tagType="gray" size="xs">{inf.currentStep}</CoreTag>
                      </td>
                      <td>
                        <Typo variant="$caption-1">{inf.deadline}</Typo>
                      </td>
                      <td>
                        <CoreStatusBadge
                          status={STATUS_MAP[inf.responseStatus]}
                          type="subtle"
                          size="sm"
                          text={inf.responseStatus}
                        />
                      </td>
                      <td>
                        <Typo variant="$caption-1">{inf.remindCount}회</Typo>
                      </td>
                      <td>
                        <Typo variant="$caption-1" style={{ color: inf.nextRemind === '-' ? 'var(--semantic-color-text-5)' : 'var(--semantic-color-text-1)' }}>
                          {inf.nextRemind}
                        </Typo>
                      </td>
                      <td>
                        <Typo variant="$caption-1">{inf.channel}</Typo>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 하단 요약 */}
            <div className="rs-bottom-summary">
              <Flex style={{ alignItems: 'center', gap: 8 }}>
                <IconAiSymbolFilled size={16} color="var(--global-colors-primary-60)" />
                <Typo variant="$caption-1" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600 }}>
                  총 리마인드 40건 자동 스케줄 완료. MD는 예외 케이스(3회 이상 미응답)만 직접 처리하면 됩니다.
                </Typo>
              </Flex>
            </div>
          </div>

          {/* 상세 패널 */}
          {selectedInf && (
            <DetailPanel inf={selectedInf} onClose={() => setSelectedInf(null)} />
          )}
        </div>
      )}
    </div>
  )
}
