import Head from 'next/head'
import Link from 'next/link'

const features = [
  {
    icon: '🎯',
    title: 'ATS-Optimised',
    desc: 'Our AI ensures your CV passes Applicant Tracking Systems by incorporating the right keywords and formatting.',
  },
  {
    icon: '⚡',
    title: 'Instant Results',
    desc: 'Get a fully tailored, professional CV in seconds — not hours. Spend your time applying, not editing.',
  },
  {
    icon: '🔍',
    title: 'Job Description Analysis',
    desc: 'We deeply analyse every job posting to extract skills, requirements, and keywords that matter most.',
  },
  {
    icon: '📈',
    title: 'Match Score',
    desc: 'See exactly how well your tailored CV aligns with the job description before you hit submit.',
  },
  {
    icon: '✏️',
    title: 'Smart Rewriting',
    desc: 'Your achievements are reframed using the language of the specific role — without inventing anything.',
  },
  {
    icon: '📄',
    title: 'Clean Export',
    desc: 'Download or copy your tailored CV ready to paste into any application form or PDF generator.',
  },
]

const steps = [
  { num: '01', title: 'Paste Your CV', desc: 'Copy and paste your existing CV or resume into the tool.' },
  { num: '02', title: 'Add the Job Description', desc: 'Paste the full job description of the role you are applying for.' },
  { num: '03', title: 'Get Your Tailored CV', desc: 'Our AI rewrites your CV to maximise alignment — instantly.' },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>cv2jd — Tailor Your CV to Job Descriptions with AI</title>
        <meta name="description" content="AI-powered CV tailoring that maximises alignment with job descriptions and creates ATS-friendly applications in seconds." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📄</text></svg>" />
      </Head>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 1000,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 800, letterSpacing: '-0.5px',
            }}>cv</div>
            <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              cv2jd
            </span>
          </div>

          <div className="navLinks" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {[['#features', 'Features'], ['#how-it-works', 'How It Works'], ['#pricing', 'Pricing']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: '#555', fontSize: 15, fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#764ba2'}
                onMouseLeave={e => e.target.style.color = '#555'}>{label}</a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/tailor" className="navLogin" style={{ color: '#555', fontSize: 15, fontWeight: 500 }}>Log in</Link>
            <Link href="/tailor" style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', padding: '10px 24px', borderRadius: 50,
              fontSize: 15, fontWeight: 600,
            }}>Sign up free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 45%, #c471ed 75%, #f64f59 100%)',
        minHeight: '100vh', paddingTop: 68, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center',
      }}>
        {/* decorative circles */}
        {[
          { size: 400, top: '-10%', right: '-5%', opacity: 0.08 },
          { size: 250, bottom: '5%', left: '-3%', opacity: 0.06 },
          { size: 150, top: '30%', left: '42%', opacity: 0.05 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.size, height: c.size, borderRadius: '50%',
            background: 'white', opacity: c.opacity,
            top: c.top, bottom: c.bottom, left: c.left, right: c.right,
            pointerEvents: 'none',
          }} />
        ))}

        <div className="heroGrid" style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem 6rem', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left */}
          <div style={{ color: 'white' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.18)', borderRadius: 50,
              padding: '8px 18px', marginBottom: 28, fontSize: 14, fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              ⭐ The #1 AI CV Tailoring Platform
            </div>

            <h1 style={{ fontSize: 'clamp(2.6rem, 4.5vw, 4.2rem)', fontWeight: 900, lineHeight: 1.08, marginBottom: 24, letterSpacing: '-1px' }}>
              Tailor Your CV<br />
              to Job Descriptions<br />
              with <span style={{ color: '#fbbf24' }}>AI</span>
            </h1>

            <p style={{ fontSize: '1.15rem', lineHeight: 1.65, opacity: 0.92, marginBottom: 40, maxWidth: 520 }}>
              Our AI technology customises your CV to perfectly match each job description, creating ATS-friendly applications that highlight your most relevant skills and experience.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/tailor" style={{
                background: 'white', color: '#764ba2',
                padding: '16px 36px', borderRadius: 50, fontSize: 16, fontWeight: 700,
                boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.22)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.18)' }}>
                Start Tailoring Your CV →
              </Link>
              <a href="#how-it-works" style={{
                background: 'rgba(255,255,255,0.15)', color: 'white',
                padding: '16px 36px', borderRadius: 50, fontSize: 16, fontWeight: 600,
                border: '2px solid rgba(255,255,255,0.4)',
              }}>
                See How It Works
              </a>
            </div>
          </div>

          {/* Right — mock CV card */}
          <div className="heroCard" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              background: 'white', borderRadius: 20, padding: 28,
              boxShadow: '0 24px 80px rgba(0,0,0,0.3)', width: '100%', maxWidth: 440,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 26,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 18, fontWeight: 800,
                }}>JD</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: '#1a1a2e' }}>John Doe</div>
                  <div style={{ fontSize: 13, color: '#888' }}>john.doe@email.com · London, UK</div>
                </div>
              </div>

              <div style={{ height: 1, background: '#f0f0f0', marginBottom: 18 }} />

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#764ba2', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Work Experience</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Senior Software Engineer</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>TechCorp · 2021 – Present</div>
                {[
                  '• Boosted system performance by 40% through architecture optimisation',
                  '• Led a team of 6 engineers on a cloud-native migration project',
                  '• Cut deployment time by 60% by implementing a full CI/CD pipeline',
                ].map((line, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#444', marginBottom: 4, lineHeight: 1.5 }}>{line}</div>
                ))}
              </div>

              <div style={{ background: 'linear-gradient(135deg, #667eea12, #764ba218)', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#764ba2' }}>✨ ATS Match Score</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#764ba2' }}>94%</span>
                </div>
                <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: 8, width: '94%', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                  {['React', 'TypeScript', 'AWS', 'CI/CD', 'Agile'].map(kw => (
                    <span key={kw} style={{ fontSize: 11, fontWeight: 600, background: '#764ba220', color: '#764ba2', padding: '3px 10px', borderRadius: 20 }}>{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '80px 2rem', background: '#fafafa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px' }}>
              Everything you need to land the interview
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: 560, margin: '0 auto' }}>
              One intelligent tool that rewrites your CV to perfectly match any job — in seconds.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 16, padding: '28px 28px',
                border: '1px solid #e8e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(118,75,162,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#1a1a2e' }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '80px 2rem', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px' }}>
              Three steps to your perfect CV
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#666' }}>Simple, fast, and incredibly effective.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 36, margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 900, color: 'white',
                  boxShadow: '0 8px 24px rgba(118,75,162,0.3)',
                }}>{s.num}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 12, color: '#1a1a2e' }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '72px 2rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', color: 'white' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Ready to land more interviews?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: 36, lineHeight: 1.6 }}>
            Join thousands of job seekers who use cv2jd to tailor their CVs and stand out from the crowd.
          </p>
          <Link href="/tailor" style={{
            background: 'white', color: '#764ba2',
            padding: '18px 44px', borderRadius: 50, fontSize: 17, fontWeight: 700,
            boxShadow: '0 8px 28px rgba(0,0,0,0.2)', display: 'inline-block',
          }}>
            Start Tailoring — It&apos;s Free →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f0f1a', color: '#aaa', padding: '40px 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 12, fontWeight: 800,
            }}>cv</div>
            <span style={{ fontWeight: 700, color: 'white', fontSize: 18 }}>cv2jd</span>
          </div>
          <div style={{ fontSize: 14 }}>© 2025 cv2jd. AI-powered CV tailoring.</div>
          <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ color: '#aaa' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = '#aaa'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
      <style jsx global>{`
        @media (max-width: 768px) {
          .navLinks { display: none !important; }
          .navLogin { display: none !important; }
          .heroGrid { grid-template-columns: 1fr !important; padding-top: 3rem !important; padding-bottom: 3.5rem !important; }
          .heroCard { display: none !important; }
        }
      `}</style>
    </>
  )
}
