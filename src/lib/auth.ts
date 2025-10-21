// Simplified auth for development
// In production, replace with proper NextAuth setup

export const authOptions = {
  // Placeholder for NextAuth options
}

export async function getServerSession() {
  // Return mock session for development
  return {
    user: {
      id: "demo-user-id",
      name: "Demo Student",
      email: "demo@vidya-ai.com"
    }
  }
}