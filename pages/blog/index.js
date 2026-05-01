import Head from 'next/head'
import Link from 'next/link'
import { posts } from '../../lib/blog-posts'

export default function Blog() {
  return (
    <>
      <Head>
        <title>Blog — CV Tips &amp; Job Application Advice for the Netherlands | cv2jd</title>
        <meta name="description" content="Practical advice on tailoring your CV for the Dutch job market, passing ATS filters, and landing more interviews in the Netherlands." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="canonical" href="https://cv2jd-website.vercel.app/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cv2jd-website.vercel.app/blog" />
        <meta property="og:title" content="Blog — CV Tips for the Netherlands Job Market | cv2jd" />
        <meta property="og:description" content="Practical advice on tailoring your CV for the Dutch job market, passing ATS filters, and landing more interviews in the Netherlands." />
        <meta property="og:image" content="https://cv2jd-website.vercel.app/logo.png" />
        <meta property="og:site_name" content="cv2jd" />
      </Head>

      <nav style={{
        position: 'sticky', top: 0, width: '100%', zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxSizing: 'border-box',
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

      <main style={{ background: '#fafafa', minHeight: 'calc(100vh - 68px)', padding: '56px 2rem 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, color: '#1a1a2e', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Blog
          </h1>
          <p style={{ fontSize: 17, color: '#666', marginBottom: 48, lineHeight: 1.6 }}>
            CV advice and job application tips for the Netherlands job market.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <article style={{
                  background: 'white', borderRadius: 16, padding: '28px 32px',
                  border: '1px solid #e8e8f0', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(118,75,162,0.1)'; e.currentTarget.style.borderColor = '#c4b5fd' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#e8e8f0' }}
                >
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: '#888' }}>{post.date}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>·</span>
                    <span style={{ fontSize: 13, color: '#888' }}>{post.readTime}</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', fontWeight: 800, color: '#1a1a2e', marginBottom: 10, lineHeight: 1.35 }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: 15, color: '#555', lineHeight: 1.65, margin: 0 }}>
                    {post.description}
                  </p>
                  <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: '#764ba2' }}>
                    Read article →
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer style={{ background: '#1a1a2e', color: '#aaa', padding: '32px 2rem', textAlign: 'center', fontSize: 14 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="cv2jd" style={{ height: 40, width: 'auto', marginBottom: 16, filter: 'brightness(0) invert(1)', opacity: 0.7 }} />
        </Link>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Home</Link>
          <Link href="/tailor" style={{ color: '#aaa', textDecoration: 'none' }}>Tailor CV</Link>
          <Link href="/pricing" style={{ color: '#aaa', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/privacy" style={{ color: '#aaa', textDecoration: 'none' }}>Privacy</Link>
        </div>
      </footer>
    </>
  )
}
