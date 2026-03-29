import './ProposalBuilder.css'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex, VStack, HStack, Typo, CoreButton, CoreTag, CoreTextInput, CoreSelect } from '@featuring-corp/components'
import {
  IconInstagramColored,
  IconYoutubeColored,
  IconTiktokColored,
  IconChevronLeftOutline,
  IconChevronRightOutline,
  IconDownloadOutline,
} from '@featuring-corp/icons'
import type {
  CampaignBrief,
  CampaignObjective,
  ToneStyle,
  ProposalCandidate,
  CandidateSummary,
  ProofSection,
  ReferenceContent,
  CreativeBriefIdea,
  ProposalStep,
} from './types/proposal'
import type { Platform, ContentFormat } from './types/content-explorer'

/* ── 상수 ── */
const OBJECTIVE_OPTIONS: { value: CampaignObjective; label: string }[] = [
  { value: 'awareness', label: '브랜드 인지도' },
  { value: 'engagement', label: '인게이지먼트' },
  { value: 'conversion', label: '전환/구매' },
  { value: 'traffic', label: '트래픽' },
]

const TONE_OPTIONS: { value: ToneStyle; label: string }[] = [
  { value: 'natural', label: '자연스러운' },
  { value: 'professional', label: '전문적인' },
  { value: 'humorous', label: '유머러스' },
  { value: 'trendy', label: '트렌디' },
  { value: 'luxurious', label: '럭셔리' },
]

const PLATFORM_LIST: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'IG' },
  { value: 'youtube', label: 'YT' },
  { value: 'tiktok', label: 'TikTok' },
]

const FORMAT_LIST: { value: ContentFormat; label: string }[] = [
  { value: '릴스', label: '릴스' },
  { value: '피드', label: '피드' },
  { value: '스토리', label: '스토리' },
  { value: '쇼츠', label: '쇼츠' },
  { value: '영상', label: '영상' },
]

const PLATFORM_ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  instagram: IconInstagramColored,
  youtube: IconYoutubeColored,
  tiktok: IconTiktokColored,
}

const PLATFORM_SHORT: Record<string, string> = {
  instagram: 'IG',
  youtube: 'YT',
  tiktok: 'TT',
}

/* ── Mock 데이터 ── */
const MOCK_DEFAULT_BRIEF: CampaignBrief = {
  brandName: '다이슨',
  productName: '에어랩 멀티 스타일러',
  objective: 'awareness',
  targetAudience: '20-30대 여성, 뷰티 관심',
  toneStyle: 'natural',
  budgetRange: '5,000만원',
  platforms: ['instagram'],
  formats: ['릴스', '피드'],
  keywords: ['헤어', '스타일링', '자연스러운'],
}

const MOCK_CANDIDATES: ProposalCandidate[] = [
  { influencerId: 1, name: 'TheAcacia_Hyurin', handle: '@theacacia_hyurin', platform: 'instagram', followerCount: '9,204만', er: '10%', categories: ['뷰티', '패션'], brandFitScore: 92, estimatedPrice: '900,000', isSelected: true },
  { influencerId: 2, name: 'tteokbokkiyum', handle: '@tteokbokkiyum', platform: 'instagram', followerCount: '3,580만', er: '8.5%', categories: ['음식', '일상'], brandFitScore: 87, estimatedPrice: '800,000', isSelected: true },
  { influencerId: 3, name: 'abb_revi', handle: '@abb_revi', platform: 'instagram', followerCount: '1,340만', er: '9.1%', categories: ['뷰티', '스킨케어'], brandFitScore: 85, estimatedPrice: '600,000', isSelected: true },
  { influencerId: 4, name: 'ctolook', handle: '@ctolook', platform: 'instagram', followerCount: '780만', er: '11.2%', categories: ['패션', '뷰티'], brandFitScore: 78, estimatedPrice: '400,000', isSelected: false },
  { influencerId: 5, name: 'deobeauty', handle: '@deobeauty', platform: 'youtube', followerCount: '640만', er: '6.8%', categories: ['뷰티', '메이크업'], brandFitScore: 82, estimatedPrice: '500,000', isSelected: true },
  { influencerId: 6, name: 'starjelly_kr', handle: '@starjelly_kr', platform: 'tiktok', followerCount: '290만', er: '12.4%', categories: ['댄스', '일상'], brandFitScore: 80, estimatedPrice: '350,000', isSelected: true },
  { influencerId: 7, name: 'beauty.yun', handle: '@beauty.yun', platform: 'instagram', followerCount: '170만', er: '9.6%', categories: ['뷰티', '스킨케어'], brandFitScore: 76, estimatedPrice: '250,000', isSelected: false },
  { influencerId: 8, name: 'upstagramc', handle: '@upstagramc', platform: 'instagram', followerCount: '520만', er: '8.0%', categories: ['요리', '홈/리빙'], brandFitScore: 74, estimatedPrice: '450,000', isSelected: false },
]

