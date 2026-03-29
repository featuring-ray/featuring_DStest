import './AdAccountOnboarding.css'
import { useState } from 'react'
import { VStack, Flex, Typo, CoreButton, CoreStatusBadge } from '@featuring-corp/components'

/* ── 타입 ── */
type ConnectionStatus = 'idle' | 'connecting' | 'connected'

interface PlatformState {
  meta: ConnectionStatus
  google: ConnectionStatus
}

/* ── 서브: 플랫폼 카드 ── */
function PlatformCard({
  platform,
  title,
  description,
  buttonLabel,
  status,
  onConnect,
}: {
  platform: 'meta' | 'google'
  title: string
  description: string
  buttonLabel: string
  status: ConnectionStatus
  onConnect: () => void
}) {
  return (
    <div className="aao-platform-card">
      <Flex style={{ alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div className={`aao-platform-icon aao-platform-icon--${platform}`}>
          <Typo variant="$body-2" style={{ color: '#fff', fontWeight: 700 }}>
            {platform === 'meta' ? 'M' : 'G'}
          </Typo>
        </div>
        <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>
          {title}
        </Typo>
      </Flex>
      <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 16, lineHeight: 1.6 }}>
        {description}
      </Typo>
      <Flex style={{ justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        {status === 'connected' && (
          <CoreStatusBadge status="success" type="subtle" size="sm" leadingElement={{ dot: true }} text="연결 완료" />
        )}
        {status === 'connecting' && (
          <CoreStatusBadge status="warning" type="subtle" size="sm" leadingElement={{ dot: true }} text="연결 중..." />
        )}
        {status === 'idle' && (
          <CoreButton
            buttonType={platform === 'meta' ? 'primary' : 'contrast'}
            size="md"
            text={buttonLabel}
            onClick={onConnect}
          />
        )}
      </Flex>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function AdAccountOnboarding() {
  const [platformState, setPlatformState] = useState<PlatformState>({
    meta: 'idle',
    google: 'idle',
  })

  const handleConnect = (platform: 'meta' | 'google') => {
    setPlatformState(prev => ({ ...prev, [platform]: 'connecting' }))

    // Mock: 2초 후 connected로 변경
    setTimeout(() => {
      setPlatformState(prev => ({ ...prev, [platform]: 'connected' }))
    }, 2000)
  }

  const allConnected = platformState.meta === 'connected' && platformState.google === 'connected'

  return (
    <div className="aao-page">
      <div className="aao-container">
        <VStack style={{ gap: 8, marginBottom: 32 }}>
          <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>
            광고 계정 연결
          </Typo>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-3)', lineHeight: 1.6 }}>
            2차 광고 기능을 사용하려면 광고 플랫폼 계정을 연결해주세요.
          </Typo>
        </VStack>

        <VStack style={{ gap: 16, marginBottom: 32 }}>
          <PlatformCard
            platform="meta"
            title="Meta Ads"
            description="Instagram/Facebook 광고를 집행합니다. Partnership Ad로 인플루언서 콘텐츠를 그대로 광고 소재로 활용할 수 있습니다."
            buttonLabel="Meta 계정 연결하기"
            status={platformState.meta}
            onConnect={() => handleConnect('meta')}
          />
          <PlatformCard
            platform="google"
            title="Google Ads"
            description="YouTube/Google Display 광고를 집행합니다. 인플루언서 영상을 YouTube 광고로 활용할 수 있습니다."
            buttonLabel="Google 계정 연결하기"
            status={platformState.google}
            onConnect={() => handleConnect('google')}
          />
        </VStack>

        {allConnected ? (
          <Flex style={{ justifyContent: 'center' }}>
            <CoreButton buttonType="primary" size="md" text="광고 관리로 이동" />
          </Flex>
        ) : (
          <Flex style={{ justifyContent: 'center' }}>
            <Typo
              variant="$body-2"
              className="aao-skip-link"
              style={{ color: 'var(--semantic-color-text-5)', cursor: 'pointer' }}
            >
              나중에 하기
            </Typo>
          </Flex>
        )}
      </div>
    </div>
  )
}
