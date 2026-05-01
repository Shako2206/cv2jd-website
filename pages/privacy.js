import Head from 'next/head'
import Link from 'next/link'

const LAST_UPDATED = '28 April 2026'

const sections = [
  {
    title: '1. Who we are',
    content: `cv2jd is a free AI-powered CV tailoring tool. We help job seekers rewrite their CVs to better match job descriptions. We are not a recruiter, an employer, or a data broker.

When this policy says "we", "us", or "cv2jd", it refers to the operator of this website.`,
  },
  {
    title: '2. What data we collect — and what we don\'t',
    content: `We collect as little as possible.

**What you type or paste into the tool:**
When you use the CV tailoring feature, your CV text and the job description are sent to Groq's AI API to generate your tailored CV. This data is transmitted securely over HTTPS and is not stored on our servers at any point. It is not saved to a database, not logged, and not retained after the AI response is returned to your browser.

**Feedback you choose to submit:**
If you submit a message on our Pricing page, your name (optional) and message are sent to our email inbox via Web3Forms. We use this only to read and respond to your feedback.

**Anonymous usage analytics:**
We use PostHog to collect anonymous, aggregated data about how people use the site — for example, how many people complete the tailoring flow, or whether the output was rated helpful. No personal data is included in these events. We do not use cookies for analytics. We do not track you across other websites.

**What we do NOT collect:**
- Your email address (unless you voluntarily include it in a feedback message)
- Your name (the CV tailoring tool does not ask for it)
- Passwords or account credentials (there are no accounts)
- Payment information (the tool is free)
- Any data from cookies or device fingerprinting`,
  },
  {
    title: '3. Third parties we work with',
    content: `We share data with the following third-party services only to the extent necessary to operate the product:

**Groq (AI processing)**
Your CV text and job description are sent to Groq's API to power the tailoring feature. Groq does not use API inputs to train their models. You can read Groq's privacy policy at groq.com/privacy-policy.

**Web3Forms (feedback delivery)**
If you submit a feedback message, it is delivered to our inbox via Web3Forms. Your message and optional name are processed by Web3Forms. See their privacy policy at web3forms.com.

**PostHog (analytics)**
We use PostHog in EU-hosted mode for anonymous product analytics. No personally identifiable information is sent. PostHog's privacy policy is available at posthog.com/privacy.

**Vercel (hosting)**
Our website is hosted on Vercel. Vercel automatically logs basic request information (IP addresses, user agents, timestamps) as part of standard web hosting infrastructure. These logs are retained for a limited period and are governed by Vercel's privacy policy at vercel.com/legal/privacy-policy.

**Cloudflare (CDN)**
The PDF parsing library used to read uploaded CVs loads a script from Cloudflare's CDN. This exposes your IP address to Cloudflare as part of fetching that resource.`,
  },
  {
    title: '4. How long we keep your data',
    content: `**CV and job description text:** Not retained. It exists only in your browser during your session and is discarded once the AI response is returned.

**Feedback messages:** Retained in our email inbox for as long as needed to follow up on your feedback, then deleted.

**Analytics data:** Anonymous usage events are retained in PostHog for up to 1 year, after which they are automatically deleted. Because no personal data is included, there is nothing to link back to you.

**Hosting logs:** Vercel retains server request logs (IP addresses) for a limited period as part of standard infrastructure operation. We do not access these logs unless diagnosing a production incident.`,
  },
  {
    title: '5. Your rights under GDPR',
    content: `If you are based in the UK or EU, you have the following rights:

**Right to access:** You can ask us what data we hold about you. In most cases the answer is: none, because we do not store CV content or user identities.

**Right to deletion:** You can ask us to delete any data we hold. For feedback messages, we will delete your message on request.

**Right to object:** You can object to any processing of your data. Because our analytics contain no personal data, there is nothing to object to in that context.

**Right to lodge a complaint:** You have the right to complain to your national data protection authority (e.g. the ICO in the UK, or your local EU supervisory authority).

To exercise any of these rights, contact us using the feedback form on our Pricing page.`,
  },
  {
    title: '6. Cookies',
    content: `We do not use cookies for tracking or advertising. Our analytics tool (PostHog) operates without cookies. No cookie consent banner is required because no tracking cookies are set.

Some cookies may be set by your browser or by infrastructure providers (such as Vercel) for security or session integrity purposes. These are strictly necessary and do not track your behaviour across websites.`,
  },
  {
    title: '7. Children\'s privacy',
    content: `cv2jd is not directed at children under the age of 16. We do not knowingly collect personal data from children. If you believe a child has submitted data to us, please contact us and we will delete it promptly.`,
  },
  {
    title: '8. Changes to this policy',
    content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. We encourage you to review this page periodically. Continued use of the service after changes are posted constitutes acceptance of the updated policy.`,
  },
  {
    title: '9. Contact',
    content: `If you have any questions about this Privacy Policy or how your data is handled, please reach out via the feedback form on our Pricing page. We will respond as soon as possible.`,
  },
]

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — cv2jd</title>
        <meta name="description" content="How cv2jd handles your data. We never store your CV, use no tracking cookies, and share as little as possible with third parties." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="canonical" href="https://cv2jd-website.vercel.app/privacy" />
        <meta name="robots" content="noindex, follow" />
      </Head>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 1000,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.png" alt="cv2jd" style={{ height: 96, width: 'auto' }} />
          </Link>
          <Link href="/tailor" style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', padding: '10px 24px', borderRadius: 50,
            fontSize: 15, fontWeight: 600, textDecoration: 'none',
          }}>
            Try it free →
          </Link>
        </div>
      </nav>

      {/* HERO STRIP */}
      <div style={{
        paddingTop: 68,
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '96px 2rem 48px',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.5px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 8 }}>
          Plain English. No legalese. Last updated: {LAST_UPDATED}
        </p>
        <p style={{ fontSize: 15, opacity: 0.75, maxWidth: 560, margin: '0 auto' }}>
          The short version: we don&apos;t store your CV, we use no tracking cookies,
          and we share as little as possible with third parties.
        </p>
      </div>

      {/* CONTENT */}
      <main style={{ background: '#fafafa', padding: '48px 2rem 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Trust badges */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
            marginBottom: 48,
          }}>
            {[
              { icon: '🚫', label: 'No CV storage' },
              { icon: '🍪', label: 'No tracking cookies' },
              { icon: '👤', label: 'No accounts required' },
              { icon: '🇪🇺', label: 'GDPR compliant' },
              { icon: '🔐', label: 'HTTPS everywhere' },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                background: 'white', border: '1px solid #e8e8f0', borderRadius: 50,
                padding: '8px 18px', fontSize: 14, fontWeight: 600, color: '#444',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>

          {/* Sections */}
          {sections.map((s) => (
            <div key={s.title} style={{
              background: 'white', borderRadius: 16, padding: '28px 32px',
              border: '1px solid #e8e8f0', marginBottom: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', marginBottom: 16, marginTop: 0 }}>
                {s.title}
              </h2>
              <div style={{ fontSize: 15, color: '#444', lineHeight: 1.75 }}>
                {s.content.split('\n\n').map((para, i) => {
                  if (para.startsWith('**') && para.includes('**\n')) {
                    const [bold, ...rest] = para.split('\n')
                    const label = bold.replace(/\*\*/g, '')
                    return (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{label}</div>
                        <div>{rest.join('\n')}</div>
                      </div>
                    )
                  }
                  return <p key={i} style={{ margin: '0 0 14px' }}>{para}</p>
                })}
              </div>
            </div>
          ))}

          {/* Contact CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: 16, padding: '32px', textAlign: 'center', color: 'white', marginTop: 32,
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>💬</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, marginTop: 0 }}>Questions about your data?</h3>
            <p style={{ opacity: 0.9, marginBottom: 20, fontSize: 15 }}>
              We&apos;re happy to answer any privacy questions.
            </p>
            <Link href="/pricing#feedback" style={{
              background: 'white', color: '#764ba2',
              padding: '12px 28px', borderRadius: 50, fontSize: 15, fontWeight: 700,
              textDecoration: 'none', display: 'inline-block',
            }}>
              Contact us →
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ background: '#0f0f1a', color: '#aaa', padding: '40px 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="cv2jd" style={{ height: 80, width: 'auto', borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: 14 }}>© 2026 cv2jd. AI-powered CV tailoring.</div>
          <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
            <Link href="/privacy" style={{ color: '#764ba2', fontWeight: 600 }}>Privacy</Link>
            <Link href="/terms" style={{ color: '#aaa' }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = '#aaa'}>Terms</Link>
            <Link href="/pricing" style={{ color: '#aaa' }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = '#aaa'}>Contact</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
