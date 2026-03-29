import './ScheduleCalculator.css'
import { useState, useCallback, useRef } from 'react'
import { Flex, VStack, Typo, CoreButton, CoreTag, CoreSelect, CoreTextInput, CoreStatusBadge } from '@featuring-corp/components'
import {
  IconSearchAiOutline,
  IconAiSymbolFilled,
  IconInstagramColored,
  IconYoutubeColored,
  IconNotificationOutline,
} from '@featuring-corp/icons'

/* ── 타입 정의 ── */
type CampaignType = '유가' | '무가' | '시딩' | '복합'

interface SchedulePhase {
  name: string
  startDate: string
  endDate: string
  daysFromUpload: number
  duration: number
  color: string
}

interface ChannelSchedule {
  channel: 'instagram' | 'youtube'
  label: string
  phases: SchedulePhase[]
}

interface Deadline {
  date: string
  phase: string
  channel: string
}

/* ── 상수 ── */
const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
  { value: '유가', label: '유가' },
  { value: '무가', label: '무가' },
  { value: '시딩', label: '시딩' },
  { value: '복합', label: '복합' },
]

const AI_MESSAGES = [
  '업로드 마감일 기준 역산 시작...',
  '채널별 리드타임 계산 중...',
  '배송 소요일 반영 중...',
  '인원 규모에 따른 버퍼 조정 중...',
  '일정 산출 완료',
]

const PHASE_COLORS: Record<string, string> = {
  '리스트업': '#6366f1',
  '섭외': '#8b5cf6',
  '확정': '#a78bfa',
  '배송': '#f59e0b',
  '가이드': '#14b8a6',
  '초안': '#06b6d4',
  '검수': '#3b82f6',
  '브랜드검수': '#2563eb',
  '수정': '#ec4899',
  '버퍼': '#94a3b8',
  '업로드': '#ef4444',
}

/* ── Mock 결과: 5/1 업로드 기준 역산 ── */
const MOCK_INSTA_SCHEDULE: SchedulePhase[] = [
  { name: '리스트업', startDate: '03.10', endDate: '03.14', daysFromUpload: -52, duration: 5, color: PHASE_COLORS['리스트업'] },
  { name: '섭외', startDate: '03.15', endDate: '03.21', daysFromUpload: -47, duration: 7, color: PHASE_COLORS['섭외'] },
  { name: '확정', startDate: '03.22', endDate: '03.24', daysFromUpload: -40, duration: 3, color: PHASE_COLORS['확정'] },
  { name: '배송', startDate: '03.25', endDate: '03.28', daysFromUpload: -37, duration: 4, color: PHASE_COLORS['배송'] },
  { name: '가이드', startDate: '03.29', endDate: '03.31', daysFromUpload: -33, duration: 3, color: PHASE_COLORS['가이드'] },
  { name: '초안', startDate: '04.01', endDate: '04.10', daysFromUpload: -30, duration: 10, color: PHASE_COLORS['초안'] },
  { name: '검수', startDate: '04.11', endDate: '04.14', daysFromUpload: -20, duration: 4, color: PHASE_COLORS['검수'] },
  { name: '브랜드검수', startDate: '04.15', endDate: '04.18', daysFromUpload: -16, duration: 4, color: PHASE_COLORS['브랜드검수'] },
  { name: '수정', startDate: '04.19', endDate: '04.23', daysFromUpload: -12, duration: 5, color: PHASE_COLORS['수정'] },
  { name: '버퍼', startDate: '04.24', endDate: '04.28', daysFromUpload: -7, duration: 5, color: PHASE_COLORS['버퍼'] },
  { name: '업로드', startDate: '04.29', endDate: '05.01', daysFromUpload: -2, duration: 3, color: PHASE_COLORS['업로드'] },
]

