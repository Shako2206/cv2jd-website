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
    const ML = 20, MR = 20, MT = 28, MB = 22
    const CW = PW - ML - MR

    // Colour palette
    const C_NAME    = [15, 23, 42]      // near-black navy
    const C_ACCENT  = [99, 102, 241]    // indigo
    const C_ACCENT2 = [139, 92, 246]    // violet
    const C_DARK    = [30, 41, 59]      // body text
    const C_MID     = [71, 85, 105]     // company / contact / date
    const C_LIGHT   = [148, 163, 184]   // page numbers
    const C_SEC_BG  = [238, 242, 255]   // section header background

    let y = MT
    const LHF = 1.42
    function lh(size) { return size * 0.3528 * LHF }
    function need(mm) { if (y + mm > PH - MB) { doc.addPage(); y = MT } }

    const rawLines = result.tailoredCV.split('\n')
    let idx = 0

    // ── NAME (centred) ───────────────────────────────────
    while (idx < rawLines.length && !rawLines[idx].trim()) idx++
    const nameLine = rawLines[idx]?.trim() || ''
    if (nameLine) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(27)
      doc.setTextColor(...C_NAME)
      doc.text(nameLine, PW / 2, y, { align: 'center' })
      y += lh(27) + 1
      idx++
    }

    // ── CONTACT LINES (centred, joined with  ·  ) ────────
    const contactLines = []
    while (idx < rawLines.length) {
      const l = rawLines[idx].trim()
      if (!l) { idx++; break }
      if (/^[A-Z][A-Z\s&\/\(\)\-]{3,}$/.test(l)) break
      contactLines.push(l)
      idx++
    }
    if (contactLines.length) {
      const joined = contactLines.join('   ·   ')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...C_MID)
      const wrapped = doc.splitTextToSize(joined, CW)
      wrapped.forEach(line => {
        doc.text(line, PW / 2, y, { align: 'center' })
        y += lh(8.5)
      })
      y += 4
    }

    // ── DOUBLE ACCENT RULE ───────────────────────────────
    doc.setDrawColor(...C_ACCENT)
    doc.setLineWidth(1.0)
    doc.line(ML, y, PW - MR, y)
    y += 1.5
    doc.setDrawColor(...C_ACCENT2)
    doc.setLineWidth(0.25)
    doc.line(ML, y, PW - MR, y)
    y += 6.5

    // ── BODY LOOP ────────────────────────────────────────
    while (idx < rawLines.length) {
      const line = rawLines[idx].trim()
      idx++

      // Empty line → small gap
      if (!line) { y += 2.5; continue }

      // Section header: ALL CAPS, ≤ 50 chars
      if (/^[A-Z][A-Z\s&\/\(\)\-]{2,}$/.test(line) && line.length < 50) {
        y += 3
        need(16)
        doc.setFillColor(...C_SEC_BG)
        doc.rect(ML - 3, y - 5.5, CW + 6, 11, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(...C_ACCENT)
        doc.text(line.toUpperCase(), ML, y)
        y += lh(8.5) + 5
        continue
      }

      // Company · date line (contains middle-dot · and starts with capital)
      if (line.includes('·') && /^[A-Z]/.test(line)) {
        const mid = line.indexOf('·')
        const company = line.slice(0, mid).trim()
        const date = line.slice(mid + 1).trim()
        need(lh(9) + 2)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...C_MID)
        doc.text(company, ML, y)
        if (date) {
          doc.setFont('helvetica', 'italic')
          doc.text(date, PW - MR, y, { align: 'right' })
        }
        y += lh(9) + 2.5
        continue
      }

      // Standalone date line (starts with year or month abbreviation)
      if (/^\d{4}/.test(line) || /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line)) {
        need(lh(9) + 1)
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(9)
        doc.setTextColor(...C_MID)
        doc.text(line, PW - MR, y, { align: 'right' })
        y += lh(9) + 1
        continue
      }

      // Bullet point
      if (/^[•\-·–\*□]/.test(line)) {
        const content = line.replace(/^[•\-·–\*□]\s*/, '')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        const wrapped = doc.splitTextToSize(content, CW - 6)
        need(wrapped.length * lh(9.5) + 2)
        // Small filled indigo square as bullet marker
        doc.setFillColor(...C_ACCENT)
        doc.rect(ML + 0.5, y - 2.1, 1.6, 1.6, 'F')
        doc.setTextColor(...C_DARK)
        doc.text(wrapped, ML + 5, y)
        y += wrapped.length * lh(9.5) + 2
        continue
      }

      // Job title / degree: short, capitalised, no period, no @
      if (line.length < 90 && /^[A-Z]/.test(line) && !line.endsWith('.') && !line.includes('@')) {
        need(lh(11) + 2.5)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...C_DARK)
        doc.text(doc.splitTextToSize(line, CW), ML, y)
        y += lh(11) + 2.5
        continue
      }

      // Body paragraph (summary, etc.)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(...C_DARK)
      const wrapped = doc.splitTextToSize(line, CW)
      need(wrapped.length * lh(9.5) + 1.5)
      doc.text(wrapped, ML, y)
      y += wrapped.length * lh(9.5) + 1.5
    }

    // ── PAGE NUMBERS ─────────────────────────────────────
    const total = doc.getNumberOfPages()
    for (let p = 1; p <= total; p++) {
      doc.setPage(p)
      // Subtle footer rule
      doc.setDrawColor(...C_LIGHT)
      doc.setLineWidth(0.2)
      doc.line(ML, PH - MB + 4, PW - MR, PH - MB + 4)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...C_LIGHT)
      doc.text(`${p} / ${total}`, PW / 2, PH - 12, { align: 'center' })
    }

    doc.save('tailored-cv.pdf')
    track('cv_downloaded', { scoreBucket: scoreBucket(result?.matchScore || 0) })
  }

  const score = result?.matchScore ?? 0
  const scoreColor = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171'

  return (
    <>
      <Head>
        <title>Tailor Your CV — cv2jd</title>
        <meta name="description" content="Paste your CV and job description to get an AI-tailored, ATS-optimised CV instantly." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" type="image/png" />
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
                      ⬇ Download PDF
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
