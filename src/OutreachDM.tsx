import './OutreachDM.css'
import { useState, useCallback, useRef } from 'react'
import { Flex, VStack, HStack, Typo, CoreButton, CoreTag, CoreTabs, CoreTabItem, CoreTextInput, CoreSelect } from '@featuring-corp/components'
import { IconAiSymbolFilled, IconCopyOutline, IconEditOutline, IconSendOutline, IconInstagramColored } from '@featuring-corp/icons'

/* ── 타입 정의 ── */
interface Influencer {
  id: number
  name: string
  handle: string
  category: string
  followers: string
  matchPoints: string[]
  dmDraft: string
}

/* ── Mock 데이터 ── */
const MOCK_INFLUENCERS: Influencer[] = [
  {
    id: 1,
    name: '에코뷰티',
    handle: '@eco_beauty',
    category: '비건뷰티',
    followers: '12.4만',
    matchPoints: [
      '최근 3개월간 비건 화장품 리뷰 12건 — 브랜드 톤과 높은 일치',
      '팔로워 78%가 20-30대 여성, 타깃 오디언스 완벽 매칭',
      '인스타 릴스 인게이지먼트 9.2%, 채널 포맷 최적',
    ],
    dmDraft: `안녕하세요 에코뷰티님! 🌿

항상 진정성 있는 비건 뷰티 콘텐츠 잘 보고 있어요. 특히 최근 올려주신 "성분 분석 시리즈"가 저희 브랜드 철학과 너무 잘 맞더라고요.

저희 그린러브는 비건 스킨케어 브랜드인데요, 이번에 새로 출시하는 시카 라인을 에코뷰티님과 함께 소개하고 싶어서 연락드렸어요.

릴스 1건 기준으로 제안드리고 싶은데, 혹시 관심 있으시면 편하게 답변 주세요! 자세한 내용은 별도로 안내드릴게요 😊

그린러브 마케팅팀 드림`,
  },
  {
    id: 2,
    name: '소연의하루',
    handle: '@daily_soyeon',
    category: '일상뷰티',
    followers: '8.7만',
    matchPoints: [
      '일상 속 자연스러운 제품 노출 스타일 — PPL 거부감 최소화',
      '스킨케어 루틴 콘텐츠 평균 저장률 5.1%로 높은 관심도',
      '"솔직 리뷰" 해시태그 주력 — 브랜드 신뢰도 구축에 적합',
    ],
    dmDraft: `소연님 안녕하세요! 😊

일상 속에 자연스럽게 녹여내시는 뷰티 콘텐츠가 정말 매력적이에요. 특히 "모닝 스킨케어 루틴" 시리즈가 너무 좋았어요!

저희 그린러브에서 비건 시카 세럼을 새로 출시하는데요, 소연님의 솔직하고 자연스러운 리뷰 스타일이면 제품의 진가가 정말 잘 전달될 것 같아요.

혹시 릴스 협업에 관심 있으실까요? 자세한 캠페인 내용은 편하게 안내드릴게요!

그린러브 마케팅팀 드림`,
  },
  {
    id: 3,
    name: '지민스타일',
    handle: '@style_jimin',
    category: '패션뷰티',
    followers: '15.2만',
    matchPoints: [
      '패션+뷰티 크로스 카테고리로 넓은 도달범위 확보 가능',
      '20대 여성 팔로워 비율 82% — 타깃 정확도 최상',
      '브랜드 콜라보 경험 다수, 협업 커뮤니케이션 원활 예상',
    ],
    dmDraft: `지민님 안녕하세요! ✨

패션과 뷰티를 넘나드는 감각적인 콘텐츠 항상 인상 깊게 보고 있어요. 특히 스타일링에 스킨케어를 연결하시는 관점이 정말 독보적이시더라고요!

저희 그린러브 비건 스킨케어에서 이번 시즌 릴스 캠페인을 준비하고 있는데요, 지민님만의 스타일리시한 시선으로 제품을 소개해주시면 좋겠다는 생각이 들었어요.

혹시 협업 가능하신지 편하게 알려주세요! 구체적인 제안은 따로 보내드릴게요 💜

그린러브 마케팅팀 드림`,
  },
]

const AI_STEPS = [
  '캠페인 브리프를 분석하고 있습니다...',
  '인플루언서 프로필과 최근 콘텐츠를 스캔 중입니다...',
  '매칭 포인트를 추출하고 있습니다...',
  '개인화된 DM 초안을 생성하고 있습니다...',
  '3명의 인플루언서에 대한 개인화 DM이 준비되었습니다!',
]

