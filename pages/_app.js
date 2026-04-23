import '../styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

// Initialise PostHog once on the client
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    person_profiles: 'identified_only', // don't create profiles for anonymous visitors
    capture_pageview: false, // we handle pageviews manually so SPA routing works
    capture_pageleave: true,
    // Privacy-preserving defaults — no session replay, no autocapture of inputs
    disable_session_recording: true,
    autocapture: false,
  })
}

export default function App({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = () => posthog?.capture('$pageview')
    router.events.on('routeChangeComplete', handleRouteChange)
    // Capture the first page load too
    handleRouteChange()
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [router.events])

  return (
    <PostHogProvider client={posthog}>
      <Component {...pageProps} />
    </PostHogProvider>
  )
}