const MOCK_YOUTUBE_SCHEDULE: SchedulePhase[] = [
  { name: '리스트업', startDate: '03.01', endDate: '03.05', daysFromUpload: -61, duration: 5, color: PHASE_COLORS['리스트업'] },
  { name: '섭외', startDate: '03.06', endDate: '03.14', daysFromUpload: -56, duration: 9, color: PHASE_COLORS['섭외'] },
  { name: '확정', startDate: '03.15', endDate: '03.18', daysFromUpload: -47, duration: 4, color: PHASE_COLORS['확정'] },
  { name: '배송', startDate: '03.19', endDate: '03.22', daysFromUpload: -43, duration: 4, color: PHASE_COLORS['배송'] },
  { name: '가이드', startDate: '03.23', endDate: '03.26', daysFromUpload: -39, duration: 4, color: PHASE_COLORS['가이드'] },
  { name: '초안', startDate: '03.27', endDate: '04.08', daysFromUpload: -35, duration: 13, color: PHASE_COLORS['초안'] },
  { name: '검수', startDate: '04.09', endDate: '04.13', daysFromUpload: -22, duration: 5, color: PHASE_COLORS['검수'] },
  { name: '브랜드검수', startDate: '04.14', endDate: '04.18', daysFromUpload: -17, duration: 5, color: PHASE_COLORS['브랜드검수'] },
  { name: '수정', startDate: '04.19', endDate: '04.24', daysFromUpload: -12, duration: 6, color: PHASE_COLORS['수정'] },
  { name: '버퍼', startDate: '04.25', endDate: '04.28', daysFromUpload: -6, duration: 4, color: PHASE_COLORS['버퍼'] },
  { name: '업로드', startDate: '04.29', endDate: '05.01', daysFromUpload: -2, duration: 3, color: PHASE_COLORS['업로드'] },
]

const MOCK_CHANNELS: ChannelSchedule[] = [
  { channel: 'instagram', label: '인스타그램', phases: MOCK_INSTA_SCHEDULE },
  { channel: 'youtube', label: '유튜브', phases: MOCK_YOUTUBE_SCHEDULE },
]

const MOCK_DEADLINES: Deadline[] = [
  { date: '03.01', phase: '유튜브 리스트업 시작', channel: 'youtube' },
  { date: '03.10', phase: '인스타 리스트업 시작', channel: 'instagram' },
  { date: '03.15', phase: '인스타 섭외 시작 / 유튜브 확정', channel: 'both' },
  { date: '03.25', phase: '인스타 배송 시작', channel: 'instagram' },
  { date: '04.01', phase: '인스타 초안 마감 시작', channel: 'instagram' },
  { date: '04.15', phase: '브랜드 검수 시작', channel: 'both' },
  { date: '04.24', phase: '수정 마감', channel: 'both' },
  { date: '04.29', phase: '업로드 시작', channel: 'both' },
  { date: '05.01', phase: '업로드 마감', channel: 'both' },
]

const WARNINGS = [
  '유튜브는 인스타보다 10일 먼저 시작 필요 (영상 제작 리드타임 고려)',
  '복합 캠페인 시 채널 간 업로드일은 동일하게 설정 권장',
  '배송이 필요한 경우 확정 후 최소 4일 배송 리드타임 확보 필요',
  '브랜드 검수 기간은 주말/공휴일 제외 기준 최소 3영업일 권장',
]

