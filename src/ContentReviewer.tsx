import './ContentReviewer.css'
import { useState, useCallback, useRef } from 'react'
import { Flex, VStack, Typo, CoreButton, CoreTag, CoreSelect, CoreTextInput } from '@featuring-corp/components'
import { IconAiLavelOutline } from '@featuring-corp/icons'

/* ── 타입 정의 ── */
type CheckStatus = 'pass' | 'fail' | 'warn'

interface CheckItem {
  id: string
  status: CheckStatus
  label: string
  detail: string
  suggestion?: string
}

/* ── 상수/Mock 데이터 ── */
const INDUSTRY_OPTIONS = [
  { label: '뷰티', value: '뷰티' },
  { label: '식품', value: '식품' },
  { label: '패션', value: '패션' },
  { label: 'IT/테크', value: 'IT/테크' },
  { label: '건강/헬스', value: '건강/헬스' },
  { label: '여행', value: '여행' },
  { label: '홈/리빙', value: '홈/리빙' },
]

const DEFAULT_GUIDE = `[필수 해시태그] #그린러브 #비건스킨케어 #광고
[필수 멘션] @greenlove_official
[금칙어] 최고, 최초, 혁신적
[필수 문구] 그린러브로부터 제품을 제공받아 작성한 솔직한 리뷰입니다`

const DEFAULT_MANUSCRIPT = `요즘 빠진 비건 세럼 찐후기 🌿

진짜 이 세럼 혁신적이에요! 피부가 확 달라졌어요.
100% 식물성 성분이라 민감한 제 피부에도 자극 없이 촉촉하게 스며들더라고요.

아침저녁으로 2주 썼는데 톤도 밝아지고 결도 좋아졌어요.
이건 무조건 써봐야 해요!

#그린러브 #비건스킨케어 #비건세럼 #스킨케어루틴`

const MOCK_CHECK_RESULTS: CheckItem[] = [
  { id: 'c1', status: 'pass', label: '필수 해시태그 포함', detail: '#그린러브, #비건스킨케어 모두 포함되어 있습니다.' },
  { id: 'c2', status: 'pass', label: '금칙어 미사용 (최초)', detail: '"최초" 단어가 사용되지 않았습니다.' },
  { id: 'c3', status: 'pass', label: '톤 적합성', detail: '자연스럽고 친근한 톤으로 가이드라인에 부합합니다.' },
  { id: 'c4', status: 'pass', label: '콘텐츠 길이 적정', detail: '캡션 길이가 적정 범위(100-500자) 내에 있습니다.' },
  { id: 'c5', status: 'fail', label: '광고 표기 누락', detail: '"광고" 표기가 캡션 최상단에 명시되어야 합니다. 해시태그 내 #광고만으로는 부족합니다.', suggestion: '캡션 첫 줄에 [유료광고포함] 또는 "광고" 문구를 추가하세요.' },
  { id: 'c6', status: 'fail', label: '필수 멘션 누락', detail: '@greenlove_official 멘션이 캡션에 포함되어 있지 않습니다.', suggestion: '캡션 하단에 @greenlove_official 멘션을 추가하세요.' },
  { id: 'c7', status: 'fail', label: '금칙어 사용 감지', detail: '"혁신적" 금칙어가 캡션에 포함되어 있습니다. ("진짜 이 세럼 혁신적이에요!")', suggestion: '"혁신적이에요" → "정말 달라요" 또는 "확실히 좋아요"로 변경하세요.' },
  { id: 'c8', status: 'warn', label: '협찬 고지 문구 누락', detail: '필수 문구 "그린러브로부터 제품을 제공받아 작성한 솔직한 리뷰입니다"가 포함되어 있지 않습니다.', suggestion: '캡션 마지막에 해당 문구를 추가하는 것을 권장합니다.' },
]

const STATUS_ICON: Record<CheckStatus, string> = {
  pass: '✓',
  fail: '✕',
  warn: '!',
}

