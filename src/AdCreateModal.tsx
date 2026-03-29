import './AdCreateModal.css'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Flex, VStack, HStack, Box, Typo, CoreButton, CoreModal, CoreTag, CoreTextInput, CoreSelect } from '@featuring-corp/components'
import { IconChevronLeftOutline, IconChevronRightOutline } from '@featuring-corp/icons'
import type { AdPlatform, AdType, AdObjective } from './types/ad'

/* ── Props ── */
interface AdCreateModalProps {
  isOpen: boolean
  onClose: () => void
  content?: {
    influencerUsername: string
    contentType: string
    contentUrl: string
    thumbnailUrl?: string
    caption?: string
  }
  defaultPlatform?: 'meta' | 'google'
}

/* ── 상수 ── */
const PLATFORM_OPTIONS: { value: AdPlatform; label: string; desc: string }[] = [
  { value: 'meta', label: 'Meta (Instagram/Facebook)', desc: 'Instagram, Facebook 광고를 집행합니다.' },
  { value: 'google', label: 'Google (YouTube/Display)', desc: 'YouTube, Google Display 광고를 집행합니다.' },
]

const AD_TYPE_OPTIONS: { value: AdType; label: string; desc: string; recommended?: boolean }[] = [
  { value: 'partnership', label: 'Partnership Ad', desc: '인플루언서 계정으로 노출', recommended: true },
  { value: 'standard', label: '일반 광고', desc: '브랜드 계정으로 노출' },
]

const OBJECTIVE_OPTIONS: { value: AdObjective; label: string; desc: string }[] = [
  { value: 'traffic', label: '트래픽', desc: '웹사이트/앱 방문' },
  { value: 'engagement', label: '인게이지먼트', desc: '좋아요, 댓글, 공유' },
  { value: 'awareness', label: '인지도', desc: '최대 도달' },
  { value: 'conversions', label: '전환', desc: '구매, 회원가입' },
]

/* ── Mock 콘텐츠 ── */
const DEFAULT_CONTENT = {
  influencerUsername: 'influencer_a',
  contentType: '릴스',
  contentUrl: '',
  caption: '여름 신상 리뷰! 이건 진짜...',
}

/* ── 서브 컴포넌트: 라디오 아이템 ── */
function RadioItem({
  selected,
  onClick,
  label,
  desc,
  recommended,
}: {
  selected: boolean
  onClick: () => void
  label: string
  desc: string
  recommended?: boolean
}) {
  return (
    <div
      className={`acm-radio-item ${selected ? 'acm-radio-item--selected' : ''}`}
      onClick={onClick}
    >
      <div className="acm-radio-circle">
        {selected && <div className="acm-radio-circle-inner" />}
      </div>
      <VStack style={{ gap: 2, flex: 1 }}>
        <HStack style={{ gap: 6, alignItems: 'center' }}>
          <Typo variant="$body-2">{label}</Typo>
          {recommended && <CoreTag tagType="primary" size="xs">권장</CoreTag>}
        </HStack>
        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>{desc}</Typo>
      </VStack>
    </div>
  )
}

