// Mock client-side auth for development
import { useEffect, useState } from 'react'

export function useSession() {
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setSession({
        user: {
          id: "demo-user-id",
          name: "Demo Student",
          email: "demo@vidya-ai.com"
        }
      })
      setStatus('authenticated')
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return { data: session, status }
}

export function signIn() {
  // Mock sign in
  return Promise.resolve()
}

export function signOut() {
  // Mock sign out
  return Promise.resolve()
}