const MOCK_PROOF_SECTIONS: ProofSection[] = [
  {
    influencerId: 1,
    handle: '@theacacia_hyurin',
    proofContents: [
      { id: 'p1-1', contentType: '릴스', caption: '자연광 스타일링 톤 일치', metrics: { likes: 11200, comments: 890, saves: 1540, engagementRate: 12.3 }, matchReason: '자연광 스타일링 톤 일치' },
      { id: 'p1-2', contentType: '피드', caption: '일상 뷰티 루틴 포맷', metrics: { likes: 7800, comments: 420, saves: 980, engagementRate: 8.1 }, matchReason: '일상 뷰티 루틴 포맷' },
      { id: 'p1-3', contentType: '스토리', caption: '제품 자연스러운 노출 사례', metrics: { likes: 9100, comments: 650, saves: 1120, engagementRate: 9.5 }, matchReason: '제품 자연스러운 노출 사례' },
    ],
    matchReasons: ['자연스러운 톤 일관성 (최근 30개 콘텐츠 분석)', '뷰티/헤어 카테고리 전문성 67%', '20대 여성 팔로워 비율 78%'],
    aiSummary: '자연스러운 톤과 뷰티 전문성을 갖춘 최적의 후보. 20대 여성 타깃과 높은 일치도.',
  },
  {
    influencerId: 2,
    handle: '@tteokbokkiyum',
    proofContents: [
      { id: 'p2-1', contentType: '릴스', caption: '제품 자연 노출 스타일', metrics: { likes: 10500, comments: 780, saves: 1380, engagementRate: 11.2 }, matchReason: '제품 자연 노출 스타일' },
      { id: 'p2-2', contentType: '피드', caption: '일상+뷰티 크로스', metrics: { likes: 7200, comments: 380, saves: 920, engagementRate: 7.8 }, matchReason: '일상+뷰티 크로스' },
      { id: 'p2-3', contentType: '릴스', caption: '높은 저장률 콘텐츠', metrics: { likes: 9500, comments: 620, saves: 1850, engagementRate: 10.1 }, matchReason: '높은 저장률' },
    ],
    matchReasons: ['제품 자연 노출 스타일 (PPL 23%)', '일상+뷰티 크로스 콘텐츠', '높은 저장률 4.2%'],
    aiSummary: '자연스러운 PPL과 일상 콘텐츠 조합이 강점. 높은 저장률로 장기 노출 효과.',
  },
  {
    influencerId: 3,
    handle: '@abb_revi',
    proofContents: [
      { id: 'p3-1', contentType: '피드', caption: '상세 리뷰 콘텐츠', metrics: { likes: 9200, comments: 510, saves: 1100, engagementRate: 9.8 }, matchReason: '상세 리뷰' },
      { id: 'p3-2', contentType: '릴스', caption: '비포/애프터 콘텐츠', metrics: { likes: 12500, comments: 980, saves: 2100, engagementRate: 13.2 }, matchReason: '비포/애프터' },
      { id: 'p3-3', contentType: '피드', caption: '제품 비교 콘텐츠', metrics: { likes: 8100, comments: 430, saves: 950, engagementRate: 8.5 }, matchReason: '제품 비교' },
    ],
    matchReasons: ['상세 리뷰 전문', '뷰티 리뷰 전환율 높음', '댓글 답변율 92%'],
    aiSummary: '상세 리뷰 콘텐츠의 전문가. 높은 댓글 답변율로 팬 소통이 활발.',
  },
  {
    influencerId: 5,
    handle: '@deobeauty',
    proofContents: [
      { id: 'p5-1', contentType: '영상', caption: '튜토리얼 형식 콘텐츠', metrics: { likes: 6800, comments: 320, saves: 780, engagementRate: 7.2 }, matchReason: '튜토리얼 형식' },
      { id: 'p5-2', contentType: '영상', caption: '제품 언박싱 콘텐츠', metrics: { likes: 6100, comments: 280, saves: 650, engagementRate: 6.5 }, matchReason: '제품 언박싱' },
      { id: 'p5-3', contentType: '쇼츠', caption: 'quick tip 콘텐츠', metrics: { likes: 8400, comments: 510, saves: 920, engagementRate: 8.9 }, matchReason: 'quick tip' },
    ],
    matchReasons: ['YouTube 뷰티 튜토리얼 전문', '긴 영상 시청 유지율 높음', '검색 유입 비율 42%'],
    aiSummary: 'YouTube 튜토리얼 전문가. 검색 기반 유입이 높아 장기 콘텐츠 가치.',
  },
  {
    influencerId: 6,
    handle: '@starjelly_kr',
    proofContents: [
      { id: 'p6-1', contentType: '쇼츠', caption: '빠른 변신 콘텐츠', metrics: { likes: 13200, comments: 1100, saves: 1800, engagementRate: 14.1 }, matchReason: '빠른 변신' },
      { id: 'p6-2', contentType: '쇼츠', caption: '제품 활용법 콘텐츠', metrics: { likes: 12000, comments: 950, saves: 1650, engagementRate: 12.8 }, matchReason: '제품 활용법' },
      { id: 'p6-3', contentType: '릴스', caption: '데일리 루틴 콘텐츠', metrics: { likes: 10800, comments: 780, saves: 1400, engagementRate: 11.5 }, matchReason: '데일리 루틴' },
    ],
    matchReasons: ['TikTok 쇼츠 특화', '빠른 편집 스타일', '10-20대 팔로워 비율 85%'],
    aiSummary: 'TikTok/쇼츠 특화 크리에이터. 빠른 편집과 젊은 팔로워층이 강점.',
  },
]

