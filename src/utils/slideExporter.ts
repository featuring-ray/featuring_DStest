import PptxGenJS from 'pptxgenjs'
import { jsPDF } from 'jspdf'
import type { Slide, PptTheme } from '../types/slides'

/* ═══════════════════════ PPTX 내보내기 ═══════════════════════ */

export async function exportToPptx(slides: Slide[], theme: PptTheme): Promise<void> {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE' // 16:9
  pptx.author = '피처링 AI PPT Studio'

  for (const slide of slides) {
    const pptSlide = pptx.addSlide()
    pptSlide.background = { color: theme.bg.replace('#', '') }

    switch (slide.type) {
      case 'title':
        renderTitleSlide(pptSlide, slide, theme)
        break
      case 'kpi':
        renderKpiSlide(pptSlide, slide, theme)
        break
      case 'chart':
        renderChartSlide(pptSlide, slide, theme)
        break
      case 'comparison':
        renderComparisonSlide(pptSlide, slide, theme)
        break
      case 'insight':
      case 'recommendation':
        renderListSlide(pptSlide, slide, theme)
        break
      case 'influencer':
        renderInfluencerSlide(pptSlide, slide, theme)
        break
      default:
        renderDefaultSlide(pptSlide, slide, theme)
    }
  }

  const fileName = slides[0]?.title || 'presentation'
  await pptx.writeFile({ fileName: `${fileName}.pptx` })
}

function renderTitleSlide(pptSlide: PptxGenJS.Slide, slide: Slide, theme: PptTheme) {
  pptSlide.addText(slide.title, {
    x: 0.8, y: 1.5, w: '80%', h: 1.2,
    fontSize: 36, fontFace: 'Arial', color: theme.primary.replace('#', ''),
    bold: true, align: 'center',
  })

  slide.elements.forEach((el, i) => {
    if (el.kind === 'text' && el.content) {
      pptSlide.addText(el.content, {
        x: 0.8, y: 2.8 + i * 0.6, w: '80%', h: 0.5,
        fontSize: i === 0 ? 20 : 14,
        fontFace: 'Arial',
        color: i === 0 ? theme.secondary.replace('#', '') : '888888',
        align: 'center',
      })
    }
  })
}

function renderKpiSlide(pptSlide: PptxGenJS.Slide, slide: Slide, theme: PptTheme) {
  pptSlide.addText(slide.title, {
    x: 0.5, y: 0.3, w: '90%', h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: theme.primary.replace('#', ''), bold: true,
  })

  const kpiEl = slide.elements.find(e => e.kind === 'kpi-grid')
  if (!kpiEl?.data) return

  const items = kpiEl.data as { label: string; value: string; sub: string }[]
  const cols = 3
  const cardW = 3.8
  const cardH = 1.4
  const startX = 0.5
  const startY = 1.2
  const gapX = 0.3
  const gapY = 0.3

  items.forEach((item, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = startX + col * (cardW + gapX)
    const y = startY + row * (cardH + gapY)

    pptSlide.addShape('rect' as PptxGenJS.ShapeType, {
      x, y, w: cardW, h: cardH,
      fill: { color: 'F8F9FA' },
      rectRadius: 0.1,
    })
    pptSlide.addText(item.label, {
      x, y: y + 0.15, w: cardW, h: 0.3,
      fontSize: 11, fontFace: 'Arial', color: '888888', align: 'center',
    })
    pptSlide.addText(item.value, {
      x, y: y + 0.4, w: cardW, h: 0.5,
      fontSize: 24, fontFace: 'Arial', color: theme.primary.replace('#', ''), bold: true, align: 'center',
    })
    pptSlide.addText(item.sub, {
      x, y: y + 0.95, w: cardW, h: 0.3,
      fontSize: 10, fontFace: 'Arial', color: theme.accent.replace('#', ''), align: 'center',
    })
  })
}