/* ── 서브 컴포넌트: AI 진행 패널 ── */
function AiProgressPanel({ steps, isGenerating }: { steps: string[]; isGenerating: boolean }) {
  return (
    <div className="odm-ai-panel">
      <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <IconAiSymbolFilled size={20} />
        <Typo variant="$body-2" style={{ fontWeight: 600 }}>AI DM 생성</Typo>
      </Flex>
      <VStack style={{ gap: 10 }}>
        {steps.map((step, i) => (
          <Flex key={i} style={{ alignItems: 'flex-start', gap: 8 }}>
            <div className={`odm-ai-dot ${i === steps.length - 1 && isGenerating ? 'odm-ai-dot--pulse' : ''}`} />
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>{step}</Typo>
          </Flex>
        ))}
        {isGenerating && (
          <div className="odm-ai-typing">
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>생성 중</Typo>
            <span className="odm-typing-dots" />
          </div>
        )}
      </VStack>
    </div>
  )
}

/* ── 서브 컴포넌트: 인플루언서 카드 ── */
function InfluencerCard({ inf }: { inf: Influencer }) {
  return (
    <div className="odm-inf-card">
      <Flex style={{ alignItems: 'center', gap: 10 }}>
        <div className="odm-inf-avatar">
          <Typo variant="$body-2" style={{ color: '#fff', fontWeight: 600 }}>{inf.name[0]}</Typo>
        </div>
        <VStack style={{ gap: 2, flex: 1 }}>
          <Flex style={{ alignItems: 'center', gap: 6 }}>
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>{inf.name}</Typo>
            <CoreTag tagType="magenta" size="xs">{inf.category}</CoreTag>
          </Flex>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{inf.handle}</Typo>
        </VStack>
        <Flex style={{ alignItems: 'center', gap: 4 }}>
          <IconInstagramColored size={14} />
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>{inf.followers}</Typo>
        </Flex>
      </Flex>
    </div>
  )
}

/* ── 서브 컴포넌트: DM 결과 탭 내용 ── */
function DmResultContent({ inf, onCopy }: { inf: Influencer; onCopy: (text: string) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDm, setEditedDm] = useState(inf.dmDraft)

  return (
    <VStack style={{ gap: 20 }}>
      {/* 매칭 포인트 */}
      <div className="odm-match-card">
        <Typo variant="$caption-1" style={{ fontWeight: 600, marginBottom: 8, color: 'var(--global-colors-primary-60)' }}>매칭 포인트</Typo>
        <VStack style={{ gap: 6 }}>
          {inf.matchPoints.map((point, i) => (
            <Flex key={i} style={{ alignItems: 'flex-start', gap: 8 }}>
              <Typo variant="$caption-2" style={{ color: 'var(--global-colors-teal-70)', flexShrink: 0 }}>●</Typo>
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>{point}</Typo>
            </Flex>
          ))}
        </VStack>
      </div>

      {/* DM 초안 */}
      <div className="odm-dm-box">
        <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Typo variant="$caption-1" style={{ fontWeight: 600 }}>개인화된 DM 초안</Typo>
          <HStack style={{ gap: 6 }}>
            <CoreButton
              buttonType="tertiary"
              size="sm"
              prefix={<IconCopyOutline size={14} />}
              text="복사"
              onClick={() => onCopy(editedDm)}
            />
            <CoreButton
              buttonType="tertiary"
              size="sm"
              prefix={<IconEditOutline size={14} />}
              text={isEditing ? '완료' : '수정'}
              onClick={() => setIsEditing(!isEditing)}
            />
          </HStack>
        </Flex>
        {isEditing ? (
          <textarea
            className="odm-dm-textarea"
            value={editedDm}
            onChange={(e) => setEditedDm(e.target.value)}
          />
        ) : (
          <div className="odm-dm-preview">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {editedDm}
            </Typo>
          </div>
        )}
      </div>
    </VStack>
  )
}

