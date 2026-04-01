import { VStack, Typo, CoreButton, Flex } from '@featuring-corp/components'
import {
  IconAiLavelOutline,
  IconDocumentOutline,
  IconLinkOutline,
  IconInsightOutline,
} from '@featuring-corp/icons'
import type { Slide, PptTheme, PptAction, SlideType } from '../types/slides'
import type { ParsedFileData } from '../utils/fileParser'
import type { InfluencerData } from '../data/influencers'

interface Props {
  tab: string
  slides: Slide[]
  activeSlideIndex: number
  activeSlide: Slide | null
  theme: PptTheme
  themes: PptTheme[]
  dispatch: React.Dispatch<PptAction>
  attachedFiles: ParsedFileData[]
  fetchedUrls: { url: string; title: string; text: string }[]
  selectedInfluencers: InfluencerData[]
  magicInput: string
  setMagicInput: (v: string) => void
  magicLoading: boolean
  onMagicEdit: (prompt?: string) => void
}

const LAYOUT_TYPES: { type: SlideType; label: string; desc: string }[] = [
  { type: 'title', label: 'Title', desc: '제목 + 부제' },
  { type: 'kpi', label: 'KPI', desc: '핵심 지표 그리드' },
  { type: 'chart', label: 'Chart', desc: '바 차트' },
  { type: 'comparison', label: 'Compare', desc: '비교 분석' },
  { type: 'insight', label: 'Insight', desc: '인사이트 목록' },
  { type: 'recommendation', label: 'Action', desc: '전략 제언' },
  { type: 'influencer', label: 'Influencer', desc: '인플루언서 분석' },
]

const AI_QUICK_ACTIONS = [
  { label: '간결하게 정리', prompt: '이 슬라이드의 텍스트를 더 간결하고 임팩트 있게 줄여줘.' },
  { label: '데이터 시각화 추가', prompt: '이 슬라이드에 적합한 데이터 시각화 요소를 추가해줘.' },
  { label: '영어로 번역', prompt: '이 슬라이드의 모든 텍스트를 영어로 번역해줘. 데이터는 유지해.' },
  { label: '발표 노트 생성', prompt: '이 슬라이드에 대한 발표자 노트를 요소 텍스트에 추가해줘.' },
]

