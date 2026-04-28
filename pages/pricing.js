import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

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
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: 'cv2jd — New Feedback',
          name: name?.trim() || 'Anonymous',
          message: message.trim(),
          from_name: 'cv2jd Feedback',
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Could not send feedback.')
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
      <nav className="fixed top-0 w-full z-[1000] bg-white/[0.92] backdrop-blur-md border-b border-black/[0.08]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-[13px] font-extrabold"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >cv</div>
            <span className="text-[22px] font-extrabold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              cv2jd
            </span>
          </Link>
          <Button asChild className="text-[15px]">
            <Link href="/tailor">Try it free</Link>
          </Button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="min-h-screen pt-[68px] flex items-center justify-center px-4 md:px-8 py-10 md:py-20 bg-gradient-to-b from-[#f8f8fc] to-white">
        <div className="max-w-[600px] w-full text-center">
          <div className="text-[56px] md:text-[68px] mb-4 md:mb-5">🎉</div>

          <h1
            className="font-black text-[#1a1a2e] mb-4 tracking-tight leading-[1.1]"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}
          >
            It&apos;s completely free.<br />
            <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              No catch. No card. No plan.
            </span>
          </h1>

          <p className="text-base md:text-[1.1rem] text-[#666] leading-[1.7] mb-8 md:mb-12">
            No subscriptions, no free trial that expires, no hidden fees.<br className="hidden sm:block" />
            Just paste your CV and job description — done.
          </p>

          <Card className="border-[#e8e8f0] shadow-[0_8px_40px_rgba(118,75,162,0.08)] text-left">
            <CardContent className="p-6 sm:p-10">
              <div className="text-center mb-6 md:mb-7">
                <div className="text-[36px] md:text-[40px] mb-3">💬</div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#1a1a2e] mb-2.5">The only thing we ask</h2>
                <p className="text-[#777] text-sm md:text-[0.98rem] leading-[1.65]">
                  Your honest feedback — good, bad, or ugly. Did it help? Feel too robotic?
                  Miss the mark? Anything at all makes this better for everyone.
                </p>
              </div>

              {status === 'sent' ? (
                <div
                  className="rounded-2xl p-6 md:p-8 text-center border"
                  style={{ background: 'linear-gradient(135deg, #667eea10, #764ba215)', borderColor: '#764ba230' }}
                >
                  <div className="text-[40px] md:text-[44px] mb-3">🙏</div>
                  <div className="text-lg md:text-[1.2rem] font-bold text-[#764ba2] mb-2">Thank you so much!</div>
                  <div className="text-[#666] text-sm md:text-[0.95rem]">Your feedback means a lot and helps make cv2jd better for everyone.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">
                      Your name <span className="text-[#aaa] font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sarah"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">
                      Your feedback <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Tell us anything — what worked, what didn't, what you'd love to see next..."
                      required
                      rows={4}
                      className="min-h-[100px] md:min-h-[120px]"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={status === 'sending' || !message.trim()}
                    className="h-12 text-base font-bold gap-2.5"
                  >
                    {status === 'sending' ? (
                      <>
                        <span className="w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full inline-block animate-spin" />
                        Sending…
                      </>
                    ) : 'Send feedback →'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 md:mt-10">
            <p className="text-[#aaa] text-sm mb-4">Ready to tailor your CV?</p>
            <Button asChild variant="outline" className="h-12 px-8 text-[15px] font-bold">
              <Link href="/tailor">✨ Start Tailoring — It&apos;s Free</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
