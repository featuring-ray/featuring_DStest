import './PptGenerator.css'
import { useState, useCallback, useRef, useReducer, useEffect } from 'react'
import { generateSlides, editSlide } from './api/slideGenerator'
import { exportToPptx, exportToPdf } from './utils/slideExporter'
import { parseFile, filesToPromptText, type ParsedFileData } from './utils/fileParser'
import { searchInfluencers, influencersToPromptText, type InfluencerData } from './data/influencers'
import { Flex, VStack, Typo, CoreButton, CoreTag } from '@featuring-corp/components'
import {
  IconAiLavelOutline,
  IconRecentOutline,
  IconSettingsOutline,
  IconPptOutline,
  IconLinkOutline,
  IconDocumentOutline,
  IconAddOutline,
  IconCloseOutline,
  IconChartBarOutline,
  IconDataOutline,
  IconTuneOutline,
  IconWidgetOutline,
  IconMagicWandOutline,
  IconCheckCircleFilled,
  IconDraggableFilled,
  IconReportDataOutline,
  IconInsightOutline,
} from '@featuring-corp/icons'
import type { Slide, PptTheme, PptState, PptAction, PptStatus } from './types/slides'
import PptCanvas from './ppt/PptCanvas'
import PptInspector from './ppt/PptInspector'
import PptExportModal from './ppt/PptExportModal'
import PptThemeModal from './ppt/PptThemeModal'
import PptSidebarPanels from './ppt/PptSidebarPanels'
import { usePptPersistence, type PresentationRecord } from './ppt/usePptPersistence'

/* ═══════════════════════ 상수 ═══════════════════════ */

export const THEMES: PptTheme[] = [
  { id: 'default', name: '프로페셔널', primary: '#4f46e5', secondary: '#374151', accent: '#0d9488', bg: '#ffffff' },
  { id: 'dark', name: '다크 모드', primary: '#60a5fa', secondary: '#e5e7eb', accent: '#34d399', bg: '#1f2937' },
  { id: 'warm', name: '웜 톤', primary: '#f59e0b', secondary: '#78350f', accent: '#ef4444', bg: '#fffbeb' },
  { id: 'cool', name: '쿨 톤', primary: '#6366f1', secondary: '#4b5563', accent: '#06b6d4', bg: '#f0f9ff' },
  { id: 'nature', name: '자연', primary: '#059669', secondary: '#374151', accent: '#84cc16', bg: '#f0fdf4' },
  { id: 'brand', name: '브랜드', primary: '#7c3aed', secondary: '#1e293b', accent: '#ec4899', bg: '#faf5ff' },
]

const CAMPAIGNS = [
  { label: '그린러브 비건스킨케어 캠페인', value: 'greenlove' },
  { label: '다이슨 에어랩 캠페인', value: 'dyson' },
  { label: '미닉스더플렌더 캠페인', value: 'minix' },
]

const QUICK_PROMPTS = ['캠페인 성과 리포트', '인플루언서 분석', '제안서 초안', '월간 트렌드 리포트']

/* ═══════════════════════ Reducer ═══════════════════════ */

const VALID_TRANSITIONS: Record<PptStatus, PptStatus[]> = {
  INIT: ['LOADING'],
  LOADING: ['ANALYZING', 'ERROR'],
  ANALYZING: ['GENERATING', 'ERROR'],
  GENERATING: ['OUTLINE', 'ERROR'],
  OUTLINE: ['EDITING', 'GENERATING', 'ERROR'],
  EDITING: ['COMPLETE', 'OUTLINE', 'ERROR'],
  COMPLETE: ['INIT', 'EDITING', 'ERROR'],
  ERROR: ['INIT'],
}

const initialState: PptState = {
  status: 'INIT', slides: [], activeSlideIndex: 0,
  selectedElementId: null, theme: THEMES[0], error: null, sidebarTab: 'slides',
}