const MOCK_REFERENCE_CONTENTS: ReferenceContent[] = [
  {
    id: 'ref-1',
    creatorHandle: '@hair_master_kr',
    contentType: '릴스',
    engagementRate: 14.2,
    cluster: { id: 'cl-1', platform: 'instagram', placement: '릴스', duration: '11-20s', structure: 'talking-head', editing: 'fast-cuts', label: 'IG/릴스/11-20s/talking-head/fast-cuts' },
    description: '헤어 스타일링 릴스 상위 성과',
  },
  {
    id: 'ref-2',
    creatorHandle: '@beauty_routine',
    contentType: '릴스',
    engagementRate: 11.8,
    cluster: { id: 'cl-2', platform: 'instagram', placement: '릴스', duration: '21-40s', structure: 'hands-demo', editing: 'fast-cuts', label: 'IG/릴스/21-40s/hands-demo/fast-cuts' },
    description: '제품 데모 릴스 상위 성과',
  },
  {
    id: 'ref-3',
    creatorHandle: '@style_daily',
    contentType: '피드',
    engagementRate: 10.5,
    cluster: { id: 'cl-3', platform: 'instagram', placement: '피드', duration: '0-10s', structure: 'text-only', editing: 'slideshow', label: 'IG/피드/0-10s/text-only/slideshow' },
    description: '스타일링 팁 피드 상위 성과',
  },
]

const MOCK_CREATIVE_BRIEF: CreativeBriefIdea = {
  hookIdeas: [
    '매일 5분이면 충분한 헤어 스타일링 루틴',
    '솔직히 이건 진짜 달라요 (에어랩 비포/애프터)',
    '헤어 초보도 가능한 에어랩 3가지 활용법',
  ],
  contiSuggestion: '인트로(3초) → 비포(5초) → 시연(15초) → 리뷰(7초)',
  messageDirection: '자연스러운 일상 속 스타일링 루틴으로 에어랩의 편리함과 결과물을 보여주되, 과장 없이 솔직한 톤 유지',
}

/* ── 유틸 ── */
function parsePriceNumber(priceStr: string): number {
  return parseInt(priceStr.replace(/,/g, ''), 10) || 0
}

function formatCurrency(n: number): string {
  return n.toLocaleString('ko-KR')
}

