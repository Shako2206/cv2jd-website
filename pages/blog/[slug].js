import Head from 'next/head'
import Link from 'next/link'
import { posts, getPostBySlug } from '../../lib/blog-posts'

export async function getStaticPaths() {
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) return { notFound: true }
  return { props: { post } }
}

function renderBlock(block, i) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 key={i} style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 800, color: '#1a1a2e', marginTop: 40, marginBottom: 14, letterSpacing: '-0.3px' }}>
          {block.text}
        </h2>
      )
    case 'p':
      return (
        <p key={i} style={{ fontSize: 16, color: '#333', lineHeight: 1.75, marginBottom: 18 }}>
          {block.text}
        </p>
      )
    case 'ul':
      return (
        <ul key={i} style={{ paddingLeft: 22, marginBottom: 18 }}>
          {block.items.map((item, j) => (
            <li key={j} style={{ fontSize: 16, color: '#333', lineHeight: 1.75, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol key={i} style={{ paddingLeft: 22, marginBottom: 18 }}>
          {block.items.map((item, j) => (
            <li key={j} style={{ fontSize: 16, color: '#333', lineHeight: 1.75, marginBottom: 8 }}>{item}</li>
          ))}
        </ol>
      )
    case 'cta':
      return (
        <div key={i} style={{
          background: 'linear-gradient(135deg, #667eea15, #764ba220)',
          border: '1px solid #c4b5fd',
          borderRadius: 16, padding: '28px 32px', marginTop: 40, marginBottom: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
            Tailor your CV to any job description — free, in seconds
          </div>
          <p style={{ fontSize: 15, color: '#555', marginBottom: 20 }}>
            No sign-up. No credit card. Paste your CV and the job posting and get a rewritten, ATS-optimised CV with a match score.
          </p>
          <Link href="/tailor" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', padding: '12px 32px', borderRadius: 50,
            fontSize: 16, fontWeight: 700, textDecoration: 'none',
          }}>
            Try cv2jd free →
          </Link>
        </div>
      )
    default:
      return null
  }
}

export default function BlogPost({ post }) {
  const url = `https://cv2jd-website.vercel.app/blog/${post.slug}`

  return (
    <>
      <Head>
        <title>{post.title} | cv2jd</title>
        <meta name="description" content={post.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={`${post.title} | cv2jd`} />
        <meta property="og:description" content={post.description} />
        <meta property="og:image" content="https://cv2jd-website.vercel.app/logo.png" />
        <meta property="og:site_name" content="cv2jd" />
        <meta property="article:published_time" content={post.date} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${post.title} | cv2jd`} />
        <meta name="twitter:description" content={post.description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.description,
          "datePublished": post.date,
          "publisher": { "@type": "Organization", "name": "cv2jd", "url": "https://cv2jd-website.vercel.app" },
          "mainEntityOfPage": { "@type": "WebPage", "@id": url },
        }) }} />
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
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Breadcrumb */}
          <div style={{ fontSize: 14, color: '#888', marginBottom: 28 }}>
            <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <Link href="/blog" style={{ color: '#888', textDecoration: 'none' }}>Blog</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: '#555' }}>{post.title}</span>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#888' }}>{post.date}</span>
            <span style={{ fontSize: 13, color: '#888' }}>·</span>
            <span style={{ fontSize: 13, color: '#888' }}>{post.readTime}</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 900, color: '#1a1a2e', marginBottom: 20, lineHeight: 1.25, letterSpacing: '-0.5px' }}>
            {post.title}
          </h1>

          <p style={{ fontSize: 17, color: '#555', lineHeight: 1.7, marginBottom: 36, borderBottom: '1px solid #e8e8f0', paddingBottom: 32 }}>
            {post.description}
          </p>

          {/* Content */}
          <div>
            {post.content.map((block, i) => renderBlock(block, i))}
          </div>

          {/* Back to blog */}
          <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid #e8e8f0' }}>
            <Link href="/blog" style={{ fontSize: 15, color: '#764ba2', fontWeight: 600, textDecoration: 'none' }}>
              ← More articles
            </Link>
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
