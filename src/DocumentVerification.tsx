import './DocumentVerification.css'
import { useState, useCallback, useRef } from 'react'
import { Flex, VStack, Typo, CoreButton, CoreTag, CoreSelect, CoreStatusBadge } from '@featuring-corp/components'
import {
  IconSearchAiOutline,
  IconAiSymbolFilled,
  IconCloseOutline,
} from '@featuring-corp/icons'

/* ── 타입 정의 ── */
type VerifyStatus = 'Pass' | 'Error' | 'Missing'
type BadgeStatus = 'default' | 'informative' | 'error' | 'warning' | 'success' | 'primary'
type PipelineStep = '서류 분류' | '정보 추출' | '규칙 검증' | '크로스 체크' | '결과 처리'

interface Influencer {
  id: number
  name: string
  type: '개인' | '사업자'
  documents: string[]
  status: VerifyStatus
  errorDetail?: string
  dmMessage?: string
}

/* ── 상수 ── */
const PIPELINE_STEPS: PipelineStep[] = ['서류 분류', '정보 추출', '규칙 검증', '크로스 체크', '결과 처리']

const STATUS_BADGE_MAP: Record<VerifyStatus, BadgeStatus> = {
  Pass: 'success',
  Error: 'error',
  Missing: 'warning',
}

const CAMPAIGN_OPTIONS = [
  { id: '1', label: '26.03 다이슨 에어랩 멀티 스타일러 캠페인' },
  { id: '2', label: '26.01 미닉스더플렌더 캠페인' },
  { id: '3', label: '25.10 성수 팝업 방문 캠페인' },
]

const AI_MESSAGES = [
  '서류 분류 중... 10건 스캔 완료',
  '정보 추출 중... OCR + NLP 처리',
  '규칙 검증 중... 계좌/금액/사업자번호 대조',
  '크로스 체크 중... 세금계산서 ↔ 계약서 비교',
  '결과 처리 완료. 6건 통과, 2건 오류, 2건 누락 확인',
]

/* ── Mock 데이터 ── */
const MOCK_INFLUENCERS: Influencer[] = [
  { id: 1, name: 'TheAcacia_Hyurin', type: '개인', documents: ['신분증 사본', '통장 사본', '계약서'], status: 'Pass' },
  { id: 2, name: 'tteokbokkiyum', type: '사업자', documents: ['사업자등록증', '세금계산서', '통장 사본', '계약서'], status: 'Pass' },
  { id: 3, name: 'abb_revi', type: '개인', documents: ['신분증 사본', '통장 사본', '계약서'], status: 'Pass' },
  { id: 4, name: 'ctolook', type: '개인', documents: ['신분증 사본', '통장 사본', '계약서'], status: 'Pass' },
  { id: 5, name: 'deobeauty', type: '사업자', documents: ['사업자등록증', '세금계산서', '통장 사본', '계약서'], status: 'Pass' },
  { id: 6, name: 'starjelly_kr', type: '개인', documents: ['신분증 사본', '통장 사본', '계약서'], status: 'Pass' },
  {
    id: 7, name: 'beauty.yun', type: '개인', documents: ['신분증 사본', '통장 사본', '계약서'], status: 'Error',
    errorDetail: '계좌번호 자릿수 불일치 (신한은행 14자리→12자리)',
    dmMessage: '안녕하세요 beauty.yun님, 정산 서류 검증 중 통장 사본의 계좌번호 자릿수가 일치하지 않습니다 (신한은행 14자리 → 12자리 확인됨). 정확한 계좌번호가 기재된 통장 사본을 다시 제출해 주세요. 감사합니다.',
  },
  {
    id: 8, name: 'upstagramc', type: '사업자', documents: ['사업자등록증', '통장 사본', '계약서'], status: 'Error',
    errorDetail: '세금계산서 금액 불일치 (계약서 150만원 ↔ 세금계산서 130만원)',
    dmMessage: '안녕하세요 upstagramc님, 제출하신 세금계산서의 금액이 계약서와 일치하지 않습니다 (계약서 150만원 ↔ 세금계산서 130만원). 정확한 금액이 기재된 세금계산서를 다시 발행해 주세요. 감사합니다.',
  },
  {
    id: 9, name: 'minzy_daily', type: '사업자', documents: ['세금계산서', '통장 사본', '계약서'], status: 'Missing',
    errorDetail: '사업자등록증 미제출',
    dmMessage: '안녕하세요 minzy_daily님, 정산을 위해 사업자등록증 사본이 필요합니다. 아직 제출되지 않은 것으로 확인되오니, 사업자등록증 사본을 제출해 주세요. 감사합니다.',
  },
  {
    id: 10, name: 'cook_haneul', type: '사업자', documents: ['사업자등록증', '통장 사본', '계약서'], status: 'Missing',
    errorDetail: '세금계산서 미제출',
    dmMessage: '안녕하세요 cook_haneul님, 정산을 위해 세금계산서가 필요합니다. 아직 제출되지 않은 것으로 확인되오니, 세금계산서를 발행하여 제출해 주세요. 감사합니다.',
  },
]

