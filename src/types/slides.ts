/* ═══════════════════════ PPT 슬라이드 타입 ═══════════════════════ */

export type PptStatus = 'INIT' | 'LOADING' | 'ANALYZING' | 'GENERATING' | 'OUTLINE' | 'EDITING' | 'COMPLETE' | 'ERROR'
export type SlideType = 'title' | 'kpi' | 'chart' | 'comparison' | 'insight' | 'recommendation' | 'influencer'

export interface SlideElement {
  id: string
  kind: 'text' | 'kpi-grid' | 'bar-chart' | 'list' | 'influencer-profile' | 'audience-chart' | 'content-grid' | 'ad-performance'
  content: string
  data?: Record<string, unknown>[] | Record<string, unknown>
  style?: ElementStyle
}

export interface Slide {
  id: string
  type: SlideType
  title: string
  summary: string
  elements: SlideElement[]
}

export interface PptTheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  bg: string
}

export interface PptState {
  status: PptStatus
  slides: Slide[]
  activeSlideIndex: number
  selectedElementId: string | null
  theme: PptTheme
  error: string | null
  sidebarTab: string
}

export type PptAction =
  | { type: 'SET_STATUS'; status: PptStatus }
  | { type: 'SET_SLIDES'; slides: Slide[] }
  | { type: 'SET_ACTIVE_SLIDE'; index: number }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'SET_THEME'; theme: PptTheme }
  | { type: 'SET_SIDEBAR'; tab: string }
  | { type: 'UPDATE_ELEMENT'; slideIndex: number; elementId: string; content: string }
  | { type: 'UPDATE_ELEMENT_DATA'; slideIndex: number; elementId: string; dataIndex: number; field: string; value: unknown }
  | { type: 'UPDATE_SLIDE_TITLE'; slideIndex: number; title: string }
  | { type: 'UPDATE_SLIDE_SUMMARY'; slideIndex: number; summary: string }
  | { type: 'ADD_SLIDE' }
  | { type: 'DELETE_SLIDE'; index: number }
  | { type: 'REORDER_SLIDES'; fromIndex: number; toIndex: number }
  | { type: 'UPDATE_ELEMENT_STYLE'; slideIndex: number; elementId: string; style: Partial<ElementStyle> }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESET' }

export interface ElementStyle {
  fontFamily?: string
  fontWeight?: string
  fontSize?: string
}
