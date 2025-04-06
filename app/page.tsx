import ChatInterface from "@/components/chat-interface"
import ResponseComparison from "@/components/response-comparison"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

/**
 * Home Page Component
 * 
 * Root page component that renders the main application layout with the following sections:
 * - Header with application branding and GitHub link
 * - Main content area displaying the response comparison component
 * - Footer containing the chat interface for user input
 * 
 * The application demonstrates the difference between vector search and knowledge graph 
 * approaches for retrieving and processing information.
 */
export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Image 
            src="/openai-logo.png" 
            alt="OpenAI Logo" 
            width={40} 
            height={40} 
            className="object-contain"
          />
          <h1 className="text-2xl font-bold">Open AI Academy Vector Search vs Knowledge Graph Demo!</h1>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/yourusername/rag-comparison"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            <span>View this demo on the GPTechday GitHub!</span>
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <ResponseComparison />
      </div>

      <div className="border-t p-4 bg-white">
        <ChatInterface />
      </div>
    </main>
  )
}