function renderChartSlide(pptSlide: PptxGenJS.Slide, slide: Slide, theme: PptTheme) {
  pptSlide.addText(slide.title, {
    x: 0.5, y: 0.3, w: '90%', h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: theme.primary.replace('#', ''), bold: true,
  })

  const chartEl = slide.elements.find(e => e.kind === 'bar-chart')
  if (!chartEl?.data) return

  const items = chartEl.data as { label: string; value: number; pct: number; color: string }[]
  const startY = 1.3
  const barH = 0.7
  const gap = 0.25
  const maxBarW = 7.5

  items.forEach((item, i) => {
    const y = startY + i * (barH + gap)
    // 라벨
    pptSlide.addText(item.label, {
      x: 0.5, y, w: 3, h: 0.3,
      fontSize: 12, fontFace: 'Arial', color: theme.secondary.replace('#', ''),
    })
    // 바 배경
    pptSlide.addShape('rect' as PptxGenJS.ShapeType, {
      x: 0.5, y: y + 0.3, w: maxBarW, h: 0.35,
      fill: { color: 'EEEEEE' }, rectRadius: 0.05,
    })
    // 바
    const barW = Math.max(0.3, (item.pct / 100) * maxBarW)
    pptSlide.addShape('rect' as PptxGenJS.ShapeType, {
      x: 0.5, y: y + 0.3, w: barW, h: 0.35,
      fill: { color: item.color.replace('#', '') }, rectRadius: 0.05,
    })
    // 값
    pptSlide.addText(`${item.value.toLocaleString()} (${item.pct}%)`, {
      x: 8.5, y, w: 3, h: 0.3,
      fontSize: 11, fontFace: 'Arial', color: '666666', align: 'right',
    })
  })
}

function renderComparisonSlide(pptSlide: PptxGenJS.Slide, slide: Slide, theme: PptTheme) {
  pptSlide.addText(slide.title, {
    x: 0.5, y: 0.3, w: '90%', h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: theme.primary.replace('#', ''), bold: true,
  })

  slide.elements.forEach((el, i) => {
    if (el.kind === 'text' && el.content) {
      pptSlide.addText(el.content, {
        x: 0.8, y: 1.3 + i * 1.0, w: '85%', h: 0.7,
        fontSize: 16, fontFace: 'Arial', color: theme.secondary.replace('#', ''),
        bullet: true,
      })
    }
  })
}

function renderListSlide(pptSlide: PptxGenJS.Slide, slide: Slide, theme: PptTheme) {
  pptSlide.addText(slide.title, {
    x: 0.5, y: 0.3, w: '90%', h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: theme.primary.replace('#', ''), bold: true,
  })

  const listEl = slide.elements.find(e => e.kind === 'list')
  if (!listEl?.data) return

  const items = listEl.data as { text: string }[]
  items.forEach((item, i) => {
    pptSlide.addText(item.text, {
      x: 0.8, y: 1.3 + i * 1.0, w: '85%', h: 0.8,
      fontSize: 14, fontFace: 'Arial', color: theme.secondary.replace('#', ''),
      bullet: { code: '25CF' },
      paraSpaceAfter: 6,
    })
  })
}

