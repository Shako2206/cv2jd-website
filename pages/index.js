import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  { icon: '🎯', title: 'ATS-Optimised', desc: 'Our AI ensures your CV passes Applicant Tracking Systems by incorporating the right keywords and formatting.' },
  { icon: '⚡', title: 'Instant Results', desc: 'Get a fully tailored, professional CV in seconds — not hours. Spend your time applying, not editing.' },
  { icon: '🔍', title: 'Job Description Analysis', desc: 'We deeply analyse every job posting to extract skills, requirements, and keywords that matter most.' },
  { icon: '📈', title: 'Match Score', desc: 'See exactly how well your tailored CV aligns with the job description before you hit submit.' },
  { icon: '✏️', title: 'Smart Rewriting', desc: 'Your achievements are reframed using the language of the specific role — without inventing anything.' },
  { icon: '📄', title: 'Clean Export', desc: 'Download or copy your tailored CV ready to paste into any application form or PDF generator.' },
]

const steps = [
  { num: '01', title: 'Paste Your CV', desc: 'Copy and paste your existing CV or resume into the tool.' },
  { num: '02', title: 'Add the Job Description', desc: 'Paste the full job description of the role you are applying for.' },
  { num: '03', title: 'Get Your Tailored CV', desc: 'Our AI rewrites your CV to maximise alignment — instantly.' },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <Head>
        <title>cv2jd — Tailor Your CV to Job Descriptions with AI</title>
        <meta name="description" content="AI-powered CV tailoring that maximises alignment with job descriptions and creates ATS-friendly applications in seconds." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📄</text></svg>" />
      </Head>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-[1000] bg-white/[0.92] backdrop-blur-md border-b border-black/[0.08]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-[13px] font-extrabold tracking-tight"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >cv</div>
            <span className="text-[22px] font-extrabold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              cv2jd
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-7 items-center">
            {[['#features', 'Features'], ['#how-it-works', 'How It Works'], ['/pricing', 'Pricing']].map(([href, label]) => (
              <a key={href} href={href} className="text-[#555] text-[15px] font-medium hover:text-[#764ba2] transition-colors">
                {label}
              </a>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            <Link href="/tailor" className="hidden md:inline text-[#555] text-[15px] font-medium hover:text-[#764ba2] transition-colors">
              Log in
            </Link>
            <Button asChild className="text-[15px]">
              <Link href="/tailor">Sign up free</Link>
            </Button>
            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col justify-center gap-[5px] w-9 h-9 cursor-pointer bg-transparent border-none p-1"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-[#555] transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#555] transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#555] transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-black/[0.06] bg-white/[0.98] px-6 py-4 flex flex-col gap-1">
            {[['#features', 'Features'], ['#how-it-works', 'How It Works'], ['/pricing', 'Pricing']].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-[#555] text-[16px] font-medium py-2.5 border-b border-black/[0.04] last:border-0 hover:text-[#764ba2] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section
        className="min-h-screen pt-[68px] relative overflow-hidden flex items-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 45%, #c471ed 75%, #f64f59 100%)' }}
      >
        <div className="absolute w-[400px] h-[400px] rounded-full bg-white/[0.08] -top-[10%] -right-[5%] pointer-events-none" />
        <div className="absolute w-[250px] h-[250px] rounded-full bg-white/[0.06] bottom-[5%] -left-[3%] pointer-events-none" />
        <div className="absolute w-[150px] h-[150px] rounded-full bg-white/[0.05] top-[30%] left-[42%] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-14 md:py-24 w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] items-center">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/[0.18] rounded-full px-4 py-2 mb-6 text-xs md:text-sm font-semibold border border-white/25">
              ⭐ The #1 AI CV Tailoring Platform
            </div>

            <h1 className="font-black leading-[1.08] mb-5 tracking-tight" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.2rem)' }}>
              Tailor Your CV<br />
              to Job Descriptions<br />
              with <span className="text-[#fbbf24]">AI</span>
            </h1>

            <p className="text-base md:text-[1.15rem] leading-[1.65] opacity-[0.92] mb-8 max-w-[520px]">
              Our AI technology customises your CV to perfectly match each job description, creating ATS-friendly applications that highlight your most relevant skills and experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="h-12 md:h-14 px-7 md:px-9 text-base bg-white text-[#764ba2] hover:bg-white/90 shadow-[0_6px_24px_rgba(0,0,0,0.18)] font-bold"
              >
                <Link href="/tailor">Start Tailoring Your CV →</Link>
              </Button>
              <a
                href="#how-it-works"
                className="h-12 md:h-14 flex items-center justify-center px-7 md:px-9 bg-white/15 text-white border-2 border-white/40 rounded-full text-base font-semibold hover:bg-white/20 transition-colors"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="bg-white rounded-[20px] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.3)] w-full max-w-[440px]">
              <div className="flex items-center gap-3.5 mb-[18px]">
                <div
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white text-lg font-extrabold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                >JD</div>
                <div>
                  <div className="font-bold text-[17px] text-[#1a1a2e]">John Doe</div>
                  <div className="text-[13px] text-[#888]">john.doe@email.com · London, UK</div>
                </div>
              </div>
              <div className="h-px bg-[#f0f0f0] mb-[18px]" />
              <div className="mb-4">
                <div className="text-[10px] font-extrabold text-[#764ba2] uppercase tracking-[1.2px] mb-2.5">Work Experience</div>
                <div className="text-sm font-bold text-[#1a1a2e]">Senior Software Engineer</div>
                <div className="text-xs text-[#888] mb-2">TechCorp · 2021 – Present</div>
                {[
                  '• Boosted system performance by 40% through architecture optimisation',
                  '• Led a team of 6 engineers on a cloud-native migration project',
                  '• Cut deployment time by 60% by implementing a full CI/CD pipeline',
                ].map((line, i) => (
                  <div key={i} className="text-xs text-[#444] mb-1 leading-[1.5]">{line}</div>
                ))}
              </div>
              <div className="rounded-xl p-3.5" style={{ background: 'linear-gradient(135deg, #667eea12, #764ba218)' }}>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[13px] font-bold text-[#764ba2]">✨ ATS Match Score</span>
                  <span className="text-[22px] font-black text-[#764ba2]">94%</span>
                </div>
                <div className="h-2 bg-[#e5e7eb] rounded overflow-hidden">
                  <div className="h-2 w-[94%] rounded" style={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }} />
                </div>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {['React', 'TypeScript', 'AWS', 'CI/CD', 'Agile'].map(kw => (
                    <Badge key={kw}>{kw}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-14 md:py-20 px-4 md:px-8 bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-extrabold mb-4 tracking-tight" style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.8rem)' }}>
              Everything you need to land the interview
            </h2>
            <p className="text-base md:text-[1.1rem] text-[#666] max-w-[560px] mx-auto">
              One intelligent tool that rewrites your CV to perfectly match any job — in seconds.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {features.map((f, i) => (
              <Card key={i} className="p-6 md:p-7 border-[#e8e8f0] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(118,75,162,0.12)] transition-all cursor-default">
                <div className="text-[28px] md:text-[32px] mb-3 md:mb-4">{f.icon}</div>
                <h3 className="text-base md:text-lg font-bold mb-2 text-[#1a1a2e]">{f.title}</h3>
                <p className="text-sm md:text-[15px] text-[#666] leading-[1.6]">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-14 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-extrabold mb-4 tracking-tight" style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.8rem)' }}>
              Three steps to your perfect CV
            </h2>
            <p className="text-base md:text-[1.1rem] text-[#666]">Simple, fast, and incredibly effective.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full mx-auto mb-4 md:mb-5 flex items-center justify-center text-xl md:text-[22px] font-black text-white shadow-[0_8px_24px_rgba(118,75,162,0.3)]"
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                >{s.num}</div>
                <h3 className="text-[17px] md:text-[19px] font-bold mb-2.5 text-[#1a1a2e]">{s.title}</h3>
                <p className="text-sm md:text-[15px] text-[#666] leading-[1.65]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section
        className="py-14 md:py-[72px] px-4 md:px-8 text-center"
        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
      >
        <div className="max-w-[680px] mx-auto text-white">
          <h2 className="font-extrabold mb-4 tracking-tight" style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.8rem)' }}>
            Ready to land more interviews?
          </h2>
          <p className="text-base md:text-[1.1rem] opacity-90 mb-8 leading-[1.6]">
            Join thousands of job seekers who use cv2jd to tailor their CVs and stand out from the crowd.
          </p>
          <Button
            asChild
            className="h-12 md:h-14 px-9 md:px-11 text-base md:text-[17px] bg-white text-[#764ba2] hover:bg-white/90 shadow-[0_8px_28px_rgba(0,0,0,0.2)] font-bold"
          >
            <Link href="/tailor">Start Tailoring — It&apos;s Free →</Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f0f1a] text-[#aaa] py-8 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row flex-wrap justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >cv</div>
            <span className="font-bold text-white text-lg">cv2jd</span>
          </div>
          <div className="text-sm">© 2026 cv2jd. AI-powered CV tailoring.</div>
          <div className="flex gap-5 text-sm">
            <Link href="/privacy" className="text-[#aaa] hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[#aaa] hover:text-white transition-colors">Terms</Link>
            <Link href="/pricing" className="text-[#aaa] hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
