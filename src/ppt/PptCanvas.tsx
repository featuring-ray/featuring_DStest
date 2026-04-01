import { useState } from 'react'
import { Flex, VStack, Typo, CoreButton } from '@featuring-corp/components'
import {
  IconAiLavelOutline,
  IconSubtractOutline,
  IconAddOutline,
  IconZoomInAreaOutline,
} from '@featuring-corp/icons'
import type { Slide, PptTheme, PptAction } from '../types/slides'

function formatNum(n: number): string { return n.toLocaleString('ko-KR') }

interface Props {
  activeSlide: Slide | null
  activeSlideIndex: number
  selectedElementId: string | null
  theme: PptTheme
  dispatch: React.Dispatch<PptAction>
  editingField: string | null
  setEditingField: (field: string | null) => void
  magicInput: string
  setMagicInput: (v: string) => void
  magicLoading: boolean
  onMagicEdit: (prompt?: string) => void
}

export default function PptCanvas({
  activeSlide, activeSlideIndex, selectedElementId, theme, dispatch,
  editingField, setEditingField,
  magicInput, setMagicInput, magicLoading, onMagicEdit,
}: Props) {
  const [zoom, setZoom] = useState(85)

  return (
    <div className="ppt-editor__canvas-area">
      <div className="ppt-canvas">
        {activeSlide && (
          <div className="ppt-canvas__slide"
            style={{ background: theme.bg, transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            onClick={(e) => { if (e.target === e.currentTarget) { dispatch({ type: 'SELECT_ELEMENT', id: null }); setEditingField(null) } }}>
            {/* 슬라이드 제목 */}
            <div className={`ppt-canvas__element ${selectedElementId === 'title' ? 'ppt-canvas__element--selected' : ''}`}
              onClick={() => dispatch({ type: 'SELECT_ELEMENT', id: 'title' })}
              onDoubleClick={() => setEditingField('title')}>
              {editingField === 'title' ? (
                <input className="ppt-inline-edit ppt-inline-edit--title" autoFocus
                  value={activeSlide.title}
                  onChange={e => dispatch({ type: 'UPDATE_SLIDE_TITLE', slideIndex: activeSlideIndex, title: e.target.value })}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={e => e.key === 'Enter' && setEditingField(null)} />
              ) : (
                <Typo variant="$heading-4" style={{ color: theme.primary }}>{activeSlide.title}</Typo>
              )}
              {activeSlide.type === 'title' && (
                editingField === 'summary' ? (
                  <input className="ppt-inline-edit ppt-inline-edit--summary" autoFocus
                    value={activeSlide.summary}
                    onChange={e => dispatch({ type: 'UPDATE_SLIDE_SUMMARY', slideIndex: activeSlideIndex, summary: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={e => e.key === 'Enter' && setEditingField(null)} />
                ) : (
                  <Typo variant="$body-2" style={{ color: theme.secondary, marginTop: 4, cursor: 'text' }}
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingField('summary') }}>{activeSlide.summary}</Typo>
                )
              )}
            </div>

            <VStack style={{ gap: 8, marginTop: 16, flex: 1 }}>
              {activeSlide.elements.map((el) => (
                <div key={el.id} className={`ppt-canvas__element ${selectedElementId === el.id ? 'ppt-canvas__element--selected' : ''}`}
                  onClick={() => dispatch({ type: 'SELECT_ELEMENT', id: el.id })}
                  style={el.style ? { fontFamily: el.style.fontFamily, fontWeight: el.style.fontWeight, fontSize: el.style.fontSize } : undefined}>

                  {/* 텍스트 요소 */}
                  {el.kind === 'text' && (
                    editingField === el.id ? (
                      <input className="ppt-inline-edit" autoFocus
                        value={el.content}
                        onChange={e => dispatch({ type: 'UPDATE_ELEMENT', slideIndex: activeSlideIndex, elementId: el.id, content: e.target.value })}
                        onBlur={() => setEditingField(null)}
                        onKeyDown={e => e.key === 'Enter' && setEditingField(null)} />
                    ) : (
                      <Typo variant="$body-2" style={{ color: theme.secondary, cursor: 'text' }}
                        onDoubleClick={() => setEditingField(el.id)}>{el.content}</Typo>
                    )
                  )}

                  {/* KPI 그리드 */}
                  {el.kind === 'kpi-grid' && el.data && (
                    <div className="ppt-slide-kpi-grid">
                      {(el.data as { label: string; value: string; sub: string }[]).map((k, ki) => (
                        <div key={ki} className="ppt-slide-kpi">
                          {editingField === `${el.id}-kpi-${ki}-label` ? (
                            <input className="ppt-inline-edit ppt-inline-edit--sm" autoFocus value={k.label}
                              onChange={e => dispatch({ type: 'UPDATE_ELEMENT_DATA', slideIndex: activeSlideIndex, elementId: el.id, dataIndex: ki, field: 'label', value: e.target.value })}
                              onBlur={() => setEditingField(null)} onKeyDown={e => e.key === 'Enter' && setEditingField(null)} />
                          ) : (
                            <Typo variant="$caption-2" style={{ color: theme.secondary, cursor: 'text' }}
                              onDoubleClick={(e) => { e.stopPropagation(); setEditingField(`${el.id}-kpi-${ki}-label`) }}>{k.label}</Typo>
                          )}
                          {editingField === `${el.id}-kpi-${ki}-value` ? (
                            <input className="ppt-inline-edit ppt-inline-edit--lg" autoFocus value={k.value}
                              onChange={e => dispatch({ type: 'UPDATE_ELEMENT_DATA', slideIndex: activeSlideIndex, elementId: el.id, dataIndex: ki, field: 'value', value: e.target.value })}
                              onBlur={() => setEditingField(null)} onKeyDown={e => e.key === 'Enter' && setEditingField(null)} />
                          ) : (
                            <Typo variant="$heading-5" style={{ color: theme.primary, marginTop: 2, cursor: 'text' }}
                              onDoubleClick={(e) => { e.stopPropagation(); setEditingField(`${el.id}-kpi-${ki}-value`) }}>{k.value}</Typo>
                          )}
                          {editingField === `${el.id}-kpi-${ki}-sub` ? (
                            <input className="ppt-inline-edit ppt-inline-edit--sm" autoFocus value={k.sub}
                              onChange={e => dispatch({ type: 'UPDATE_ELEMENT_DATA', slideIndex: activeSlideIndex, elementId: el.id, dataIndex: ki, field: 'sub', value: e.target.value })}
                              onBlur={() => setEditingField(null)} onKeyDown={e => e.key === 'Enter' && setEditingField(null)} />
                          ) : (
                            <Typo variant="$caption-2" style={{ color: theme.accent, marginTop: 2, cursor: 'text' }}
                              onDoubleClick={(e) => { e.stopPropagation(); setEditingField(`${el.id}-kpi-${ki}-sub`) }}>{k.sub}</Typo>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 바 차트 */}
                  {el.kind === 'bar-chart' && el.data && (
                    <VStack style={{ gap: 6, marginTop: 8 }}>
                      {(el.data as { label: string; value: number; pct: number; color: string }[]).map((b, bi) => (
                        <div key={bi} className="ppt-slide-bar">
                          <div className="ppt-slide-bar__label">
                            {editingField === `${el.id}-bar-${bi}-label` ? (
                              <input className="ppt-inline-edit ppt-inline-edit--sm" autoFocus value={b.label}
                                onChange={e => dispatch({ type: 'UPDATE_ELEMENT_DATA', slideIndex: activeSlideIndex, elementId: el.id, dataIndex: bi, field: 'label', value: e.target.value })}
                                onBlur={() => setEditingField(null)} onKeyDown={e => e.key === 'Enter' && setEditingField(null)} />
                            ) : (
                              <Typo variant="$caption-2" style={{ color: theme.secondary, fontWeight: 500, cursor: 'text' }}
                                onDoubleClick={(e) => { e.stopPropagation(); setEditingField(`${el.id}-bar-${bi}-label`) }}>{b.label}</Typo>
                            )}
                          </div>
                          <div className="ppt-slide-bar__track">
                            <div className="ppt-slide-bar__fill" style={{ width: `${b.pct}%`, background: b.color || theme.primary }} />
                          </div>
                          {editingField === `${el.id}-bar-${bi}-value` ? (
                            <input className="ppt-inline-edit ppt-inline-edit--sm" autoFocus value={String(b.value)} style={{ width: 70, textAlign: 'right' }}
                              onChange={e => dispatch({ type: 'UPDATE_ELEMENT_DATA', slideIndex: activeSlideIndex, elementId: el.id, dataIndex: bi, field: 'value', value: Number(e.target.value) || 0 })}
                              onBlur={() => setEditingField(null)} onKeyDown={e => e.key === 'Enter' && setEditingField(null)} />
                          ) : (
                            <Typo variant="$caption-2" style={{ color: theme.secondary, width: 60, textAlign: 'right', flexShrink: 0, cursor: 'text' }}
                              onDoubleClick={(e) => { e.stopPropagation(); setEditingField(`${el.id}-bar-${bi}-value`) }}>{formatNum(b.value)}</Typo>
                          )}
                        </div>
                      ))}
                    </VStack>
                  )}

                  {/* 리스트 */}
                  {el.kind === 'list' && el.data && (
                    <VStack style={{ gap: 6 }}>
                      {(el.data as { text: string }[]).map((item, li) => (
                        <Flex key={li} style={{ gap: 8, alignItems: 'flex-start' }}>
                          <Typo variant="$body-2" style={{ color: theme.primary, fontWeight: 700, flexShrink: 0 }}>{li + 1}.</Typo>
                          {editingField === `${el.id}-list-${li}` ? (
                            <input className="ppt-inline-edit" autoFocus value={item.text} style={{ flex: 1 }}
                              onChange={e => dispatch({ type: 'UPDATE_ELEMENT_DATA', slideIndex: activeSlideIndex, elementId: el.id, dataIndex: li, field: 'text', value: e.target.value })}
                              onBlur={() => setEditingField(null)} onKeyDown={e => e.key === 'Enter' && setEditingField(null)} />
                          ) : (
                            <Typo variant="$body-2" style={{ color: theme.secondary, cursor: 'text' }}
                              onDoubleClick={(e) => { e.stopPropagation(); setEditingField(`${el.id}-list-${li}`) }}>{item.text}</Typo>
                          )}
                        </Flex>
                      ))}
                    </VStack>
                  )}

                  {/* 인플루언서 프로필 KPI */}
                  {el.kind === 'influencer-profile' && Array.isArray(el.data) && (
                    <div className="ppt-slide-inf-profile">
                      {(el.data as { label: string; value: string; pct: number; color: string }[]).map((k, ki) => (
                        <div key={ki} className="ppt-slide-inf-profile__card">
                          <Typo variant="$caption-2" style={{ color: theme.secondary }}>{k.label}</Typo>
                          <Typo variant="$heading-5" style={{ color: k.color || theme.primary, marginTop: 2 }}>{k.value}</Typo>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 오디언스 차트 (성별 도넛 + 연령 바) */}
                  {el.kind === 'audience-chart' && el.data && !Array.isArray(el.data) && (
                    (() => {
                      const d = el.data as { gender?: { label: string; pct: number; color: string }[]; age?: { label: string; pct: number; color: string }[] }
                      return (
                        <div className="ppt-slide-audience">
                          {d.gender && (
                            <div className="ppt-slide-audience__section">
                              <div className="ppt-slide-audience__section-title">성별 분포</div>
                              <div className="ppt-slide-donut" style={{
                                background: `conic-gradient(${d.gender.map((g, i) => {
                                  const start = d.gender!.slice(0, i).reduce((s, x) => s + x.pct, 0)
                                  return `${g.color} ${start * 3.6}deg ${(start + g.pct) * 3.6}deg`
                                }).join(', ')})`
                              }} />
                              <div className="ppt-slide-donut__legend">
                                {d.gender.map((g, i) => (
                                  <div key={i} className="ppt-slide-donut__legend-item">
                                    <div className="ppt-slide-donut__legend-dot" style={{ background: g.color }} />
                                    {g.label} {g.pct}%
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {d.age && (
                            <div className="ppt-slide-audience__section">
                              <div className="ppt-slide-audience__section-title">연령 분포</div>
                              <div className="ppt-slide-age-bars">
                                {d.age.map((a, i) => (
                                  <div key={i} className="ppt-slide-age-bar">
                                    <span className="ppt-slide-age-bar__label">{a.label}</span>
                                    <div className="ppt-slide-age-bar__track">
                                      <div className="ppt-slide-age-bar__fill" style={{ width: `${a.pct}%`, background: a.color }} />
                                    </div>
                                    <span className="ppt-slide-age-bar__pct">{a.pct}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()
                  )}

                  {/* 콘텐츠 성과 그리드 */}
                  {el.kind === 'content-grid' && Array.isArray(el.data) && (
                    <div className="ppt-slide-content-grid">
                      {(el.data as { title: string; likes: string; comments: string; date: string }[]).map((c, ci) => (
                        <div key={ci} className="ppt-slide-content-card">
                          <div className="ppt-slide-content-card__title">{c.title}</div>
                          <div className="ppt-slide-content-card__meta">
                            <span>♥ {c.likes}</span>
                            <span>💬 {c.comments}</span>
                            <span>{c.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 광고 성과 */}
                  {el.kind === 'ad-performance' && Array.isArray(el.data) && (
                    <div className="ppt-slide-ad-perf">
                      {(el.data as { label: string; value: string; pct: number; color: string }[]).map((a, ai) => (
                        <div key={ai} className="ppt-slide-ad-perf__item">
                          <span className="ppt-slide-ad-perf__label">{a.label}</span>
                          <div className="ppt-slide-ad-perf__bar">
                            <div className="ppt-slide-ad-perf__bar-fill" style={{ width: `${a.pct}%`, background: a.color }} />
                          </div>
                          <span className="ppt-slide-ad-perf__value">{a.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </VStack>

            {activeSlide.type === 'title' && (
              <Flex style={{ justifyContent: 'flex-end', marginTop: 'auto' }}>
                <span style={{ fontSize: 11, color: theme.secondary, opacity: 0.6, padding: '4px 8px', border: `1px solid ${theme.secondary}33`, borderRadius: 4 }}>Confidential Internal Report</span>
              </Flex>
            )}
          </div>
        )}
      </div>

      {/* Magic Edit Bar */}
      <div className="ppt-magic-bar">
        <IconAiLavelOutline size={20} color="var(--global-colors-primary-60)" />
        <input className="ppt-magic-bar__input" placeholder="더 간결하게 만들거나 핵심 성과를 강조해줘..."
          value={magicInput} onChange={e => setMagicInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onMagicEdit()} />
        <CoreButton buttonType="contrast" size="sm" text={magicLoading ? '처리 중...' : 'MAGIC EDIT'} onClick={() => onMagicEdit()} disabled={magicLoading} />
      </div>

      {/* Zoom Bar */}
      <div className="ppt-zoom-bar">
        <button className="ppt-zoom-bar__btn" onClick={() => setZoom(z => Math.max(25, z - 15))}><IconSubtractOutline size={14} /></button>
        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', width: 40, textAlign: 'center' }}>{zoom}%</Typo>
        <button className="ppt-zoom-bar__btn" onClick={() => setZoom(z => Math.min(200, z + 15))}><IconAddOutline size={14} /></button>
        <button className="ppt-zoom-bar__btn" style={{ marginLeft: 8 }} onClick={() => setZoom(85)}><IconZoomInAreaOutline size={14} /></button>
      </div>
    </div>
  )
}