/* ── 서브 컴포넌트: 체크 카드 ── */
function CheckCard({ item }: { item: CheckItem }) {
  return (
    <div className={`cr-check-card cr-check-card--${item.status}`}>
      <Flex style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className={`cr-check-icon cr-check-icon--${item.status}`}>
          <Typo variant="$caption-2" style={{ color: 'white', fontWeight: 700 }}>{STATUS_ICON[item.status]}</Typo>
        </div>
        <VStack style={{ gap: 2, flex: 1 }}>
          <Typo variant="$body-2" style={{ fontWeight: 600, color: 'var(--semantic-color-text-1)' }}>{item.label}</Typo>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>{item.detail}</Typo>
          {item.suggestion && (
            <div className="cr-suggestion">
              <Typo variant="$caption-2" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 500 }}>
                💡 수정 제안: {item.suggestion}
              </Typo>
            </div>
          )}
        </VStack>
      </Flex>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function ContentReviewer() {
  const [guide, setGuide] = useState(DEFAULT_GUIDE)
  const [industry, setIndustry] = useState('뷰티')
  const [manuscript, setManuscript] = useState(DEFAULT_MANUSCRIPT)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<CheckItem[] | null>(null)
  const [showDmPreview, setShowDmPreview] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const passCount = results?.filter(r => r.status === 'pass').length ?? 0
  const failCount = results?.filter(r => r.status === 'fail').length ?? 0
  const warnCount = results?.filter(r => r.status === 'warn').length ?? 0

  const handleReview = useCallback(() => {
    setIsAnalyzing(true)
    setResults(null)
    setShowDmPreview(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setResults(MOCK_CHECK_RESULTS)
      setIsAnalyzing(false)
    }, 2000)
  }, [])

  const handleGenerateDm = useCallback(() => {
    setShowDmPreview(true)
  }, [])

  const dmMessage = results
    ? `안녕하세요, 그린러브 캠페인 담당자입니다 🌿

제출해 주신 원고를 검수한 결과, 아래 사항에 대해 수정이 필요합니다.

[필수 수정 사항]
${results.filter(r => r.status === 'fail').map((r, i) => `${i + 1}. ${r.label}\n   → ${r.suggestion}`).join('\n')}

[권장 수정 사항]
${results.filter(r => r.status === 'warn').map((r, i) => `${i + 1}. ${r.label}\n   → ${r.suggestion}`).join('\n')}

수정 완료 후 재제출 부탁드립니다.
감사합니다!`
    : ''

  return (
    <div className="cr-page">
      {/* ── 상단 헤더 바 ── */}
      <div className="cr-topbar">
        <IconAiLavelOutline size={20} color="var(--semantic-color-text-1)" />
        <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>콘텐츠 검수 체커</Typo>
        <CoreTag tagType="primary" size="xs">AI</CoreTag>
      </div>

      {/* ── 본문 ── */}
      <div className="cr-content">
        {/* 입력 영역 */}
        <div className="cr-input-section">
          <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 16 }}>
            검수 설정
          </Typo>

          <div className="cr-field">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 6 }}>캠페인 가이드 요약</Typo>
            <CoreTextInput
              size="md"
              placeholder="필수 해시태그, 멘션, 금칙어, 필수 문구를 입력하세요"
              value={guide}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuide(e.target.value)}
            />
          </div>

          <div className="cr-field">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 6 }}>산업군</Typo>
            <CoreSelect size="sm" value={industry} setValue={(v: string) => setIndustry(v)}>
              {INDUSTRY_OPTIONS.map(o => (
                <CoreSelect.Item key={o.value} value={o.value}>{o.label}</CoreSelect.Item>
              ))}
            </CoreSelect>
          </div>

          <div className="cr-field">
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 6 }}>인플루언서 제출 원고</Typo>
            <CoreTextInput
              size="md"
              placeholder="인플루언서가 제출한 캡션/원고를 붙여넣으세요"
              value={manuscript}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManuscript(e.target.value)}
            />
          </div>

          <Flex style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <CoreButton buttonType="primary" size="md" text="검수 시작" onClick={handleReview} />
          </Flex>
        </div>

        {/* AI 분석 중 */}
        {isAnalyzing && (
          <div className="cr-analyzing">
            <Typo variant="$body-2" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600 }}>
              AI가 원고를 검수하고 있습니다...
            </Typo>
          </div>
        )}

        {/* 결과 영역 */}
        {results && (
          <div className="cr-result-section">
            <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 16 }}>
              검수 결과
            </Typo>

            {/* 체크 카드 목록 */}
            <VStack style={{ gap: 0, marginBottom: 20 }}>
              {results.map(item => (
                <CheckCard key={item.id} item={item} />
              ))}
            </VStack>

            {/* 요약 바 */}
            <div className="cr-summary-bar">
              <div className="cr-summary-item">
                <Typo variant="$heading-4" style={{ color: '#ef4444' }}>{failCount}</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>필수수정</Typo>
              </div>
              <div className="cr-summary-item">
                <Typo variant="$heading-4" style={{ color: '#f59e0b' }}>{warnCount}</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>권장수정</Typo>
              </div>
              <div className="cr-summary-item">
                <Typo variant="$heading-4" style={{ color: '#10b981' }}>{passCount}</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>통과</Typo>
              </div>
            </div>

            {/* DM 생성 버튼 */}
            <Flex style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <CoreButton buttonType="contrast" size="md" text="피드백 DM 생성" onClick={handleGenerateDm} />
            </Flex>

            {/* DM 프리뷰 */}
            {showDmPreview && (
              <div className="cr-dm-preview">
                <Typo variant="$caption-1" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600, marginBottom: 8 }}>
                  DM 발송 프리뷰
                </Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>
                  {dmMessage}
                </Typo>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