/* ── 서브 컴포넌트: Step 1 ── */
function Step1({
  platform,
  setPlatform,
  adType,
  setAdType,
  objective,
  setObjective,
  content,
}: {
  platform: AdPlatform
  setPlatform: (v: AdPlatform) => void
  adType: AdType
  setAdType: (v: AdType) => void
  objective: AdObjective
  setObjective: (v: AdObjective) => void
  content: typeof DEFAULT_CONTENT
}) {
  return (
    <VStack style={{ gap: 24 }}>
      {/* 광고 소재 */}
      <VStack style={{ gap: 8 }}>
        <Typo variant="$body-1" style={{ fontWeight: 600 }}>광고 소재</Typo>
        <Flex className="acm-content-preview" style={{ gap: 12, alignItems: 'center' }}>
          <div className="acm-thumbnail-placeholder" />
          <VStack style={{ gap: 4 }}>
            <Typo variant="$body-2">@{content.influencerUsername} · {content.contentType}</Typo>
            {content.caption && (
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>
                "{content.caption}"
              </Typo>
            )}
          </VStack>
        </Flex>
      </VStack>

      {/* 광고 플랫폼 */}
      <VStack style={{ gap: 8 }}>
        <Typo variant="$body-1" style={{ fontWeight: 600 }}>광고 플랫폼</Typo>
        <VStack style={{ gap: 8 }}>
          {PLATFORM_OPTIONS.map((opt) => (
            <RadioItem
              key={opt.value}
              selected={platform === opt.value}
              onClick={() => setPlatform(opt.value)}
              label={opt.label}
              desc={opt.desc}
            />
          ))}
        </VStack>
      </VStack>

      {/* 광고 유형 (Meta 선택 시) */}
      {platform === 'meta' && (
        <VStack style={{ gap: 8 }}>
          <Typo variant="$body-1" style={{ fontWeight: 600 }}>광고 유형</Typo>
          <VStack style={{ gap: 8 }}>
            {AD_TYPE_OPTIONS.map((opt) => (
              <RadioItem
                key={opt.value}
                selected={adType === opt.value}
                onClick={() => setAdType(opt.value)}
                label={opt.label}
                desc={opt.desc}
                recommended={opt.recommended}
              />
            ))}
          </VStack>
        </VStack>
      )}

      {/* 광고 목표 */}
      <VStack style={{ gap: 8 }}>
        <Typo variant="$body-1" style={{ fontWeight: 600 }}>광고 목표</Typo>
        <VStack style={{ gap: 8 }}>
          {OBJECTIVE_OPTIONS.map((opt) => (
            <RadioItem
              key={opt.value}
              selected={objective === opt.value}
              onClick={() => setObjective(opt.value)}
              label={opt.label}
              desc={opt.desc}
            />
          ))}
        </VStack>
      </VStack>
    </VStack>
  )
}