/* ── 메인 컴포넌트 ── */
export default function OutreachDM() {
  const [brandName, setBrandName] = useState('그린러브')
  const [product, setProduct] = useState('비건 시카 세럼')
  const [target, setTarget] = useState('20-30대 여성')
  const [tone, setTone] = useState('친근하고 자연스러운')
  const [, setChannel] = useState('instagram')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiSteps, setAiSteps] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [activeInfTab, setActiveInfTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }, [])

  const handleGenerate = useCallback(() => {
    clearTimers()
    setIsGenerating(true)
    setShowResults(false)
    setAiSteps([])
    setActiveInfTab(0)

    AI_STEPS.forEach((msg, i) => {
      const timer = setTimeout(() => {
        setAiSteps(prev => [...prev, msg])
        if (i === AI_STEPS.length - 1) {
          setIsGenerating(false)
          setShowResults(true)
        }
      }, (i + 1) * 700)
      timersRef.current.push(timer)
    })
  }, [clearTimers])

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <div className="odm-page">
      {/* 상단 헤더 */}
      <div className="odm-topbar">
        <Flex style={{ alignItems: 'center', gap: 10 }}>
          <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>섭외 DM 개인화</Typo>
          <CoreTag tagType="primary" size="xs">AI</CoreTag>
        </Flex>
      </div>

      {/* 메인 2단 레이아웃 */}
      <div className="odm-body">
        {/* 좌측: 입력 영역 */}
        <div className="odm-left">
          <VStack style={{ gap: 20 }}>
            {/* 캠페인 브리프 */}
            <div className="odm-section">
              <Typo variant="$body-1" style={{ fontWeight: 600, marginBottom: 12 }}>캠페인 브리프</Typo>
              <VStack style={{ gap: 12 }}>
                <CoreTextInput
                  label="브랜드명"
                  size="md"
                  placeholder="브랜드명 입력"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
                <CoreTextInput
                  label="제품"
                  size="md"
                  placeholder="제품명 입력"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                />
                <CoreTextInput
                  label="타깃"
                  size="md"
                  placeholder="타깃 오디언스"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
                <CoreTextInput
                  label="톤앤매너"
                  size="md"
                  placeholder="메시지 톤"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                />
                <div className="odm-form-field">
                  <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 4 }}>채널</Typo>
                  <CoreSelect size="md" placeholderText="채널 선택" defaultValue="instagram" setValue={(v: string) => setChannel(v)}>
                    <CoreSelect.Item value="instagram">인스타 릴스</CoreSelect.Item>
                    <CoreSelect.Item value="youtube">유튜브 쇼츠</CoreSelect.Item>
                    <CoreSelect.Item value="tiktok">틱톡</CoreSelect.Item>
                  </CoreSelect>
                </div>
              </VStack>
            </div>

            {/* 인플루언서 리스트 */}
            <div className="odm-section">
              <Typo variant="$body-1" style={{ fontWeight: 600, marginBottom: 12 }}>인플루언서 리스트</Typo>
              <VStack style={{ gap: 8 }}>
                {MOCK_INFLUENCERS.map(inf => (
                  <InfluencerCard key={inf.id} inf={inf} />
                ))}
              </VStack>
            </div>

            {/* 생성 버튼 */}
            <CoreButton
              buttonType="primary"
              size="md"
              text="DM 생성"
              prefix={<IconSendOutline size={14} />}
              onClick={handleGenerate}
              disabled={isGenerating}
            />
          </VStack>
        </div>

        {/* 우측: AI 생성 결과 */}
        <div className="odm-right">
          {/* AI 진행 상태 */}
          {(isGenerating || aiSteps.length > 0) && (
            <AiProgressPanel steps={aiSteps} isGenerating={isGenerating} />
          )}

          {/* 초기 상태 */}
          {!showResults && !isGenerating && aiSteps.length === 0 && (
            <div className="odm-empty">
              <IconAiSymbolFilled size={40} color="var(--semantic-color-text-5)" />
              <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)', marginTop: 12 }}>
                캠페인 브리프를 입력하고 DM 생성을 클릭하세요
              </Typo>
            </div>
          )}

          {/* 생성 결과 */}
          {showResults && (
            <VStack style={{ gap: 16 }}>
              {/* 복사 완료 토스트 */}
              {copied && (
                <div className="odm-toast">
                  <Typo variant="$caption-1" style={{ color: '#fff' }}>클립보드에 복사되었습니다</Typo>
                </div>
              )}

              {/* 인플루언서별 탭 */}
              <CoreTabs>
                {MOCK_INFLUENCERS.map((inf, i) => (
                  <CoreTabItem
                    key={inf.id}
                    size="md"
                    active={activeInfTab === i}
                    onClick={() => setActiveInfTab(i)}
                  >
                    {inf.name}
                  </CoreTabItem>
                ))}
              </CoreTabs>

              {/* 탭 내용 */}
              <DmResultContent
                inf={MOCK_INFLUENCERS[activeInfTab]}
                onCopy={handleCopy}
              />
            </VStack>
          )}
        </div>
      </div>
    </div>
  )
}
