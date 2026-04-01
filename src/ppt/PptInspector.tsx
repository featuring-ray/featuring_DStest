import { useState } from 'react'
import { Flex, VStack, Typo, CoreButton, CoreTag } from '@featuring-corp/components'
import { IconAiLavelOutline, IconChartBarOutline, IconDataOutline } from '@featuring-corp/icons'
import type { Slide, PptTheme, PptAction, ElementStyle } from '../types/slides'

interface Props {
  activeSlide: Slide | null
  activeSlideIndex: number
  selectedElementId: string | null
  theme: PptTheme
  themes: PptTheme[]
  dispatch: React.Dispatch<PptAction>
  onShowTheme: () => void
  onApplySuggestion: () => void
  originalSlides: Slide[] | null
}

const METRICS = ['Total Reach', 'Conversions', 'Engagement', 'CTR']

function ChartInspector() {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const [timeRange, setTimeRange] = useState('3m')
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(new Set(['Total Reach']))

  const toggleMetric = (m: string) => {
    setActiveMetrics(prev => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })
  }

  return (
    <>
      <div>
        <div className="ppt-inspector__section-title">LAYOUT & STYLE</div>
        <div className="ppt-style-options">
          <div className={`ppt-style-option ${chartType === 'bar' ? 'ppt-style-option--active' : ''}`}
            onClick={() => setChartType('bar')} style={{ cursor: 'pointer' }}>
            <IconChartBarOutline size={20} color={chartType === 'bar' ? 'var(--global-colors-primary-60)' : 'var(--semantic-color-text-3)'} />
            <Typo variant="$caption-2" style={{ marginTop: 4, color: chartType === 'bar' ? 'var(--semantic-color-text-1)' : 'var(--semantic-color-text-3)' }}>Bar Chart</Typo>
          </div>
          <div className={`ppt-style-option ${chartType === 'line' ? 'ppt-style-option--active' : ''}`}
            onClick={() => setChartType('line')} style={{ cursor: 'pointer' }}>
            <IconDataOutline size={20} color={chartType === 'line' ? 'var(--global-colors-primary-60)' : 'var(--semantic-color-text-3)'} />
            <Typo variant="$caption-2" style={{ marginTop: 4, color: chartType === 'line' ? 'var(--semantic-color-text-1)' : 'var(--semantic-color-text-3)' }}>Line Chart</Typo>
          </div>
        </div>
      </div>
      <div>
        <div className="ppt-inspector__section-title">DATA FILTERS</div>
        <VStack style={{ gap: 8 }}>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>Time Range</Typo>
          <select className="ppt-inspector__input" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            <option value="1m">Last 1 Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
          </select>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', marginTop: 4 }}>Metric</Typo>
          <Flex style={{ gap: 6, flexWrap: 'wrap' }}>
            {METRICS.map(m => (
              <CoreTag key={m} tagType={activeMetrics.has(m) ? 'primary' : 'gray'} size="xs"
                onClick={() => toggleMetric(m)} style={{ cursor: 'pointer' }}>{m}</CoreTag>
            ))}
          </Flex>
        </VStack>
      </div>
    </>
  )
}

function getSelectedElementStyle(activeSlide: Slide | null, selectedElementId: string | null): ElementStyle {
  if (!activeSlide || !selectedElementId || selectedElementId === 'title') return {}
  const el = activeSlide.elements.find(e => e.id === selectedElementId)
  return el?.style || {}
}

