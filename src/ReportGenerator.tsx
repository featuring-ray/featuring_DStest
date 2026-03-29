import './ReportGenerator.css'
import { useState, useCallback, useRef } from 'react'
import { Flex, VStack, Typo, CoreButton, CoreTag, CoreSelect } from '@featuring-corp/components'
import { IconAiLavelOutline } from '@featuring-corp/icons'

/* ── 타입 정의 ── */
interface InfluencerPerformance {
  name: string
  channel: string
  format: string
  reach: number
  engagement: number
  cpe: number
}

interface FormatPerformance {
  format: string
  reach: number
  engagement: number
  cpe: number
  color: string
}

/* ── 상수/Mock 데이터 ── */
const CAMPAIGN_OPTIONS = [
  { label: '그린러브 비건스킨케어 캠페인', value: 'greenlove' },
  { label: '다이슨 에어랩 캠페인', value: 'dyson' },
  { label: '미닉스더플렌더 캠페인', value: 'minix' },
]

const MOCK_INFLUENCERS: InfluencerPerformance[] = [
  { name: '@creator_A', channel: 'Instagram', format: '릴스', reach: 245000, engagement: 18200, cpe: 137 },
  { name: '@creator_B', channel: 'Instagram', format: '피드', reach: 128000, engagement: 6400, cpe: 312 },
  { name: '@creator_C', channel: 'YouTube', format: '쇼츠', reach: 312000, engagement: 22100, cpe: 113 },
  { name: '@creator_D', channel: 'Instagram', format: '릴스', reach: 189000, engagement: 14800, cpe: 169 },
  { name: '@creator_E', channel: 'TikTok', format: '쇼츠', reach: 278000, engagement: 19500, cpe: 128 },
  { name: '@creator_F', channel: 'Instagram', format: '피드', reach: 95000, engagement: 4200, cpe: 476 },
]

const MOCK_FORMAT_PERFORMANCE: FormatPerformance[] = [
  { format: '릴스', reach: 434000, engagement: 33000, cpe: 151, color: 'var(--global-colors-primary-60)' },
  { format: '쇼츠', reach: 590000, engagement: 41600, cpe: 120, color: 'var(--global-colors-teal-70)' },
  { format: '피드', reach: 223000, engagement: 10600, cpe: 385, color: 'var(--global-colors-magenta-40)' },
]

const MOCK_INSIGHTS = [
  '숏폼(릴스+쇼츠)이 전체 참여의 87%를 차지하며, 피드 대비 CPE가 2.8배 효율적입니다. 차기 캠페인은 숏폼 비중을 70% 이상으로 확대하는 것을 권장합니다.',
  '@creator_C와 @creator_E의 쇼츠 콘텐츠가 "제품 시연 + 비포/애프터" 구조에서 가장 높은 참여율을 기록했습니다. 해당 콘텐츠 구조를 템플릿화하여 다른 크리에이터에게도 적용할 수 있습니다.',
  '게시 시간 분석 결과, 오후 8-10시 게시물의 참여율이 오전 대비 1.6배 높았습니다. 콘텐츠 라이브 시간을 저녁 피크타임에 집중하는 것을 권장합니다.',
]

const MOCK_RECOMMENDATIONS = [
  '재협업 1순위: @creator_C (CPE 최저, 도달 최고) — 장기 앰배서더 계약 검토',
  '재협업 2순위: @creator_E (TikTok 쇼츠 특화, 젊은 타깃 확보)',
  '신규 채널 확장: TikTok 비중을 30%에서 50%로 확대 (CPE 효율 우수)',
  '콘텐츠 포맷: 피드 단독보다 릴스+피드 교차 게시 전략 권장',
]

/* ── 유틸 ── */
function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR')
}

