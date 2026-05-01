import Head from 'next/head'
import Link from 'next/link'
import { useState, useRef } from 'react'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const track = (name, props) => posthog?.capture?.(name, props)

function lengthBucket(text) {
  const n = (text || '').length
  if (n < 1000) return 'small'
  if (n < 3000) return 'medium'
  if (n < 6000) return 'large'
  return 'xlarge'
}

function scoreBucket(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'mid'
  return 'low'
}

const EXAMPLE_JD = `Senior Software Engineer — FinTech (Remote)

We are looking for a Senior Software Engineer to join our growing platform team. You will design, build, and maintain high-performance microservices that power our payments infrastructure.

Requirements:
- 5+ years of experience in backend development
- Strong proficiency in Python or Node.js
- Experience with AWS (Lambda, RDS, SQS, S3)
- Familiarity with Agile / Scrum methodologies
- Experience building and consuming REST APIs
- Strong communication skills and ability to work cross-functionally

Nice to have:
- Experience with Kafka or event-driven architectures
- Knowledge of PCI-DSS compliance
- Prior experience at a FinTech or startup`

async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf')
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const lineMap = new Map()
    content.items.forEach(item => {
      const y = Math.round(item.transform[5])
      lineMap.set(y, (lineMap.get(y) || '') + item.str + ' ')
    })
    const sorted = [...lineMap.entries()].sort((a, b) => b[0] - a[0])
    pages.push(sorted.map(([, text]) => text.trim()).join('\n'))
  }
  return pages.join('\n\n').trim()
}

