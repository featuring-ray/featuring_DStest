import { Flex, Typo } from '@featuring-corp/components'
import { IconCloseOutline } from '@featuring-corp/icons'
import type { PptTheme } from '../types/slides'

interface Props {
  themes: PptTheme[]
  currentTheme: PptTheme
  onSelect: (theme: PptTheme) => void
  onClose: () => void
}

export default function PptThemeModal({ themes, currentTheme, onSelect, onClose }: Props) {
  return (
    <div className="ppt-overlay" onClick={onClose}>
      <div className="ppt-modal" onClick={e => e.stopPropagation()}>
        <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typo variant="$heading-5" style={{ color: 'var(--semantic-color-text-1)' }}>테마 선택</Typo>
          <button className="ppt-gnb__icon-btn" onClick={onClose}><IconCloseOutline size={20} /></button>
        </Flex>
        <div className="ppt-theme-grid">
          {themes.map(t => (
            <div key={t.id} className={`ppt-theme-card ${currentTheme.id === t.id ? 'ppt-theme-card--active' : ''}`}
              onClick={() => { onSelect(t); onClose() }}>
              <div className="ppt-theme-preview">
                <div className="ppt-theme-swatch" style={{ background: t.primary }} />
                <div className="ppt-theme-swatch" style={{ background: t.secondary }} />
                <div className="ppt-theme-swatch" style={{ background: t.accent }} />
              </div>
              <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>{t.name}</Typo>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
