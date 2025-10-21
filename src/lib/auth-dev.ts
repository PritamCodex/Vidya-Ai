// Development-only authentication bypass
// This creates a mock session for testing without OAuth setup

export function createMockSession() {
  return {
    user: {
      id: "demo-user-id",
      name: "Demo Student",
      email: "demo@vidya-ai.com",
      image: null
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }
}

export async function getServerSession() {
  // In development, return a mock session
  if (process.env.NODE_ENV === "development") {
    return createMockSession()
  }
  
  // In production, this would use the real NextAuth session
  return null
}