/* ── 서브 컴포넌트: Step Indicator ── */
function StepIndicator({ currentStep }: { currentStep: ProposalStep }) {
  return (
    <div className="pb-step-indicator">
      {[1, 2, 3, 4].map((s, i) => (
        <div key={s} className="pb-step-item">
          <div
            className={`pb-step-dot ${s === currentStep ? 'pb-step-dot--active' : ''} ${s < currentStep ? 'pb-step-dot--done' : ''}`}
          >
            <Typo variant="$caption-2" style={{ color: s <= currentStep ? '#fff' : 'var(--semantic-color-text-5)', fontSize: 11 }}>
              {s < currentStep ? '\u2713' : s}
            </Typo>
          </div>
          {i < 3 && (
            <div className={`pb-step-line ${s < currentStep ? 'pb-step-line--done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ── 서브 컴포넌트: Toggle Chip ── */
function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div className={`pb-toggle-chip ${active ? 'pb-toggle-chip--active' : ''}`} onClick={onClick}>
      <Typo variant="$caption-1" style={{ color: active ? 'var(--global-colors-primary-60)' : 'var(--semantic-color-text-3)' }}>
        {active ? '✓ ' : ''}{label}
      </Typo>
    </div>
  )
}

/* ── 서브 컴포넌트: BrandFitBar ── */
function BrandFitBar({ score }: { score: number }) {
  let colorClass = 'pb-fit--green'
  if (score < 80) colorClass = 'pb-fit--orange'
  else if (score < 90) colorClass = 'pb-fit--teal'

  return (
    <Flex style={{ alignItems: 'center', gap: 8 }}>
      <Typo variant="$caption-1" style={{ fontWeight: 600, width: 28 }}>{score}</Typo>
      <div className="pb-fit-bar-bg">
        <div className={`pb-fit-bar-fill ${colorClass}`} style={{ width: `${score}%` }} />
      </div>
    </Flex>
  )
}

/* ── 서브 컴포넌트: Step 1 — 브리프 입력 ── */
function Step1Brief({
  brief,
  setBrief,
}: {
  brief: CampaignBrief
  setBrief: React.Dispatch<React.SetStateAction<CampaignBrief>>
}) {
  const updateField = <K extends keyof CampaignBrief>(key: K, value: CampaignBrief[K]) => {
    setBrief((prev) => ({ ...prev, [key]: value }))
  }

  const togglePlatform = (p: Platform) => {
    setBrief((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }))
  }

  const toggleFormat = (f: ContentFormat) => {
    setBrief((prev) => ({
      ...prev,
      formats: prev.formats.includes(f)
        ? prev.formats.filter((x) => x !== f)
        : [...prev.formats, f],
    }))
  }

  return (
    <VStack style={{ gap: 24 }}>
      <VStack style={{ gap: 4 }}>
        <Typo variant="$heading-4" style={{ fontWeight: 700 }}>캠페인 브리프</Typo>
        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
          브랜드와 캠페인 정보를 입력하면 AI가 최적의 인플루언서를 추천합니다.
        </Typo>
      </VStack>

      {/* 입력 필드들 */}
      <VStack style={{ gap: 16 }}>
        <Flex style={{ gap: 12, alignItems: 'center' }}>
          <Typo variant="$caption-1" style={{ width: 100, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>브랜드명</Typo>
          <CoreTextInput size="md" placeholder="브랜드명" value={brief.brandName} onChange={(e) => updateField('brandName', e.target.value)} />
        </Flex>
        <Flex style={{ gap: 12, alignItems: 'center' }}>
          <Typo variant="$caption-1" style={{ width: 100, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>제품/서비스</Typo>
          <CoreTextInput size="md" placeholder="제품 또는 서비스명" value={brief.productName} onChange={(e) => updateField('productName', e.target.value)} />
        </Flex>
        <Flex style={{ gap: 12, alignItems: 'center' }}>
          <Typo variant="$caption-1" style={{ width: 100, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>캠페인 목적</Typo>
          <CoreSelect size="sm" defaultValue={brief.objective} setValue={(v: string) => updateField('objective', v as CampaignObjective)}>
            {OBJECTIVE_OPTIONS.map((opt) => (
              <CoreSelect.Item key={opt.value} value={opt.value}>{opt.label}</CoreSelect.Item>
            ))}
          </CoreSelect>
        </Flex>
        <Flex style={{ gap: 12, alignItems: 'center' }}>
          <Typo variant="$caption-1" style={{ width: 100, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>타깃 오디언스</Typo>
          <CoreTextInput size="md" placeholder="예: 20-30대 여성, 뷰티 관심" value={brief.targetAudience} onChange={(e) => updateField('targetAudience', e.target.value)} />
        </Flex>
        <Flex style={{ gap: 12, alignItems: 'center' }}>
          <Typo variant="$caption-1" style={{ width: 100, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>톤앤매너</Typo>
          <CoreSelect size="sm" defaultValue={brief.toneStyle} setValue={(v: string) => updateField('toneStyle', v as ToneStyle)}>
            {TONE_OPTIONS.map((opt) => (
              <CoreSelect.Item key={opt.value} value={opt.value}>{opt.label}</CoreSelect.Item>
            ))}
          </CoreSelect>
        </Flex>
        <Flex style={{ gap: 12, alignItems: 'center' }}>
          <Typo variant="$caption-1" style={{ width: 100, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>예산 범위</Typo>
          <CoreTextInput size="md" placeholder="예: 5,000만원" value={brief.budgetRange} onChange={(e) => updateField('budgetRange', e.target.value)} />
        </Flex>
      </VStack>

      {/* 플랫폼 선택 */}
      <VStack style={{ gap: 8 }}>
        <Typo variant="$body-2" style={{ fontWeight: 600 }}>선호 플랫폼</Typo>
        <HStack style={{ gap: 8 }}>
          {PLATFORM_LIST.map((p) => (
            <ToggleChip key={p.value} label={p.label} active={brief.platforms.includes(p.value)} onClick={() => togglePlatform(p.value)} />
          ))}
        </HStack>
      </VStack>

      {/* 포맷 선택 */}
      <VStack style={{ gap: 8 }}>
        <Typo variant="$body-2" style={{ fontWeight: 600 }}>선호 포맷</Typo>
        <HStack style={{ gap: 8, flexWrap: 'wrap' } as React.CSSProperties}>
          {FORMAT_LIST.map((f) => (
            <ToggleChip key={f.value} label={f.label} active={brief.formats.includes(f.value)} onClick={() => toggleFormat(f.value)} />
          ))}
        </HStack>
      </VStack>

      {/* 키워드 */}
      <VStack style={{ gap: 8 }}>
        <Typo variant="$body-2" style={{ fontWeight: 600 }}>키워드</Typo>
        <CoreTextInput
          size="md"
          placeholder="쉼표로 구분하여 입력"
          value={brief.keywords.join(', ')}
          onChange={(e) => updateField('keywords', e.target.value.split(',').map((k) => k.trim()).filter(Boolean))}
        />
      </VStack>
    </VStack>
  )
}

/* ── 서브 컴포넌트: Step 2 — 후보 선정 ── */
function Step2Candidates({
  candidates,
  setCandidates,
}: {
  candidates: ProposalCandidate[]
  setCandidates: React.Dispatch<React.SetStateAction<ProposalCandidate[]>>
}) {
  const selectedCandidates = candidates.filter((c) => c.isSelected)
  const allSelected = candidates.every((c) => c.isSelected)

  const summary: CandidateSummary = useMemo(() => {
    const selected = candidates.filter((c) => c.isSelected)
    const totalCost = selected.reduce((sum, c) => sum + parsePriceNumber(c.estimatedPrice), 0)
    const avgFit = selected.length > 0
      ? Math.round((selected.reduce((sum, c) => sum + c.brandFitScore, 0) / selected.length) * 10) / 10
      : 0
    return {
      totalEstimatedCost: formatCurrency(totalCost),
      avgBrandFit: avgFit,
      totalExpectedReach: '1,342,000',
      selectedCount: selected.length,
    }
  }, [candidates])

  const toggleCandidate = (id: number) => {
    setCandidates((prev) =>
      prev.map((c) => c.influencerId === id ? { ...c, isSelected: !c.isSelected } : c)
    )
  }

  const toggleAll = () => {
    const newVal = !allSelected
    setCandidates((prev) => prev.map((c) => ({ ...c, isSelected: newVal })))
  }

  return (
    <VStack style={{ gap: 20 }}>
      {/* AI 분석 배너 */}
      <div className="pb-ai-banner">
        <VStack style={{ gap: 6 }}>
          <Typo variant="$body-2" style={{ fontWeight: 600 }}>
            브리프 기반으로 1,847개 콘텐츠를 분석하여 {candidates.length}명의 후보를 추천합니다
          </Typo>
          <Typo variant="$caption-1" style={{ color: 'var(--global-colors-primary-60)' }}>
            수동: 4시간 12분 → AI: 3초 (99.9% 절약)
          </Typo>
        </VStack>
      </div>

      {/* 선택 헤더 */}
      <Flex style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <HStack style={{ gap: 12, alignItems: 'center' }}>
          <label className="pb-checkbox-label" onClick={toggleAll}>
            <input type="checkbox" className="pb-checkbox" checked={allSelected} readOnly />
            <Typo variant="$caption-1">전체 선택</Typo>
          </label>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
            선택: {selectedCandidates.length}/{candidates.length}
          </Typo>
        </HStack>
      </Flex>

      {/* 후보 테이블 */}
      <div className="pb-table-wrap">
        <table className="pb-table">
          <thead>
            <tr>
              <th className="pb-col-check"></th>
              <th>계정</th>
              <th>플랫폼</th>
              <th>팔로워</th>
              <th>ER</th>
              <th>Brand Fit</th>
              <th>예상 단가</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => {
              const PlatformIcon = PLATFORM_ICON_MAP[c.platform]
              return (
                <tr key={c.influencerId} className={c.isSelected ? 'pb-tr--selected' : ''}>
                  <td className="pb-td-check">
                    <input
                      type="checkbox"
                      className="pb-checkbox"
                      checked={c.isSelected}
                      onChange={() => toggleCandidate(c.influencerId)}
                    />
                  </td>
                  <td>
                    <Typo variant="$caption-1" style={{ fontWeight: 600 }}>{c.handle}</Typo>
                  </td>
                  <td>
                    <HStack style={{ gap: 4, alignItems: 'center' }}>
                      {PlatformIcon && <PlatformIcon size={14} />}
                      <Typo variant="$caption-2">{PLATFORM_SHORT[c.platform]}</Typo>
                    </HStack>
                  </td>
                  <td>
                    <Typo variant="$caption-1">{c.followerCount}</Typo>
                  </td>
                  <td>
                    <Typo variant="$caption-1">{c.er}</Typo>
                  </td>
                  <td>
                    <BrandFitBar score={c.brandFitScore} />
                  </td>
                  <td>
                    <Typo variant="$caption-1">{c.estimatedPrice}</Typo>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 요약 카드 */}
      <div className="pb-summary-card">
        <Flex style={{ gap: 24, flexWrap: 'wrap' }}>
          <VStack style={{ gap: 2 }}>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>총 예상 비용</Typo>
            <Typo variant="$body-2" style={{ fontWeight: 700 }}>{'\u20A9'}{summary.totalEstimatedCost}</Typo>
          </VStack>
          <VStack style={{ gap: 2 }}>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>평균 Brand Fit</Typo>
            <Typo variant="$body-2" style={{ fontWeight: 700 }}>{summary.avgBrandFit}%</Typo>
          </VStack>
          <VStack style={{ gap: 2 }}>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>예상 총 도달</Typo>
            <Typo variant="$body-2" style={{ fontWeight: 700 }}>{summary.totalExpectedReach}</Typo>
          </VStack>
          <VStack style={{ gap: 2 }}>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>선택 인원</Typo>
            <Typo variant="$body-2" style={{ fontWeight: 700 }}>{summary.selectedCount}명</Typo>
          </VStack>
        </Flex>
      </div>
    </VStack>
  )
}

/* ── 서브 컴포넌트: Step 3 — 근거 & 레퍼런스 ── */
function Step3Proof({
  candidates,
  proofSections,
  referenceContents,
  creativeBrief,
}: {
  candidates: ProposalCandidate[]
  proofSections: ProofSection[]
  referenceContents: ReferenceContent[]
  creativeBrief: CreativeBriefIdea
}) {
  const selectedCandidates = candidates.filter((c) => c.isSelected)
  const [activeInfluencer, setActiveInfluencer] = useState(selectedCandidates[0]?.influencerId ?? 0)

  const currentProof = proofSections.find((p) => p.influencerId === activeInfluencer)

  return (
    <VStack style={{ gap: 20 }}>
      {/* 인플루언서 탭 */}
      <Flex style={{ gap: 8, flexWrap: 'wrap' }}>
        {selectedCandidates.map((c) => {
          return (
            <div
              key={c.influencerId}
              className={`pb-influencer-tab ${activeInfluencer === c.influencerId ? 'pb-influencer-tab--active' : ''}`}
              onClick={() => setActiveInfluencer(c.influencerId)}
            >
              <Typo variant="$caption-1" style={{ fontWeight: activeInfluencer === c.influencerId ? 600 : 400 }}>
                {c.handle}
              </Typo>
            </div>
          )
        })}
      </Flex>

      {/* Proof 콘텐츠 */}
      {currentProof && (
        <div className="pb-proof-section">
          <VStack style={{ gap: 16 }}>
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>
              이 크리에이터가 브리프에 맞는 이유:
            </Typo>

            {/* Proof 콘텐츠 카드 */}
            <Flex style={{ gap: 12, flexWrap: 'wrap' }}>
              {currentProof.proofContents.map((pc) => (
                <div key={pc.id} className="pb-proof-card">
                  <div className="pb-proof-thumbnail" />
                  <VStack style={{ gap: 4, padding: '8px 0 0' }}>
                    <HStack style={{ gap: 6, alignItems: 'center' }}>
                      <CoreTag tagType="gray" size="xs">{pc.contentType}</CoreTag>
                    </HStack>
                    <Typo variant="$caption-1" style={{ fontWeight: 600 }}>ER: {pc.metrics.engagementRate}%</Typo>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
                      "{pc.matchReason}"
                    </Typo>
                  </VStack>
                </div>
              ))}
            </Flex>

            {/* AI 매칭 근거 */}
            <div className="pb-match-reasons">
              <Typo variant="$caption-1" style={{ fontWeight: 600, marginBottom: 8 }}>AI 매칭 근거:</Typo>
              <VStack style={{ gap: 4 }}>
                {currentProof.matchReasons.map((reason, i) => (
                  <Typo key={i} variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
                    {'\u2022'} {reason}
                  </Typo>
                ))}
              </VStack>
            </div>
          </VStack>
        </div>
      )}

      {/* Reference 콘텐츠 */}
      <div className="pb-proof-section">
        <VStack style={{ gap: 12 }}>
          <Typo variant="$body-2" style={{ fontWeight: 600 }}>Reference 콘텐츠</Typo>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
            클러스터: 릴스 x 15-30초 x Talking Head x Fast Cuts
          </Typo>

          <Flex style={{ gap: 12, flexWrap: 'wrap' }}>
            {referenceContents.map((ref) => (
              <div key={ref.id} className="pb-proof-card">
                <div className="pb-proof-thumbnail" />
                <VStack style={{ gap: 4, padding: '8px 0 0' }}>
                  <Typo variant="$caption-1" style={{ fontWeight: 600 }}>{ref.creatorHandle}</Typo>
                  <Typo variant="$caption-1">ER: {ref.engagementRate}%</Typo>
                  <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
                    "{ref.description}"
                  </Typo>
                </VStack>
              </div>
            ))}
          </Flex>
        </VStack>
      </div>

      {/* 크리에이티브 브리프 */}
      <div className="pb-proof-section">
        <VStack style={{ gap: 12 }}>
          <Typo variant="$body-2" style={{ fontWeight: 600 }}>크리에이티브 브리프</Typo>

          <VStack style={{ gap: 8 }}>
            <Typo variant="$caption-1" style={{ fontWeight: 600 }}>훅 아이디어:</Typo>
            {creativeBrief.hookIdeas.map((hook, i) => (
              <Typo key={i} variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
                {i + 1}. "{hook}"
              </Typo>
            ))}
          </VStack>

          <VStack style={{ gap: 4 }}>
            <Typo variant="$caption-1" style={{ fontWeight: 600 }}>콘티:</Typo>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
              {creativeBrief.contiSuggestion}
            </Typo>
          </VStack>

          <VStack style={{ gap: 4 }}>
            <Typo variant="$caption-1" style={{ fontWeight: 600 }}>메시지 방향:</Typo>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
              {creativeBrief.messageDirection}
            </Typo>
          </VStack>
        </VStack>
      </div>
    </VStack>
  )
}

/* ── 서브 컴포넌트: Step 4 — 제안서 미리보기 ── */
function Step4Preview({
  brief,
  candidates,
  proofSections,
  referenceContents,
  creativeBrief,
}: {
  brief: CampaignBrief
  candidates: ProposalCandidate[]
  proofSections: ProofSection[]
  referenceContents: ReferenceContent[]
  creativeBrief: CreativeBriefIdea
}) {
  const selectedCandidates = candidates.filter((c) => c.isSelected)
  const totalCost = selectedCandidates.reduce((sum, c) => sum + parsePriceNumber(c.estimatedPrice), 0)
  const avgER = selectedCandidates.length > 0
    ? (selectedCandidates.reduce((sum, c) => sum + parseFloat(c.er.replace('%', '')), 0) / selectedCandidates.length).toFixed(1)
    : '0'
  const objectiveLabel = OBJECTIVE_OPTIONS.find((o) => o.value === brief.objective)?.label ?? brief.objective

  return (
    <VStack style={{ gap: 24 }}>
      {/* PPT 스타일 카드 */}
      <div className="pb-preview-card">
        <VStack style={{ gap: 28 }}>
          {/* 타이틀 */}
          <VStack style={{ gap: 4, textAlign: 'center' } as React.CSSProperties}>
            <Typo variant="$heading-3" style={{ fontWeight: 700 }}>
              {brief.brandName} {brief.productName}
            </Typo>
            <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-3)' }}>
              인플루언서 캠페인 제안서
            </Typo>
          </VStack>

          <div className="pb-preview-divider" />

          {/* 캠페인 개요 */}
          <VStack style={{ gap: 10 }}>
            <Typo variant="$body-1" style={{ fontWeight: 700 }}>캠페인 개요</Typo>
            <Flex style={{ gap: 24, flexWrap: 'wrap' }}>
              <VStack style={{ gap: 2 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>목적</Typo>
                <Typo variant="$caption-1">{objectiveLabel}</Typo>
              </VStack>
              <VStack style={{ gap: 2 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>타깃</Typo>
                <Typo variant="$caption-1">{brief.targetAudience}</Typo>
              </VStack>
              <VStack style={{ gap: 2 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>예산</Typo>
                <Typo variant="$caption-1">{brief.budgetRange}</Typo>
              </VStack>
            </Flex>
          </VStack>

          <div className="pb-preview-divider" />

          {/* 추천 인플루언서 */}
          <VStack style={{ gap: 10 }}>
            <Typo variant="$body-1" style={{ fontWeight: 700 }}>
              추천 인플루언서 ({selectedCandidates.length}명)
            </Typo>
            <div className="pb-preview-table-wrap">
              <table className="pb-preview-table">
                <thead>
                  <tr>
                    <th>계정</th>
                    <th>팔로워</th>
                    <th>ER</th>
                    <th>Brand Fit</th>
                    <th>예상 단가</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCandidates.map((c) => (
                    <tr key={c.influencerId}>
                      <td>
                        <Typo variant="$caption-1" style={{ fontWeight: 600 }}>{c.handle}</Typo>
                      </td>
                      <td><Typo variant="$caption-1">{c.followerCount}</Typo></td>
                      <td><Typo variant="$caption-1">{c.er}</Typo></td>
                      <td><Typo variant="$caption-1">{c.brandFitScore}%</Typo></td>
                      <td><Typo variant="$caption-1">{c.estimatedPrice}</Typo></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </VStack>

          <div className="pb-preview-divider" />

          {/* 선정 근거 요약 */}
          <VStack style={{ gap: 10 }}>
            <Typo variant="$body-1" style={{ fontWeight: 700 }}>선정 근거 요약</Typo>
            <VStack style={{ gap: 8 }}>
              {selectedCandidates.map((c) => {
                const proof = proofSections.find((p) => p.influencerId === c.influencerId)
                return (
                  <Flex key={c.influencerId} style={{ gap: 8 }}>
                    <Typo variant="$caption-1" style={{ fontWeight: 600, width: 140, flexShrink: 0 }}>{c.handle}</Typo>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
                      {proof?.aiSummary ?? '-'} (Proof {proof?.proofContents.length ?? 0}개)
                    </Typo>
                  </Flex>
                )
              })}
            </VStack>
          </VStack>

          <div className="pb-preview-divider" />

          {/* 크리에이티브 방향 */}
          <VStack style={{ gap: 10 }}>
            <Typo variant="$body-1" style={{ fontWeight: 700 }}>크리에이티브 방향</Typo>
            <Flex style={{ gap: 24, flexWrap: 'wrap' }}>
              <VStack style={{ gap: 2 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>포맷</Typo>
                <Typo variant="$caption-1">{brief.formats.join(', ')}</Typo>
              </VStack>
              <VStack style={{ gap: 2 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>훅</Typo>
                <Typo variant="$caption-1">"{creativeBrief.hookIdeas[0]}"</Typo>
              </VStack>
            </Flex>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
              Reference 콘텐츠 {referenceContents.length}개
            </Typo>
          </VStack>

          <div className="pb-preview-divider" />

          {/* 예상 성과 */}
          <VStack style={{ gap: 10 }}>
            <Typo variant="$body-1" style={{ fontWeight: 700 }}>예상 성과</Typo>
            <Flex style={{ gap: 24, flexWrap: 'wrap' }}>
              <VStack style={{ gap: 2 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>총 도달</Typo>
                <Typo variant="$body-2" style={{ fontWeight: 700 }}>1,342,000</Typo>
              </VStack>
              <VStack style={{ gap: 2 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>평균 ER</Typo>
                <Typo variant="$body-2" style={{ fontWeight: 700 }}>{avgER}%</Typo>
              </VStack>
              <VStack style={{ gap: 2 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>비용</Typo>
                <Typo variant="$body-2" style={{ fontWeight: 700 }}>{'\u20A9'}{formatCurrency(totalCost)}</Typo>
              </VStack>
            </Flex>
          </VStack>

          {/* 푸터 */}
          <Flex style={{ justifyContent: 'center', paddingTop: 12 }}>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
              Powered by featuring AI
            </Typo>
          </Flex>
        </VStack>
      </div>

      {/* 비즈니스 임팩트 */}
      <div className="pb-impact-card">
        <VStack style={{ gap: 8 }}>
          <Flex style={{ gap: 8, alignItems: 'center' }}>
            <Typo variant="$caption-1">수동 작성: 4시간 12분 → AI 생성: 45초</Typo>
          </Flex>
          <Typo variant="$caption-1">
            포함: 후보 {selectedCandidates.length}명 x Proof 3개 x Reference {referenceContents.length}개
          </Typo>
          <Typo variant="$caption-1" style={{ color: 'var(--global-colors-primary-60)' }}>
            시장에서 유일하게 콘텐츠 기반 선정 근거 자동 포함
          </Typo>
        </VStack>
      </div>
    </VStack>
  )
}

/* ── 메인 컴포넌트 ── */
export default function ProposalBuilder() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<ProposalStep>(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  /* Step 1 상태 */
  const [brief, setBrief] = useState<CampaignBrief>({ ...MOCK_DEFAULT_BRIEF })

  /* Step 2 상태 */
  const [candidates, setCandidates] = useState<ProposalCandidate[]>(MOCK_CANDIDATES.map((c) => ({ ...c })))

  /* Step 전환 핸들러 */
  const handleStep1Next = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setCurrentStep(2)
    }, 2000)
  }

  const handleStep2Next = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setCurrentStep(3)
    }, 1500)
  }

  const handleStep3Next = () => {
    setCurrentStep(4)
  }

  const handlePdfDownload = () => {
    alert('프로토타입에서는 실제 PDF가 생성되지 않습니다. 실제 구현 시 PDF 생성 API가 연결됩니다.')
  }

  const handleClipboardCopy = () => {
    const selectedCandidates = candidates.filter((c) => c.isSelected)
    const text = `[${brief.brandName} ${brief.productName} 인플루언서 캠페인 제안서]\n추천 인플루언서: ${selectedCandidates.map((c) => c.handle).join(', ')}`
    navigator.clipboard.writeText(text).then(() => {
      alert('제안서 요약이 클립보드에 복사되었습니다.')
    }).catch(() => {
      alert('클립보드 복사가 지원되지 않는 환경입니다.')
    })
  }

  const handleComplete = () => {
    navigate('/ai-playground')
  }

  const selectedCandidates = candidates.filter((c) => c.isSelected)

  return (
    <div className="pb-page">
      {/* 상단 바 */}
      <div className="pb-topbar">
        <Flex style={{ alignItems: 'center', gap: 12 }}>
          <Typo variant="$body-1" style={{ fontWeight: 700 }}>인플루언서 제안서 생성</Typo>
        </Flex>
        <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-5)' }}>
          Step {currentStep} of 4
        </Typo>
      </div>

      {/* Step Indicator */}
      <div className="pb-step-area">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* 로딩 오버레이 */}
      {(isAnalyzing || isGenerating) && (
        <div className="pb-loading-overlay">
          <VStack style={{ gap: 12, alignItems: 'center' }}>
            <div className="pb-spinner" />
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>
              {isAnalyzing ? 'AI가 브리프를 분석하고 있습니다...' : 'AI가 근거를 생성하고 있습니다...'}
            </Typo>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
              {isAnalyzing ? '1,847개 콘텐츠에서 최적의 인플루언서를 찾고 있습니다' : '선택된 인플루언서의 콘텐츠를 분석하고 있습니다'}
            </Typo>
          </VStack>
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="pb-content">
        {currentStep === 1 && (
          <Step1Brief brief={brief} setBrief={setBrief} />
        )}
        {currentStep === 2 && (
          <Step2Candidates candidates={candidates} setCandidates={setCandidates} />
        )}
        {currentStep === 3 && (
          <Step3Proof
            candidates={candidates}
            proofSections={MOCK_PROOF_SECTIONS}
            referenceContents={MOCK_REFERENCE_CONTENTS}
            creativeBrief={MOCK_CREATIVE_BRIEF}
          />
        )}
        {currentStep === 4 && (
          <Step4Preview
            brief={brief}
            candidates={candidates}
            proofSections={MOCK_PROOF_SECTIONS}
            referenceContents={MOCK_REFERENCE_CONTENTS}
            creativeBrief={MOCK_CREATIVE_BRIEF}
          />
        )}
      </div>

      {/* 하단 액션 바 */}
      <div className="pb-action-bar">
        <Flex style={{ justifyContent: 'flex-end', gap: 8 }}>
          {currentStep === 1 && (
            <CoreButton
              buttonType="primary"
              size="md"
              text="AI 분석 시작"
              suffix={<IconChevronRightOutline size={14} />}
              onClick={handleStep1Next}
            />
          )}
          {currentStep === 2 && (
            <>
              <CoreButton
                buttonType="contrast"
                size="md"
                text="이전"
                prefix={<IconChevronLeftOutline size={14} />}
                onClick={() => setCurrentStep(1)}
              />
              <CoreButton
                buttonType="primary"
                size="md"
                text="근거 생성"
                suffix={<IconChevronRightOutline size={14} />}
                onClick={handleStep2Next}
                disabled={selectedCandidates.length === 0}
              />
            </>
          )}
          {currentStep === 3 && (
            <>
              <CoreButton
                buttonType="contrast"
                size="md"
                text="이전"
                prefix={<IconChevronLeftOutline size={14} />}
                onClick={() => setCurrentStep(2)}
              />
              <CoreButton
                buttonType="primary"
                size="md"
                text="제안서 완성"
                suffix={<IconChevronRightOutline size={14} />}
                onClick={handleStep3Next}
              />
            </>
          )}
          {currentStep === 4 && (
            <>
              <CoreButton
                buttonType="contrast"
                size="md"
                text="수정하기"
                prefix={<IconChevronLeftOutline size={14} />}
                onClick={() => setCurrentStep(3)}
              />
              <CoreButton
                buttonType="contrast"
                size="md"
                text="PDF 다운로드"
                prefix={<IconDownloadOutline size={14} />}
                onClick={handlePdfDownload}
              />
              <CoreButton
                buttonType="contrast"
                size="md"
                text="클립보드 복사"
                onClick={handleClipboardCopy}
              />
              <CoreButton
                buttonType="primary"
                size="md"
                text="완료"
                onClick={handleComplete}
              />
            </>
          )}
        </Flex>
      </div>
    </div>
  )
}