function pptReducer(state: PptState, action: PptAction): PptState {
  switch (action.type) {
    case 'SET_STATUS': {
      if (!VALID_TRANSITIONS[state.status].includes(action.status)) return state
      return { ...state, status: action.status, error: action.status === 'ERROR' ? state.error : null }
    }
    case 'SET_SLIDES': return { ...state, slides: action.slides }
    case 'SET_ACTIVE_SLIDE': return { ...state, activeSlideIndex: action.index, selectedElementId: null }
    case 'SELECT_ELEMENT': return { ...state, selectedElementId: action.id }
    case 'SET_THEME': return { ...state, theme: action.theme }
    case 'SET_SIDEBAR': return { ...state, sidebarTab: action.tab }
    case 'UPDATE_ELEMENT': {
      const s = [...state.slides]; const sl = { ...s[action.slideIndex] }
      sl.elements = sl.elements.map(e => e.id === action.elementId ? { ...e, content: action.content } : e)
      s[action.slideIndex] = sl; return { ...state, slides: s }
    }
    case 'UPDATE_ELEMENT_DATA': {
      const s = [...state.slides]; const sl = { ...s[action.slideIndex] }
      sl.elements = sl.elements.map(e => {
        if (e.id !== action.elementId || !e.data) return e
        const newData = [...(e.data as Record<string, unknown>[])]
        newData[action.dataIndex] = { ...newData[action.dataIndex], [action.field]: action.value }
        return { ...e, data: newData }
      })
      s[action.slideIndex] = sl; return { ...state, slides: s }
    }
    case 'UPDATE_SLIDE_TITLE': {
      const s = [...state.slides]; s[action.slideIndex] = { ...s[action.slideIndex], title: action.title }
      return { ...state, slides: s }
    }
    case 'UPDATE_SLIDE_SUMMARY': {
      const s = [...state.slides]; s[action.slideIndex] = { ...s[action.slideIndex], summary: action.summary }
      return { ...state, slides: s }
    }
    case 'ADD_SLIDE': {
      const ns: Slide = { id: `s${Date.now()}`, type: 'title', title: '새 슬라이드', summary: '새 슬라이드입니다.',
        elements: [{ id: `e${Date.now()}`, kind: 'text', content: '내용을 입력하세요.' }] }
      return { ...state, slides: [...state.slides, ns], activeSlideIndex: state.slides.length }
    }
    case 'DELETE_SLIDE': {
      if (state.slides.length <= 1) return state
      const ns = state.slides.filter((_, i) => i !== action.index)
      return { ...state, slides: ns, activeSlideIndex: Math.min(state.activeSlideIndex, ns.length - 1), selectedElementId: null }
    }
    case 'REORDER_SLIDES': {
      const { fromIndex, toIndex } = action
      if (fromIndex === toIndex) return state
      const ns = [...state.slides]
      const [moved] = ns.splice(fromIndex, 1)
      ns.splice(toIndex, 0, moved)
      let newActive = state.activeSlideIndex
      if (state.activeSlideIndex === fromIndex) newActive = toIndex
      else if (fromIndex < state.activeSlideIndex && toIndex >= state.activeSlideIndex) newActive--
      else if (fromIndex > state.activeSlideIndex && toIndex <= state.activeSlideIndex) newActive++
      return { ...state, slides: ns, activeSlideIndex: newActive }
    }
    case 'UPDATE_ELEMENT_STYLE': {
      const s = [...state.slides]; const sl = { ...s[action.slideIndex] }
      sl.elements = sl.elements.map(e =>
        e.id === action.elementId ? { ...e, style: { ...e.style, ...action.style } } : e
      )
      s[action.slideIndex] = sl; return { ...state, slides: s }
    }
    case 'SET_ERROR': return { ...state, error: action.error, status: 'ERROR' }
    case 'RESET': return initialState
    default: return state
  }
}

/* ═══════════════════════ 공통 서브 컴포넌트 ═══════════════════════ */

function GNB({ title, onReset, onSettings, showGenerate = true, onGenerate }: {
  title: string; onReset?: () => void; onSettings?: () => void; showGenerate?: boolean; onGenerate?: () => void
}) {
  return (
    <div className="ppt-gnb">
      <div className="ppt-gnb__left">
        <Typo variant="$heading-5" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 700 }}>{title}</Typo>
      </div>
      <div className="ppt-gnb__right">
        <button className="ppt-gnb__icon-btn" onClick={onReset} title="홈으로"><IconRecentOutline size={20} /></button>
        <button className="ppt-gnb__icon-btn" onClick={onSettings} title="설정"><IconSettingsOutline size={20} /></button>
        {showGenerate && onGenerate && (
          <CoreButton buttonType="primary" size="sm" text="Generate Presentation" onClick={onGenerate} />
        )}
      </div>
    </div>
  )
}

