import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function Pricing() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) return
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  return (
    <>
      <Head>
        <title>Pricing — cv2jd</title>
        <meta name="description" content="cv2jd is completely free. No subscriptions, no credit card, no catch." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📄</text></svg>" />
      </Head>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 1000,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 800,
            }}>cv</div>
            <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              cv2jd
            </span>
          </Link>
          <Link href="/tailor" style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', padding: '10px 24px', borderRadius: 50,
            fontSize: 15, fontWeight: 600,
          }}>Try it free</Link>
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ minHeight: '100vh', paddingTop: 68, background: 'linear-gradient(180deg, #f8f8fc 0%, #ffffff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 2rem' }}>
        <div style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>

          <div style={{ fontSize: 68, marginBottom: 20 }}>🎉</div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#1a1a2e', marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.1 }}>
            It&apos;s completely free.<br />
            <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              No catch. No card. No plan.
            </span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: 1.7, marginBottom: 48 }}>
            No subscriptions, no free trial that expires, no hidden fees.<br />
            Just paste your CV and job description — done.
          </p>

          {/* Feedback card */}
          <div style={{
            background: 'white', borderRadius: 24, padding: '40px',
            border: '1px solid #e8e8f0', boxShadow: '0 8px 40px rgba(118,75,162,0.08)',
            textAlign: 'left',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', marginBottom: 10 }}>
                The only thing we ask
              </h2>
              <p style={{ color: '#777', fontSize: '0.98rem', lineHeight: 1.65 }}>
                Your honest feedback — good, bad, or ugly. Did it help? Feel too robotic?
                Miss the mark? Anything at all makes this better for everyone.
              </p>
            </div>

            {status === 'sent' ? (
              <div style={{
                background: 'linear-gradient(135deg, #667eea10, #764ba215)',
                border: '1px solid #764ba230', borderRadius: 16,
                padding: '32px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🙏</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#764ba2', marginBottom: 8 }}>Thank you so much!</div>
                <div style={{ color: '#666', fontSize: '0.95rem' }}>Your feedback means a lot and helps make cv2jd better for everyone.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                    Your name <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sarah"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '1px solid #e0e0ee', fontSize: 15, color: '#333',
                      outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit', background: '#fafafa',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                    Your feedback <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us anything — what worked, what didn't, what you'd love to see next..."
                    required
                    rows={5}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '1px solid #e0e0ee', fontSize: 15, color: '#333',
                      outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                      fontFamily: 'inherit', background: '#fafafa', lineHeight: 1.6,
                    }}
                  />
                </div>

                {status === 'error' && (
                  <div style={{ background: '#fff1f1', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 14 }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending' || !message.trim()}
                  style={{
                    background: status === 'sending' || !message.trim()
                      ? '#c4b5fd'
                      : 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white', border: 'none', padding: '14px 32px',
                    borderRadius: 50, fontSize: 16, fontWeight: 700,
                    cursor: status === 'sending' || !message.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 10,
                  }}
                >
                  {status === 'sending' ? (
                    <>
                      <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Sending…
                    </>
                  ) : 'Send feedback →'}
                </button>
              </form>
            )}
          </div>

          <div style={{ marginTop: 40 }}>
            <p style={{ color: '#aaa', fontSize: 14, marginBottom: 16 }}>Ready to tailor your CV?</p>
            <Link href="/tailor" style={{
              display: 'inline-block', border: '2px solid #764ba2',
              color: '#764ba2', padding: '12px 32px', borderRadius: 50,
              fontSize: 15, fontWeight: 700,
            }}>
              ✨ Start Tailoring — It&apos;s Free
            </Link>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus { border-color: #764ba2 !important; box-shadow: 0 0 0 3px rgba(118,75,162,0.1) !important; }
      `}</style>
    </>
  )
}