export default function Tailor() {
  const [cv, setCv] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('cv')
  const [feedbackVote, setFeedbackVote] = useState(null)

  async function handleCVFile(file) {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    setError(null)
    setPdfLoading(true)
    try {
      const text = await extractTextFromPDF(file)
      if (!text) throw new Error('empty')
      setCv(text)
    } catch {
      setError('Could not read the PDF. Try copying and pasting your CV text instead.')
    } finally {
      setPdfLoading(false)
    }
  }

  async function handleTailor() {
    if (!cv.trim() || !jd.trim()) {
      setError('Please paste both your CV and the job description.')
      return
    }
    setError(null)
    setResult(null)
    setFeedbackVote(null)
    setLoading(true)
    const startedAt = Date.now()
    track('tailor_started', { cvLength: lengthBucket(cv), jdLength: lengthBucket(jd) })
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jobDescription: jd }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Something went wrong.')
      }
      const data = await res.json()
      setResult(data)
      setActiveTab('cv')
      track('tailor_succeeded', {
        cvLength: lengthBucket(cv),
        jdLength: lengthBucket(jd),
        matchScore: typeof data.matchScore === 'number' ? data.matchScore : 0,
        scoreBucket: scoreBucket(data.matchScore || 0),
        durationMs: Date.now() - startedAt,
      })
    } catch (e) {
      setError(e.message)
      track('tailor_failed', {
        cvLength: lengthBucket(cv),
        jdLength: lengthBucket(jd),
        reason: String(e.message || 'unknown').slice(0, 80),
      })
    } finally {
      setLoading(false)
    }
  }

  function handleFeedback(verdict) {
    if (feedbackVote) return
    setFeedbackVote(verdict)
    track('feedback_submitted', {
      verdict,
      matchScore: typeof result?.matchScore === 'number' ? result.matchScore : 0,
      scoreBucket: scoreBucket(result?.matchScore || 0),
    })
  }

  function handleCopy() {
    if (!result?.tailoredCV) return
    navigator.clipboard.writeText(result.tailoredCV)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    track('cv_copied', { scoreBucket: scoreBucket(result?.matchScore || 0) })
  }

  async function handleDownload() {
    if (!result?.tailoredCV) return
    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const PW = 210, PH = 297
    const ML = 18, MR = 18, MT = 26, MB = 20

    // Two-column layout (borrowed from OneColumnModern.vue — 25% left / 75% right)
    const LC_X = ML          // left col x: section labels
    const LC_W = 40           // left col width
    const RC_X = ML + 48      // right col x: content
    const RC_W = PW - MR - RC_X  // right col width: ~126mm

    const C_NAME   = [15, 23, 42]     // near-black navy
    const C_ACCENT = [79, 70, 229]    // indigo-600
    const C_DARK   = [30, 41, 59]     // body text
    const C_MID    = [100, 116, 139]  // dates / company
    const C_RULE   = [203, 213, 225]  // section dividers (slate-200)
    const C_LIGHT  = [148, 163, 184]  // footer

    let y = MT
    const LHF = 1.38
    function lh(size) { return size * 0.3528 * LHF }
    function need(mm) { if (y + mm > PH - MB) { doc.addPage(); y = MT } }

    const rawLines = result.tailoredCV.split('\n')
    let idx = 0

    // ── NAME (centred, large) ────────────────────────────
    while (idx < rawLines.length && !rawLines[idx].trim()) idx++
    const nameLine = rawLines[idx]?.trim() || ''
    if (nameLine) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.setTextColor(...C_NAME)
      doc.text(nameLine, PW / 2, y, { align: 'center' })
      y += lh(26) + 2
      idx++
    }

    // ── CONTACT LINE (centred) ───────────────────────────
    const contactLines = []
    while (idx < rawLines.length) {
      const l = rawLines[idx].trim()
      if (!l) { idx++; break }
      if (/^[A-Z][A-Z\s&\/\(\)\-]{3,}$/.test(l)) break
      contactLines.push(l)
      idx++
    }
    if (contactLines.length) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...C_MID)
      const CW = PW - ML - MR
      const wrapped = doc.splitTextToSize(contactLines.join('   ·   '), CW)
      wrapped.forEach(l => { doc.text(l, PW / 2, y, { align: 'center' }); y += lh(8.5) })
      y += 2
    }

    // ── HEADER RULE ──────────────────────────────────────
    y += 2
    doc.setDrawColor(...C_ACCENT)
    doc.setLineWidth(1.3)
    doc.line(ML, y, PW - MR, y)
    y += 8

    // ── BODY LOOP (two-column sections) ──────────────────
    let firstSection = true
    let skipNextBlank = false   // suppresses gap between section label and first content
    let currentSection = ''

    while (idx < rawLines.length) {
      const line = rawLines[idx].trim()
      idx++

      // Empty line
      if (!line) {
        if (!skipNextBlank) y += 1.5
        skipNextBlank = false
        continue
      }
      skipNextBlank = false

      // ── Section header: label in left col, content in right col ──
      if (/^[A-Z][A-Z\s&\/\(\)\-]{2,}$/.test(line) && line.length < 50) {
        currentSection = line
        if (!firstSection) {
          // Thin rule between sections (from OneColumnModern border-bottom)
          y += 4
          doc.setDrawColor(...C_RULE)
          doc.setLineWidth(0.3)
          doc.line(ML, y, PW - MR, y)
          y += 7
        } else {
          firstSection = false
        }
        need(18)
        // Section label — small, bold, indigo, left column
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(...C_ACCENT)
        doc.text(doc.splitTextToSize(line, LC_W), LC_X, y)
        // y stays — right column content starts at the same baseline
        skipNextBlank = true
        continue
      }

      // ── Skills line: "Category: skill1, skill2" ───────
      if (currentSection === 'SKILLS' && line.includes(':')) {
        const colon = line.indexOf(':')
        const category = line.slice(0, colon)
        const skills = line.slice(colon + 1).trim()
        const skillsWrapped = doc.splitTextToSize(skills, RC_W)
        need(lh(9) + skillsWrapped.length * lh(9.5) + 5)
        // Category label — bold indigo, small caps style
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(...C_ACCENT)
        doc.text(category.toUpperCase(), RC_X, y)
        y += lh(8.5) + 0.5
        // Skills list — normal, dark
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        doc.setTextColor(...C_DARK)
        doc.text(skillsWrapped, RC_X, y)
        y += skillsWrapped.length * lh(9.5) + 4
        continue
      }

      // ── Bullet ────────────────────────────────────────
      if (/^[•\-·–\*□]/.test(line)) {
        const content = line.replace(/^[•\-·–\*□]\s*/, '')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        const wrapped = doc.splitTextToSize(content, RC_W - 5)
        need(wrapped.length * lh(9.5) + 1.5)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(...C_ACCENT)
        doc.text('·', RC_X + 0.5, y)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        doc.setTextColor(...C_DARK)
        doc.text(wrapped, RC_X + 4.5, y)
        y += wrapped.length * lh(9.5) + 1.5
        continue
      }

      // ── Job title + company·date (look-ahead merge) ───
      if (currentSection !== 'SKILLS' && line.length < 90 && /^[A-Z]/.test(line) && !line.includes('·') && !line.includes('–') && !line.endsWith('.') && !line.includes('@')) {
        const next = rawLines[idx]?.trim() || ''
        if (next.includes('·') && /^[A-Z]/.test(next)) {
          const mid = next.indexOf('·')
          const company = next.slice(0, mid).trim()
          const date = next.slice(mid + 1).trim()
          idx++
          need(lh(11) + lh(9) + 4)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(11)
          doc.setTextColor(...C_DARK)
          doc.text(line, RC_X, y)
          if (date) {
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(...C_MID)
            doc.text(date, PW - MR, y, { align: 'right' })
          }
          y += lh(11) + 0.5
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(9)
          doc.setTextColor(...C_MID)
          doc.text(company, RC_X, y)
          y += lh(9) + 3.5
          continue
        }
        // Plain title (degree, standalone heading)
        need(lh(11) + 2)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...C_DARK)
        doc.text(doc.splitTextToSize(line, RC_W), RC_X, y)
        y += lh(11) + 2
        continue
      }

      // ── Company·date standalone fallback ─────────────
      if (line.includes('·') && /^[A-Z]/.test(line)) {
        const mid = line.indexOf('·')
        const left = line.slice(0, mid).trim()
        const right = line.slice(mid + 1).trim()
        need(lh(9) + 2)
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(9)
        doc.setTextColor(...C_MID)
        doc.text(left, RC_X, y)
        if (right) {
          doc.setFont('helvetica', 'normal')
          doc.text(right, PW - MR, y, { align: 'right' })
        }
        y += lh(9) + 2
        continue
      }

      // ── Body paragraph (summary, skills line, etc.) ──
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(...C_DARK)
      const wrapped = doc.splitTextToSize(line, RC_W)
      need(wrapped.length * lh(9.5) + 1.5)
      doc.text(wrapped, RC_X, y)
      y += wrapped.length * lh(9.5) + 2
    }

    // ── PAGE FOOTER ──────────────────────────────────────
    const total = doc.getNumberOfPages()
    for (let p = 1; p <= total; p++) {
      doc.setPage(p)
      doc.setDrawColor(...C_LIGHT)
      doc.setLineWidth(0.2)
      doc.line(ML, PH - MB + 3, PW - MR, PH - MB + 3)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...C_LIGHT)
      doc.text(`${p} / ${total}`, PW / 2, PH - 10, { align: 'center' })
    }

    doc.save('tailored-cv.pdf')
    track('cv_downloaded', { format: 'pdf', scoreBucket: scoreBucket(result?.matchScore || 0) })
  }

  async function handleDownloadDocx() {
    if (!result?.tailoredCV) return
    const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = await import('docx')

    const INDIGO = '4F46E5'
    const DARK   = '1E293B'
    const MID    = '64748B'
    const BLACK  = '0F172A'

    const paras = []
    const lines = result.tailoredCV.split('\n')
    let idx = 0

    // Skip leading blank lines
    while (idx < lines.length && !lines[idx].trim()) idx++

    // Name — first non-empty line
    const name = lines[idx]?.trim() || ''
    if (name) {
      paras.push(new Paragraph({
        children: [new TextRun({ text: name, bold: true, size: 48, color: BLACK, font: 'Calibri' })],
        spacing: { after: 60 },
      }))
      idx++
    }

    // Contact — lines until blank or section header
    const contactParts = []
    while (idx < lines.length) {
      const l = lines[idx].trim()
      if (!l || /^[A-Z][A-Z\s&\/\(\)\-]{2,}$/.test(l)) break
      contactParts.push(l)
      idx++
    }
    if (contactParts.length) {
      paras.push(new Paragraph({
        children: [new TextRun({ text: contactParts.join('   ·   '), size: 18, color: MID, font: 'Calibri' })],
        spacing: { after: 280 },
      }))
    }

    let section = ''

    while (idx < lines.length) {
      const line = lines[idx].trim()
      idx++

      if (!line) continue

      // Section header (ALL CAPS, < 60 chars)
      if (/^[A-Z][A-Z\s&\/\(\)\-]{2,}$/.test(line) && line.length < 60) {
        section = line
        paras.push(new Paragraph({
          children: [new TextRun({ text: line, bold: true, size: 20, color: INDIGO, font: 'Calibri', allCaps: true })],
          spacing: { before: 320, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C7D2FE', space: 4 } },
        }))
        continue
      }

      // Bullet
      if (/^[•\-·–\*]/.test(line)) {
        const content = line.replace(/^[•\-·–\*]\s*/, '')
        paras.push(new Paragraph({
          children: [new TextRun({ text: content, size: 20, color: DARK, font: 'Calibri' })],
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 },
        }))
        continue
      }

      // Skills line — bold category name
      if (section === 'SKILLS' && line.includes(':')) {
        const colon = line.indexOf(':')
        paras.push(new Paragraph({
          children: [
            new TextRun({ text: line.slice(0, colon + 1), bold: true, size: 20, color: DARK, font: 'Calibri' }),
            new TextRun({ text: line.slice(colon + 1), size: 20, color: DARK, font: 'Calibri' }),
          ],
          spacing: { before: 60, after: 60 },
        }))
        continue
      }

      // Job title / degree — look ahead for company · date line
      if (/^[A-Z]/.test(line) && !line.includes('·') && !line.includes('–') && line.length < 90) {
        const next = lines[idx]?.trim() || ''
        if (next.includes('·') && /\d{4}/.test(next)) {
          paras.push(new Paragraph({
            children: [new TextRun({ text: line, bold: true, size: 22, color: DARK, font: 'Calibri' })],
            spacing: { before: 200, after: 40 },
          }))
          const mid = next.indexOf('·')
          const company = next.slice(0, mid).trim()
          const date = next.slice(mid + 1).trim()
          paras.push(new Paragraph({
            children: [
              new TextRun({ text: company, italics: true, size: 20, color: MID, font: 'Calibri' }),
              ...(date ? [new TextRun({ text: `  ·  ${date}`, italics: true, size: 20, color: MID, font: 'Calibri' })] : []),
            ],
            spacing: { before: 0, after: 80 },
          }))
          idx++
          continue
        }
        // Plain heading (standalone degree, etc.)
        paras.push(new Paragraph({
          children: [new TextRun({ text: line, bold: true, size: 22, color: DARK, font: 'Calibri' })],
          spacing: { before: 200, after: 80 },
        }))
        continue
      }

      // Company · date standalone fallback
      if (line.includes('·') && /^[A-Z]/.test(line)) {
        const mid = line.indexOf('·')
        paras.push(new Paragraph({
          children: [
            new TextRun({ text: line.slice(0, mid).trim(), italics: true, size: 20, color: MID, font: 'Calibri' }),
            new TextRun({ text: `  ·  ${line.slice(mid + 1).trim()}`, italics: true, size: 20, color: MID, font: 'Calibri' }),
          ],
          spacing: { before: 0, after: 80 },
        }))
        continue
      }

      // Body paragraph (summary prose, etc.)
      paras.push(new Paragraph({
        children: [new TextRun({ text: line, size: 20, color: DARK, font: 'Calibri' })],
        spacing: { before: 40, after: 80 },
      }))
    }

    const wordDoc = new Document({
      styles: {
        default: {
          document: { run: { font: 'Calibri', size: 20 } },
        },
      },
      sections: [{
        properties: {
          page: { margin: { top: 1080, right: 1296, bottom: 1080, left: 1296 } },
        },
        children: paras,
      }],
    })

    const blob = await Packer.toBlob(wordDoc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tailored-cv.docx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    track('cv_downloaded', { format: 'docx', scoreBucket: scoreBucket(result?.matchScore || 0) })
  }

  const score = result?.matchScore ?? 0
  const scoreColor = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171'

  return (
    <>
      <Head>
        <title>Tailor Your CV to the Job Description — cv2jd</title>
        <meta name="description" content="Paste your CV and a job description. cv2jd rewrites every bullet point to match the role, surfaces the right keywords, and gives you an ATS match score — in seconds." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="canonical" href="https://cv2jd-website.vercel.app/tailor" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cv2jd-website.vercel.app/tailor" />
        <meta property="og:title" content="Tailor Your CV to the Job Description — cv2jd" />
        <meta property="og:description" content="Paste your CV and a job description. cv2jd rewrites every bullet point to match the role, surfaces the right keywords, and gives you an ATS match score — in seconds." />
        <meta property="og:image" content="https://cv2jd-website.vercel.app/logo.png" />
        <meta property="og:site_name" content="cv2jd" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Tailor Your CV to the Job Description — cv2jd" />
        <meta name="twitter:description" content="Paste your CV and a job description. cv2jd rewrites every bullet point to match the role, surfaces the right keywords, and gives you an ATS match score — in seconds." />
        <meta name="twitter:image" content="https://cv2jd-website.vercel.app/logo.png" />
      </Head>

      {/* NAV */}
      <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="cv2jd" className="h-24 w-auto" />
          </Link>
          <span className="hidden sm:block text-sm text-[#888] font-medium">AI CV Tailoring Tool</span>
        </div>
      </nav>

      {/* MAIN */}
      <main className="bg-[#f8f8fc] min-h-[calc(100vh-64px)] py-8 px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* Header */}
          <div className="text-center mb-9">
            <h1 className="font-extrabold mb-2.5 tracking-tight" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
              Tailor Your CV with AI
            </h1>
            <p className="text-[#666] text-[1.05rem]">
              Paste your CV and the job description — we&apos;ll rewrite your CV to maximise your match score.
            </p>
          </div>

          {/* Two-column input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <InputCard
              label="Your Current CV"
              placeholder={"Paste your CV or resume here, or drag & drop a PDF file...\n\nTip: Include your full work history, skills, education, and any other relevant sections."}
              value={pdfLoading ? '' : cv}
              onChange={e => setCv(e.target.value)}
              charCount={cv.length}
              icon="📋"
              acceptPDF
              onFileSelect={handleCVFile}
              pdfLoading={pdfLoading}
            />
            <InputCard
              label="Job Description"
              placeholder={"Paste the job description here...\n\nTip: Include the full posting — requirements, responsibilities, and 'nice to haves'. This helps our AI understand exactly what the employer is looking for."}
              value={jd}
              onChange={e => setJd(e.target.value)}
              charCount={jd.length}
              icon="💼"
              exampleClick={() => setJd(EXAMPLE_JD)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 mb-5 text-red-600 text-[15px] flex gap-2.5 items-center">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Privacy notice */}
          <p className="text-center text-[13px] text-[#999] mb-4">
            🔒 Your CV and job description are sent to Groq&apos;s AI API for processing and are <strong>not stored</strong> on our servers.{' '}
            <Link href="/privacy" className="text-[#764ba2] underline">Learn more</Link>
          </p>

          {/* Tailor button */}
          <div className="flex justify-center mb-10">
            <Button
              onClick={handleTailor}
              disabled={loading}
              className="h-14 px-14 text-[17px] font-bold gap-3 shadow-[0_8px_28px_rgba(118,75,162,0.35)]"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-[3px] border-white/40 border-t-white rounded-full inline-block animate-spin" />
                  Tailoring your CV…
                </>
              ) : (
                <>✨ Tailor My CV</>
              )}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-[20px] border border-[#e8e8f0] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">

              {/* Results header */}
              <div
                className="px-4 sm:px-7 py-4 sm:py-6 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center gap-4"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                <div className="text-white">
                  <div className="text-xs font-semibold opacity-80 uppercase tracking-[1px] mb-1">Result</div>
                  <div className="text-[18px] sm:text-[22px] font-extrabold">Your Tailored CV is Ready</div>
                </div>

                <div className="flex flex-row flex-wrap items-center gap-3">
                  {/* Score badge */}
                  <div className="bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-center">
                    <div className="text-[10px] text-white/80 font-semibold mb-0.5">ATS MATCH</div>
                    <div className="text-[24px] sm:text-[28px] font-black" style={{ color: scoreColor }}>{score}%</div>
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2 flex-1 sm:flex-none">
                    <button
                      onClick={handleCopy}
                      className={`px-4 sm:px-[22px] py-2 sm:py-2.5 rounded-full text-sm font-bold transition-all border-none cursor-pointer ${copied ? 'bg-[#4ade80] text-white' : 'bg-white text-[#764ba2]'}`}
                    >
                      {copied ? '✓ Copied!' : '📋 Copy CV'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="bg-white/15 text-white border-2 border-white/40 px-4 sm:px-[22px] py-2 sm:py-2.5 rounded-full text-sm font-bold cursor-pointer hover:bg-white/25 transition-colors"
                    >
                      ⬇ PDF
                    </button>
                    <button
                      onClick={handleDownloadDocx}
                      className="bg-white/15 text-white border-2 border-white/40 px-4 sm:px-[22px] py-2 sm:py-2.5 rounded-full text-sm font-bold cursor-pointer hover:bg-white/25 transition-colors"
                    >
                      ⬇ Word
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full rounded-none border-b border-border bg-[#fafafa] px-0">
                  <TabsTrigger value="cv" className="flex-1 rounded-none text-xs sm:text-sm">📄 Tailored CV</TabsTrigger>
                  <TabsTrigger value="keywords" className="flex-1 rounded-none text-xs sm:text-sm">🔑 Keywords</TabsTrigger>
                  <TabsTrigger value="vocab" className="flex-1 rounded-none text-xs sm:text-sm">🔄 Vocabulary</TabsTrigger>
                  <TabsTrigger value="improvements" className="flex-1 rounded-none text-xs sm:text-sm">📈 Improvements</TabsTrigger>
                  <TabsTrigger value="gaps" className="flex-1 rounded-none text-xs sm:text-sm">⚠️ Gaps</TabsTrigger>
                </TabsList>

                <TabsContent value="cv" className="p-4 sm:p-7">
                  <pre className="whitespace-pre-wrap font-[inherit] text-[13px] sm:text-[15px] leading-[1.75] text-[#1a1a2e] bg-[#fafafa] rounded-xl p-4 sm:p-6 border border-[#eee] max-h-[500px] overflow-y-auto">
                    {result.tailoredCV}
                  </pre>
                </TabsContent>

                <TabsContent value="keywords" className="p-4 sm:p-7">
                  <p className="text-[#666] text-sm mb-4">
                    Terms from the job description that were specifically added or emphasised in your tailored CV — these are what ATS systems and recruiters will search for:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(result.keywords)
                      ? result.keywords
                      : String(result.keywords || '').split(',').map(k => k.trim()).filter(Boolean)
                    ).map((kw, i) => (
                      <Badge key={i} className="px-3 sm:px-[18px] py-1.5 sm:py-2 text-xs sm:text-sm">{kw}</Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="vocab" className="p-4 sm:p-7">
                  <p className="text-[#666] text-sm mb-4">
                    Domain vocabulary swaps applied — where your CV used one term but this job description uses different language for the same concept. These translations help your CV speak the employer&apos;s language:
                  </p>
                  {Array.isArray(result.vocabularyMap) && result.vocabularyMap.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {result.vocabularyMap.filter(Boolean).map((item, i) => (
                        <div key={i} className="px-3 sm:px-5 py-3 sm:py-4 bg-[#f8f8fc] rounded-xl border border-[#eee]">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-xs sm:text-sm text-[#888] line-through">{item.cvSays}</span>
                            <span className="text-[#bbb] text-sm">→</span>
                            <span className="text-xs sm:text-sm font-semibold text-[#764ba2]">{item.jdSays}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#666] leading-[1.5]">{item.why}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#888] italic">No vocabulary swaps identified — your CV already uses this role&apos;s language well.</p>
                  )}
                </TabsContent>

                <TabsContent value="improvements" className="p-4 sm:p-7">
                  <p className="text-[#666] text-sm mb-4">
                    Specific changes made to your CV — each one explains what was changed, where, and why it better matches this role:
                  </p>
                  <ul className="flex flex-col gap-3 list-none p-0 m-0">
                    {(Array.isArray(result.improvements) ? result.improvements : [result.improvements])
                      .filter(Boolean)
                      .map((item, i) => (
                        <li key={i} className="flex gap-3 items-start px-3 sm:px-[18px] py-3 sm:py-3.5 bg-[#f8f8fc] rounded-xl border border-[#eee]">
                          <span className="text-[#4ade80] text-base sm:text-lg flex-shrink-0">✓</span>
                          <span className="text-sm sm:text-[15px] text-[#333] leading-[1.6]">{String(item)}</span>
                        </li>
                      ))}
                  </ul>
                </TabsContent>

                <TabsContent value="gaps" className="p-4 sm:p-7">
                  <p className="text-[#666] text-sm mb-4">
                    Areas the job requires that are weak or missing in your CV — with honest suggestions on how to address each gap without fabricating experience:
                  </p>
                  {Array.isArray(result.gaps) && result.gaps.length > 0 ? (
                    <ul className="flex flex-col gap-3 list-none p-0 m-0">
                      {result.gaps.filter(Boolean).map((item, i) => (
                        <li key={i} className="flex gap-3 items-start px-3 sm:px-[18px] py-3 sm:py-3.5 bg-[#fffbf0] rounded-xl border border-[#ffe4a0]">
                          <span className="text-[#f59e0b] text-base sm:text-lg flex-shrink-0">⚠</span>
                          <span className="text-sm sm:text-[15px] text-[#333] leading-[1.6]">{String(item)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#888] italic">No significant gaps identified — your CV maps well to this role.</p>
                  )}
                </TabsContent>
              </Tabs>

              {/* Feedback widget */}
              <div className="border-t border-[#eee] bg-[#fafafa] px-4 sm:px-7 py-4 flex items-center justify-center gap-3 sm:gap-3.5 flex-wrap">
                {feedbackVote ? (
                  <div className="text-sm text-[#555]">
                    {feedbackVote === 'up' ? '🙏 Thanks for the feedback!' : "🙏 Thanks — we'll keep improving."}
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-[#555] font-semibold">Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback('up')}
                      aria-label="Helpful"
                      className="bg-white border border-[#ddd] rounded-[20px] px-[18px] py-2 text-sm cursor-pointer font-semibold text-[#333] hover:bg-[#f0fdf4] hover:border-[#4ade80] transition-all"
                    >
                      👍 Yes
                    </button>
                    <button
                      onClick={() => handleFeedback('down')}
                      aria-label="Not helpful"
                      className="bg-white border border-[#ddd] rounded-[20px] px-[18px] py-2 text-sm cursor-pointer font-semibold text-[#333] hover:bg-[#fef2f2] hover:border-[#f87171] transition-all"
                    >
                      👎 No
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function InputCard({ label, placeholder, value, onChange, charCount, icon, exampleClick, acceptPDF, onFileSelect, pdfLoading }) {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  function handleDragEnter(e) {
    if (!acceptPDF) return
    e.preventDefault()
    setDragging(true)
  }
  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false)
  }
  function handleDragOver(e) {
    if (!acceptPDF) return
    e.preventDefault()
  }
  function handleDrop(e) {
    if (!acceptPDF) return
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && onFileSelect) onFileSelect(file)
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl flex flex-col overflow-hidden relative transition-all ${
        dragging
          ? 'border-2 border-dashed border-[#764ba2] shadow-[0_0_0_4px_rgba(118,75,162,0.12)]'
          : 'border border-[#e8e8f0] shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
      }`}
    >
      {/* Drag overlay */}
      {dragging && (
        <div className="absolute inset-0 z-10 bg-[#764ba2]/5 flex items-center justify-center pointer-events-none rounded-2xl">
          <div className="bg-white rounded-2xl px-8 py-5 border-2 border-dashed border-[#764ba2] text-center shadow-[0_8px_32px_rgba(118,75,162,0.15)]">
            <div className="text-[32px] mb-2">📄</div>
            <div className="text-[15px] font-bold text-[#764ba2]">Drop your PDF here</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 py-4 border-b border-[#f0f0f5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon}</span>
          <span className="font-bold text-[15px] text-[#1a1a2e]">{label}</span>
        </div>
        <div className="flex gap-2 items-center">
          {acceptPDF && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={e => { if (onFileSelect) onFileSelect(e.target.files[0]); e.target.value = '' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-[#764ba2] bg-[#764ba2]/10 border-none rounded-full px-3 py-1 cursor-pointer flex items-center gap-1 hover:bg-[#764ba2]/15 transition-colors"
              >
                📎 Upload PDF
              </button>
            </>
          )}
          {exampleClick && (
            <button
              onClick={exampleClick}
              className="text-xs font-semibold text-[#764ba2] bg-[#764ba2]/10 border-none rounded-full px-3 py-1 cursor-pointer hover:bg-[#764ba2]/15 transition-colors"
            >
              Use example
            </button>
          )}
          <span className="text-xs text-[#aaa]">{charCount.toLocaleString()} chars</span>
        </div>
      </div>

      {/* Body */}
      {pdfLoading ? (
        <div className="flex-1 min-h-[340px] flex items-center justify-center flex-col gap-3.5 text-[#764ba2]">
          <span className="w-7 h-7 border-[3px] border-[#e0d4f7] border-t-[#764ba2] rounded-full inline-block animate-spin" />
          <span className="text-sm font-semibold">Reading PDF…</span>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 border-none p-4 sm:p-5 text-sm leading-[1.65] text-[#333] resize-none min-h-[220px] sm:min-h-[340px] font-[inherit] bg-white focus:outline-none"
        />
      )}
    </div>
  )
}