function IconSidebar({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  const items = [
    { id: 'slides', icon: IconPptOutline, label: 'SLIDES' },
    { id: 'layouts', icon: IconWidgetOutline, label: 'LAYOUTS' },
    { id: 'data', icon: IconDataOutline, label: 'DATA' },
    { id: 'themes', icon: IconTuneOutline, label: 'THEMES' },
    { id: 'ai', icon: IconAiLavelOutline, label: 'AI ASSIST' },
  ]
  return (
    <div className="ppt-outline__sidebar">
      {items.map(it => (
        <button key={it.id} className={`ppt-sidebar-btn ${active === it.id ? 'ppt-sidebar-btn--active' : ''}`}
          onClick={() => onChange(it.id)}>
          <it.icon size={20} />
          {it.label}
        </button>
      ))}
    </div>
  )
}

/* ═══════════════════════ 메인 컴포넌트 ═══════════════════════ */

export default function PptGenerator() {
  const [state, dispatch] = useReducer(pptReducer, initialState)
  const [prompt, setPrompt] = useState('')
  const [targetId, setTargetId] = useState('greenlove')
  const [showTheme, setShowTheme] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [magicInput, setMagicInput] = useState('')
  const [magicLoading, setMagicLoading] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<ParsedFileData[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [fetchedUrls, setFetchedUrls] = useState<{ url: string; title: string; text: string }[]>([])
  const [urlError, setUrlError] = useState<string | null>(null)
  const [infQuery, setInfQuery] = useState('')
  const [infResults, setInfResults] = useState<InfluencerData[]>([])
  const [selectedInfluencers, setSelectedInfluencers] = useState<InfluencerData[]>([])
  const [showInfDropdown, setShowInfDropdown] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [outlineMagicIdx, setOutlineMagicIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalSlidesRef = useRef<Slide[] | null>(null)

  const activeSlide = state.slides[state.activeSlideIndex] || null
  const { history, save, remove } = usePptPersistence()

  // 편집 진입 시 원본 저장
  useEffect(() => {
    if (state.status === 'EDITING' && !originalSlidesRef.current) {
      originalSlidesRef.current = [...state.slides]
    }
    if (state.status === 'INIT') {
      originalSlidesRef.current = null
    }
  }, [state.status, state.slides])

  // 컴포넌트 언마운트 시 진행 중인 요청 취소
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  /* ═══════ 파일 / URL / 인플루언서 핸들러 ═══════ */

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return
    setParseError(null)
    for (const file of Array.from(files)) {
      try {
        const parsed = await parseFile(file)
        setAttachedFiles(prev => [...prev, parsed])
      } catch (err) {
        setParseError(err instanceof Error ? err.message : '파일 파싱 오류')
      }
    }
  }, [])

  const removeFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleFetchUrl = useCallback(async () => {
    if (!urlInput.trim() || urlLoading) return
    setUrlError(null)
    setUrlLoading(true)
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json() as { title?: string; text?: string; error?: string }
      if (!res.ok || data.error) {
        setUrlError(data.error || 'URL을 가져올 수 없습니다.')
      } else if (data.text) {
        setFetchedUrls(prev => [...prev, { url: urlInput.trim(), title: data.title || urlInput.trim(), text: data.text! }])
        setUrlInput('')
      }
    } catch {
      setUrlError('네트워크 오류가 발생했습니다.')
    } finally {
      setUrlLoading(false)
    }
  }, [urlInput, urlLoading])

  const removeUrl = useCallback((index: number) => {
    setFetchedUrls(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleInfSearch = useCallback((q: string) => {
    setInfQuery(q)
    if (q.trim().length > 0) {
      setInfResults(searchInfluencers(q))
      setShowInfDropdown(true)
    } else {
      setInfResults([])
      setShowInfDropdown(false)
    }
  }, [])

  const selectInfluencer = useCallback((inf: InfluencerData) => {
    setSelectedInfluencers(prev => prev.some(s => s.id === inf.id) ? prev : [...prev, inf])
    setInfQuery('')
    setInfResults([])
    setShowInfDropdown(false)
  }, [])

  const removeInfluencer = useCallback((id: number) => {
    setSelectedInfluencers(prev => prev.filter(s => s.id !== id))
  }, [])

  /* ═══════ 생성 / 편집 / 내보내기 핸들러 ═══════ */

  const handleGenerate = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    dispatch({ type: 'SET_STATUS', status: 'LOADING' })

    const fileData = attachedFiles.length > 0 ? filesToPromptText(attachedFiles) : ''
    const urlData = fetchedUrls.length > 0
      ? fetchedUrls.map(u => `=== 웹 페이지: ${u.title} (${u.url}) ===\n${u.text}`).join('\n\n')
      : ''
    const infData = selectedInfluencers.length > 0 ? influencersToPromptText(selectedInfluencers) : ''
    const attachedData = (fileData || urlData || infData) ? [fileData, urlData, infData].filter(Boolean).join('\n\n') : undefined

    await generateSlides(
      { prompt, campaignId: targetId, attachedData },
      (event) => {
        switch (event.phase) {
          case 'analyzing': dispatch({ type: 'SET_STATUS', status: 'ANALYZING' }); break
          case 'generating': dispatch({ type: 'SET_STATUS', status: 'GENERATING' }); break
          case 'complete':
            dispatch({ type: 'SET_SLIDES', slides: event.slides })
            dispatch({ type: 'SET_STATUS', status: 'OUTLINE' })
            break
          case 'error': dispatch({ type: 'SET_ERROR', error: event.message }); break
        }
      },
      controller.signal,
    )
  }, [prompt, targetId, attachedFiles, fetchedUrls, selectedInfluencers])

  const handleMagicEdit = useCallback(async (directPrompt?: string) => {
    const prompt_ = directPrompt || magicInput.trim()
    if (!prompt_ || !activeSlide || magicLoading) return
    setMagicLoading(true)
    try {
      const updated = await editSlide(activeSlide, prompt_)
      if (updated) {
        const newSlides = [...state.slides]
        newSlides[state.activeSlideIndex] = updated
        dispatch({ type: 'SET_SLIDES', slides: newSlides })
      }
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Magic Edit 처리 중 오류가 발생했습니다.' })
    } finally {
      setMagicLoading(false)
      setMagicInput('')
    }
  }, [magicInput, state.activeSlideIndex, activeSlide, magicLoading, state.slides])

  const handleOutlineMagic = useCallback(async (slideIndex: number) => {
    const slide = state.slides[slideIndex]
    if (!slide || outlineMagicIdx !== null) return
    setOutlineMagicIdx(slideIndex)
    try {
      const updated = await editSlide(slide, '이 슬라이드를 더 임팩트 있게 개선해줘. 데이터와 인사이트를 강화해.')
      if (updated) {
        const newSlides = [...state.slides]
        newSlides[slideIndex] = updated
        dispatch({ type: 'SET_SLIDES', slides: newSlides })
      }
    } catch {
      dispatch({ type: 'SET_ERROR', error: '슬라이드 개선 중 오류가 발생했습니다.' })
    } finally {
      setOutlineMagicIdx(null)
    }
  }, [state.slides, outlineMagicIdx])

  const handleApplySuggestion = useCallback(async () => {
    if (!activeSlide) return
    const suggestionPrompt = activeSlide.type === 'chart'
      ? '현재 성장률 기반으로 Q1 예측 데이터를 추가하고, 트렌드 인사이트를 강화해줘.'
      : activeSlide.type === 'kpi'
        ? 'KPI 지표에 전월 대비 변화율을 추가하고 성과 트렌드를 명확히 표현해줘.'
        : '이 슬라이드의 핵심 메시지를 더 간결하고 임팩트 있게 정리해줘.'
    setMagicLoading(true)
    try {
      const updated = await editSlide(activeSlide, suggestionPrompt)
      if (updated) {
        const newSlides = [...state.slides]
        newSlides[state.activeSlideIndex] = updated
        dispatch({ type: 'SET_SLIDES', slides: newSlides })
      }
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'AI 제안 적용 중 오류가 발생했습니다.' })
    } finally {
      setMagicLoading(false)
    }
  }, [activeSlide, state.slides, state.activeSlideIndex])

  const handleExport = useCallback(async (format: string) => {
    if (state.slides.length === 0 || exporting) return
    setExporting(true)
    try {
      if (format === 'pptx') {
        await exportToPptx(state.slides, state.theme)
      } else {
        await exportToPdf(state.slides, state.theme)
      }
      dispatch({ type: 'SET_STATUS', status: 'COMPLETE' })
      save(state.slides, state.theme)
    } catch (err) {
      alert(`내보내기 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    } finally {
      setExporting(false)
      setShowExport(false)
    }
  }, [state.slides, state.theme, exporting, save])

  const handleShare = useCallback(() => {
    const json = JSON.stringify({ slides: state.slides, theme: state.theme }, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    })
  }, [state.slides, state.theme])

  const handleLoadPresentation = useCallback((record: PresentationRecord) => {
    dispatch({ type: 'SET_SLIDES', slides: record.slides })
    dispatch({ type: 'SET_THEME', theme: record.theme })
    // INIT → LOADING is valid, then we jump to OUTLINE
    dispatch({ type: 'SET_STATUS', status: 'LOADING' })
    // Small delay to show transition, then go to OUTLINE
    setTimeout(() => {
      dispatch({ type: 'SET_STATUS', status: 'ANALYZING' })
      setTimeout(() => {
        dispatch({ type: 'SET_STATUS', status: 'GENERATING' })
        setTimeout(() => {
          dispatch({ type: 'SET_STATUS', status: 'OUTLINE' })
        }, 300)
      }, 300)
    }, 300)
  }, [])

  /* ═══════ 슬라이드 드래그 재정렬 ═══════ */

  const handleSlideDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleSlideDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIdx(index)
  }, [])

  const handleSlideDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = Number(e.dataTransfer.getData('text/plain'))
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      dispatch({ type: 'REORDER_SLIDES', fromIndex, toIndex })
    }
    setDragOverIdx(null)
  }, [])

  const handleSlideDragEnd = useCallback(() => {
    setDragOverIdx(null)
  }, [])

  /* ═══════ GNB 공통 props ═══════ */
  const gnbProps = {
    onReset: () => dispatch({ type: 'RESET' }),
    onSettings: () => setShowTheme(true),
  }

  /* ═══════ INIT ═══════ */
  if (state.status === 'INIT') {
    const displayHistory = showAllHistory ? history : history.slice(0, 3)
    return (
      <div className="ppt-page">
        <GNB title="AI PPT Studio" {...gnbProps} onGenerate={handleGenerate} showGenerate={!!prompt.trim()} />

        {/* 히어로 */}
        <div className="ppt-hero">
          <Typo variant="$heading-1" style={{ color: 'var(--semantic-color-text-1)', marginBottom: 8 }}>
            다음 프레젠테이션은{'\n'}
            <span className="ppt-hero__accent">어떤 이야기</span>를 담을까요?
          </Typo>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)', maxWidth: 520, margin: '0 auto' }}>
            분석 방향을 설명하고, 데이터를 연결하거나, 최근 프로젝트에서 시작하세요.
          </Typo>
        </div>

        {/* AI 엔진 + 사이드 패널 */}
        <div className="ppt-init-content">
          {/* 좌: AI Creative Engine */}
          <VStack style={{ gap: 16, minWidth: 0 }}>
            <div className={`ppt-engine-card ${isDragging ? 'ppt-engine-card--dragging' : ''}`}
              onDragOver={handleDragOver} onDragEnter={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              {isDragging && (
                <div className="ppt-drop-overlay">
                  <Typo variant="$body-1" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600 }}>CSV 또는 Excel 파일을 여기에 놓으세요</Typo>
                </div>
              )}
              <Flex style={{ alignItems: 'center', gap: 8 }}>
                <IconAiLavelOutline size={16} color="var(--global-colors-primary-60)" />
                <Typo variant="$caption-1" style={{ fontWeight: 700, letterSpacing: '0.05em', color: 'var(--semantic-color-text-3)', textTransform: 'uppercase' as const }}>
                  AI Creative Engine
                </Typo>
              </Flex>

              <textarea
                className="ppt-engine-card__prompt"
                placeholder="예: '이번 Q4 인플루언서 캠페인을 분석하고, 고임팩트 비주얼 중심 리포트를 생성해줘'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              {attachedFiles.length > 0 && (
                <div className="ppt-attached-files">
                  <div className="ppt-attached-files__list">
                    {attachedFiles.map((f, i) => (
                      <div key={i} className="ppt-attached-file-chip">
                        <IconDocumentOutline size={14} />
                        <span>{f.fileName}</span>
                        <span className="ppt-attached-file-chip__meta">{f.totalRows}행</span>
                        <button onClick={() => removeFile(i)} title="삭제"><IconCloseOutline size={12} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="ppt-data-preview">
                    <table className="ppt-data-preview__table">
                      <thead><tr>{attachedFiles[0].headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {attachedFiles[0].preview.map((row, ri) => (
                          <tr key={ri}>{attachedFiles[0].headers.map(h => <td key={h}>{String(row[h] ?? '')}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                    {attachedFiles[0].truncated && (
                      <Typo variant="$caption-2" style={{ padding: '6px 10px', color: 'var(--semantic-color-text-4)' }}>
                        ... {attachedFiles[0].totalRows - 200}행 추가 (프롬프트에는 200행까지 포함)
                      </Typo>
                    )}
                  </div>
                </div>
              )}

              {parseError && <div className="ppt-parse-error">{parseError}</div>}

              <div className="ppt-engine-card__actions">
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" multiple hidden
                  onChange={e => { handleFileSelect(e.target.files); e.target.value = '' }} />
                <button className="ppt-gnb__icon-btn" title="파일 첨부" onClick={() => fileInputRef.current?.click()}>
                  <IconDocumentOutline size={18} />
                </button>
                <CoreButton buttonType="primary" size="md" text="프레젠테이션 생성 →" onClick={handleGenerate} />
              </div>

              <div className="ppt-engine-card__chips">
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', fontWeight: 600 }}>TRY:</Typo>
                {QUICK_PROMPTS.map(p => (
                  <button key={p} className="ppt-chip" onClick={() => setPrompt(p)}>{p}</button>
                ))}
              </div>
            </div>

            {/* 소스 카드 */}
            <div className="ppt-source-cards">
              <div className="ppt-source-card">
                <Flex style={{ alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <IconDocumentOutline size={20} color="var(--semantic-color-icon-secondary)" />
                  <IconAddOutline size={14} color="var(--semantic-color-text-4)" style={{ marginLeft: 'auto' }} />
                </Flex>
                <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 4 }}>Notion 페이지 동기화</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>Notion 워크스페이스의 기획서·회의록을 불러와 슬라이드 기반으로 변환합니다.</Typo>
              </div>
              <div className="ppt-source-card">
                <Flex style={{ alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <IconLinkOutline size={20} color="var(--semantic-color-icon-secondary)" />
                </Flex>
                <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, marginBottom: 4 }}>웹 URL 분석</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', marginBottom: 8 }}>URL을 붙여넣어 웹 페이지 내용을 슬라이드에 반영합니다.</Typo>
                <div className="ppt-url-input-row">
                  <input className="ppt-url-input" placeholder="https://example.com"
                    value={urlInput} onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFetchUrl()}
                    disabled={urlLoading} />
                  <CoreButton buttonType="primary" size="sm"
                    text={urlLoading ? '분석 중...' : '추가'}
                    onClick={handleFetchUrl} disabled={urlLoading || !urlInput.trim()} />
                </div>
                {urlError && <div className="ppt-parse-error" style={{ marginTop: 6 }}>{urlError}</div>}
                {fetchedUrls.length > 0 && (
                  <div className="ppt-attached-files__list" style={{ marginTop: 8 }}>
                    {fetchedUrls.map((u, i) => (
                      <div key={i} className="ppt-attached-file-chip">
                        <IconLinkOutline size={14} />
                        <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.title}</span>
                        <button onClick={() => removeUrl(i)} title="삭제"><IconCloseOutline size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </VStack>

          {/* 우: 데이터 소스 + AI 팁 */}
          <div className="ppt-side-cards">
            <div className="ppt-side-card">
              <div className="ppt-side-card__title">데이터 소스</div>
              <VStack style={{ gap: 0 }}>
                <div className="ppt-data-row">
                  <div className="ppt-data-icon" style={{ background: 'var(--global-colors-primary-10)' }}>
                    <IconReportDataOutline size={18} color="var(--global-colors-primary-60)" />
                  </div>
                  <VStack style={{ gap: 2, flex: 1 }}>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>캠페인 성과 데이터</Typo>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>피처링 내부 데이터</Typo>
                  </VStack>
                  <IconCheckCircleFilled size={16} color="var(--global-colors-primary-60)" />
                </div>
                <div className="ppt-data-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                  <Flex style={{ alignItems: 'center', gap: 10 }}>
                    <div className="ppt-data-icon" style={{ background: 'var(--global-colors-teal-10)' }}>
                      <IconInsightOutline size={18} color="var(--global-colors-teal-70)" />
                    </div>
                    <VStack style={{ gap: 2, flex: 1 }}>
                      <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>인플루언서 프로필</Typo>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>계정명 또는 URL로 검색</Typo>
                    </VStack>
                    {selectedInfluencers.length > 0 && <IconCheckCircleFilled size={16} color="var(--global-colors-teal-70)" />}
                  </Flex>
                  <div className="ppt-inf-search-wrap">
                    <input className="ppt-url-input" placeholder="@계정명 또는 URL 검색..."
                      value={infQuery} onChange={e => handleInfSearch(e.target.value)}
                      onFocus={() => infResults.length > 0 && setShowInfDropdown(true)}
                      onBlur={() => setTimeout(() => setShowInfDropdown(false), 200)} />
                    {showInfDropdown && infResults.length > 0 && (
                      <div className="ppt-inf-dropdown">
                        {infResults.map(inf => (
                          <div key={inf.id} className="ppt-inf-dropdown__item" onMouseDown={() => selectInfluencer(inf)}>
                            <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>@{inf.name}</Typo>
                            <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>{inf.subname} · {inf.platform} · {inf.followerCount}</Typo>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedInfluencers.length > 0 && (
                    <div className="ppt-attached-files__list">
                      {selectedInfluencers.map(inf => (
                        <div key={inf.id} className="ppt-attached-file-chip">
                          <span>@{inf.name}</span>
                          <span className="ppt-attached-file-chip__meta">{inf.platform}</span>
                          <button onClick={() => removeInfluencer(inf.id)} title="삭제"><IconCloseOutline size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {attachedFiles.map((f, i) => (
                  <div key={`af-${i}`} className="ppt-data-row">
                    <div className="ppt-data-icon" style={{ background: 'var(--global-colors-green-10)' }}>
                      <IconDocumentOutline size={18} color="var(--global-colors-green-70)" />
                    </div>
                    <VStack style={{ gap: 2, flex: 1 }}>
                      <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{f.fileName}</Typo>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>{f.totalRows}행 · {f.headers.length}열</Typo>
                    </VStack>
                    <IconCheckCircleFilled size={16} color="var(--global-colors-green-70)" />
                  </div>
                ))}
                {fetchedUrls.map((u, i) => (
                  <div key={`url-${i}`} className="ppt-data-row">
                    <div className="ppt-data-icon" style={{ background: 'var(--global-colors-blue-10)' }}>
                      <IconLinkOutline size={18} color="var(--global-colors-blue-70)" />
                    </div>
                    <VStack style={{ gap: 2, flex: 1, minWidth: 0 }}>
                      <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.title}</Typo>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.url}</Typo>
                    </VStack>
                    <IconCheckCircleFilled size={16} color="var(--global-colors-blue-70)" />
                  </div>
                ))}
              </VStack>
              <VStack style={{ gap: 8, marginTop: 12 }}>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', fontWeight: 600 }}>대상 캠페인</Typo>
                <select className="ppt-engine-card__prompt" style={{ minHeight: 'auto', padding: '8px 12px', fontSize: 13, borderRadius: 'var(--global-radius-200)' }}
                  value={targetId} onChange={e => setTargetId(e.target.value)}>
                  {CAMPAIGNS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </VStack>
            </div>

            <div className="ppt-ai-tip">
              <Flex style={{ alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <IconAiLavelOutline size={14} color="var(--global-colors-primary-60)" />
                <Typo variant="$caption-1" style={{ fontWeight: 700, color: 'var(--global-colors-primary-60)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>AI TIP</Typo>
              </Flex>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-2)', lineHeight: 1.5 }}>
                프롬프트에 '톤'을 지정해보세요. '미니멀', '임원용', '데이터 중심' 같은 키워드를 넣으면 더 나은 스타일 결과를 얻을 수 있습니다.
              </Typo>
            </div>
          </div>
        </div>

        {/* 최근 프레젠테이션 */}
        <div className="ppt-recent">
          <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <VStack style={{ gap: 4 }}>
              <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)' }}>최근 프레젠테이션</Typo>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>이전 작업을 이어가거나 스타일을 복제하세요.</Typo>
            </VStack>
            {history.length > 3 && (
              <CoreButton buttonType="tertiary" size="sm"
                text={showAllHistory ? '접기' : '모든 프로젝트 보기 →'}
                onClick={() => setShowAllHistory(v => !v)} />
            )}
          </Flex>
          <div className="ppt-recent__grid">
            {displayHistory.length > 0 ? (
              displayHistory.map((p, i) => (
                <div key={p.id} className="ppt-recent-card" onClick={() => handleLoadPresentation(p)}>
                  <div className={`ppt-recent-card__thumb ${i % 2 === 0 ? 'ppt-recent-card__thumb--gradient' : ''}`}>
                    {i % 2 !== 0 && <IconPptOutline size={32} color="var(--semantic-color-text-4)" />}
                  </div>
                  <div className="ppt-recent-card__info">
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{p.name}</Typo>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', marginTop: 2 }}>
                      {formatTimeAgo(p.updatedAt)} · {p.slides.length} Slides
                    </Typo>
                  </div>
                  <button className="ppt-recent-card__delete" onClick={(e) => { e.stopPropagation(); remove(p.id) }} title="삭제">
                    <IconCloseOutline size={14} />
                  </button>
                </div>
              ))
            ) : (
              [
                { name: 'Q4 마케팅 전략', time: '2시간 전', slides: 12, gradient: true },
                { name: '제품 런칭 로드맵', time: '1일 전', slides: 8, gradient: false },
                { name: '브랜드 가이드라인 v2', time: '3일 전', slides: 24, gradient: true },
              ].map((p, i) => (
                <div key={i} className="ppt-recent-card" onClick={handleGenerate}>
                  <div className={`ppt-recent-card__thumb ${p.gradient ? 'ppt-recent-card__thumb--gradient' : ''}`}>
                    {!p.gradient && <IconPptOutline size={32} color="var(--semantic-color-text-4)" />}
                  </div>
                  <div className="ppt-recent-card__info">
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{p.name}</Typo>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', marginTop: 2 }}>수정 {p.time} · {p.slides} Slides</Typo>
                  </div>
                </div>
              ))
            )}
            <div className="ppt-recent-card ppt-recent-card--empty" onClick={handleGenerate}>
              <VStack style={{ alignItems: 'center', gap: 6 }}>
                <IconAddOutline size={24} color="var(--semantic-color-text-4)" />
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)' }}>빈 캔버스</Typo>
              </VStack>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════ LOADING / ANALYZING / GENERATING ═══════ */
  if (['LOADING', 'ANALYZING', 'GENERATING'].includes(state.status)) {
    const steps = [
      { key: 'LOADING', label: '데이터 수집' },
      { key: 'ANALYZING', label: '인사이트 분석' },
      { key: 'GENERATING', label: '슬라이드 생성' },
    ]
    const ci = steps.findIndex(s => s.key === state.status)
    return (
      <div className="ppt-page">
        <GNB title="AI PPT Studio" {...gnbProps} showGenerate={false} />
        <div className="ppt-generating">
          <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>프레젠테이션을 제작하고 있습니다</Typo>
          <div className="ppt-generating__steps">
            {steps.map((step, i) => (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div className="ppt-step__connector" />}
                <div className={`ppt-step ${i === ci ? 'ppt-step--active' : i < ci ? 'ppt-step--done' : ''}`}>
                  <div className="ppt-step__icon">
                    {i < ci ? <IconCheckCircleFilled size={24} color="var(--global-colors-teal-70)" /> :
                      i === 0 ? <IconDataOutline size={24} /> : i === 1 ? <IconInsightOutline size={24} /> : <IconPptOutline size={24} />}
                  </div>
                  <Typo variant="$caption-1" style={{ color: i === ci ? 'var(--global-colors-primary-60)' : 'var(--semantic-color-text-4)', fontWeight: i === ci ? 700 : 500 }}>
                    {step.label}
                  </Typo>
                </div>
              </div>
            ))}
          </div>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)' }}>
            {state.status === 'LOADING' && '캠페인 데이터를 수집하고 있습니다...'}
            {state.status === 'ANALYZING' && 'AI가 성과를 분석하고 인사이트를 도출하고 있습니다...'}
            {state.status === 'GENERATING' && '슬라이드 구조와 콘텐츠를 생성하고 있습니다...'}
          </Typo>
        </div>
      </div>
    )
  }

  /* ═══════ ERROR ═══════ */
  if (state.status === 'ERROR') {
    return (
      <div className="ppt-page">
        <GNB title="AI PPT Studio" {...gnbProps} showGenerate={false} />
        <div className="ppt-generating">
          <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-support-error-1)' }}>오류가 발생했습니다</Typo>
          <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)' }}>{state.error || '알 수 없는 오류'}</Typo>
          <CoreButton buttonType="primary" size="md" text="다시 시도" onClick={() => dispatch({ type: 'RESET' })} />
        </div>
      </div>
    )
  }

  /* ═══════ OUTLINE ═══════ */
  if (state.status === 'OUTLINE') {
    return (
      <div className="ppt-page">
        <GNB title="AI PPT Studio" {...gnbProps} onGenerate={() => dispatch({ type: 'SET_STATUS', status: 'EDITING' })} />
        <div className="ppt-outline">
          <IconSidebar active={state.sidebarTab} onChange={(t) => dispatch({ type: 'SET_SIDEBAR', tab: t })} />

          <div className="ppt-outline__main">
            <div className="ppt-outline__header">
              <VStack style={{ gap: 8 }}>
                <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>프레젠테이션 아웃라인</Typo>
                <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-4)' }}>
                  AI가 "{CAMPAIGNS.find(c => c.value === targetId)?.label}" 분석을 위한 전략적 구성을 생성했습니다. 슬라이드 흐름과 요약을 검토하세요.
                </Typo>
              </VStack>
              <CoreButton buttonType="secondary" size="md" text="↻ 아웃라인 재생성" onClick={handleGenerate} />
            </div>

            {state.slides.map((slide, i) => (
              <div key={slide.id}
                className={`ppt-outline__card ${i === state.activeSlideIndex ? 'ppt-outline__card--active' : ''} ${dragOverIdx === i ? 'ppt-outline__card--drop-target' : ''}`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_SLIDE', index: i })}
                draggable
                onDragStart={e => handleSlideDragStart(e, i)}
                onDragOver={e => handleSlideDragOver(e, i)}
                onDrop={e => handleSlideDrop(e, i)}
                onDragEnd={handleSlideDragEnd}>
                <IconDraggableFilled size={16} color="var(--semantic-color-text-5)" style={{ marginTop: 4, cursor: 'grab' }} />
                <VStack style={{ gap: 6, flex: 1 }}>
                  <Flex style={{ alignItems: 'center', gap: 8 }}>
                    <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{slide.title}</Typo>
                  </Flex>
                  <Flex style={{ alignItems: 'center', gap: 6 }}>
                    <span className="ppt-outline__card-num">{String(i + 1).padStart(2, '0')}</span>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-3)' }}>{slide.summary}</Typo>
                  </Flex>
                </VStack>
                <button className="ppt-outline__card-edit"
                  onClick={(e) => { e.stopPropagation(); handleOutlineMagic(i) }}
                  disabled={outlineMagicIdx !== null}>
                  {outlineMagicIdx === i
                    ? <span className="ppt-outline__card-spinner" />
                    : <IconMagicWandOutline size={16} />}
                </button>
              </div>
            ))}

            <div className="ppt-outline__add" onClick={() => dispatch({ type: 'ADD_SLIDE' })}>
              <IconAddOutline size={16} /> 새 슬라이드 섹션 추가
            </div>

            <Flex style={{ justifyContent: 'flex-end', marginTop: 24, gap: 8 }}>
              <CoreButton buttonType="primary" size="md" text="슬라이드 편집 시작 →"
                onClick={() => dispatch({ type: 'SET_STATUS', status: 'EDITING' })} />
            </Flex>
          </div>

          {/* 우측: Narrative Flow */}
          <div className="ppt-outline__right">
            <div className="ppt-side-card__title">NARRATIVE FLOW</div>
            <div className="ppt-narrative-card">
              <Flex style={{ alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <IconAiLavelOutline size={14} color="var(--global-colors-primary-60)" />
                <Typo variant="$caption-1" style={{ fontWeight: 700, color: 'var(--global-colors-primary-60)', textTransform: 'uppercase' as const }}>AI 전략</Typo>
              </Flex>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-2)', lineHeight: 1.6 }}>
                이 흐름은 <strong>성과 지표</strong>를 먼저 제시하고 <strong>채널 분석</strong> → <strong>전략 제언</strong> 순으로 구성하여
                이해관계자의 초반 동의를 확보합니다.
              </Typo>
            </div>

            <VStack style={{ gap: 12, marginTop: 8 }}>
              {state.slides.slice(0, 3).map((slide, i) => (
                <VStack key={slide.id} style={{ gap: 4 }}>
                  <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--global-radius-200)', background: i === 0 ? 'linear-gradient(135deg, #4f46e5, #0d9488)' : 'var(--semantic-color-background-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i > 0 && <IconChartBarOutline size={24} color="var(--semantic-color-text-4)" />}
                  </div>
                  <Typo variant="$caption-2" style={{ fontWeight: 600, color: 'var(--semantic-color-text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.03em' }}>
                    {i === 0 ? 'HOOK: 캠페인 개요' : i === 1 ? 'EVIDENCE: 성과 데이터' : 'VALIDATION: 채널 분석'}
                  </Typo>
                </VStack>
              ))}
            </VStack>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════ EDITING / COMPLETE ═══════ */
  return (
    <div className="ppt-page">
      <GNB title="AI PPT Studio" {...gnbProps} onGenerate={() => setShowExport(true)} showGenerate={false} />

      {/* 에디터 GNB */}
      <div className="ppt-gnb" style={{ borderBottom: '1px solid var(--semantic-color-border-default)' }}>
        <div className="ppt-gnb__left">
          <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>
            {state.slides[0]?.title || '프레젠테이션'}
          </Typo>
          {state.status === 'COMPLETE' && <CoreTag tagType="primary" size="xs">완료</CoreTag>}
        </div>
        <div className="ppt-gnb__right">
          <CoreButton buttonType="tertiary" size="sm" text={shareCopied ? '복사됨!' : 'Share'} onClick={handleShare} />
          <CoreButton buttonType="primary" size="sm" text="Export" onClick={() => setShowExport(true)} />
        </div>
      </div>

      <div className="ppt-editor">
        {/* 아이콘 사이드바 */}
        <div className="ppt-editor__sidebar">
          <IconSidebar active={state.sidebarTab} onChange={(t) => dispatch({ type: 'SET_SIDEBAR', tab: t })} />
        </div>

        {/* 슬라이드 패널 */}
        <div className="ppt-editor__panel">
          {state.sidebarTab === 'slides' ? (
            <>
              <div className="ppt-editor__panel-header">
                <Typo variant="$caption-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{state.slides[0]?.title}</Typo>
                <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-4)', marginTop: 2 }}>LAST EDITED {formatTimeAgo(Date.now()).toUpperCase()}</Typo>
              </div>
              <div className="ppt-editor__panel-slides">
                {state.slides.map((slide, i) => (
                  <div key={slide.id}
                    className={`ppt-thumb ${i === state.activeSlideIndex ? 'ppt-thumb--active' : ''} ${dragOverIdx === i ? 'ppt-thumb--drop-target' : ''}`}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_SLIDE', index: i })}
                    draggable
                    onDragStart={e => handleSlideDragStart(e, i)}
                    onDragOver={e => handleSlideDragOver(e, i)}
                    onDrop={e => handleSlideDrop(e, i)}
                    onDragEnd={handleSlideDragEnd}>
                    <span className="ppt-thumb__number">{String(i + 1).padStart(2, '0')}</span>
                    <div className="ppt-thumb__preview">
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600, fontSize: 9 }}>{slide.title}</Typo>
                    </div>
                  </div>
                ))}
              </div>
              <button className="ppt-panel__add" onClick={() => dispatch({ type: 'ADD_SLIDE' })}>
                <IconAddOutline size={14} /> ADD SLIDE
              </button>
            </>
          ) : (
            <PptSidebarPanels
              tab={state.sidebarTab}
              slides={state.slides}
              activeSlideIndex={state.activeSlideIndex}
              activeSlide={activeSlide}
              theme={state.theme}
              themes={THEMES}
              dispatch={dispatch}
              attachedFiles={attachedFiles}
              fetchedUrls={fetchedUrls}
              selectedInfluencers={selectedInfluencers}
              magicInput={magicInput}
              setMagicInput={setMagicInput}
              magicLoading={magicLoading}
              onMagicEdit={handleMagicEdit}
            />
          )}
        </div>

        {/* 캔버스 영역 */}
        <PptCanvas
          activeSlide={activeSlide}
          activeSlideIndex={state.activeSlideIndex}
          selectedElementId={state.selectedElementId}
          theme={state.theme}
          dispatch={dispatch}
          editingField={editingField}
          setEditingField={setEditingField}
          magicInput={magicInput}
          setMagicInput={setMagicInput}
          magicLoading={magicLoading}
          onMagicEdit={handleMagicEdit}
        />

        {/* Inspector */}
        <PptInspector
          activeSlide={activeSlide}
          activeSlideIndex={state.activeSlideIndex}
          selectedElementId={state.selectedElementId}
          theme={state.theme}
          themes={THEMES}
          dispatch={dispatch}
          onShowTheme={() => setShowTheme(true)}
          onApplySuggestion={handleApplySuggestion}
          originalSlides={originalSlidesRef.current}
        />
      </div>

      {/* 테마 모달 */}
      {showTheme && (
        <PptThemeModal
          themes={THEMES}
          currentTheme={state.theme}
          onSelect={(t) => dispatch({ type: 'SET_THEME', theme: t })}
          onClose={() => setShowTheme(false)}
        />
      )}

      {/* 내보내기 모달 */}
      {showExport && (
        <PptExportModal
          exporting={exporting}
          onExport={handleExport}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}

/* ═══════ 유틸리티 ═══════ */

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}