function renderInfluencerSlide(pptSlide: PptxGenJS.Slide, slide: Slide, theme: PptTheme) {
  pptSlide.addText(slide.title, {
    x: 0.5, y: 0.3, w: '90%', h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: theme.primary.replace('#', ''), bold: true,
  })

  let yOffset = 1.2

  for (const el of slide.elements) {
    if ((el.kind === 'influencer-profile' || el.kind === 'ad-performance') && Array.isArray(el.data)) {
      const items = el.data as { label: string; value: string; pct: number; color: string }[]
      const cols = 3
      const cardW = 3.8
      const cardH = 0.9
      items.forEach((item, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = 0.5 + col * (cardW + 0.3)
        const y = yOffset + row * (cardH + 0.2)
        pptSlide.addShape('rect' as PptxGenJS.ShapeType, { x, y, w: cardW, h: cardH, fill: { color: 'F8F9FA' }, rectRadius: 0.08 })
        pptSlide.addText(item.label, { x, y: y + 0.1, w: cardW, h: 0.3, fontSize: 10, fontFace: 'Arial', color: '888888', align: 'center' })
        pptSlide.addText(item.value, { x, y: y + 0.35, w: cardW, h: 0.4, fontSize: 18, fontFace: 'Arial', color: item.color.replace('#', ''), bold: true, align: 'center' })
      })
      yOffset += Math.ceil(items.length / cols) * (cardH + 0.2) + 0.3
    } else if (el.kind === 'audience-chart' && el.data && !Array.isArray(el.data)) {
      const d = el.data as { gender?: { label: string; pct: number; color: string }[]; age?: { label: string; pct: number; color: string }[] }
      if (d.gender) {
        pptSlide.addText('성별 분포', { x: 0.5, y: yOffset, w: 5, h: 0.3, fontSize: 11, fontFace: 'Arial', color: '888888', bold: true })
        d.gender.forEach((g, i) => {
          pptSlide.addText(`${g.label}: ${g.pct}%`, { x: 0.5 + i * 2.5, y: yOffset + 0.35, w: 2.3, h: 0.3, fontSize: 12, fontFace: 'Arial', color: g.color.replace('#', '') })
        })
      }
      if (d.age) {
        pptSlide.addText('연령 분포', { x: 6, y: yOffset, w: 5, h: 0.3, fontSize: 11, fontFace: 'Arial', color: '888888', bold: true })
        d.age.forEach((a, i) => {
          pptSlide.addText(`${a.label}: ${a.pct}%`, { x: 6, y: yOffset + 0.35 + i * 0.28, w: 5, h: 0.25, fontSize: 10, fontFace: 'Arial', color: theme.secondary.replace('#', '') })
        })
      }
      yOffset += 1.5
    } else if (el.kind === 'content-grid' && Array.isArray(el.data)) {
      const items = el.data as { title: string; likes: string; comments: string; date: string }[]
      items.forEach((c, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = 0.5 + col * 6
        const y = yOffset + row * 0.8
        pptSlide.addText(c.title, { x, y, w: 5.5, h: 0.35, fontSize: 12, fontFace: 'Arial', color: theme.secondary.replace('#', ''), bold: true })
        pptSlide.addText(`♥ ${c.likes}  💬 ${c.comments}  ${c.date}`, { x, y: y + 0.35, w: 5.5, h: 0.3, fontSize: 9, fontFace: 'Arial', color: '999999' })
      })
      yOffset += Math.ceil(items.length / 2) * 0.8 + 0.3
    } else if (el.kind === 'text' && el.content) {
      pptSlide.addText(el.content, { x: 0.5, y: yOffset, w: '90%', h: 0.5, fontSize: 14, fontFace: 'Arial', color: theme.secondary.replace('#', '') })
      yOffset += 0.6
    }
  }
}

function renderDefaultSlide(pptSlide: PptxGenJS.Slide, slide: Slide, theme: PptTheme) {
  pptSlide.addText(slide.title, {
    x: 0.5, y: 0.3, w: '90%', h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: theme.primary.replace('#', ''), bold: true,
  })

  slide.elements.forEach((el, i) => {
    if (el.content) {
      pptSlide.addText(el.content, {
        x: 0.8, y: 1.3 + i * 0.8, w: '85%', h: 0.6,
        fontSize: 14, fontFace: 'Arial', color: theme.secondary.replace('#', ''),
      })
    }
  })
}

/* ═══════════════════════ PDF 내보내기 ═══════════════════════ */

export async function exportToPdf(slides: Slide[], theme: PptTheme): Promise<void> {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [338.67, 190.5] }) // 16:9 비율

  const pageW = 338.67
  const pageH = 190.5

  slides.forEach((slide, idx) => {
    if (idx > 0) pdf.addPage()

    // 배경
    pdf.setFillColor(theme.bg)
    pdf.rect(0, 0, pageW, pageH, 'F')

    switch (slide.type) {
      case 'title':
        renderTitlePdf(pdf, slide, theme, pageW, pageH)
        break
      case 'kpi':
        renderKpiPdf(pdf, slide, theme, pageW)
        break
      case 'chart':
        renderChartPdf(pdf, slide, theme, pageW)
        break
      case 'influencer':
        renderDefaultPdf(pdf, slide, theme, pageW)
        break
      default:
        renderDefaultPdf(pdf, slide, theme, pageW)
        break
    }
  })

  const fileName = slides[0]?.title || 'presentation'
  pdf.save(`${fileName}.pdf`)
}

