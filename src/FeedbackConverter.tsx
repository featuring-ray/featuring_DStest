import './FeedbackConverter.css'
import { useState, useCallback, useRef } from 'react'
import { Flex, VStack, HStack, Typo, CoreButton, CoreTag, CoreTextInput, CoreSelect, CoreStatusBadge } from '@featuring-corp/components'
import { IconAiSymbolFilled, IconRefreshOutline } from '@featuring-corp/icons'

/* ── 타입 정의 ── */
type Severity = '필수수정' | '권장수정' | '칭찬'

interface FeedbackItem {
  id: number
  original: string
  converted: string
  severity: Severity
  category: string
}

const SEVERITY_STATUS: Record<Severity, 'error' | 'warning' | 'success'> = {
  '필수수정': 'error',
  '권장수정': 'warning',
  '칭찬': 'success',
}

/* ── Mock 원문 ── */
const DEFAULT_ORIGINAL = `1. 사진이 전체적으로 어둡습니다. 조명 보정이 필요합니다.
2. 필수 해시태그 #광고 #그린러브 누락되었습니다.
3. "효과 보장" 문구는 화장품법 규정 위반입니다. 삭제해주세요.
4. 전체적으로 광고 같은 톤이라 자연스럽지 않습니다.`

/* ── Mock 변환 결과 ── */
const MOCK_FEEDBACKS: FeedbackItem[] = [
  {
    id: 1,
    original: '사진이 전체적으로 어둡습니다. 조명 보정이 필요합니다.',
    converted: '사진 분위기가 좋은데요! 밝기를 살짝만 올려주시면 제품 색감이 더 예쁘게 나올 것 같아요 :) 혹시 보정 어려우시면 저희가 참고 이미지 보내드릴게요!',
    severity: '권장수정',
    category: '이미지 품질',
  },
  {
    id: 2,
    original: '필수 해시태그 #광고 #그린러브 누락되었습니다.',
    converted: '캡션에 #광고 #그린러브 해시태그 추가 부탁드려요! 공정위 규정상 꼭 필요한 부분이라서요. 위치는 편하신 곳에 넣어주시면 됩니다!',
    severity: '필수수정',
    category: '규정 준수',
  },
  {
    id: 3,
    original: '"효과 보장" 문구는 화장품법 규정 위반입니다. 삭제해주세요.',
    converted: '"효과 보장" 문구를 "개인적으로 효과를 느꼈어요" 정도로 바꿔주실 수 있을까요? 화장품법상 효과를 보장하는 표현은 사용이 어려워서요. 불편 드려 죄송합니다!',
    severity: '필수수정',
    category: '규정 준수',
  },
  {
    id: 4,
    original: '전체적으로 광고 같은 톤이라 자연스럽지 않습니다.',
    converted: '콘텐츠 퀄리티가 정말 좋아요! 한 가지만 제안드리면, 크리에이터님만의 평소 말투로 좀 더 자연스럽게 표현해주시면 팔로워분들 반응이 더 좋을 것 같아요. 예를 들어 "요즘 빠진 템" 같은 일상 표현이 어떨까요?',
    severity: '권장수정',
    category: '톤앤매너',
  },
]

const MOCK_DM_PREVIEW = `안녕하세요 소연님! 콘텐츠 너무 잘 봤어요 😊

몇 가지 확인 부탁드릴 사항이 있어서 연락드려요.

📌 수정 필요 사항
1. 캡션에 #광고 #그린러브 해시태그 추가 부탁드려요! (공정위 규정)
2. "효과 보장" → "개인적으로 효과를 느꼈어요" 로 변경 부탁드려요 (화장품법)

💡 제안 사항
3. 사진 밝기를 살짝 올려주시면 제품 색감이 더 예쁘게 나올 것 같아요
4. 평소 말투로 좀 더 자연스럽게 표현해주시면 좋을 것 같아요

수정 어려우신 부분 있으시면 편하게 말씀해주세요!
감사합니다 🙏`

