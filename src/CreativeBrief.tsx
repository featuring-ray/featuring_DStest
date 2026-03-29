import './CreativeBrief.css'
import { useState, useCallback, useRef } from 'react'
import { Flex, VStack, Typo, CoreButton, CoreTag, CoreTabs, CoreTabItem, CoreSelect, CoreTextInput } from '@featuring-corp/components'
import { IconAiLavelOutline } from '@featuring-corp/icons'

/* ── 타입 정의 ── */
interface HookScenario {
  type: '질문형' | '반전형' | '정보형'
  title: string
  description: string
}

interface TimelineStep {
  time: string
  label: string
  description: string
}

interface InfluencerBrief {
  handle: string
  name: string
  style: string
  concept: string
  hooks: HookScenario[]
  timeline: TimelineStep[]
  dos: string[]
  donts: string[]
}

/* ── 상수/Mock 데이터 ── */
const CHANNEL_OPTIONS = [
  { label: '인스타그램 릴스', value: 'ig-reels' },
  { label: '인스타그램 피드', value: 'ig-feed' },
  { label: '유튜브 쇼츠', value: 'yt-shorts' },
  { label: 'TikTok', value: 'tiktok' },
]

const FORMAT_OPTIONS = [
  { label: '릴스', value: '릴스' },
  { label: '쇼츠', value: '쇼츠' },
  { label: '피드', value: '피드' },
  { label: '영상', value: '영상' },
]

const INFLUENCER_LIST = [
  { handle: '@eco_beauty', name: '에코뷰티', style: '감성 브이로그 + 클린뷰티 전문' },
  { handle: '@daily_soyeon', name: '데일리소연', style: '일상 공유 + 솔직 리뷰' },
  { handle: '@style_jimin', name: '스타일지민', style: '트렌디 패션/뷰티 + 빠른 편집' },
]

const HOOK_TAG_TYPE: Record<string, 'teal' | 'blue' | 'orange'> = {
  '질문형': 'teal',
  '반전형': 'orange',
  '정보형': 'blue',
}