/* ── 서브 컴포넌트: 타임라인 바 차트 ── */
function TimelineChart({ schedules }: { schedules: ChannelSchedule[] }) {
  const totalDays = 62 // 03.01 ~ 05.01

  return (
    <div className="sc-timeline">
      {/* 날짜 헤더 */}
      <div className="sc-timeline-header">
        <div className="sc-timeline-label" />
        <div className="sc-timeline-dates">
          {['3월', '3월 중순', '4월', '4월 중순', '5월'].map((d, i) => (
            <Typo key={i} variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{d}</Typo>
          ))}
        </div>
      </div>

      {schedules.map(schedule => (
        <div key={schedule.channel} className="sc-timeline-row">
          <div className="sc-timeline-label">
            <Flex style={{ alignItems: 'center', gap: 6 }}>
              {schedule.channel === 'instagram' ? <IconInstagramColored size={16} /> : <IconYoutubeColored size={16} />}
              <Typo variant="$caption-1" style={{ fontWeight: 600 }}>{schedule.label}</Typo>
            </Flex>
          </div>
          <div className="sc-timeline-track">
            {schedule.phases.map((phase, i) => {
              const startOffset = Math.abs(phase.daysFromUpload + totalDays)
              const leftPercent = (startOffset / totalDays) * 100
              const widthPercent = (phase.duration / totalDays) * 100
              return (
                <div
                  key={i}
                  className="sc-timeline-block"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    background: phase.color,
                  }}
                  title={`${phase.name}: ${phase.startDate} ~ ${phase.endDate}`}
                >
                  <Typo variant="$caption-2" style={{ color: '#fff', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {phase.name}
                  </Typo>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* 범례 */}
      <div className="sc-timeline-legend">
        {Object.entries(PHASE_COLORS).map(([name, color]) => (
          <Flex key={name} style={{ alignItems: 'center', gap: 4 }}>
            <div className="sc-legend-dot" style={{ background: color }} />
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>{name}</Typo>
          </Flex>
        ))}
      </div>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function ScheduleCalculator() {
  const [uploadDate, setUploadDate] = useState('2026-05-01')
  const [, setCampaignType] = useState<string>('')
  const [instaCount, setInstaCount] = useState('10')
  const [youtubeCount, setYoutubeCount] = useState('5')
  const [needDelivery, setNeedDelivery] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiSteps, setAiSteps] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }, [])

  const runCalculation = useCallback(() => {
    clearTimers()
    setIsAnalyzing(true)
    setShowResults(false)
    setAiSteps([])

    AI_MESSAGES.forEach((msg, i) => {
      const timer = setTimeout(() => {
        setAiSteps(prev => [...prev, msg])
        if (i === AI_MESSAGES.length - 1) {
          setIsAnalyzing(false)
          setShowResults(true)
        }
      }, (i + 1) * 700)
      timersRef.current.push(timer)
    })
  }, [clearTimers])

  return (
    <div className="sc-page">

      {/* ── 상단 헤더 ── */}
      <div className="sc-topbar">
        <Flex style={{ alignItems: 'center', gap: 12 }}>
          <Typo variant="$heading-4" style={{ fontWeight: 700 }}>캠페인 일정 산출</Typo>
          <CoreTag tagType="primary" size="xs">AI</CoreTag>
        </Flex>
      </div>

      {/* ── 입력 폼 ── */}
      <div className="sc-form">
        <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 16 }}>캠페인 정보 입력</Typo>

        <div className="sc-form-grid">
          {/* 업로드일 */}
          <div className="sc-form-field">
            <Typo variant="$caption-1" style={{ fontWeight: 600, marginBottom: 6 }}>업로드 마감일</Typo>
            <CoreTextInput
              size="md"
              placeholder="YYYY-MM-DD"
              value={uploadDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadDate(e.target.value)}
            />
          </div>

          {/* 캠페인 유형 */}
          <div className="sc-form-field">
            <Typo variant="$caption-1" style={{ fontWeight: 600, marginBottom: 6 }}>캠페인 유형</Typo>
            <CoreSelect size="sm" placeholderText="유형 선택" setValue={(v: string) => setCampaignType(v)}>
              {CAMPAIGN_TYPES.map(t => (
                <CoreSelect.Item key={t.value} value={t.value}>{t.label}</CoreSelect.Item>
              ))}
            </CoreSelect>
          </div>

          {/* 인스타 인원 */}
          <div className="sc-form-field">
            <Typo variant="$caption-1" style={{ fontWeight: 600, marginBottom: 6 }}>
              <Flex style={{ alignItems: 'center', gap: 4 }}>
                <IconInstagramColored size={14} />
                인스타그램 인원
              </Flex>
            </Typo>
            <CoreTextInput
              size="md"
              placeholder="인원수"
              value={instaCount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstaCount(e.target.value)}
            />
          </div>

          {/* 유튜브 인원 */}
          <div className="sc-form-field">
            <Typo variant="$caption-1" style={{ fontWeight: 600, marginBottom: 6 }}>
              <Flex style={{ alignItems: 'center', gap: 4 }}>
                <IconYoutubeColored size={14} />
                유튜브 인원
              </Flex>
            </Typo>
            <CoreTextInput
              size="md"
              placeholder="인원수"
              value={youtubeCount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYoutubeCount(e.target.value)}
            />
          </div>
        </div>

        {/* 배송 토글 */}
        <Flex style={{ alignItems: 'center', gap: 12, marginTop: 16 }}>
          <Typo variant="$caption-1" style={{ fontWeight: 600 }}>배송 필요 여부</Typo>
          <div
            className={`sc-toggle ${needDelivery ? 'sc-toggle--on' : ''}`}
            onClick={() => setNeedDelivery(!needDelivery)}
          >
            <div className="sc-toggle-thumb" />
          </div>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
            {needDelivery ? '배송 필요' : '배송 불필요'}
          </Typo>
        </Flex>

        {/* 산출 버튼 */}
        <div style={{ marginTop: 20 }}>
          <CoreButton
            buttonType="primary"
            size="md"
            prefix={<IconSearchAiOutline size={14} />}
            text="일정 산출"
            onClick={runCalculation}
          />
        </div>
      </div>

      {/* ── AI 분석 로그 ── */}
      {aiSteps.length > 0 && (
        <div className="sc-ai-panel">
          <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <IconAiSymbolFilled size={20} />
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>AI 일정 산출</Typo>
          </Flex>
          <VStack style={{ gap: 8 }}>
            {aiSteps.map((step, i) => (
              <Flex key={i} style={{ alignItems: 'center', gap: 8 }}>
                <div className={`sc-ai-dot ${i === aiSteps.length - 1 && isAnalyzing ? 'sc-ai-dot--pulse' : ''}`} />
                <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>{step}</Typo>
              </Flex>
            ))}
            {isAnalyzing && (
              <div className="sc-ai-typing">
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>산출 중</Typo>
                <span className="sc-typing-dots" />
              </div>
            )}
          </VStack>
        </div>
      )}

      {/* ── 결과 영역 ── */}
      {showResults && (
        <>
          {/* 타임라인 차트 */}
          <div className="sc-result-section">
            <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 16 }}>채널별 타임라인</Typo>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)', marginBottom: 12 }}>
              업로드 마감: 05.01 기준 역산 결과 (인스타 {instaCount}명, 유튜브 {youtubeCount}명)
            </Typo>
            <TimelineChart schedules={MOCK_CHANNELS} />
          </div>

          {/* 단계별 마감일 리스트 */}
          <div className="sc-deadline-section">
            <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 16 }}>주요 마감일</Typo>
            <div className="sc-deadline-list">
              {MOCK_DEADLINES.map((d, i) => (
                <Flex key={i} className="sc-deadline-item" style={{ alignItems: 'center', gap: 12 }}>
                  <div className="sc-deadline-date">
                    <Typo variant="$caption-1" style={{ fontWeight: 600, color: 'var(--global-colors-primary-60)' }}>{d.date}</Typo>
                  </div>
                  <div className="sc-deadline-dot" />
                  <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)' }}>{d.phase}</Typo>
                  {d.channel !== 'both' && (
                    <CoreTag tagType={d.channel === 'instagram' ? 'magenta' : 'red'} size="xs">
                      {d.channel === 'instagram' ? 'IG' : 'YT'}
                    </CoreTag>
                  )}
                </Flex>
              ))}
            </div>
          </div>

          {/* 주의사항 */}
          <div className="sc-warnings">
            <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <IconNotificationOutline size={18} />
              <Typo variant="$body-2" style={{ fontWeight: 600 }}>주의사항</Typo>
            </Flex>
            <VStack style={{ gap: 8 }}>
              {WARNINGS.map((w, i) => (
                <Flex key={i} style={{ alignItems: 'flex-start', gap: 8 }}>
                  <CoreStatusBadge status="warning" text="!" size="sm" type="subtle" />
                  <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', lineHeight: '1.5' }}>{w}</Typo>
                </Flex>
              ))}
            </VStack>
          </div>
        </>
      )}
    </div>
  )
}