const MOCK_MD_SUMMARY = `[MD용 요약]
• 필수수정 2건: 해시태그 누락, 화장품법 위반 문구
• 권장수정 2건: 사진 밝기, 톤앤매너
• 전달 상태: DM 초안 생성 완료
• 특이사항: 화장품법 관련 수정은 리스크 관리 필요`

const AI_STEPS = [
  '원문 피드백을 분석하고 있습니다...',
  '심각도를 분류하고 있습니다...',
  '인플루언서 친화적 톤으로 변환 중입니다...',
  'DM 메시지를 구성하고 있습니다...',
  '변환이 완료되었습니다!',
]

/* ── 서브 컴포넌트: AI 진행 패널 ── */
function AiProgressPanel({ steps, isConverting }: { steps: string[]; isConverting: boolean }) {
  return (
    <div className="fc-ai-panel">
      <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <IconAiSymbolFilled size={20} />
        <Typo variant="$body-2" style={{ fontWeight: 600 }}>AI 톤 변환</Typo>
      </Flex>
      <VStack style={{ gap: 10 }}>
        {steps.map((step, i) => (
          <Flex key={i} style={{ alignItems: 'flex-start', gap: 8 }}>
            <div className={`fc-ai-dot ${i === steps.length - 1 && isConverting ? 'fc-ai-dot--pulse' : ''}`} />
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>{step}</Typo>
          </Flex>
        ))}
        {isConverting && (
          <div className="fc-ai-typing">
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>변환 중</Typo>
            <span className="fc-typing-dots" />
          </div>
        )}
      </VStack>
    </div>
  )
}

