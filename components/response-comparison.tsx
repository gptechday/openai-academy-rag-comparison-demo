"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, Clock } from "lucide-react"

/**
 * ResponseComparison Component
 * 
 * A client-side component that displays a side-by-side comparison of responses from two different
 * information retrieval approaches:
 * 1. Vector search only (traditional RAG)
 * 2. Knowledge graph + vector search (enhanced RAG)
 * 
 * Features include:
 * - Real-time querying of both backend systems
 * - Tabbed interface to view different aspects of responses
 * - Responsive design for mobile and desktop
 * - Loading states and error handling
 * - Performance timing for response comparison
 * 
 * This component listens for 'newQuery' events dispatched by the ChatInterface component.
 */

/**
 * Represents a single vector search result
 */
type VectorResult = {
  score: string
  text: string
}

/**
 * Represents a single result from a Cypher query on the knowledge graph
 * This is intentionally flexible as the schema may vary between queries
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CypherResult = Record<string, any>

/**
 * Represents the complete response from the vector-only search endpoint
 */
type VectorOnlyResponse = {
  query: string            // The original user query
  summary: string          // AI-generated summary based on vector search results
  vector_results: VectorResult[]  // Individual vector search result items
}

/**
 * Represents the complete response from the knowledge graph endpoint
 */
type KGResponse = {
  query: string                  // The original user query
  summary: string                // AI-generated summary based on KG + vector results
  cypher_query: string           // The generated Cypher query for the knowledge graph
  cypher_results_count: number   // Total number of results from the Cypher query
  cypher_results: CypherResult[] // Individual results from the knowledge graph
  vector_results: VectorResult[] // Individual vector search result items (fallback)
}

/**
 * Main ResponseComparison component that displays side-by-side results from different RAG approaches
 * @returns A responsive grid layout with cards showing the comparison results
 */
