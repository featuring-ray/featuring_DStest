import './App.css'
import { useState } from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import CampaignManagement from './CampaignManagement'
import Dashboard from './Dashboard'
import ReactionAutomation from './ReactionAutomation'
import InfluencerManagement from './InfluencerManagement'
import { Box, Flex, VStack, Typo, Center, CoreTag } from '@featuring-corp/components'
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
  IconLightningOutline,
} from '@featuring-corp/icons'

type NavItem = {
  icon: React.ComponentType<{ size?: number; color?: string }>
  label: string
  path: string
  badge?: string
  tag?: string
  disabled?: boolean
}

/* 실제 라우트가 등록된 경로만 활성화 */
const NAV_SECTIONS: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [
      { icon: IconDashboardOutline, label: '대시보드', path: '/' },
      { icon: IconNotificationOutline, label: '알림', badge: '1', path: '/notifications', disabled: true },
    ],
  },
  {
    label: '인플루언서',
    items: [
      { icon: IconSearchOutline, label: '인플루언서 찾기', path: '/influencer/search', disabled: true },
      { icon: IconGroupListOutline, label: '인플루언서 관리', path: '/influencer/manage' },
      { icon: IconTrophyOutline, label: '인플루언서 랭킹', tag: 'NEW', path: '/influencer/ranking', disabled: true },
      { icon: IconSearchAiOutline, label: 'AI 리스트업', path: '/influencer/ai', disabled: true },
    ],
  },
  {
    label: '캠페인',
    items: [
      { icon: IconMediaLibraryOutline, label: '콘텐츠 라이브러리', path: '/content/library', disabled: true },
      { icon: IconLineChartOutline, label: '콘텐츠 트래킹', path: '/content/tracking', disabled: true },
      { icon: IconPresentationOutline, label: '캠페인 관리', tag: 'BETA', path: '/campaign' },
      { icon: IconLightningOutline, label: '반응 자동화 관리', tag: 'NEW', path: '/reaction-automation' },
      { icon: IconContentsOutline, label: '종료 예정', path: '/campaign/ending', disabled: true },
      { icon: IconMailOutline, label: 'DM/이메일 발송', path: '/campaign/dm', disabled: true },
    ],
  },
]

export default function App() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Flex className="layout">
      <Box className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>

        {/* ── 워크스페이스 헤더 ── */}
        <Flex
          className="sidebar-workspace"
          style={{ justifyContent: collapsed ? 'center' : 'space-between', alignItems: 'center' }}
        >
          {!collapsed && (
            <Flex style={{ gap: 8, alignItems: 'center', flex: 1, minWidth: 0 }}>
              <Center className="workspace-avatar">
                <Typo variant="$caption-2" style={{ color: 'white', fontWeight: 600 }}>피</Typo>
              </Center>
              <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                피처링 워크스페이스 입니다
              </Typo>
              <IconCaretDownFilled size={14} color="var(--semantic-color-icon-secondary)" />
            </Flex>
          )}
          <Box
            className="sidebar-toggle"
            style={{ marginLeft: collapsed ? 0 : 4, flexShrink: 0 }}
            onClick={() => setCollapsed(c => !c)}
          >
            <IconChevronDoubleLeftOutline size={16} color="var(--semantic-color-icon-tertiary)" />
          </Box>
        </Flex>

        {/* ── 검색 (확장 시만) ── */}
        {!collapsed && (
          <Flex className="sidebar-search" style={{ alignItems: 'center', gap: 6 }}>
            <IconSearchOutline size={14} color="var(--semantic-color-icon-tertiary)" />
            <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)' }}>계정 및 채널 검색</Typo>
          </Flex>
        )}

        {/* ── 내비게이션 ── */}
        <VStack className="sidebar-nav">
          {NAV_SECTIONS.map((section, si) => (
            <Box key={si} className="nav-section">
              {section.label && !collapsed && (
                <Typo variant="$caption-2" className="nav-section-label">{section.label}</Typo>
              )}
              {section.items.map(({ icon: Icon, label, path, badge, tag, disabled }) =>
                disabled ? (
                  <div key={label} className="nav-item nav-item--disabled">
                    <Flex style={{ alignItems: 'center', gap: 8 }}>
                      <Icon size={16} color="var(--semantic-color-icon-disabled)" />
                      {!collapsed && (
                        <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-5)' }}>
                          {label}
                        </Typo>
                      )}
                    </Flex>
                    {!collapsed && badge && (
                      <Center className="nav-badge">
                        <Typo variant="$caption-1" style={{ color: 'white', lineHeight: 1 }}>{badge}</Typo>
                      </Center>
                    )}
                    {!collapsed && tag && (
                      <CoreTag tagType={tag === 'BETA' ? 'gray' : 'primary'} size="xs" text={tag} disabled />
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={label}
                    to={path}
                    end={path === '/'}
                    className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
                  >
                    {({ isActive }) => (
                      <>
                        <Flex style={{ alignItems: 'center', gap: 8 }}>
                          <Icon size={16} color={isActive ? 'var(--global-colors-primary-60)' : 'var(--semantic-color-icon-secondary)'} />
                          {!collapsed && (
                            <Typo variant="$body-2" style={{ color: isActive ? 'var(--global-colors-primary-60)' : 'var(--semantic-color-text-1)' }}>
                              {label}
                            </Typo>
                          )}
                        </Flex>
                        {!collapsed && badge && (
                          <Center className="nav-badge">
                            <Typo variant="$caption-1" style={{ color: 'white', lineHeight: 1 }}>{badge}</Typo>
                          </Center>
                        )}
                        {!collapsed && tag && (
                          <CoreTag tagType={tag === 'BETA' ? 'gray' : 'primary'} size="xs" text={tag} />
                        )}
                      </>
                    )}
                  </NavLink>
                )
              )}
            </Box>
          ))}
        </VStack>

        {/* ── 하단 ── */}
        <VStack className="sidebar-bottom">
          <Flex className="nav-item sidebar-bottom-item" style={{ alignItems: 'center', gap: 8 }}>
            <IconBookOutline size={16} color="var(--semantic-color-icon-secondary)" />
            {!collapsed && <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>서비스 가이드</Typo>}
          </Flex>
          <Flex className="nav-item sidebar-bottom-item" style={{ alignItems: 'center', gap: 8 }}>
            <IconSupportOutline size={16} color="var(--semantic-color-icon-secondary)" />
            {!collapsed && <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>인사이트/블로그</Typo>}
          </Flex>
          <Flex className="sidebar-user" style={{ alignItems: 'center', gap: 8 }}>
            <Center className="user-avatar">
              <Typo variant="$caption-1" style={{ color: 'var(--global-colors-teal-70)', fontWeight: 600 }}>U</Typo>
            </Center>
            {!collapsed && <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>User name</Typo>}
          </Flex>
        </VStack>
      </Box>

      <Box className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaign" element={<CampaignManagement />} />
          <Route path="/reaction-automation/*" element={<ReactionAutomation />} />
          <Route path="/influencer/manage" element={<InfluencerManagement />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Box>
    </Flex>
  )
}
