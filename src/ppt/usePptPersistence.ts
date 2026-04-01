import { useState, useCallback } from 'react'
import type { Slide, PptTheme } from '../types/slides'

const STORAGE_KEY = 'ppt-studio-history'
const MAX_ENTRIES = 10

export interface PresentationRecord {
  id: string
  name: string
  slides: Slide[]
  theme: PptTheme
  updatedAt: number
}

function readHistory(): PresentationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PresentationRecord[]
  } catch {
    return []
  }
}

function writeHistory(records: PresentationRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_ENTRIES)))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function usePptPersistence() {
  const [history, setHistory] = useState<PresentationRecord[]>(readHistory)

  const save = useCallback((slides: Slide[], theme: PptTheme) => {
    const name = slides[0]?.title || '프레젠테이션'
    const record: PresentationRecord = {
      id: `ppt_${Date.now()}`,
      name,
      slides,
      theme,
      updatedAt: Date.now(),
    }
    const updated = [record, ...readHistory().filter(r => r.name !== name)].slice(0, MAX_ENTRIES)
    writeHistory(updated)
    setHistory(updated)
  }, [])

  const load = useCallback((id: string): PresentationRecord | null => {
    return readHistory().find(r => r.id === id) || null
  }, [])

  const remove = useCallback((id: string) => {
    const updated = readHistory().filter(r => r.id !== id)
    writeHistory(updated)
    setHistory(updated)
  }, [])

  return { history, save, load, remove }
}