export default function PptInspector({
  activeSlide, activeSlideIndex, selectedElementId, theme, themes, dispatch,
  onShowTheme, onApplySuggestion, originalSlides,
}: Props) {
  const elStyle = getSelectedElementStyle(activeSlide, selectedElementId)

  const updateStyle = (field: keyof ElementStyle, value: string) => {
    if (!selectedElementId || selectedElementId === 'title' || !activeSlide) return
    dispatch({
      type: 'UPDATE_ELEMENT_STYLE',
      slideIndex: activeSlideIndex,
      elementId: selectedElementId,
      style: { [field]: value },
    })
  }

  const handleReset = () => {
    if (!originalSlides) return
    dispatch({ type: 'SET_SLIDES', slides: [...originalSlides] })
  }

  return (
    <div className="ppt-inspector">
      <div className="ppt-inspector__header">
        <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>
          {selectedElementId === 'title' ? '슬라이드 속성' :
            selectedElementId ? '요소 속성' : '슬라이드 속성'}
        </Typo>
      </div>

      <div className="ppt-inspector__body">
        {/* 차트 속성 (차트 슬라이드일 때) */}
        {activeSlide?.type === 'chart' && (
          <ChartInspector />
        )}

        {/* 텍스트 속성 */}
        {(selectedElementId === 'title' || (selectedElementId && activeSlide?.elements.find(e => e.id === selectedElementId)?.kind === 'text')) && (
          <>
            <div>
              <div className="ppt-inspector__section-title">TEXT SETTINGS</div>
              <VStack style={{ gap: 8 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>Font Family</Typo>
                <select className="ppt-inspector__input"
                  value={elStyle.fontFamily || 'pretendard'}
                  onChange={e => updateStyle('fontFamily', e.target.value)}>
                  <option value="pretendard">Pretendard</option>
                  <option value="inter">Inter</option>
                </select>
                <Flex style={{ gap: 8 }}>
                  <VStack style={{ gap: 4, flex: 1 }}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>Weight</Typo>
                    <select className="ppt-inspector__input"
                      value={elStyle.fontWeight || 'bold'}
                      onChange={e => updateStyle('fontWeight', e.target.value)}>
                      <option value="normal">Regular</option>
                      <option value="600">Semibold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </VStack>
                  <VStack style={{ gap: 4, flex: 1 }}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>Size</Typo>
                    <input className="ppt-inspector__input" type="text"
                      value={elStyle.fontSize || '24px'}
                      onChange={e => updateStyle('fontSize', e.target.value)} />
                  </VStack>
                </Flex>
              </VStack>
            </div>
            {selectedElementId === 'title' && activeSlide && (
              <div>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', marginBottom: 6 }}>제목 편집</Typo>
                <input className="ppt-inspector__input" style={{ width: '100%' }} value={activeSlide.title}
                  onChange={e => dispatch({ type: 'UPDATE_SLIDE_TITLE', slideIndex: activeSlideIndex, title: e.target.value })} />
              </div>
            )}
          </>
        )}

        {/* 테마 색상 */}
        <div>
          <div className="ppt-inspector__section-title">VISUAL THEME</div>
          <div className="ppt-color-swatches">
            {themes.slice(0, 5).map(t => (
              <div key={t.id} className={`ppt-swatch ${theme.id === t.id ? 'ppt-swatch--active' : ''}`}
                style={{ background: t.primary }} onClick={() => dispatch({ type: 'SET_THEME', theme: t })} />
            ))}
            <Typo variant="$caption-2" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600, cursor: 'pointer', marginLeft: 4 }}
              onClick={onShowTheme}>EDIT</Typo>
          </div>
        </div>

        {/* AI Suggestion */}
        <div className="ppt-ai-suggest">
          <Flex style={{ alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <IconAiLavelOutline size={14} color="var(--global-colors-primary-60)" />
            <Typo variant="$caption-1" style={{ fontWeight: 700, color: 'var(--global-colors-primary-60)', textTransform: 'uppercase' as const }}>AI SUGGESTION</Typo>
          </Flex>
          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-2)', lineHeight: 1.5 }}>
            {activeSlide?.type === 'chart'
              ? '"Q4 데이터가 강한 상승 추세를 보이고 있습니다. 현재 성장률 기반으로 <strong>Q1 예측선</strong>을 추가하시겠습니까?"'
              : activeSlide?.type === 'kpi'
                ? '"KPI 지표에 <strong>전월 대비 변화율</strong>을 추가하면 성과 트렌드를 더 명확히 전달할 수 있습니다."'
                : '"이 슬라이드의 핵심 메시지를 <strong>더 간결하게</strong> 정리하면 임팩트가 높아집니다."'}
          </Typo>
          <CoreButton buttonType="primary" size="sm" text="APPLY SUGGESTION" style={{ width: '100%', marginTop: 10 }} onClick={onApplySuggestion} />
        </div>
      </div>

      <div className="ppt-inspector__footer">
        <CoreButton buttonType="tertiary" size="sm" text="RESET" style={{ flex: 1 }} onClick={handleReset} />
        <CoreButton buttonType="primary" size="sm" text="UPDATE SLIDE" style={{ flex: 1 }}
          onClick={() => dispatch({ type: 'SET_STATUS', status: 'COMPLETE' })} />
      </div>
    </div>
  )
}
