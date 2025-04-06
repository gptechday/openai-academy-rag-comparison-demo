"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ArrowUp, ArrowDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

/**
 * ChatInterface Component
 * 
 * A client-side component that provides a user interface for submitting queries and managing query history.
 * Features include:
 * - Text input with submit button
 * - Query history tracking and browsing
 * - Keyboard shortcuts for submission and history navigation
 * - Loading state management
 * - Dispatch of query events to other components
 * 
 * This component does not directly fetch or display query results - it emits events that are
 * handled by the ResponseComparison component.
 */

/**
 * Represents a single item in the query history
 */
type QueryHistoryItem = {
  id: string
  text: string
  timestamp: Date
}

/**
 * Main ChatInterface component that handles user input and query history management
 * @returns A form with textarea input, submit button, and query history buttons
 */
export default function ChatInterface() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { toast } = useToast() as any

  /**
   * Effect hook to automatically focus the textarea when the component mounts
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  /**
   * Handles form submission by processing the current query and dispatching an event
   * @param e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    try {
      setIsLoading(true)

      // Add to history
      const newQueryItem = {
        id: Date.now().toString(),
        text: query.trim(),
        timestamp: new Date(),
      }

      setQueryHistory((prev) => [newQueryItem, ...prev.slice(0, 19)]) // Keep last 20 queries
      setHistoryIndex(-1)

      // Create a custom event to send the query to the response comparison component
      const event = new CustomEvent("newQuery", {
        detail: { query: query.trim() },
      })
      window.dispatchEvent(event)

      // Clear the input after sending
      setQuery("")
    } catch (error) {
      console.error("Error sending query:", error)
      toast({
        title: "Error",
        description: "Failed to send query. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Navigates through query history in the specified direction
   * @param direction - Either "up" (older) or "down" (newer) in the history
   */
  const navigateHistory = (direction: "up" | "down") => {
    if (queryHistory.length === 0) return

    if (direction === "up") {
      const newIndex = historyIndex < queryHistory.length - 1 ? historyIndex + 1 : historyIndex
      setHistoryIndex(newIndex)
      if (newIndex >= 0 && newIndex < queryHistory.length) {
        setQuery(queryHistory[newIndex].text)
      }
    } else {
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1
      setHistoryIndex(newIndex)
      if (newIndex >= 0) {
        setQuery(queryHistory[newIndex].text)
      } else {
        setQuery("")
      }
    }
  }

  /**
   * Handles keyboard events for form submission and history navigation
   * @param e - The keyboard event object
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }

    // Navigate history with up/down arrows
    if (e.key === "ArrowUp" && !e.shiftKey && query === "") {
      e.preventDefault()
      navigateHistory("up")
    } else if (e.key === "ArrowDown" && !e.shiftKey) {
      e.preventDefault()
      navigateHistory("down")
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a healthcare question..."
            className="min-h-[80px] pr-20 resize-none"
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-2 top-2 flex flex-col space-y-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => navigateHistory("up")}
              disabled={queryHistory.length === 0}
              title="Previous query"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => navigateHistory("down")}
              disabled={historyIndex <= 0}
              title="Next query"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button type="submit" size="icon" className="h-[80px] w-[80px]" disabled={isLoading || !query.trim()}>
          {isLoading ? <LoadingSpinner /> : <Send className="h-6 w-6" />}
        </Button>
      </form>

      {queryHistory.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {queryHistory.slice(0, 5).map((item) => (
            <Button
              key={item.id}
              variant="outline"
              size="sm"
              className="text-xs truncate max-w-[200px]"
              onClick={() => {
                setQuery(item.text)
                if (textareaRef.current) {
                  textareaRef.current.focus()
                }
              }}
            >
              {item.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}