/* ── 서브 컴포넌트: 파이프라인 ── */
function PipelineBar({ currentStep, isRunning }: { currentStep: number; isRunning: boolean }) {
  return (
    <div className="dv-pipeline">
      {PIPELINE_STEPS.map((step, i) => (
        <div key={step} className="dv-pipeline-item">
          <div
            className={`dv-pipeline-circle ${
              i < currentStep ? 'dv-pipeline-circle--done' :
              i === currentStep && isRunning ? 'dv-pipeline-circle--active' : ''
            }`}
          >
            <Typo variant="$caption-2" style={{ color: i < currentStep ? '#fff' : i === currentStep && isRunning ? '#fff' : 'var(--semantic-color-text-5)' }}>
              {i < currentStep ? '✓' : i + 1}
            </Typo>
          </div>
          <Typo
            variant="$caption-2"
            style={{
              color: i <= currentStep ? 'var(--semantic-color-text-1)' : 'var(--semantic-color-text-5)',
              fontWeight: i === currentStep && isRunning ? 600 : 400,
              marginTop: 4,
            }}
          >
            {step}
          </Typo>
          {i < PIPELINE_STEPS.length - 1 && (
            <div className={`dv-pipeline-line ${i < currentStep ? 'dv-pipeline-line--done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ── 서브 컴포넌트: 상세 모달 ── */
function DetailPanel({ influencer, onClose }: { influencer: Influencer; onClose: () => void }) {
  return (
    <div className="dv-detail-overlay" onClick={onClose}>
      <div className="dv-detail-panel" onClick={e => e.stopPropagation()}>
        <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typo variant="$heading-4" style={{ fontWeight: 700 }}>검증 상세 - {influencer.name}</Typo>
          <CoreButton buttonType="tertiary" size="sm" onClick={onClose} prefix={<IconCloseOutline size={14} />} text="닫기" />
        </Flex>

        <VStack style={{ gap: 16 }}>
          <div className="dv-detail-section">
            <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 8 }}>오류/누락 내용</Typo>
            <div className="dv-detail-error-box">
              <CoreStatusBadge status={STATUS_BADGE_MAP[influencer.status]} text={influencer.status} size="sm" type="subtle" />
              <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', marginTop: 8 }}>
                {influencer.errorDetail}
              </Typo>
            </div>
          </div>

          <div className="dv-detail-section">
            <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <IconAiSymbolFilled size={16} />
              <Typo variant="$body-2" style={{ fontWeight: 600 }}>자동 생성 재제출 요청 DM</Typo>
            </Flex>
            <div className="dv-dm-preview">
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', lineHeight: '1.6' }}>
                {influencer.dmMessage}
              </Typo>
            </div>
            <Flex style={{ gap: 8, marginTop: 12 }}>
              <CoreButton buttonType="primary" size="sm" text="DM 발송" />
              <CoreButton buttonType="tertiary" size="sm" text="메시지 편집" />
            </Flex>
          </div>
        </VStack>
      </div>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function DocumentVerification() {
  const [, setSelectedCampaign] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [aiSteps, setAiSteps] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const passCount = MOCK_INFLUENCERS.filter(i => i.status === 'Pass').length
  const errorCount = MOCK_INFLUENCERS.filter(i => i.status === 'Error').length
  const missingCount = MOCK_INFLUENCERS.filter(i => i.status === 'Missing').length
  const progressPercent = (passCount / MOCK_INFLUENCERS.length) * 100

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }, [])

  const runAnalysis = useCallback(() => {
    clearTimers()
    setIsAnalyzing(true)
    setShowResults(false)
    setAiSteps([])
    setCurrentStep(0)

    AI_MESSAGES.forEach((msg, i) => {
      const timer = setTimeout(() => {
        setAiSteps(prev => [...prev, msg])
        setCurrentStep(i)
        if (i === AI_MESSAGES.length - 1) {
          setIsAnalyzing(false)
          setShowResults(true)
        }
      }, (i + 1) * 800)
      timersRef.current.push(timer)
    })
  }, [clearTimers])

  return (
    <div className="dv-page">

      {/* ── 상단 헤더 ── */}
      <div className="dv-topbar">
        <Flex style={{ alignItems: 'center', gap: 12 }}>
          <Typo variant="$heading-4" style={{ fontWeight: 700 }}>정산 서류 자동 검증</Typo>
          <CoreTag tagType="primary" size="xs">AI</CoreTag>
        </Flex>
      </div>

      {/* ── 컨트롤 영역 ── */}
      <div className="dv-controls">
        <Flex style={{ alignItems: 'center', gap: 12 }}>
          <div style={{ width: 320 }}>
            <CoreSelect size="sm" placeholderText="캠페인 선택" setValue={(v: string) => setSelectedCampaign(v)}>
              {CAMPAIGN_OPTIONS.map(c => (
                <CoreSelect.Item key={c.id} value={c.id}>{c.label}</CoreSelect.Item>
              ))}
            </CoreSelect>
          </div>
          <CoreButton
            buttonType="primary"
            size="md"
            prefix={<IconSearchAiOutline size={14} />}
            text="검증 / 분석"
            onClick={runAnalysis}
          />
        </Flex>
      </div>

      {/* ── 파이프라인 시각화 ── */}
      <div className="dv-pipeline-wrap">
        <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 12 }}>검증 파이프라인</Typo>
        <PipelineBar currentStep={currentStep} isRunning={isAnalyzing} />
      </div>

      {/* ── AI 분석 로그 ── */}
      {aiSteps.length > 0 && (
        <div className="dv-ai-panel">
          <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <IconAiSymbolFilled size={20} />
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>AI 분석</Typo>
          </Flex>
          <VStack style={{ gap: 8 }}>
            {aiSteps.map((step, i) => (
              <Flex key={i} style={{ alignItems: 'center', gap: 8 }}>
                <div className={`dv-ai-dot ${i === aiSteps.length - 1 && isAnalyzing ? 'dv-ai-dot--pulse' : ''}`} />
                <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>{step}</Typo>
              </Flex>
            ))}
            {isAnalyzing && (
              <div className="dv-ai-typing">
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>분석 중</Typo>
                <span className="dv-typing-dots" />
              </div>
            )}
          </VStack>
        </div>
      )}

      {/* ── 검증 결과 테이블 ── */}
      {showResults && (
        <>
          <div className="dv-table-wrap">
            <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 12 }}>인플루언서 서류 검증 결과</Typo>
            <div className="dv-table-container">
              <table className="dv-table">
                <thead>
                  <tr>
                    <th>인플루언서</th>
                    <th>유형</th>
                    <th>제출서류</th>
                    <th>검증상태</th>
                    <th>상세</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_INFLUENCERS.map(inf => (
                    <tr key={inf.id}>
                      <td>
                        <Typo variant="$body-1" style={{ fontWeight: 500 }}>{inf.name}</Typo>
                      </td>
                      <td>
                        <CoreTag tagType={inf.type === '사업자' ? 'blue' : 'gray'} size="xs">{inf.type}</CoreTag>
                      </td>
                      <td>
                        <Flex style={{ gap: 4, flexWrap: 'wrap' }}>
                          {inf.documents.map((doc, di) => (
                            <CoreTag key={di} tagType="gray" size="xs">{doc}</CoreTag>
                          ))}
                        </Flex>
                      </td>
                      <td>
                        <CoreStatusBadge
                          status={STATUS_BADGE_MAP[inf.status]}
                          text={inf.status}
                          size="sm"
                          type="subtle"
                          leadingElement={{ dot: true }}
                        />
                      </td>
                      <td>
                        {(inf.status === 'Error' || inf.status === 'Missing') ? (
                          <CoreButton
                            buttonType="tertiary"
                            size="sm"
                            text="상세 보기"
                            onClick={() => setSelectedInfluencer(inf)}
                          />
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

          {/* ── 하단 요약 대시보드 ── */}
          <div className="dv-summary">
            <Typo variant="$body-2" style={{ fontWeight: 600, marginBottom: 16 }}>검증 요약</Typo>
            <Flex style={{ gap: 24, marginBottom: 16 }}>
              <div className="dv-summary-card dv-summary-card--pass">
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>통과</Typo>
                <Typo variant="$heading-3" style={{ fontWeight: 700, color: 'var(--global-colors-teal-70)' }}>
                  {passCount}
                </Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>/ {MOCK_INFLUENCERS.length}명</Typo>
              </div>
              <div className="dv-summary-card dv-summary-card--error">
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>오류</Typo>
                <Typo variant="$heading-3" style={{ fontWeight: 700, color: '#ef4444' }}>{errorCount}</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>명</Typo>
              </div>
              <div className="dv-summary-card dv-summary-card--missing">
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>누락</Typo>
                <Typo variant="$heading-3" style={{ fontWeight: 700, color: '#f59e0b' }}>{missingCount}</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>명</Typo>
              </div>
            </Flex>

            {/* 진행률 바 */}
            <div className="dv-progress">
              <Flex style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>검증 통과율</Typo>
                <Typo variant="$caption-1" style={{ fontWeight: 600, color: 'var(--global-colors-teal-70)' }}>{progressPercent}%</Typo>
              </Flex>
              <div className="dv-progress-track">
                <div className="dv-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 상세 패널 ── */}
      {selectedInfluencer && (
        <DetailPanel influencer={selectedInfluencer} onClose={() => setSelectedInfluencer(null)} />
      )}
    </div>
  )
}