function renderTitlePdf(pdf: jsPDF, slide: Slide, theme: PptTheme, pageW: number, pageH: number) {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(32)
  pdf.setTextColor(theme.primary)
  pdf.text(slide.title, pageW / 2, pageH * 0.35, { align: 'center' })

  pdf.setFont('helvetica', 'normal')
  slide.elements.forEach((el, i) => {
    if (el.kind === 'text' && el.content) {
      pdf.setFontSize(i === 0 ? 18 : 12)
      pdf.setTextColor(i === 0 ? theme.secondary : '#888888')
      pdf.text(el.content, pageW / 2, pageH * 0.5 + i * 12, { align: 'center' })
    }
  })
}

function renderKpiPdf(pdf: jsPDF, slide: Slide, theme: PptTheme, pageW: number) {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(22)
  pdf.setTextColor(theme.primary)
  pdf.text(slide.title, 20, 25)

  const kpiEl = slide.elements.find(e => e.kind === 'kpi-grid')
  if (!kpiEl?.data) return

  const items = kpiEl.data as { label: string; value: string; sub: string }[]
  const cols = 3
  const cardW = (pageW - 60) / cols
  const cardH = 45
  const startX = 20
  const startY = 40

  items.forEach((item, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = startX + col * (cardW + 10)
    const y = startY + row * (cardH + 10)

    pdf.setFillColor('#F8F9FA')
    pdf.roundedRect(x, y, cardW, cardH, 3, 3, 'F')

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor('#888888')
    pdf.text(item.label, x + cardW / 2, y + 12, { align: 'center' })

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.setTextColor(theme.primary)
    pdf.text(item.value, x + cardW / 2, y + 28, { align: 'center' })

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(theme.accent)
    pdf.text(item.sub, x + cardW / 2, y + 38, { align: 'center' })
  })
}

function renderChartPdf(pdf: jsPDF, slide: Slide, theme: PptTheme, pageW: number) {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(22)
  pdf.setTextColor(theme.primary)
  pdf.text(slide.title, 20, 25)

  const chartEl = slide.elements.find(e => e.kind === 'bar-chart')
  if (!chartEl?.data) return

  const items = chartEl.data as { label: string; value: number; pct: number; color: string }[]
  const barMaxW = pageW - 100
  const barH = 12
  const startY = 45

  items.forEach((item, i) => {
    const y = startY + i * (barH + 18)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(theme.secondary)
    pdf.text(item.label, 20, y)

    // 바 배경
    pdf.setFillColor('#EEEEEE')
    pdf.roundedRect(20, y + 3, barMaxW, barH, 2, 2, 'F')

    // 바
    const barW = Math.max(5, (item.pct / 100) * barMaxW)
    pdf.setFillColor(item.color)
    pdf.roundedRect(20, y + 3, barW, barH, 2, 2, 'F')

    // 값
    pdf.setFontSize(10)
    pdf.setTextColor('#666666')
    pdf.text(`${item.value.toLocaleString()} (${item.pct}%)`, pageW - 20, y, { align: 'right' })
  })
}

function renderDefaultPdf(pdf: jsPDF, slide: Slide, theme: PptTheme, _pageW: number) {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(22)
  pdf.setTextColor(theme.primary)
  pdf.text(slide.title, 20, 25)

  let yPos = 45

  for (const el of slide.elements) {
    if (el.kind === 'list' && el.data) {
      const items = el.data as { text: string }[]
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(12)
      pdf.setTextColor(theme.secondary)
      for (const item of items) {
        const lines = pdf.splitTextToSize(`• ${item.text}`, 290)
        pdf.text(lines, 25, yPos)
        yPos += lines.length * 7 + 5
      }
    } else if (el.kind === 'text' && el.content) {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(13)
      pdf.setTextColor(theme.secondary)
      const lines = pdf.splitTextToSize(el.content, 290)
      pdf.text(lines, 25, yPos)
      yPos += lines.length * 7 + 5
    }
  }
}
