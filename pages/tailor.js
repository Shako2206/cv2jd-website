import Head from 'next/head'
import Link from 'next/link'
import { useState, useRef } from 'react'
import posthog from 'posthog-js'

// Thin wrapper so the rest of the file stays identical
const track = (name, props) => posthog?.capture?.(name, props)

// Bucket lengths to avoid sending raw CV/JD size as a continuous value
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
  const [feedbackVote, setFeedbackVote] = useState(null) // null | 'up' | 'down'

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
    track('tailor_started', {
      cvLength: lengthBucket(cv),
      jdLength: lengthBucket(jd),
    })
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
        // Truncate to keep events tidy and avoid leaking details
        reason: String(e.message || 'unknown').slice(0, 80),
      })
    } finally {
      setLoading(false)
    }
  }

  function handleFeedback(verdict) {
    if (feedbackVote) return // one vote per result
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
    track('cv_copied', {
      scoreBucket: scoreBucket(result?.matchScore || 0),
    })
  }

  async function handleDownload() {
    if (!result?.tailoredCV) return
    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const PW = 210, PH = 297
    const ML = 20, MR = 20, MT = 22, MB = 18
    const CW = PW - ML - MR

    // Brand colours
    const C_NAME    = [22, 22, 40]
    const C_ACCENT  = [102, 126, 234]
    const C_DARK    = [35, 35, 50]
    const C_MID     = [90, 90, 110]
    const C_LIGHT   = [150, 150, 165]
    const C_RULE    = [220, 220, 230]

    let y = MT
    const lineHeightFactor = 1.35

    function lh(size) { return size * 0.3528 * lineHeightFactor }

    function need(mm) {
      if (y + mm > PH - MB) { doc.addPage(); y = MT }
    }

    function text(str, x, fontSize, style, color, maxW) {
      doc.setFont('helvetica', style)
      doc.setFontSize(fontSize)
      doc.setTextColor(...color)
      const w = maxW || CW
      const lines = doc.splitTextToSize(str, w)
      need(lines.length * lh(fontSize) + 1)
      doc.text(lines, x, y)
      return lines.length * lh(fontSize)
    }

    function rule(color = C_RULE, width = 0.25) {
      doc.setDrawColor(...color)
      doc.setLineWidth(width)
      doc.line(ML, y, PW - MR, y)
    }

    const rawLines = result.tailoredCV.split('\n')
    let idx = 0

    // ── NAME block ─────────────────────────────────────
    while (idx < rawLines.length && !rawLines[idx].trim()) idx++
    const nameLine = rawLines[idx]?.trim() || ''
    if (nameLine) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(24)
      doc.setTextColor(...C_NAME)
      doc.text(nameLine, ML, y)
      y += lh(24) + 1
      idx++
    }

    // ── Contact lines (until first blank line or section header) ──
    const contactLines = []
    while (idx < rawLines.length) {
      const l = rawLines[idx].trim()
      if (!l) { idx++; break }
      if (/^[A-Z][A-Z\s&\/\(\)\-]{3,}$/.test(l)) break
      contactLines.push(l)
      idx++
    }
    if (contactLines.length) {
      // Join short contact fields with  |  separator for ATS-friendly single line
      const joined = contactLines.join('  |  ')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...C_MID)
      const wrapped = doc.splitTextToSize(joined, CW)
      doc.text(wrapped, ML, y)
      y += wrapped.length * lh(8.5) + 3
    }

    // Thick accent rule under header block
    doc.setDrawColor(...C_ACCENT)
    doc.setLineWidth(0.6)
    doc.line(ML, y, PW - MR, y)
    y += 6

    // ── Body lines ─────────────────────────────────────
    while (idx < rawLines.length) {
      const raw = rawLines[idx]
      const line = raw.trim()
      idx++

      if (!line) { y += 2.5; continue }

      // Section header: ALL CAPS (allow spaces, &, /)
      if (/^[A-Z][A-Z\s&\/\(\)\-]{2,}$/.test(line) && line.length < 50) {
        y += 3
        need(12)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...C_ACCENT)
        doc.text(line.toUpperCase(), ML, y)
        y += lh(9) + 1
        rule(C_RULE, 0.2)
        y += 3
        continue
      }

      // Date range — right-align lines that are purely dates/locations
      if (/^\d{4}/.test(line) || /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{2}\/\d{2})/i.test(line)) {
        need(lh(9) + 1)
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(9)
        doc.setTextColor(...C_LIGHT)
        doc.text(line, PW - MR, y, { align: 'right' })
        y += lh(9) + 1
        continue
      }

      // Bullet point
      if (/^[•\-·–\*□]/.test(line)) {
        const content = line.replace(/^[•\-·–\*□]\s*/, '')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        doc.setTextColor(...C_DARK)
        const wrapped = doc.splitTextToSize(content, CW - 7)
        need(wrapped.length * lh(9.5) + 1)
        doc.setTextColor(...C_ACCENT)
        doc.text('-', ML + 1, y)
        doc.setTextColor(...C_DARK)
        doc.text(wrapped, ML + 6, y)
        y += wrapped.length * lh(9.5) + 1
        continue
      }

      // Bold line: short, starts uppercase, no period at end — job title / company / degree
      if (line.length < 90 && /^[A-Z]/.test(line) && !line.endsWith('.') && !line.includes('@')) {
        need(lh(10.5) + 1)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10.5)
        doc.setTextColor(...C_DARK)
        doc.text(doc.splitTextToSize(line, CW), ML, y)
        y += lh(10.5) + 1
        continue
      }

      // Normal paragraph
      need(lh(9.5))
      const h = text(line, ML, 9.5, 'normal', C_DARK)
      y += h + 1
    }

    // ── Page numbers ───────────────────────────────────
    const total = doc.getNumberOfPages()
    for (let p = 1; p <= total; p++) {
      doc.setPage(p)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...C_LIGHT)
      doc.text(`${p} / ${total}`, PW / 2, PH - 8, { align: 'center' })
    }

    doc.save('tailored-cv.pdf')
    track('cv_downloaded', {
      scoreBucket: scoreBucket(result?.matchScore || 0),
    })
  }

  const score = result?.matchScore ?? 0

  return (
    <>
      <Head>
        <title>Tailor Your CV — cv2jd</title>
        <meta name="description" content="Paste your CV and job description to get an AI-tailored, ATS-optimised CV instantly." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📄</text></svg>" />
      </Head>

      {/* NAV */}
      <nav style={{
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 12, fontWeight: 800,
            }}>cv</div>
            <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              cv2jd
            </span>
          </Link>
          <span className="navSubtitle" style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>AI CV Tailoring Tool</span>
        </div>
      </nav>

      {/* MAIN */}
      <main className="mainContent" style={{ background: '#f8f8fc', minHeight: 'calc(100vh - 64px)', padding: '32px 2rem' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px' }}>
              Tailor Your CV with AI
            </h1>
            <p style={{ color: '#666', fontSize: '1.05rem' }}>
              Paste your CV and the job description — we&apos;ll rewrite your CV to maximise your match score.
            </p>
          </div>

          {/* Two-column input */}
          <div className="inputGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
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
            <div style={{ background: '#fff1f1', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 20px', marginBottom: 20, color: '#dc2626', fontSize: 15, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Privacy notice */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#999', marginBottom: 16 }}>
            🔒 Your CV and job description are sent to Groq&apos;s AI API for processing and are <strong>not stored</strong> on our servers.{' '}
            <Link href="/privacy" style={{ color: '#764ba2', textDecoration: 'underline' }}>Learn more</Link>
          </p>

          {/* Tailor button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <button
              onClick={handleTailor}
              disabled={loading}
              style={{
                background: loading ? '#c4b5fd' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', border: 'none', padding: '18px 56px',
                borderRadius: 50, fontSize: 17, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 28px rgba(118,75,162,0.35)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.4)', borderTop: '3px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Tailoring your CV…
                </>
              ) : (
                <>✨ Tailor My CV</>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e8f0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              {/* Results header */}
              <div className="resultsHeader" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ color: 'white' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Result</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>Your Tailored CV is Ready</div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Score badge */}
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 2 }}>ATS MATCH</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171' }}>{score}%</div>
                  </div>

                  <div className="resultsBtns" style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handleCopy} style={{
                      background: copied ? '#4ade80' : 'white', color: copied ? 'white' : '#764ba2',
                      border: 'none', padding: '10px 22px', borderRadius: 25, fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      {copied ? '✓ Copied!' : '📋 Copy CV'}
                    </button>
                    <button onClick={handleDownload} style={{
                      background: 'rgba(255,255,255,0.15)', color: 'white',
                      border: '2px solid rgba(255,255,255,0.4)', padding: '10px 22px',
                      borderRadius: 25, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    }}>
                      ⬇ Download PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabsWrap" style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fafafa' }}>
                {[
                  { id: 'cv', label: '📄 Tailored CV' },
                  { id: 'keywords', label: '🔑 Keywords' },
                  { id: 'improvements', label: '📈 Improvements' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 600,
                    color: activeTab === tab.id ? '#764ba2' : '#888',
                    borderBottom: activeTab === tab.id ? '2px solid #764ba2' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="tabContent" style={{ padding: 28 }}>
                {activeTab === 'cv' && (
                  <pre style={{
                    whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 15,
                    lineHeight: 1.75, color: '#1a1a2e', background: '#fafafa',
                    borderRadius: 12, padding: 24, border: '1px solid #eee',
                    maxHeight: 600, overflowY: 'auto',
                  }}>
                    {result.tailoredCV}
                  </pre>
                )}

                {activeTab === 'keywords' && (
                  <div>
                    <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
                      These keywords were identified from the job description and incorporated into your tailored CV:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {(Array.isArray(result.keywords)
                        ? result.keywords
                        : String(result.keywords || '').split(',').map(k => k.trim()).filter(Boolean)
                      ).map((kw, i) => (
                        <span key={i} style={{
                          background: 'linear-gradient(135deg, #667eea15, #764ba220)',
                          color: '#764ba2', padding: '8px 18px', borderRadius: 30,
                          fontSize: 14, fontWeight: 600, border: '1px solid #764ba230',
                        }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'improvements' && (
                  <div>
                    <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
                      Here&apos;s what our AI changed to improve your CV&apos;s alignment with this role:
                    </p>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(Array.isArray(result.improvements)
                        ? result.improvements
                        : [result.improvements]
                      ).filter(Boolean).map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 18px', background: '#f8f8fc', borderRadius: 10, border: '1px solid #eee' }}>
                          <span style={{ color: '#4ade80', fontSize: 18, flexShrink: 0 }}>✓</span>
                          <span style={{ fontSize: 15, color: '#333', lineHeight: 1.6 }}>{String(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Feedback widget */}
              <div style={{
                borderTop: '1px solid #eee', background: '#fafafa',
                padding: '18px 28px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 14, flexWrap: 'wrap',
              }}>
                {feedbackVote ? (
                  <div style={{ fontSize: 14, color: '#555' }}>
                    {feedbackVote === 'up' ? '🙏 Thanks for the feedback!' : '🙏 Thanks — we\'ll keep improving.'}
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: 14, color: '#555', fontWeight: 600 }}>Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback('up')}
                      aria-label="Helpful"
                      style={{
                        background: 'white', border: '1px solid #ddd', borderRadius: 20,
                        padding: '8px 18px', fontSize: 14, cursor: 'pointer', fontWeight: 600,
                        color: '#333', transition: 'all 0.15s',
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#4ade80' }}
                      onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#ddd' }}
                    >
                      👍 Yes
                    </button>
                    <button
                      onClick={() => handleFeedback('down')}
                      aria-label="Not helpful"
                      style={{
                        background: 'white', border: '1px solid #ddd', borderRadius: 20,
                        padding: '8px 18px', fontSize: 14, cursor: 'pointer', fontWeight: 600,
                        color: '#333', transition: 'all 0.15s',
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#f87171' }}
                      onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#ddd' }}
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

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus { outline: none; }
        @media (max-width: 768px) {
          .navSubtitle { display: none !important; }
          .inputGrid { grid-template-columns: 1fr !important; }
          .mainContent { padding: 20px 1rem !important; }
          .resultsHeader { padding: 16px !important; }
          .resultsBtns { flex-direction: column !important; width: 100% !important; }
          .resultsBtns button { width: 100% !important; justify-content: center !important; }
          .tabsWrap button { padding: 10px 10px !important; font-size: 12px !important; flex: 1 !important; }
          .tabContent { padding: 16px !important; }
        }
      `}</style>
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
      style={{
        background: 'white', borderRadius: 16,
        border: dragging ? '2px dashed #764ba2' : '1px solid #e8e8f0',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: dragging ? '0 0 0 4px rgba(118,75,162,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'border 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      {/* Drag overlay */}
      {dragging && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'rgba(118,75,162,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', borderRadius: 16,
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: '20px 32px',
            border: '2px dashed #764ba2', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(118,75,162,0.15)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#764ba2' }}>Drop your PDF here</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {acceptPDF && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={e => { if (onFileSelect) onFileSelect(e.target.files[0]); e.target.value = '' }}
              />
              <button onClick={() => fileInputRef.current?.click()} style={{
                fontSize: 12, fontWeight: 600, color: '#764ba2',
                background: '#764ba215', border: 'none', borderRadius: 20,
                padding: '4px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                📎 Upload PDF
              </button>
            </>
          )}
          {exampleClick && (
            <button onClick={exampleClick} style={{
              fontSize: 12, fontWeight: 600, color: '#764ba2',
              background: '#764ba215', border: 'none', borderRadius: 20,
              padding: '4px 12px', cursor: 'pointer',
            }}>
              Use example
            </button>
          )}
          <span style={{ fontSize: 12, color: '#aaa' }}>{charCount.toLocaleString()} chars</span>
        </div>
      </div>

      {/* PDF loading state */}
      {pdfLoading ? (
        <div style={{ flex: 1, minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: '#764ba2' }}>
          <span style={{ width: 28, height: 28, border: '3px solid #e0d4f7', borderTop: '3px solid #764ba2', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Reading PDF…</span>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', padding: '20px', fontSize: 14,
            lineHeight: 1.65, color: '#333', resize: 'none', minHeight: 340,
            fontFamily: 'inherit', background: 'white',
          }}
        />
      )}
    </div>
  )
}
