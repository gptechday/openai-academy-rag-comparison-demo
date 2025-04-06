import { type NextRequest, NextResponse } from "next/server"

/**
 * Vector-Only Search API Route Handler
 * 
 * This API route proxies user queries to a backend vector search service and returns the results.
 * It handles parameter validation, error handling, and response formatting.
 * 
 * Endpoint: GET /api/query-vector-only?query=<user-query>
 * 
 * @param request - The incoming NextRequest object containing query parameters
 * @returns NextResponse with either the processed results or an appropriate error message
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    /**
     * The base URL for the backend API
     * Falls back to localhost:8000 if the environment variable is not set
     */
    const apiUrl = process.env.API_BASE_URL || "http://localhost:8000"
    
    console.log(`Calling vector-only API with query: ${query}`)
    
    const response = await fetch(`${apiUrl}/query-with-vector-only?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`)
    }

    const text = await response.text()
    console.log("Raw vector-only response:", text.substring(0, 200) + "...")
    
    try {
      const data = JSON.parse(text)
      console.log("Parsed vector-only data (summary):", data.summary ? data.summary.substring(0, 100) + "..." : "No summary")
      
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      })
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json({ error: "Failed to parse JSON response from backend" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error querying vector-only endpoint:", error)
    return NextResponse.json({ 
      error: "Failed to fetch from vector-only endpoint", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

