"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle, XCircle, RotateCcw, Trophy, Target, Calendar } from "lucide-react"
import Link from "next/link"

interface SpacedRepetition {
  id: string
  topic: string
  question: string
  answer: string
  interval: number
  repetitions: number
  easeFactor: number
  nextReviewDate: Date
  lastReviewDate?: Date
  quality?: number
}

export default function Review() {
  const [dueCards, setDueCards] = useState<SpacedRepetition[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [reviewStats, setReviewStats] = useState({
    total: 0,
    completed: 0,
    correct: 0,
    points: 0
  })

  useEffect(() => {
    fetchDueCards()
  }, [])

  const fetchDueCards = async () => {
    try {
      const response = await fetch("/api/spaced-repetition/due")
      if (response.ok) {
        const cards = await response.json()
        setDueCards(cards)
        setReviewStats(prev => ({ ...prev, total: cards.length }))
      }
    } catch (error) {
      console.error("Failed to fetch due cards:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQualityRating = async (quality: number) => {
    if (currentCardIndex >= dueCards.length) return

    const currentCard = dueCards[currentCardIndex]
    
    try {
      await fetch("/api/spaced-repetition/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: currentCard.id,
          quality
        })
      })

      // Update stats
      const isCorrect = quality >= 3
      setReviewStats(prev => ({
        ...prev,
        completed: prev.completed + 1,
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        points: prev.points + (isCorrect ? 10 : 5)
      }))

      // Move to next card
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1)
        setShowAnswer(false)
      } else {
        // Review completed
        alert(`Review completed! You earned ${reviewStats.points + (quality >= 3 ? 10 : 5)} points!`)
        setCurrentCardIndex(dueCards.length)
      }
    } catch (error) {
      console.error("Failed to submit review:", error)
    }
  }

  const resetReview = () => {
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setReviewStats({ total: dueCards.length, completed: 0, correct: 0, points: 0 })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (dueCards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-green-600" />
                Spaced Repetition Review
              </h1>
              <p className="text-gray-600 mt-1">
                Review concepts at optimal intervals for better retention
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                All Caught Up!
              </h2>
              <p className="text-gray-600 mb-6">
                You have no cards due for review right now. Great job staying on top of your learning!
              </p>
              <div className="space-y-2">
                <Link href="/ai-tutor">
                  <Button className="w-full">
                    Ask New Questions
                  </Button>
                </Link>
                <Link href="/focus">
                  <Button variant="outline" className="w-full">
                    Start Focus Session
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentCard = dueCards[currentCardIndex]
  const isReviewComplete = currentCardIndex >= dueCards.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-green-600" />
              Spaced Repetition Review
            </h1>
            <p className="text-gray-600 mt-1">
              Review concepts at optimal intervals for better retention
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Main Review Area */}
        <div className="md:col-span-2">
          {/* Progress Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Progress: {reviewStats.completed} / {reviewStats.total}
                </span>
                <span className="text-sm font-medium text-green-600">
                  {reviewStats.points} points earned
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(reviewStats.completed / reviewStats.total) * 100}%`
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {!isReviewComplete ? (
            <Card className="min-h-[400px]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      {currentCard.topic}
                    </CardTitle>
                    <CardDescription>
                      Card {currentCardIndex + 1} of {dueCards.length}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-gray-500">
                    Repetition #{currentCard.repetitions + 1}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question */}
                <div className="p-6 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Question:</h3>
                  <p className="text-blue-800">{currentCard.question}</p>
                </div>

                {/* Answer (shown when clicked) */}
                {showAnswer && (
                  <div className="p-6 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Answer:</h3>
                    <p className="text-green-800">{currentCard.answer}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {!showAnswer ? (
                  <Button 
                    onClick={() => setShowAnswer(true)}
                    className="w-full"
                    size="lg"
                  >
                    Show Answer
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-center text-sm text-gray-600">
                      How well did you remember this?
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((quality) => (
                        <Button
                          key={quality}
                          onClick={() => handleQualityRating(quality)}
                          variant={quality <= 2 ? "destructive" : quality === 3 ? "outline" : "default"}
                          className="h-12"
                        >
                          {quality === 1 && "😣"}
                          {quality === 2 && "😕"}
                          {quality === 3 && "😐"}
                          {quality === 4 && "😊"}
                          {quality === 5 && "🎉"}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-xs text-center text-gray-500">
                      <span>Forgot</span>
                      <span>Hard</span>
                      <span>Good</span>
                      <span>Easy</span>
                      <span>Perfect</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Review Complete!
                </h2>
                <div className="space-y-2 mb-6">
                  <p className="text-lg">
                    You reviewed {reviewStats.total} cards
                  </p>
                  <p className="text-green-600 font-semibold">
                    {reviewStats.correct} correct ({Math.round((reviewStats.correct / reviewStats.total) * 100)}%)
                  </p>
                  <p className="text-purple-600 font-semibold">
                    {reviewStats.points} points earned!
                  </p>
                </div>
                <div className="space-y-2">
                  <Button onClick={resetReview} className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Review Again
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Session Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{reviewStats.correct}</p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{reviewStats.total - reviewStats.correct}</p>
                <p className="text-sm text-gray-600">Need Practice</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{reviewStats.points}</p>
                <p className="text-sm text-gray-600">Points Earned</p>
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Spaced Repetition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">SM-2 Algorithm</p>
                <p className="text-xs text-blue-700">
 scientifically proven scheduling
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Quality Rating</p>
                <p className="text-xs text-green-700">
                  Higher ratings = longer intervals
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900">Optimal Learning</p>
                <p className="text-xs text-purple-700">
                  Review just before you forget
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Due Cards Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Due Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dueCards.slice(0, 5).map((card, index) => (
                  <div 
                    key={card.id} 
                    className={`p-2 rounded text-sm ${
                      index === currentCardIndex 
                        ? "bg-blue-100 border border-blue-300" 
                        : index < currentCardIndex 
                        ? "bg-green-50" 
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="font-medium">{card.topic}</div>
                    <div className="text-xs text-gray-500">
                      Repetition #{card.repetitions + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}