/* ── 서브 컴포넌트: 피드백 카드 ── */
function FeedbackCard({ item }: { item: FeedbackItem }) {
  return (
    <div className="fc-feedback-card">
      <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <HStack style={{ gap: 8, alignItems: 'center' }}>
          <CoreStatusBadge
            status={SEVERITY_STATUS[item.severity]}
            type="subtle"
            size="sm"
            text={item.severity}
          />
          <CoreTag tagType="gray" size="xs">{item.category}</CoreTag>
        </HStack>
      </Flex>

      {/* 원문 */}
      <div className="fc-compare-box fc-compare-original">
        <Typo variant="$caption-2" style={{ fontWeight: 600, color: 'var(--semantic-color-text-5)', marginBottom: 4 }}>원문</Typo>
        <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>{item.original}</Typo>
      </div>

      {/* 변환 */}
      <div className="fc-compare-box fc-compare-converted">
        <Typo variant="$caption-2" style={{ fontWeight: 600, color: 'var(--global-colors-primary-60)', marginBottom: 4 }}>변환</Typo>
        <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)' }}>{item.converted}</Typo>
      </div>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function FeedbackConverter() {
  const [originalText, setOriginalText] = useState(DEFAULT_ORIGINAL)
  const [, setIndustry] = useState('beauty')
  const [influencerName, setInfluencerName] = useState('소연')
  const [isConverting, setIsConverting] = useState(false)
  const [aiSteps, setAiSteps] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }, [])

  const handleConvert = useCallback(() => {
    clearTimers()
    setIsConverting(true)
    setShowResults(false)
    setAiSteps([])

    AI_STEPS.forEach((msg, i) => {
      const timer = setTimeout(() => {
        setAiSteps(prev => [...prev, msg])
        if (i === AI_STEPS.length - 1) {
          setIsConverting(false)
          setShowResults(true)
        }
      }, (i + 1) * 600)
      timersRef.current.push(timer)
    })
  }, [clearTimers])

  return (
    <div className="fc-page">
      {/* 상단 헤더 */}
      <div className="fc-topbar">
        <Flex style={{ alignItems: 'center', gap: 10 }}>
          <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>피드백 톤 변환</Typo>
          <CoreTag tagType="primary" size="xs">AI</CoreTag>
        </Flex>
      </div>

      {/* 메인 2단 레이아웃 */}
      <div className="fc-body">
        {/* 좌측: 원문 입력 */}
        <div className="fc-left">
          <VStack style={{ gap: 20 }}>
            <div className="fc-section">
              <Typo variant="$body-1" style={{ fontWeight: 600, marginBottom: 12 }}>브랜드 피드백 원문</Typo>
              <textarea
                className="fc-original-textarea"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="피드백 원문을 입력하세요..."
              />
            </div>

            <div className="fc-section">
              <Typo variant="$body-1" style={{ fontWeight: 600, marginBottom: 12 }}>캠페인 정보</Typo>
              <VStack style={{ gap: 12 }}>
                <div className="fc-form-field">
                  <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 4 }}>산업군</Typo>
                  <CoreSelect size="md" placeholderText="산업군 선택" defaultValue="beauty" setValue={(v: string) => setIndustry(v)}>
                    <CoreSelect.Item value="beauty">뷰티/화장품</CoreSelect.Item>
                    <CoreSelect.Item value="fashion">패션</CoreSelect.Item>
                    <CoreSelect.Item value="food">식품/F&B</CoreSelect.Item>
                    <CoreSelect.Item value="tech">IT/테크</CoreSelect.Item>
                    <CoreSelect.Item value="lifestyle">라이프스타일</CoreSelect.Item>
                  </CoreSelect>
                </div>
                <CoreTextInput
                  label="인플루언서 이름"
                  size="md"
                  placeholder="인플루언서 이름"
                  value={influencerName}
                  onChange={(e) => setInfluencerName(e.target.value)}
                />
              </VStack>
            </div>

            <CoreButton
              buttonType="primary"
              size="md"
              text="변환"
              prefix={<IconRefreshOutline size={14} />}
              onClick={handleConvert}
              disabled={isConverting || !originalText.trim()}
            />
          </VStack>
        </div>

        {/* 우측: 변환 결과 */}
        <div className="fc-right">
          {/* AI 진행 상태 */}
          {(isConverting || aiSteps.length > 0) && (
            <AiProgressPanel steps={aiSteps} isConverting={isConverting} />
          )}

          {/* 초기 상태 */}
          {!showResults && !isConverting && aiSteps.length === 0 && (
            <div className="fc-empty">
              <IconAiSymbolFilled size={40} color="var(--semantic-color-text-5)" />
              <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)', marginTop: 12 }}>
                피드백 원문을 입력하고 변환을 클릭하세요
              </Typo>
            </div>
          )}

          {/* 변환 결과 */}
          {showResults && (
            <VStack style={{ gap: 20 }}>
              {/* 요약 통계 */}
              <Flex style={{ gap: 12 }}>
                <div className="fc-stat-chip fc-stat-error">
                  <Typo variant="$caption-1" style={{ fontWeight: 600 }}>필수수정 2건</Typo>
                </div>
                <div className="fc-stat-chip fc-stat-warning">
                  <Typo variant="$caption-1" style={{ fontWeight: 600 }}>권장수정 2건</Typo>
                </div>
              </Flex>

              {/* 항목별 카드 */}
              <VStack style={{ gap: 12 }}>
                {MOCK_FEEDBACKS.map(item => (
                  <FeedbackCard key={item.id} item={item} />
                ))}
              </VStack>

              {/* 인플루언서 전달용 DM 프리뷰 */}
              <div className="fc-dm-preview-section">
                <Typo variant="$body-1" style={{ fontWeight: 600, marginBottom: 12 }}>인플루언서 전달용 메시지</Typo>
                <div className="fc-dm-preview">
                  <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {MOCK_DM_PREVIEW}
                  </Typo>
                </div>
              </div>

              {/* MD용 요약 */}
              <div className="fc-md-summary">
                <Typo variant="$body-1" style={{ fontWeight: 600, marginBottom: 12 }}>MD용 요약</Typo>
                <div className="fc-md-box">
                  <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {MOCK_MD_SUMMARY}
                  </Typo>
                </div>
              </div>
            </VStack>
          )}
        </div>
      </div>
    </div>
  )
}
