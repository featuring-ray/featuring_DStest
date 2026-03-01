import './Dashboard.css'
import { Box, Flex, HStack, VStack, Typo, CoreButton, CoreTag } from '@featuring-corp/components'
import {
  IconCaretUpFilled,
  IconCaretDownFilled,
  IconRefreshOutline,
  IconAccountOutline,
  IconLineChartOutline,
  IconCoinOutline,
  IconReportDataOutline,
} from '@featuring-corp/icons'

const KPI_CARDS = [
  {
    label: '총 도달수',
    value: '12,847,320',
    change: '+18.4%',
    isUp: true,
    icon: IconAccountOutline,
    color: 'var(--global-colors-primary-60)',
    bg: 'var(--global-colors-primary-10)',
  },
  {
    label: '총 참여수',
    value: '984,210',
    change: '+12.1%',
    isUp: true,
    icon: IconLineChartOutline,
    color: 'var(--global-colors-lightGreen-70)',
    bg: 'var(--global-colors-lightGreen-10)',
  },
  {
    label: '전환수',
    value: '24,830',
    change: '-3.2%',
    isUp: false,
    icon: IconReportDataOutline,
    color: 'var(--global-colors-orange-70)',
    bg: 'var(--global-colors-orange-10)',
  },
  {
    label: 'ROI',
    value: '348%',
    change: '+5.7%',
    isUp: true,
    icon: IconCoinOutline,
    color: 'var(--global-colors-blue-70)',
    bg: 'var(--global-colors-blue-10)',
  },
]

type CoreTagType = 'primary' | 'lightGreen' | 'orange' | 'gray' | 'magenta' | 'red' | 'indigo'

const INFLUENCERS: {
  name: string
  handle: string
  platform: string
  followers: string
  engagement: string
  posts: number
  reach: string
  status: string
  statusType: CoreTagType
}[] = [
  { name: '김민지', handle: '@minji.k', platform: 'Instagram', followers: '2.1M', engagement: '4.8%', posts: 12, reach: '3,420,000', status: '진행중', statusType: 'primary' },
  { name: '박준혁', handle: '@jun_style', platform: 'YouTube', followers: '890K', engagement: '6.2%', posts: 8, reach: '1,280,000', status: '완료', statusType: 'lightGreen' },
  { name: '이소연', handle: '@soyeon_life', platform: 'TikTok', followers: '3.4M', engagement: '8.1%', posts: 20, reach: '5,100,000', status: '진행중', statusType: 'primary' },
  { name: '최현우', handle: '@hwanuu', platform: 'Instagram', followers: '540K', engagement: '3.9%', posts: 6, reach: '820,000', status: '검토중', statusType: 'orange' },
  { name: '정다은', handle: '@da.eun_', platform: 'YouTube', followers: '1.2M', engagement: '5.4%', posts: 10, reach: '2,040,000', status: '완료', statusType: 'lightGreen' },
  { name: '강태양', handle: '@taeyang.k', platform: 'TikTok', followers: '780K', engagement: '9.3%', posts: 15, reach: '1,870,000', status: '대기중', statusType: 'gray' },
]

const PLATFORM_COLOR: Record<string, CoreTagType> = {
  Instagram: 'magenta',
  YouTube: 'red',
  TikTok: 'indigo',
}

export default function Dashboard() {
  return (
    <VStack className="dashboard">
      {/* 헤더 */}
      <Flex className="dashboard-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <VStack style={{ gap: 4 }}>
          <Typo variant="$heading-5">인플루언서 마케팅 대시보드</Typo>
          <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-3)' }}>2025년 2분기 · 전체 캠페인</Typo>
        </VStack>
        <HStack style={{ gap: 8 }}>
          <CoreButton buttonType="secondary" size="sm" prefix={<IconRefreshOutline size={14} />} text="새로고침" />
          <CoreButton buttonType="primary" size="sm" text="캠페인 추가" />
        </HStack>
      </Flex>

      <Box className="dashboard-content">
        {/* KPI 카드 */}
        <div className="kpi-grid">
          {KPI_CARDS.map(({ label, value, change, isUp, icon: Icon, color, bg }) => (
            <Box key={label} className="kpi-card">
              <Flex style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <VStack style={{ gap: 8 }}>
                  <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-3)' }}>{label}</Typo>
                  <Typo variant="$heading-6" style={{ color: 'var(--semantic-color-text-1)' }}>{value}</Typo>
                  <Flex style={{ gap: 4, alignItems: 'center' }}>
                    {isUp
                      ? <IconCaretUpFilled size={14} color="var(--global-colors-green-60)" />
                      : <IconCaretDownFilled size={14} color="var(--global-colors-red-60)" />
                    }
                    <Typo variant="$caption-2" style={{ color: isUp ? 'var(--global-colors-green-60)' : 'var(--global-colors-red-60)' }}>
                      {change} 전월 대비
                    </Typo>
                  </Flex>
                </VStack>
                <Flex className="kpi-icon" style={{ background: bg }}>
                  <Icon size={20} color={color} />
                </Flex>
              </Flex>
            </Box>
          ))}
        </div>

        {/* 인플루언서 테이블 */}
        <Box className="table-card">
          <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--global-spacing-600)' }}>
            <Typo variant="$heading-3">인플루언서 목록</Typo>
            <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-3)' }}>총 {INFLUENCERS.length}명</Typo>
          </Flex>

          <table className="influencer-table">
            <thead>
              <tr>
                {['인플루언서', '플랫폼', '팔로워', '참여율', '게시물', '도달수', '상태'].map(h => (
                  <th key={h}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>{h}</Typo>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INFLUENCERS.map((inf) => (
                <tr key={inf.handle}>
                  <td>
                    <Flex style={{ gap: 10, alignItems: 'center' }}>
                      <Flex className="avatar">
                        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-2)', fontWeight: 600 }}>
                          {inf.name[0]}
                        </Typo>
                      </Flex>
                      <VStack style={{ gap: 2 }}>
                        <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 500 }}>{inf.name}</Typo>
                        <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-4)' }}>{inf.handle}</Typo>
                      </VStack>
                    </Flex>
                  </td>
                  <td>
                    <CoreTag tagType={PLATFORM_COLOR[inf.platform]} size="xs" text={inf.platform} />
                  </td>
                  <td><Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>{inf.followers}</Typo></td>
                  <td><Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>{inf.engagement}</Typo></td>
                  <td><Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>{inf.posts}</Typo></td>
                  <td><Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>{inf.reach}</Typo></td>
                  <td>
                    <CoreTag tagType={inf.statusType} size="xs" text={inf.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </VStack>
  )
}