/* ── 서브 컴포넌트: Step 2 ── */
function Step2({
  targetMode,
  setTargetMode,
  dailyBudget,
  setDailyBudget,
  totalBudget,
  setTotalBudget,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  targetMode: 'auto' | 'custom'
  setTargetMode: (v: 'auto' | 'custom') => void
  dailyBudget: string
  setDailyBudget: (v: string) => void
  totalBudget: string
  setTotalBudget: (v: string) => void
  startDate: string
  setStartDate: (v: string) => void
  endDate: string
  setEndDate: (v: string) => void
}) {
  return (
    <VStack style={{ gap: 24 }}>
      {/* 타겟 오디언스 */}
      <VStack style={{ gap: 8 }}>
        <Typo variant="$body-1" style={{ fontWeight: 600 }}>타겟 오디언스</Typo>
        <VStack style={{ gap: 8 }}>
          <RadioItem
            selected={targetMode === 'auto'}
            onClick={() => setTargetMode('auto')}
            label="자동 타겟 (Meta/Google AI 최적화)"
            desc="플랫폼 AI가 최적의 타겟을 자동으로 찾아줍니다."
            recommended
          />
          <RadioItem
            selected={targetMode === 'custom'}
            onClick={() => setTargetMode('custom')}
            label="커스텀 타겟"
            desc="직접 타겟 조건을 설정합니다."
          />
        </VStack>

        {targetMode === 'custom' && (
          <div className="acm-custom-target">
            <VStack style={{ gap: 12 }}>
              <Flex style={{ gap: 12, alignItems: 'center' }}>
                <Typo variant="$caption-1" style={{ width: 48, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>위치</Typo>
                <CoreSelect size="sm" placeholderText="위치 선택" defaultValue="kr">
                  <CoreSelect.Item value="kr">대한민국</CoreSelect.Item>
                  <CoreSelect.Item value="us">미국</CoreSelect.Item>
                  <CoreSelect.Item value="jp">일본</CoreSelect.Item>
                </CoreSelect>
              </Flex>
              <Flex style={{ gap: 12, alignItems: 'center' }}>
                <Typo variant="$caption-1" style={{ width: 48, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>연령</Typo>
                <Flex style={{ gap: 8, alignItems: 'center' }}>
                  <CoreSelect size="sm" placeholderText="최소" defaultValue="18">
                    {[18, 21, 25, 30, 35, 40, 45].map((age) => (
                      <CoreSelect.Item key={age} value={String(age)}>{age}세</CoreSelect.Item>
                    ))}
                  </CoreSelect>
                  <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>~</Typo>
                  <CoreSelect size="sm" placeholderText="최대" defaultValue="45">
                    {[25, 30, 35, 40, 45, 50, 55, 65].map((age) => (
                      <CoreSelect.Item key={age} value={String(age)}>{age}세</CoreSelect.Item>
                    ))}
                  </CoreSelect>
                </Flex>
              </Flex>
              <Flex style={{ gap: 12, alignItems: 'center' }}>
                <Typo variant="$caption-1" style={{ width: 48, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>성별</Typo>
                <CoreSelect size="sm" placeholderText="성별" defaultValue="all">
                  <CoreSelect.Item value="all">전체</CoreSelect.Item>
                  <CoreSelect.Item value="male">남성</CoreSelect.Item>
                  <CoreSelect.Item value="female">여성</CoreSelect.Item>
                </CoreSelect>
              </Flex>
              <Flex style={{ gap: 12, alignItems: 'center' }}>
                <Typo variant="$caption-1" style={{ width: 48, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>관심사</Typo>
                <Flex style={{ gap: 4, flexWrap: 'wrap' }}>
                  {['뷰티', '패션', '피트니스', 'IT/테크', 'F&B'].map((label) => (
                    <CoreTag key={label} tagType="gray" size="xs">{label}</CoreTag>
                  ))}
                </Flex>
              </Flex>
            </VStack>
          </div>
        )}
      </VStack>

      {/* 예산 설정 */}
      <VStack style={{ gap: 8 }}>
        <Typo variant="$body-1" style={{ fontWeight: 600 }}>예산 설정</Typo>
        <VStack style={{ gap: 12 }}>
          <Flex style={{ gap: 12, alignItems: 'center' }}>
            <Typo variant="$caption-1" style={{ width: 64, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>일일 예산</Typo>
            <CoreTextInput
              size="md"
              placeholder="50,000"
              leadingElement={<Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>&#8361;</Typo>}
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
            />
          </Flex>
          <Flex style={{ gap: 12, alignItems: 'center' }}>
            <Typo variant="$caption-1" style={{ width: 64, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>총 예산</Typo>
            <CoreTextInput
              size="md"
              placeholder="500,000"
              leadingElement={<Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>&#8361;</Typo>}
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
            />
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>(자동 계산)</Typo>
          </Flex>
        </VStack>
      </VStack>

      {/* 기간 선택 */}
      <VStack style={{ gap: 8 }}>
        <Typo variant="$body-1" style={{ fontWeight: 600 }}>기간</Typo>
        <Flex style={{ gap: 8, alignItems: 'center' }}>
          <CoreTextInput
            size="md"
            placeholder="2026-03-30"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-5)' }}>~</Typo>
          <CoreTextInput
            size="md"
            placeholder="2026-04-08"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Flex>
      </VStack>

      {/* AI 추천 안내 */}
      <div className="acm-ai-tip">
        <Typo variant="$caption-1" style={{ color: 'var(--global-colors-primary-60)' }}>
          AI 추천: 이 콘텐츠의 인게이지먼트 기반, 일일 &#8361;50,000 / 10일 집행 시 예상 도달 120,000
        </Typo>
      </div>
    </VStack>
  )
}

/* ── 서브 컴포넌트: Step 3 ── */
function Step3({
  platform,
  adType,
  objective,
  targetMode,
  dailyBudget,
  totalBudget,
  startDate,
  endDate,
  content,
}: {
  platform: AdPlatform
  adType: AdType
  objective: AdObjective
  targetMode: 'auto' | 'custom'
  dailyBudget: string
  totalBudget: string
  startDate: string
  endDate: string
  content: typeof DEFAULT_CONTENT
}) {
  const platformLabel = platform === 'meta' ? 'Meta' : 'Google'
  const adTypeLabel = adType === 'partnership' ? 'Partnership Ad' : '일반 광고'
  const objectiveLabel = OBJECTIVE_OPTIONS.find((o) => o.value === objective)?.label ?? objective
  const targetLabel = targetMode === 'auto' ? `자동 (${platformLabel} AI 최적화)` : '커스텀'

  return (
    <VStack style={{ gap: 24 }}>
      {/* 광고 요약 */}
      <VStack style={{ gap: 8 }}>
        <Typo variant="$body-1" style={{ fontWeight: 600 }}>광고 요약</Typo>
        <div className="acm-summary-box">
          <VStack style={{ gap: 10 }}>
            <Flex style={{ gap: 8 }}>
              <Typo variant="$caption-1" style={{ width: 72, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>소재</Typo>
              <Typo variant="$caption-1">@{content.influencerUsername} {content.contentType}</Typo>
            </Flex>
            <Flex style={{ gap: 8 }}>
              <Typo variant="$caption-1" style={{ width: 72, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>플랫폼</Typo>
              <Typo variant="$caption-1">{platformLabel} ({adTypeLabel})</Typo>
            </Flex>
            <Flex style={{ gap: 8 }}>
              <Typo variant="$caption-1" style={{ width: 72, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>목표</Typo>
              <Typo variant="$caption-1">{objectiveLabel}</Typo>
            </Flex>
            <Flex style={{ gap: 8 }}>
              <Typo variant="$caption-1" style={{ width: 72, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>타겟</Typo>
              <Typo variant="$caption-1">{targetLabel}</Typo>
            </Flex>
            <Flex style={{ gap: 8 }}>
              <Typo variant="$caption-1" style={{ width: 72, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>일일 예산</Typo>
              <Typo variant="$caption-1">&#8361;{dailyBudget || '50,000'}</Typo>
            </Flex>
            <Flex style={{ gap: 8 }}>
              <Typo variant="$caption-1" style={{ width: 72, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>총 예산</Typo>
              <Typo variant="$caption-1">&#8361;{totalBudget || '500,000'}</Typo>
            </Flex>
            <Flex style={{ gap: 8 }}>
              <Typo variant="$caption-1" style={{ width: 72, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>기간</Typo>
              <Typo variant="$caption-1">{startDate || '2026-03-30'} ~ {endDate || '2026-04-08'}</Typo>
            </Flex>
            <Flex style={{ gap: 8 }}>
              <Typo variant="$caption-1" style={{ width: 72, flexShrink: 0, color: 'var(--semantic-color-text-3)' }}>예상 도달</Typo>
              <Typo variant="$caption-1">~120,000</Typo>
            </Flex>
          </VStack>
        </div>
      </VStack>

      {/* Partnership Ad 안내 */}
      {platform === 'meta' && adType === 'partnership' && (
        <div className="acm-partnership-notice">
          <VStack style={{ gap: 8 }}>
            <Typo variant="$body-2" style={{ fontWeight: 600 }}>Partnership Ad 안내</Typo>
            <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-3)' }}>
              인플루언서 @{content.influencerUsername}의 Instagram에서 브랜드 파트너 승인이 필요합니다.
            </Typo>
            <Box>
              <CoreButton buttonType="tertiary" size="sm">승인 가이드 보내기</CoreButton>
            </Box>
          </VStack>
        </div>
      )}
    </VStack>
  )
}

/* ── 메인 컴포넌트 ── */
export default function AdCreateModal({ isOpen, onClose, content, defaultPlatform }: AdCreateModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  /* Step 1 상태 */
  const [platform, setPlatform] = useState<AdPlatform>(defaultPlatform ?? 'meta')
  const [adType, setAdType] = useState<AdType>('partnership')
  const [objective, setObjective] = useState<AdObjective>('traffic')

  /* Step 2 상태 */
  const [targetMode, setTargetMode] = useState<'auto' | 'custom'>('auto')
  const [dailyBudget, setDailyBudget] = useState('50,000')
  const [totalBudget, setTotalBudget] = useState('500,000')
  const [startDate, setStartDate] = useState('2026-03-30')
  const [endDate, setEndDate] = useState('2026-04-08')

  const resolvedContent = content
    ? { ...DEFAULT_CONTENT, ...content }
    : DEFAULT_CONTENT

  const handleClose = () => {
    setStep(1)
    onClose()
  }

  const handleCreate = () => {
    // Mock: 광고 생성 처리
    handleClose()
  }

  if (!isOpen) return null

  const stepTitle = `광고 만들기 — Step ${step}/3`

  const actionsChildren = (() => {
    switch (step) {
      case 1:
        return [
          <CoreButton key="cancel" buttonType="contrast" size="md" text="취소" onClick={handleClose} />,
          <CoreButton
            key="next"
            buttonType="primary"
            size="md"
            text="다음"
            suffix={<IconChevronRightOutline size={14} />}
            onClick={() => setStep(2)}
          />,
        ]
      case 2:
        return [
          <CoreButton
            key="prev"
            buttonType="contrast"
            size="md"
            text="이전"
            prefix={<IconChevronLeftOutline size={14} />}
            onClick={() => setStep(1)}
          />,
          <CoreButton
            key="next"
            buttonType="primary"
            size="md"
            text="다음"
            suffix={<IconChevronRightOutline size={14} />}
            onClick={() => setStep(3)}
          />,
        ]
      case 3:
        return [
          <CoreButton
            key="prev"
            buttonType="contrast"
            size="md"
            text="이전"
            prefix={<IconChevronLeftOutline size={14} />}
            onClick={() => setStep(2)}
          />,
          <CoreButton
            key="create"
            buttonType="primary"
            size="md"
            text="광고 생성하기"
            onClick={handleCreate}
          />,
        ]
    }
  })()

  return createPortal(
    <CoreModal
      size="md"
      title={stepTitle}
      handleClose={handleClose}
      hasCloseButton
      isBgClose
      actionsChildren={actionsChildren}
    >
      {/* 스텝 인디케이터 */}
      <div className="acm-step-indicator">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`acm-step-dot ${s === step ? 'acm-step-dot--active' : ''} ${s < step ? 'acm-step-dot--done' : ''}`}
          />
        ))}
      </div>

      {step === 1 && (
        <Step1
          platform={platform}
          setPlatform={setPlatform}
          adType={adType}
          setAdType={setAdType}
          objective={objective}
          setObjective={setObjective}
          content={resolvedContent}
        />
      )}
      {step === 2 && (
        <Step2
          targetMode={targetMode}
          setTargetMode={setTargetMode}
          dailyBudget={dailyBudget}
          setDailyBudget={setDailyBudget}
          totalBudget={totalBudget}
          setTotalBudget={setTotalBudget}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      )}
      {step === 3 && (
        <Step3
          platform={platform}
          adType={adType}
          objective={objective}
          targetMode={targetMode}
          dailyBudget={dailyBudget}
          totalBudget={totalBudget}
          startDate={startDate}
          endDate={endDate}
          content={resolvedContent}
        />
      )}
    </CoreModal>,
    document.body
  )
}