export default function ResponseComparison() {
  /**
   * State Variables:
   * - query: Stores the current user query being processed
   * - isLoading: Tracks loading state for API calls
   * - vectorResponse/kgResponse: Store API responses from both endpoints
   * - vectorError/kgError: Track error states for each API call
   * - vectorTime/kgTime: Store performance metrics for comparison
   * - vectorTab/kgTab: Control which tab is active in each result panel
   */
  const [query, setQuery] = useState("")               // Current query text
  const [isLoading, setIsLoading] = useState(false)    // Loading state flag
  const [vectorResponse, setVectorResponse] = useState<VectorOnlyResponse | null>(null)
  const [kgResponse, setKGResponse] = useState<KGResponse | null>(null)
  const [vectorError, setVectorError] = useState<string | null>(null)
  const [kgError, setKGError] = useState<string | null>(null)
  const [vectorTime, setVectorTime] = useState<number | null>(null)  // Response time in ms
  const [kgTime, setKGTime] = useState<number | null>(null)          // Response time in ms
  
  // UI state for tabs and responsive layout
  const [vectorTab, setVectorTab] = useState("summary")  // Active tab for vector results
  const [kgTab, setKGTab] = useState("summary")          // Active tab for KG results
  const isMobile = useMobile()                           // Responsive layout detection

  /**
   * Effect hook to listen for and handle new query events from the ChatInterface
   */
  useEffect(() => {
    /**
     * Event handler for new queries from the ChatInterface component
     * @param event - Custom event with the query string in event.detail.query
     */
    function handleQuery(event: CustomEvent<{ query: string }>) {
      const newQuery = event.detail.query
      setQuery(newQuery)
      setIsLoading(true)
      setVectorResponse(null)
      setKGResponse(null)
      setVectorError(null)
      setKGError(null)
      
      // Call APIs
      fetchVectorResponse(newQuery)
      fetchKGResponse(newQuery)
    }

    // Add event listener
    window.addEventListener("newQuery", handleQuery as EventListener)
    
    // Cleanup
    return () => window.removeEventListener("newQuery", handleQuery as EventListener)
  }, [])

  /**
   * Fetches response from the vector-only search API endpoint
   * @param query - The user's query string
   */
  async function fetchVectorResponse(query: string) {
    const startTime = performance.now()
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/query-vector-only?query=${encodeURIComponent(query)}&t=${timestamp}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Vector data:", data)
      
      setVectorResponse(data)
      setVectorTime(Math.round(performance.now() - startTime))
    } catch (error) {
      console.error("Vector error:", error)
      setVectorError(error instanceof Error ? error.message : "Unknown error")
    }
  }

  /**
   * Fetches response from the knowledge graph API endpoint
   * @param query - The user's query string
   */
  async function fetchKGResponse(query: string) {
    const startTime = performance.now()
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/query-kg?query=${encodeURIComponent(query)}&t=${timestamp}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("KG data:", data)
      
      setKGResponse(data)
      setKGTime(Math.round(performance.now() - startTime))
    } catch (error) {
      console.error("KG error:", error)
      setKGError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Formats time in milliseconds to a readable string
   * @param ms - Time in milliseconds
   * @returns Formatted time string with ms unit or "N/A"
   */
  function formatTime(ms: number | null) {
    return ms ? `${ms}ms` : "N/A"
  }

  /**
   * Display an empty state with instructions when no query has been submitted yet
   */
  if (!query) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Compare Vector Search vs Knowledge Graph RAG Results</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Enter a healthcare-related query in the chat box below to see how different RAG approaches compare.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Query: <span className="font-normal">{query}</span>
        </h2>
        {isLoading && (
          <div className="flex items-center">
            <LoadingSpinner size={16} className="mr-2" />
            <span className="text-sm text-gray-500">Processing query...</span>
          </div>
        )}
      </div>

      <div className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-6"}`}>
        {/* Vector-only Response */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center text-lg">
              <div className="flex items-center">
                <span>Vector Search Only</span>
                {vectorTime && (
                  <Badge variant="outline" className="ml-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(vectorTime)}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !vectorResponse ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : vectorError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{vectorError}</AlertDescription>
              </Alert>
            ) : vectorResponse ? (
              <Tabs value={vectorTab} onValueChange={setVectorTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="vector-results">Vector Results</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="text-sm whitespace-pre-wrap">{vectorResponse.summary}</div>
                </TabsContent>

                <TabsContent value="vector-results" className="space-y-4">
                  {vectorResponse.vector_results.length > 0 ? (
                    vectorResponse.vector_results.map((result, index) => (
                      <div key={index} className="border p-3 rounded-md">
                        <div className="text-xs text-gray-500 mb-1">Score: {result.score}</div>
                        <div className="text-sm">{result.text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No vector results found</div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center text-gray-500">Waiting for response...</div>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Graph Response */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center text-lg">
              <div className="flex items-center">
                <span>Knowledge Graph + Vector</span>
                {kgTime && (
                  <Badge variant="outline" className="ml-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(kgTime)}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !kgResponse ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : kgError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{kgError}</AlertDescription>
              </Alert>
            ) : kgResponse ? (
              <Tabs value={kgTab} onValueChange={setKGTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="cypher">Cypher Query</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="vector-results">Vector Results</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="text-sm whitespace-pre-wrap">{kgResponse.summary}</div>
                </TabsContent>

                <TabsContent value="cypher" className="space-y-4">
                  <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs">
                    {kgResponse.cypher_query}
                  </pre>
                </TabsContent>

                <TabsContent value="results" className="space-y-4">
                  <div className="text-xs text-gray-500 mb-2">
                    Found {kgResponse.cypher_results_count} results
                  </div>
                  {kgResponse.cypher_results.length > 0 ? (
                    <div className="overflow-x-auto">
                      <pre className="bg-gray-100 p-3 rounded-md text-xs">
                        {JSON.stringify(kgResponse.cypher_results, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No results found</div>
                  )}
                </TabsContent>

                <TabsContent value="vector-results" className="space-y-4">
                  {kgResponse.vector_results.length > 0 ? (
                    kgResponse.vector_results.map((result, index) => (
                      <div key={index} className="border p-3 rounded-md">
                        <div className="text-xs text-gray-500 mb-1">Score: {result.score}</div>
                        <div className="text-sm">{result.text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No vector results found</div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center text-gray-500">Waiting for response...</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