const MOCK_BRIEFS: InfluencerBrief[] = [
  {
    handle: '@eco_beauty',
    name: '에코뷰티',
    style: '감성 브이로그 + 클린뷰티 전문',
    concept: '자연 속 스킨케어 루틴 — 비건 세럼으로 완성하는 클린 뷰티 하루',
    hooks: [
      { type: '질문형', title: '비건 세럼, 진짜 효과 있을까?', description: '비건 화장품에 대한 의구심을 던지며 시작. 직접 2주 사용 후기로 답변하는 구조.' },
      { type: '반전형', title: '화학 성분 가득한 세럼을 버렸습니다', description: '기존 세럼을 버리는 장면 → 그린러브 비건 세럼으로 교체하는 반전 연출.' },
      { type: '정보형', title: '100% 식물성 세럼이 피부에 하는 일', description: '성분 분석 + 피부 변화 과정을 정보형으로 전달. 교육적 콘텐츠.' },
    ],
    timeline: [
      { time: '0-3초', label: '훅', description: '질문 자막 + 세럼 클로즈업' },
      { time: '3-8초', label: '문제 제기', description: '기존 스킨케어 고민 공유' },
      { time: '8-18초', label: '제품 소개 + 시연', description: '그린러브 세럼 텍스처, 발림성 클로즈업' },
      { time: '18-25초', label: '결과 & 후기', description: '2주 사용 비포/애프터 + 솔직 소감' },
      { time: '25-30초', label: 'CTA', description: '제품 정보 + 할인 코드 안내' },
    ],
    dos: [
      '자연광에서 촬영하여 클린 이미지 유지',
      '성분 리스트를 화면에 노출 (100% 식물성 강조)',
      '본인 피부 타입과 연결하여 공감 유도',
      '협찬 고지 문구를 영상 초반에 자연스럽게 삽입',
    ],
    donts: [
      '"최고", "최초", "혁신적" 등 금칙어 사용 금지',
      '타 브랜드 비하 또는 비교 금지',
      '과장된 효과 주장 (예: "주름이 사라졌어요") 금지',
      '필터 과다 사용으로 피부 변화 왜곡 금지',
    ],
  },
  {
    handle: '@daily_soyeon',
    name: '데일리소연',
    style: '일상 공유 + 솔직 리뷰',
    concept: '출근 전 5분 루틴 — 바쁜 아침에도 챙기는 비건 스킨케어',
    hooks: [
      { type: '질문형', title: '아침 스킨케어 5분이면 충분하다고?', description: '바쁜 직장인의 공감 포인트를 질문으로 시작. 실제 모닝 루틴에 자연스럽게 제품 노출.' },
      { type: '반전형', title: '스킨케어 포기한 줄 알았는데...', description: '스킨케어를 건너뛰는 일상 → 간단한 비건 세럼 하나로 달라진 루틴 반전.' },
      { type: '정보형', title: '비건 세럼 vs 일반 세럼, 뭐가 다를까', description: '성분 비교 카드뉴스 스타일. 일반 vs 비건 세럼 차이를 시각적으로 전달.' },
    ],
    timeline: [
      { time: '0-3초', label: '훅', description: '알람 소리 + "또 늦었다" 자막' },
      { time: '3-10초', label: '일상 공유', description: '바쁜 아침 준비 과정 (공감 유도)' },
      { time: '10-20초', label: '제품 사용', description: '세럼 한 방울로 끝내는 스킨케어 시연' },
      { time: '20-27초', label: '솔직 후기', description: '2주 사용 소감 + 피부 변화' },
      { time: '27-30초', label: 'CTA', description: '제품 링크 + "프로필에서 확인"' },
    ],
    dos: [
      '실제 아침 루틴에 자연스럽게 녹여내기',
      '솔직한 톤으로 장단점 모두 언급 (단점은 가볍게)',
      '제품 사용 전후 피부 상태 비교',
      '#그린러브 #비건스킨케어 #광고 해시태그 필수',
    ],
    donts: [
      '지나치게 연출된 "완벽한 아침" 금지',
      '금칙어 ("최고", "최초", "혁신적") 사용 금지',
      '경쟁 제품 언급 또는 비교 금지',
      '영상 전체가 광고처럼 느껴지는 구성 금지',
    ],
  },
  {
    handle: '@style_jimin',
    name: '스타일지민',
    style: '트렌디 패션/뷰티 + 빠른 편집',
    concept: '겟레디위드미 비건 에디션 — 트렌디한 GRWM에 비건 세럼 한 스푼',
    hooks: [
      { type: '질문형', title: '요즘 뷰티 트렌드가 비건이라는데?', description: 'Z세대 트렌드 키워드로 시작. 비건 뷰티가 왜 핫한지 빠르게 설명.' },
      { type: '반전형', title: '이 세럼... 원래 안 쓰려고 했거든요', description: '비건 제품에 반신반의 → 사용 후 반전 리뷰. 솔직함이 매력 포인트.' },
      { type: '정보형', title: 'GRWM 비건 스킨케어 에디션', description: '트렌디한 GRWM 포맷에 비건 스킨케어 과정을 자연스럽게 편입.' },
    ],
    timeline: [
      { time: '0-2초', label: '훅', description: '빠른 컷 전환 + 트렌디 BGM 시작' },
      { time: '2-7초', label: 'GRWM 인트로', description: '오늘의 메이크업 소개 + 스킨케어 시작' },
      { time: '7-15초', label: '세럼 시연', description: '세럼 텍스처 ASMR + 발림 클로즈업' },
      { time: '15-22초', label: '메이크업 완성', description: '세럼 위에 메이크업 올리기 + 밀착력 강조' },
      { time: '22-28초', label: '최종 룩 + 후기', description: '완성 룩 공개 + 한 줄 리뷰' },
      { time: '28-30초', label: 'CTA', description: '@greenlove_official 태그 + 할인 정보' },
    ],
    dos: [
      '빠른 편집 + 트렌디한 BGM 활용',
      'ASMR 요소 (세럼 텍스처, 발림 소리) 포함',
      '@greenlove_official 멘션 필수 포함',
      '영상 초반 "광고" 표기 명확히',
    ],
    donts: [
      '느린 편집이나 장황한 설명 금지',
      '금칙어 ("최고", "최초", "혁신적") 사용 금지',
      '과도한 필터로 제품 색상 왜곡 금지',
      '협찬 고지 없이 자연스러운 척하는 구성 금지',
    ],
  },
]

