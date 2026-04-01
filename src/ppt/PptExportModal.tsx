import { useState } from 'react'
import { Flex, Typo, CoreButton } from '@featuring-corp/components'
import { IconCloseOutline, IconCheckCircleFilled } from '@featuring-corp/icons'

interface Props {
  exporting: boolean
  onExport: (format: string) => void
  onClose: () => void
}

const CHECKLIST_ITEMS = [
  { key: 'spell', label: '맞춤법 확인 완료' },
  { key: 'brand', label: '브랜드 색상 일관성 확인' },
  { key: 'data', label: '데이터 정확성 확인' },
]

export default function PptExportModal({ exporting, onExport, onClose }: Props) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({ spell: false, brand: false, data: false })

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="ppt-overlay" onClick={onClose}>
      <div className="ppt-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <Flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typo variant="$heading-5" style={{ color: 'var(--semantic-color-text-1)' }}>내보내기</Typo>
          <button className="ppt-gnb__icon-btn" onClick={onClose}><IconCloseOutline size={20} /></button>
        </Flex>
        <div className="ppt-export-checklist">
          <div className="ppt-side-card__title">사전 체크리스트</div>
          {CHECKLIST_ITEMS.map(c => (
            <div key={c.key} className="ppt-export-check" onClick={() => toggleCheck(c.key)} style={{ cursor: 'pointer' }}>
              <IconCheckCircleFilled size={16} color={checklist[c.key] ? 'var(--global-colors-teal-70)' : 'var(--semantic-color-text-5)'} />
              <Typo variant="$body-2" style={{ color: checklist[c.key] ? 'var(--semantic-color-text-1)' : 'var(--semantic-color-text-4)' }}>{c.label}</Typo>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--semantic-color-border-default)', paddingTop: 16 }}>
          <Flex style={{ gap: 8 }}>
            <CoreButton buttonType="primary" size="md" text={exporting ? '내보내는 중...' : 'PPTX 다운로드'} onClick={() => onExport('pptx')} disabled={exporting} style={{ flex: 1 }} />
            <CoreButton buttonType="tertiary" size="md" text={exporting ? '내보내는 중...' : 'PDF 다운로드'} onClick={() => onExport('pdf')} disabled={exporting} style={{ flex: 1 }} />
          </Flex>
        </div>
      </div>
    </div>
  )
}
