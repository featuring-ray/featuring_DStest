import './App.css'
import CampaignManagement from './CampaignManagement'
import { Box, Flex, VStack, Typo, Center } from '@featuring-corp/components'
import {
  IconDashboardOutline,
  IconNotificationOutline,
  IconSearchOutline,
  IconGroupListOutline,
  IconTrophyOutline,
  IconSearchAiOutline,
  IconMediaLibraryOutline,
  IconLineChartOutline,
  IconPresentationOutline,
  IconChevronDoubleLeftOutline,
  IconCaretDownFilled,
  IconSupportOutline,
  IconBookOutline,
  IconMailOutline,
  IconContentsOutline,
} from '@featuring-corp/icons'

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { icon: IconDashboardOutline, label: '대시보드' },
      { icon: IconNotificationOutline, label: '알림', badge: '1' },
    ],
  },
  {
    label: '인플루언서',
    items: [
      { icon: IconSearchOutline, label: '인플루언서 찾기' },
      { icon: IconGroupListOutline, label: '인플루언서 관리' },
      { icon: IconTrophyOutline, label: '인플루언서 랭킹', tag: 'NEW' },
      { icon: IconSearchAiOutline, label: 'AI 리스트업' },
    ],
  },
  {
    label: '캠페인',
    items: [
      { icon: IconMediaLibraryOutline, label: '콘텐츠 라이브러리' },
      { icon: IconLineChartOutline, label: '콘텐츠 트래킹' },
      { icon: IconPresentationOutline, label: '캠페인 관리', tag: 'BETA', active: true },
      { icon: IconContentsOutline, label: '종료 예정' },
      { icon: IconMailOutline, label: 'DM/이메일 발송' },
    ],
  },
]

export default function App() {
  return (
    <Flex className="layout">
      <Box className="sidebar">
        <Flex className="sidebar-workspace" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Flex style={{ gap: 8, alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Center className="workspace-avatar">
              <Typo variant="$caption-2" style={{ color: 'white', fontWeight: 600 }}>피</Typo>
            </Center>
            <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              피처링 워크스페이스 입니다
            </Typo>
            <IconCaretDownFilled size={14} color="var(--semantic-color-icon-secondary)" />
          </Flex>
          <Box style={{ marginLeft: 4, flexShrink: 0 }}>
            <IconChevronDoubleLeftOutline size={16} color="var(--semantic-color-icon-tertiary)" />
          </Box>
        </Flex>

        <Flex className="sidebar-search" style={{ alignItems: 'center', gap: 6 }}>
          <IconSearchOutline size={14} color="var(--semantic-color-icon-tertiary)" />
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)' }}>계정 및 채널 검색</Typo>
        </Flex>

        <VStack className="sidebar-nav">
          {NAV_SECTIONS.map((section, si) => (
            <Box key={si} className="nav-section">
              {section.label && (
                <Typo variant="$caption-2" className="nav-section-label">{section.label}</Typo>
              )}
              {section.items.map(({ icon: Icon, label, badge, tag, active }: { icon: React.ComponentType<{ size?: number; color?: string }>, label: string, badge?: string, tag?: string, active?: boolean }) => (
                <Flex key={label} className={`nav-item${active ? ' nav-item--active' : ''}`} style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Flex style={{ alignItems: 'center', gap: 8 }}>
                    <Icon size={16} color={active ? 'var(--global-colors-primary-60)' : 'var(--semantic-color-icon-secondary)'} />
                    <Typo variant="$body-2" style={{ color: active ? 'var(--global-colors-primary-60)' : 'var(--semantic-color-text-1)' }}>
                      {label}
                    </Typo>
                  </Flex>
                  {badge && (
                    <Center className="nav-badge">
                      <Typo variant="$caption-1" style={{ color: 'white', lineHeight: 1 }}>{badge}</Typo>
                    </Center>
                  )}
                  {tag && (
                    <Center className={`nav-tag${tag === 'BETA' ? ' nav-tag--beta' : ' nav-tag--new'}`}>
                      <Typo variant="$caption-1" style={{ fontWeight: 400, lineHeight: 1 }}>{tag}</Typo>
                    </Center>
                  )}
                </Flex>
              ))}
            </Box>
          ))}
        </VStack>

        <VStack className="sidebar-bottom">
          <Flex className="nav-item" style={{ alignItems: 'center', gap: 8 }}>
            <IconBookOutline size={16} color="var(--semantic-color-icon-secondary)" />
            <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>서비스 가이드</Typo>
          </Flex>
          <Flex className="nav-item" style={{ alignItems: 'center', gap: 8 }}>
            <IconSupportOutline size={16} color="var(--semantic-color-icon-secondary)" />
            <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>인사이트/블로그</Typo>
          </Flex>
          <Flex className="sidebar-user" style={{ alignItems: 'center', gap: 8 }}>
            <Center className="user-avatar">
              <Typo variant="$caption-1" style={{ color: 'var(--global-colors-teal-70)', fontWeight: 600 }}>U</Typo>
            </Center>
            <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>User name</Typo>
          </Flex>
        </VStack>
      </Box>

      <Box className="main">
        <CampaignManagement />
      </Box>
    </Flex>
  )
}
