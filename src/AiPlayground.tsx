import './AiPlayground.css'
import { useNavigate } from 'react-router-dom'
import { Box, Flex, VStack, Typo, CoreTag } from '@featuring-corp/components'
import { IconAiLavelOutline } from '@featuring-corp/icons'

// ==================== 타입 ====================

interface PlaygroundCard {
  title: string
  description: string
  tag: string
  tagType: 'primary' | 'gray'
  path: string
}

// ==================== 데이터 ====================

const PLAYGROUND_CARDS: PlaygroundCard[] = [
  {
    title: '콘텐츠 기반 탐색',
    description: 'AI로 트렌드를 스캔하고, 톤 기반 크리에이터를 발굴하며, 성과 패턴을 학습합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/content-explorer',
  },
  {
    title: '인플루언서 제안서 생성',
    description: '브리프 입력만으로 후보 리스트 + Proof 콘텐츠 + Reference + 크리에이티브 브리프가 포함된 제안서를 자동 생성합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/proposal-builder',
  },
  {
    title: '2차 광고 (Paid Amplification)',
    description: '성과 좋은 인플루언서 콘텐츠를 Meta/Google 유료 광고로 증폭합니다.',
    tag: 'AD',
    tagType: 'gray',
    path: '/ad-management',
  },
  {
    title: '섭외 DM 개인화',
    description: '캠페인 브리프와 인플루언서 프로필을 분석하여 개인화된 섭외 DM을 자동 생성합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/outreach-dm',
  },
  {
    title: '피드백 톤 변환',
    description: '브랜드의 내부 피드백을 인플루언서 친화적인 톤으로 자동 변환합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/feedback-converter',
  },
  {
    title: '리마인드 타이밍 최적화',
    description: '인플루언서별 응답 패턴을 분석하여 최적의 리마인드 시점과 DM을 자동 생성합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/remind-scheduler',
  },
  {
    title: '정산 서류 자동 검증',
    description: '인플루언서 정산 서류를 자동 분류·추출·검증하고, 오류 시 재제출 요청 DM을 생성합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/document-verification',
  },
  {
    title: '제품 배송 트래커',
    description: '송장번호 기반 배송 상태 자동 추적, 지연/반송 알림, 수령 확인 DM을 자동화합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/delivery-tracker',
  },
  {
    title: '캠페인 일정 자동 산출',
    description: '업로드일 기준으로 채널별 리드타임을 역산하여 단계별 마감일을 자동 생성합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/schedule-calculator',
  },
  {
    title: '콘텐츠 검수 체커',
    description: '가이드 대비 원고를 자동 검수하여 광고 표기, 금칙어, 규정 위반을 체크합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/content-reviewer',
  },
  {
    title: '캠페인 리포트 생성',
    description: '성과 데이터를 분석하여 인사이트·벤치마크·향후 제언이 포함된 PPT 스타일 리포트를 생성합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/report-generator',
  },
  {
    title: '크리에이티브 브리프 생성',
    description: '인플루언서 스타일에 맞춘 훅 시나리오, 콘티 구성안, Do&Don\'t를 자동 생성합니다.',
    tag: 'AI',
    tagType: 'primary',
    path: '/creative-brief',
  },
]

// ==================== 컴포넌트 ====================

export default function AiPlayground() {
  const navigate = useNavigate()

  return (
    <VStack className="ai-playground">
      {/* 헤더 */}
      <Flex className="ai-playground__header" style={{ alignItems: 'center', gap: 10 }}>
        <IconAiLavelOutline size={24} color="var(--global-colors-primary-60)" />
        <VStack style={{ gap: 2 }}>
          <Typo variant="$heading-5" style={{ color: 'var(--semantic-color-text-1)' }}>
            AI 실험실
          </Typo>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)' }}>
            에이전트 기능을 모아 테스트할 수 있는 플레이그라운드입니다.
          </Typo>
        </VStack>
      </Flex>

      {/* 카드 그리드 */}
      <Flex className="ai-playground__grid" style={{ gap: 16, flexWrap: 'wrap' }}>
        {PLAYGROUND_CARDS.map((card) => (
          <Box
            key={card.path}
            className="ai-playground__card"
            onClick={() => navigate(card.path)}
          >
            <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>
                {card.title}
              </Typo>
              <CoreTag tagType={card.tagType} size="xs" text={card.tag} />
            </Flex>
            <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)' }}>
              {card.description}
            </Typo>
          </Box>
        ))}

        {/* 빈 카드 (추후 추가) */}
        <Box className="ai-playground__card ai-playground__card--empty">
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)' }}>
            + 더 많은 에이전트 기능이 추가될 예정입니다
          </Typo>
        </Box>
      </Flex>
    </VStack>
  )
}
