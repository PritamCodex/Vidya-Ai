"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Send, Loader2, BookOpen, Target, Lightbulb } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  topic?: string
  timestamp: Date
}

export default function AITutor() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.answer,
        topic: data.topic,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-600" />
              AI Tutor
            </h1>
            <p className="text-gray-600 mt-1">
              Ask any question and get instant, intelligent answers
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Chat with AI</CardTitle>
              <CardDescription>
                Ask questions about any subject and get detailed explanations
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Start by asking a question!</p>
                    <p className="text-sm mt-2">e.g., "What is Newton's second law of motion?"</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === "user"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.topic && (
                          <p className={`text-xs mt-2 ${
                            message.type === "user" ? "text-purple-200" : "text-gray-500"
                          }`}>
                            Topic: {message.topic}
                          </p>
                        )}
                        <p className={`text-xs mt-1 ${
                          message.type === "user" ? "text-purple-200" : "text-gray-400"
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your question here..."
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="self-end"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Be Specific</p>
                <p className="text-xs text-blue-700">
                  Include context for better answers
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Follow Up</p>
                <p className="text-xs text-green-700">
                  Ask related questions to dive deeper
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900">Learn Topics</p>
                <p className="text-xs text-purple-700">
                  Topics are tracked for review
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Recent Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {messages
                  .filter(m => m.type === "ai" && m.topic)
                  .slice(-5)
                  .map((message, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      {message.topic}
                    </div>
                  ))}
                {messages.filter(m => m.type === "ai" && m.topic).length === 0 && (
                  <p className="text-sm text-gray-500">No topics yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/review">
                <Button variant="outline" className="w-full">
                  Review Weak Topics
                </Button>
              </Link>
              <Link href="/focus">
                <Button variant="outline" className="w-full">
                  Start Focus Session
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}