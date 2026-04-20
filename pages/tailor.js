import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

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

export default function Tailor() {
  const [cv, setCv] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('cv')

  async function handleTailor() {
    if (!cv.trim() || !jd.trim()) {
      setError('Please paste both your CV and the job description.')
      return
    }
    setError(null)
    setResult(null)
    setLoading(true)
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
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result?.tailoredCV) return
    navigator.clipboard.writeText(result.tailoredCV)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    if (!result?.tailoredCV) return
    const blob = new Blob([result.tailoredCV], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tailored-cv.txt'
    a.click()
    URL.revokeObjectURL(url)
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
          <span style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>AI CV Tailoring Tool</span>
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ background: '#f8f8fc', minHeight: 'calc(100vh - 64px)', padding: '32px 2rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <InputCard
              label="Your Current CV"
              placeholder={"Paste your CV or resume here...\n\nTip: Include your full work history, skills, education, and any other relevant sections. The more detail you provide, the better the tailoring."}
              value={cv}
              onChange={e => setCv(e.target.value)}
              charCount={cv.length}
              icon="📋"
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
              <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
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

                  <div style={{ display: 'flex', gap: 10 }}>
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
                      ⬇ Download
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fafafa' }}>
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
              <div style={{ padding: 28 }}>
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
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus { outline: none; }
      `}</style>
    </>
  )
}

function InputCard({ label, placeholder, value, onChange, charCount, icon, exampleClick }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, border: '1px solid #e8e8f0',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
    </div>
  )
}