export default function PptSidebarPanels({
  tab, slides, activeSlideIndex, activeSlide, theme, themes, dispatch,
  attachedFiles, fetchedUrls, selectedInfluencers,
  magicInput, setMagicInput, magicLoading, onMagicEdit,
}: Props) {
  /* ═══════ LAYOUTS ═══════ */
  if (tab === 'layouts') {
    return (
      <div className="ppt-sidebar-panel">
        <div className="ppt-sidebar-panel__title">LAYOUTS</div>
        <VStack style={{ gap: 6 }}>
          {LAYOUT_TYPES.map(lt => (
            <div key={lt.type}
              className={`ppt-layout-item ${activeSlide?.type === lt.type ? 'ppt-layout-item--active' : ''}`}
              onClick={() => {
                if (!activeSlide) return
                const updated = [...slides]
                updated[activeSlideIndex] = { ...updated[activeSlideIndex], type: lt.type }
                dispatch({ type: 'SET_SLIDES', slides: updated })
              }}>
              <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{lt.label}</Typo>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>{lt.desc}</Typo>
            </div>
          ))}
        </VStack>
      </div>
    )
  }

  /* ═══════ DATA ═══════ */
  if (tab === 'data') {
    return (
      <div className="ppt-sidebar-panel">
        <div className="ppt-sidebar-panel__title">DATA SOURCES</div>
        <VStack style={{ gap: 8 }}>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>현재 연결된 데이터:</Typo>
          {attachedFiles.map((f, i) => (
            <Flex key={`f-${i}`} style={{ gap: 8, alignItems: 'center', padding: '6px 0' }}>
              <IconDocumentOutline size={14} color="var(--global-colors-green-70)" />
              <VStack style={{ gap: 2, flex: 1 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{f.fileName}</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>{f.totalRows}행 · {f.headers.length}열</Typo>
              </VStack>
            </Flex>
          ))}
          {fetchedUrls.map((u, i) => (
            <Flex key={`u-${i}`} style={{ gap: 8, alignItems: 'center', padding: '6px 0' }}>
              <IconLinkOutline size={14} color="var(--global-colors-blue-70)" />
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.title}</Typo>
            </Flex>
          ))}
          {selectedInfluencers.map(inf => (
            <Flex key={inf.id} style={{ gap: 8, alignItems: 'center', padding: '6px 0' }}>
              <IconInsightOutline size={14} color="var(--global-colors-teal-70)" />
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>@{inf.name}</Typo>
            </Flex>
          ))}
          {attachedFiles.length === 0 && fetchedUrls.length === 0 && selectedInfluencers.length === 0 && (
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', padding: '12px 0' }}>연결된 데이터 소스가 없습니다.</Typo>
          )}

          {/* 선택된 요소의 raw data */}
          {activeSlide && (
            <>
              <div style={{ borderTop: '1px solid var(--semantic-color-border-default)', marginTop: 8, paddingTop: 8 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', fontWeight: 600 }}>슬라이드 데이터</Typo>
              </div>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>
                {activeSlide.elements.length}개 요소 · 타입: {activeSlide.type}
              </Typo>
            </>
          )}
        </VStack>
      </div>
    )
  }

  /* ═══════ THEMES ═══════ */
  if (tab === 'themes') {
    return (
      <div className="ppt-sidebar-panel">
        <div className="ppt-sidebar-panel__title">THEMES</div>
        <VStack style={{ gap: 8 }}>
          {themes.map(t => (
            <div key={t.id}
              className={`ppt-layout-item ${theme.id === t.id ? 'ppt-layout-item--active' : ''}`}
              onClick={() => dispatch({ type: 'SET_THEME', theme: t })}>
              <Flex style={{ gap: 8, alignItems: 'center' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: t.primary, flexShrink: 0 }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.secondary, flexShrink: 0 }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.accent, flexShrink: 0 }} />
                <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginLeft: 4 }}>{t.name}</Typo>
              </Flex>
            </div>
          ))}
        </VStack>
      </div>
    )
  }

  /* ═══════ AI ASSIST ═══════ */
  if (tab === 'ai') {
    return (
      <div className="ppt-sidebar-panel">
        <div className="ppt-sidebar-panel__title">
          <Flex style={{ gap: 6, alignItems: 'center' }}>
            <IconAiLavelOutline size={14} color="var(--global-colors-primary-60)" />
            AI ASSIST
          </Flex>
        </div>
        <VStack style={{ gap: 12 }}>
          <VStack style={{ gap: 6 }}>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', fontWeight: 600 }}>MAGIC EDIT</Typo>
            <input className="ppt-inspector__input" placeholder="수정 지시 입력..."
              value={magicInput} onChange={e => setMagicInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onMagicEdit()} />
            <CoreButton buttonType="primary" size="sm" text={magicLoading ? '처리 중...' : 'APPLY'}
              onClick={() => onMagicEdit()} disabled={magicLoading || !magicInput.trim()} style={{ width: '100%' }} />
          </VStack>

          <div style={{ borderTop: '1px solid var(--semantic-color-border-default)', paddingTop: 12 }}>
            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', fontWeight: 600, marginBottom: 8 }}>QUICK ACTIONS</Typo>
            <VStack style={{ gap: 6 }}>
              {AI_QUICK_ACTIONS.map(action => (
                <CoreButton key={action.label} buttonType="tertiary" size="sm" text={action.label}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => onMagicEdit(action.prompt)}
                  disabled={magicLoading} />
              ))}
            </VStack>
          </div>
        </VStack>
      </div>
    )
  }

  return null
}