function formatKRW(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

/* ── 메인 컴포넌트 ── */
export default function ReportGenerator() {
  const [campaign, setCampaign] = useState('greenlove')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalReach = MOCK_INFLUENCERS.reduce((s, i) => s + i.reach, 0)
  const totalEngagement = MOCK_INFLUENCERS.reduce((s, i) => s + i.engagement, 0)
  const avgCpe = Math.round(MOCK_INFLUENCERS.reduce((s, i) => s + i.cpe, 0) / MOCK_INFLUENCERS.length)
  const engagementRate = ((totalEngagement / totalReach) * 100).toFixed(1)

  const maxFormatReach = Math.max(...MOCK_FORMAT_PERFORMANCE.map(f => f.reach))

  const topPerformers = [...MOCK_INFLUENCERS].sort((a, b) => a.cpe - b.cpe).slice(0, 3)

  const handleGenerate = useCallback(() => {
    setIsGenerating(true)
    setShowReport(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setShowReport(true)
      setIsGenerating(false)
    }, 2500)
  }, [])

  const handleCopy = useCallback(() => {
    alert('리포트 내용이 클립보드에 복사되었습니다. (Mock)')
  }, [])

  const handleDownload = useCallback(() => {
    alert('PDF 다운로드가 시작되었습니다. (Mock)')
  }, [])

  return (
    <div className="rg-page">
      {/* ── 상단 헤더 바 ── */}
      <div className="rg-topbar">
        <IconAiLavelOutline size={20} color="var(--semantic-color-text-1)" />
        <Typo variant="$heading-3" style={{ color: 'var(--semantic-color-text-1)' }}>캠페인 리포트 생성</Typo>
        <CoreTag tagType="primary" size="xs">AI</CoreTag>
      </div>

      {/* ── 본문 ── */}
      <div className="rg-content">
        {/* 캠페인 선택 + 데이터 테이블 */}
        <div className="rg-input-section">
          <Flex style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Typo variant="$body-1" style={{ color: 'var(--semantic-color-text-1)', fontWeight: 600 }}>성과 데이터</Typo>
            <CoreSelect size="sm" value={campaign} setValue={(v: string) => setCampaign(v)}>
              {CAMPAIGN_OPTIONS.map(o => (
                <CoreSelect.Item key={o.value} value={o.value}>{o.label}</CoreSelect.Item>
              ))}
            </CoreSelect>
          </Flex>

          <div className="rg-table-wrap">
            <table className="rg-table">
              <thead>
                <tr>
                  <th>인플루언서</th>
                  <th>채널</th>
                  <th>포맷</th>
                  <th>도달</th>
                  <th>참여</th>
                  <th>CPE</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INFLUENCERS.map((inf, i) => (
                  <tr key={i}>
                    <td>
                      <Typo variant="$body-2" style={{ fontWeight: 600, color: 'var(--semantic-color-text-1)' }}>{inf.name}</Typo>
                    </td>
                    <td>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>{inf.channel}</Typo>
                    </td>
                    <td>
                      <CoreTag tagType="gray" size="xs">{inf.format}</CoreTag>
                    </td>
                    <td>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>{formatNumber(inf.reach)}</Typo>
                    </td>
                    <td>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>{formatNumber(inf.engagement)}</Typo>
                    </td>
                    <td>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>{formatKRW(inf.cpe)}</Typo>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Flex style={{ justifyContent: 'flex-end', marginTop: 16 }}>
            <CoreButton buttonType="primary" size="md" text="리포트 생성" onClick={handleGenerate} />
          </Flex>
        </div>

        {/* AI 생성 중 */}
        {isGenerating && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Typo variant="$body-2" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 600 }}>
              AI가 리포트를 생성하고 있습니다...
            </Typo>
          </div>
        )}

        {/* 슬라이드 결과 */}
        {showReport && (
          <>
            <div className="rg-slides">
              {/* 슬라이드 1: 캠페인 개요 */}
              <div className="rg-slide">
                <Flex style={{ alignItems: 'center', marginBottom: 16 }}>
                  <span className="rg-slide-number">1</span>
                  <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)' }}>캠페인 개요</Typo>
                </Flex>
                <VStack style={{ gap: 8 }}>
                  <Flex style={{ gap: 8 }}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', width: 80 }}>캠페인명</Typo>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>그린러브 비건스킨케어 캠페인</Typo>
                  </Flex>
                  <Flex style={{ gap: 8 }}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', width: 80 }}>브랜드</Typo>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>그린러브 (GreenLove)</Typo>
                  </Flex>
                  <Flex style={{ gap: 8 }}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', width: 80 }}>예산</Typo>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>2,500만원</Typo>
                  </Flex>
                  <Flex style={{ gap: 8 }}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', width: 80 }}>기간</Typo>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>2026.02.15 - 2026.03.15 (4주)</Typo>
                  </Flex>
                  <Flex style={{ gap: 8 }}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', width: 80 }}>목표</Typo>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>비건 스킨케어 인지도 확대 + 제품 체험 리뷰</Typo>
                  </Flex>
                  <Flex style={{ gap: 8 }}>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', width: 80 }}>참여 크리에이터</Typo>
                    <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>6명 (Instagram 4, YouTube 1, TikTok 1)</Typo>
                  </Flex>
                </VStack>
              </div>

              {/* 슬라이드 2: 핵심 성과 요약 */}
              <div className="rg-slide">
                <Flex style={{ alignItems: 'center', marginBottom: 16 }}>
                  <span className="rg-slide-number">2</span>
                  <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)' }}>핵심 성과 요약</Typo>
                </Flex>
                <div className="rg-kpi-grid">
                  <div className="rg-kpi-card">
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>총 도달</Typo>
                    <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)', marginTop: 4 }}>{formatNumber(totalReach)}</Typo>
                  </div>
                  <div className="rg-kpi-card">
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>총 참여</Typo>
                    <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)', marginTop: 4 }}>{formatNumber(totalEngagement)}</Typo>
                  </div>
                  <div className="rg-kpi-card">
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>참여율</Typo>
                    <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)', marginTop: 4 }}>{engagementRate}%</Typo>
                  </div>
                  <div className="rg-kpi-card">
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>평균 CPE</Typo>
                    <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)', marginTop: 4 }}>{formatKRW(avgCpe)}</Typo>
                  </div>
                  <div className="rg-kpi-card">
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>벤치마크 CPE</Typo>
                    <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-3)', marginTop: 4 }}>220원</Typo>
                    <Typo variant="$caption-2" style={{ color: 'var(--global-colors-teal-70)', marginTop: 2 }}>뷰티 카테고리 평균</Typo>
                  </div>
                  <div className="rg-kpi-card">
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>CPE 대비 효율</Typo>
                    <Typo variant="$heading-4" style={{ color: avgCpe < 220 ? 'var(--global-colors-teal-70)' : '#ef4444', marginTop: 4 }}>
                      {avgCpe < 220 ? '우수' : '개선 필요'}
                    </Typo>
                    <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', marginTop: 2 }}>
                      {avgCpe < 220 ? `벤치마크 대비 ${Math.round((1 - avgCpe / 220) * 100)}% 절감` : `벤치마크 대비 ${Math.round((avgCpe / 220 - 1) * 100)}% 초과`}
                    </Typo>
                  </div>
                </div>
              </div>

              {/* 슬라이드 3: 포맷별 성과 비교 */}
              <div className="rg-slide">
                <Flex style={{ alignItems: 'center', marginBottom: 16 }}>
                  <span className="rg-slide-number">3</span>
                  <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)' }}>포맷별 성과 비교</Typo>
                </Flex>
                <div className="rg-bar-chart">
                  {MOCK_FORMAT_PERFORMANCE.map((f) => (
                    <div key={f.format} className="rg-bar-row">
                      <div className="rg-bar-label">
                        <Typo variant="$body-2" style={{ fontWeight: 600, color: 'var(--semantic-color-text-1)' }}>{f.format}</Typo>
                      </div>
                      <div className="rg-bar-track">
                        <div
                          className="rg-bar-fill"
                          style={{ width: `${(f.reach / maxFormatReach) * 100}%`, background: f.color }}
                        />
                      </div>
                      <div className="rg-bar-value">
                        <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>
                          도달 {formatNumber(f.reach)}
                        </Typo>
                      </div>
                    </div>
                  ))}
                </div>
                <VStack style={{ gap: 6, marginTop: 16 }}>
                  {MOCK_FORMAT_PERFORMANCE.map((f) => (
                    <Flex key={f.format} style={{ gap: 16 }}>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)', width: 60 }}>{f.format}</Typo>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>참여 {formatNumber(f.engagement)}</Typo>
                      <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>CPE {formatKRW(f.cpe)}</Typo>
                    </Flex>
                  ))}
                </VStack>
              </div>

              {/* 슬라이드 4: Top 3 퍼포머 */}
              <div className="rg-slide">
                <Flex style={{ alignItems: 'center', marginBottom: 16 }}>
                  <span className="rg-slide-number">4</span>
                  <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)' }}>Top 3 퍼포머</Typo>
                </Flex>
                <div className="rg-performer-cards">
                  {topPerformers.map((p, i) => (
                    <div key={p.name} className="rg-performer-card">
                      <Flex style={{ alignItems: 'center', marginBottom: 8 }}>
                        <span className="rg-performer-rank">{i + 1}</span>
                        <Typo variant="$body-2" style={{ fontWeight: 600, color: 'var(--semantic-color-text-1)' }}>{p.name}</Typo>
                      </Flex>
                      <VStack style={{ gap: 4 }}>
                        <Flex style={{ justifyContent: 'space-between' }}>
                          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>채널</Typo>
                          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>{p.channel}</Typo>
                        </Flex>
                        <Flex style={{ justifyContent: 'space-between' }}>
                          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>포맷</Typo>
                          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>{p.format}</Typo>
                        </Flex>
                        <Flex style={{ justifyContent: 'space-between' }}>
                          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>도달</Typo>
                          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-1)' }}>{formatNumber(p.reach)}</Typo>
                        </Flex>
                        <Flex style={{ justifyContent: 'space-between' }}>
                          <Typo variant="$caption-2" style={{ color: 'var(--semantic-color-text-3)' }}>CPE</Typo>
                          <Typo variant="$caption-1" style={{ color: 'var(--global-colors-teal-70)', fontWeight: 600 }}>{formatKRW(p.cpe)}</Typo>
                        </Flex>
                      </VStack>
                    </div>
                  ))}
                </div>
              </div>

              {/* 슬라이드 5: AI 인사이트 */}
              <div className="rg-slide">
                <Flex style={{ alignItems: 'center', marginBottom: 16 }}>
                  <span className="rg-slide-number">5</span>
                  <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)' }}>핵심 인사이트</Typo>
                  <CoreTag tagType="primary" size="xs" style={{ marginLeft: 8 }}>AI 분석</CoreTag>
                </Flex>
                <ul className="rg-insight-list">
                  {MOCK_INSIGHTS.map((insight, i) => (
                    <li key={i} className="rg-insight-item">
                      <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>{insight}</Typo>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 슬라이드 6: 향후 제언 */}
              <div className="rg-slide">
                <Flex style={{ alignItems: 'center', marginBottom: 16 }}>
                  <span className="rg-slide-number">6</span>
                  <Typo variant="$heading-4" style={{ color: 'var(--semantic-color-text-1)' }}>향후 제언 & 재협업 추천</Typo>
                </Flex>
                <VStack style={{ gap: 8, marginTop: 4 }}>
                  {MOCK_RECOMMENDATIONS.map((rec, i) => (
                    <Flex key={i} style={{ alignItems: 'flex-start', gap: 8 }}>
                      <Typo variant="$body-2" style={{ color: 'var(--global-colors-primary-60)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</Typo>
                      <Typo variant="$body-2" style={{ color: 'var(--semantic-color-text-1)' }}>{rec}</Typo>
                    </Flex>
                  ))}
                </VStack>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="rg-action-bar">
              <CoreButton buttonType="tertiary" size="md" text="클립보드 복사" onClick={handleCopy} />
              <CoreButton buttonType="primary" size="md" text="PDF 다운로드 (Mock)" onClick={handleDownload} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
