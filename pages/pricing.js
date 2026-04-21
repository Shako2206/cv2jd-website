import Head from 'next/head'
import Link from 'next/link'

export default function Pricing() {
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
        <div style={{ maxWidth: 640, width: '100%', textAlign: 'center' }}>

          {/* Big emoji */}
          <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, color: '#1a1a2e', marginBottom: 20, letterSpacing: '-1px', lineHeight: 1.1 }}>
            It&apos;s completely free.<br />
            <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              No catch. No card. No plan.
            </span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#555', lineHeight: 1.7, marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
            cv2jd is free for everyone. No subscriptions, no free trial that expires, no hidden fees. Just paste your CV, paste the job description, and get your tailored CV instantly.
          </p>

          {/* The one "price" card */}
          <div style={{
            background: 'white', borderRadius: 24, padding: '40px 40px',
            border: '2px solid #e8e8f0', boxShadow: '0 8px 40px rgba(118,75,162,0.1)',
            marginBottom: 40,
          }}>
            <div style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #667eea15, #764ba220)',
              color: '#764ba2', fontWeight: 700, fontSize: 13, padding: '6px 18px',
              borderRadius: 30, border: '1px solid #764ba230', marginBottom: 20,
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              The only thing we ask
            </div>

            <div style={{ fontSize: 52, marginBottom: 16 }}>💬</div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e', marginBottom: 16 }}>
              Your honest feedback
            </h2>

            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 28px' }}>
              Did it help? Did it miss the mark? Was the PDF useful? Did it feel too robotic — or just right? Anything at all. Good, bad, or ugly — your opinion is what makes this better for everyone.
            </p>

            <a
              href="mailto:shahar.korin@gmail.com?subject=cv2jd feedback"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', padding: '14px 36px', borderRadius: 50,
                fontSize: 15, fontWeight: 700,
                boxShadow: '0 6px 24px rgba(118,75,162,0.3)',
              }}
            >
              Send feedback →
            </a>
          </div>

          {/* CTA */}
          <p style={{ color: '#999', fontSize: 14, marginBottom: 20 }}>Ready to tailor your CV?</p>
          <Link href="/tailor" style={{
            display: 'inline-block',
            background: 'white', color: '#764ba2',
            padding: '14px 36px', borderRadius: 50, fontSize: 15, fontWeight: 700,
            border: '2px solid #764ba2',
          }}>
            ✨ Start Tailoring — It&apos;s Free
          </Link>
        </div>
      </main>
    </>
  )
}