/* ── 메인 컴포넌트 ── */
export default function CreativeBrief() {
  const [product, setProduct] = useState('그린러브 비건 세럼')
  const [target, setTarget] = useState('20-30대 여성, 클린뷰티 관심')
  const [message, setMessage] = useState('100% 식물성 성분으로 만든 비건 세럼')
  const [channel, setChannel] = useState('ig-reels')
  const [format, setFormat] = useState('릴스')
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>(['@eco_beauty', '@daily_soyeon', '@style_jimin'])
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<InfluencerBrief[] | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleInfluencer = useCallback((handle: string) => {
    setSelectedInfluencers(prev =>
      prev.includes(handle)
        ? prev.filter(h => h !== handle)
        : [...prev, handle]
    )
  }, [])

  const handleGenerate = useCallback(() => {
    setIsGenerating(true)
    setResults(null)
    setActiveTab(0)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const filtered = MOCK_BRIEFS.filter(b => selectedInfluencers.includes(b.handle))
      setResults(filtered.length > 0 ? filtered : MOCK_BRIEFS)
      setIsGenerating(false)
    }, 2000)
  }, [selectedInfluencers])

  const currentBrief = results ? results[activeTab] : null

  return (
    <div className="cb-page">
      {/* ── 상단 헤더 바 ── */}
      <div className="cb-topbar">
        <IconAiLavelOutline size={20} color="var(--semantic-color-text-1)" />
        <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>크리에이티브 브리프 생성</Typo>
        <CoreTag tagType="primary" size="xs">AI</CoreTag>
      </div>

      {/* ── 2단 본문 ── */}
      <div className="cb-content">
        {/* 좌측: 입력 */}
        <div className="cb-left">
          <div className="cb-input-panel">
            <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 14 }}>
              캠페인 브리프
            </Typo>

            <div className="cb-field">
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 6 }}>제품명</Typo>
              <CoreTextInput
                size="md"
                placeholder="제품명 입력"
                value={product}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProduct(e.target.value)}
              />
            </div>

            <div className="cb-field">
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 6 }}>타깃 오디언스</Typo>
              <CoreTextInput
                size="md"
                placeholder="타깃 오디언스"
                value={target}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)}
              />
            </div>

            <div className="cb-field">
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 6 }}>핵심 메시지</Typo>
              <CoreTextInput
                size="md"
                placeholder="핵심 메시지"
                value={message}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
              />
            </div>

            <div className="cb-field">
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 6 }}>채널</Typo>
              <CoreSelect size="sm" value={channel} setValue={(v: string) => setChannel(v)}>
                {CHANNEL_OPTIONS.map(o => (
                  <CoreSelect.Item key={o.value} value={o.value}>{o.label}</CoreSelect.Item>
                ))}
              </CoreSelect>
            </div>

            <div className="cb-field">
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 6 }}>포맷</Typo>
              <CoreSelect size="sm" value={format} setValue={(v: string) => setFormat(v)}>
                {FORMAT_OPTIONS.map(o => (
                  <CoreSelect.Item key={o.value} value={o.value}>{o.label}</CoreSelect.Item>
                ))}
              </CoreSelect>
            </div>
          </div>

          {/* 인플루언서 선택 */}
          <div className="cb-input-panel">
            <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 14 }}>
              인플루언서 선택
            </Typo>
            <div className="cb-influencer-list">
              {INFLUENCER_LIST.map((inf) => (
                <div
                  key={inf.handle}
                  className={`cb-influencer-item ${selectedInfluencers.includes(inf.handle) ? 'cb-influencer-item--selected' : ''}`}
                  onClick={() => toggleInfluencer(inf.handle)}
                >
                  <Flex style={{ alignItems: 'center', gap: 8 }}>
                    <Typo variant="$body-2" style={{ fontWeight: 600, color: 'var(--semantic-color-text-1)' }}>{inf.name}</Typo>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{inf.handle}</Typo>
                  </Flex>
                  <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', marginTop: 2 }}>{inf.style}</Typo>
                </div>
              ))}
            </div>
          </div>

          <CoreButton buttonType="primary" size="md" text="브리프 생성" onClick={handleGenerate} />
        </div>

        {/* 우측: 결과 */}
        <div className="cb-right">
          <div className="cb-result-panel">
            {!results && !isGenerating && (
              <div className="cb-empty-result">
                <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)' }}>
                  좌측에서 캠페인 정보를 입력하고 "브리프 생성" 버튼을 눌러주세요.
                </Typo>
              </div>
            )}

            {isGenerating && (
              <div className="cb-empty-result">
                <Typo variant="$body-2" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600 }}>
                  AI가 인플루언서별 맞춤 브리프를 생성하고 있습니다...
                </Typo>
              </div>
            )}

            {results && (
              <>
                {/* 탭 */}
                <CoreTabs>
                  {results.map((brief, i) => (
                    <CoreTabItem
                      key={brief.handle}
                      size="md"
                      active={activeTab === i}
                      onClick={() => setActiveTab(i)}
                    >
                      {brief.name} ({brief.handle})
                    </CoreTabItem>
                  ))}
                </CoreTabs>

                {currentBrief && (
                  <VStack style={{ gap: 20, marginTop: 20 }}>
                    {/* 콘셉트 카드 */}
                    <div className="cb-concept-card">
                      <Typo variant="$caption-1" style={{ color: 'var(--global-colors-teal-70)', fontWeight: 600, marginBottom: 4 }}>
                        콘셉트
                      </Typo>
                      <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>
                        {currentBrief.concept}
                      </Typo>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', marginTop: 4 }}>
                        스타일: {currentBrief.style}
                      </Typo>
                    </div>

                    {/* 훅 시나리오 */}
                    <div>
                      <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 10 }}>
                        훅 시나리오
                      </Typo>
                      <div className="cb-hooks">
                        {currentBrief.hooks.map((hook, i) => (
                          <div key={i} className="cb-hook-card">
                            <CoreTag tagType={HOOK_TAG_TYPE[hook.type]} size="xs">{hook.type}</CoreTag>
                            <Typo variant="$body-2" style={{ fontWeight: 600, color: 'var(--semantic-color-text-1)', marginTop: 8 }}>
                              {hook.title}
                            </Typo>
                            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', marginTop: 4 }}>
                              {hook.description}
                            </Typo>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 콘티 구성안 (타임라인) */}
                    <div>
                      <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 10 }}>
                        콘티 구성안
                      </Typo>
                      <div className="cb-timeline">
                        {currentBrief.timeline.map((step, i) => (
                          <div key={i} className="cb-timeline-item">
                            <div className="cb-timeline-dot">
                              <Typo variant="$caption-2" style={{ color: 'white', fontWeight: 700, fontSize: 10 }}>{i + 1}</Typo>
                            </div>
                            <div className="cb-timeline-content">
                              <Flex style={{ alignItems: 'center', gap: 8 }}>
                                <CoreTag tagType="gray" size="xs">{step.time}</CoreTag>
                                <Typo variant="$body-2" style={{ fontWeight: 600, color: 'var(--semantic-color-text-1)' }}>{step.label}</Typo>
                              </Flex>
                              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', marginTop: 2 }}>
                                {step.description}
                              </Typo>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Do & Don't */}
                    <div>
                      <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 10 }}>
                        Do & Don't
                      </Typo>
                      <div className="cb-dodont">
                        <div className="cb-do-list">
                          <Typo variant="$caption-1" style={{ color: '#10b981', fontWeight: 600, marginBottom: 8 }}>Do</Typo>
                          {currentBrief.dos.map((item, i) => (
                            <div key={i} className="cb-dodont-item">
                              <Typo variant="$caption-2" style={{ color: '#10b981', flexShrink: 0 }}>&#10003;</Typo>
                              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>{item}</Typo>
                            </div>
                          ))}
                        </div>
                        <div className="cb-dont-list">
                          <Typo variant="$caption-1" style={{ color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>Don't</Typo>
                          {currentBrief.donts.map((item, i) => (
                            <div key={i} className="cb-dodont-item">
                              <Typo variant="$caption-2" style={{ color: '#ef4444', flexShrink: 0 }}>&#10007;</Typo>
                              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>{item}</Typo>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </VStack>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
