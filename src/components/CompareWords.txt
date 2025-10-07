import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Download, Scale } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw' // <-- Import the new package
import { GeminiApiService, processWordList } from './shared/apiService'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface ComparisonResult {
  summary: string;
  details: string;
}

interface CompareWordsProps {
  apiKey: string
  englishLevel: string
}

const DownloadButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="outline" onClick={onClick} className="flex items-center gap-2">
    <Download className="h-4 w-4" />
    Download Comparison
  </Button>
);

export default function CompareWords({ apiKey, englishLevel }: CompareWordsProps) {
  const [words, setWords] = useState('')
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)

  const compareWords = async () => {
    const processedWordList = processWordList(words)
    if (processedWordList.length < 2) {
      toast.error('Please enter at least two words to compare')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const apiService = new GeminiApiService(apiKey)
      const wordList = processedWordList.join(', ')

      const getLevelInstruction = (level: string) => { /* ... unchanged ... */ }

      // --- FINAL, REFINED PROMPT ---
      // It now asks the AI to bold AND highlight key terms.
      const prompt = `
      **Task: Compare and contrast these words:** ${wordList}.

      **Response Format (Strict):**
      1.  **Key Difference:** Start with a single, concise sentence that summarizes the absolute main difference. (No Markdown in this section)
      2.  **Separator:** After that sentence, insert the exact separator: "---DETAILS---" on its own line.
      3.  **Detailed Analysis:** After the separator, provide a full, detailed analysis formatted in Markdown. In this section:
          - Use a Level 2 Heading (e.g., '## Word') for each word.
          - Use Markdown bold ('**Usage:**') for subheadings.
          - **CRITICAL: Throughout your explanations, wrap the most important keywords and concepts in HTML <mark> tags to highlight them.**
          - Conclude with a final '## Comparison Table'.

      ${getLevelInstruction(englishLevel)}
      `

      const text = await apiService.generateContent(prompt)
      const parts = text.split('---DETAILS---')

      if (parts.length === 2) {
        setResult({ summary: parts[0].trim(), details: parts[1].trim() })
        toast.success(`Successfully compared ${processedWordList.length} word(s)!`)
      } else {
        setResult({ summary: "Could not automatically summarize the key difference.", details: text })
        toast.warning("AI response format was unexpected, showing full details.")
      }

    } catch (error: any) {
      console.error('Error comparing words:', error)
      toast.error(`Error: ${error.message || 'Failed to compare words.'}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadComparison = () => {
    if (!result) { return }
    const content = `Word Comparison Analysis\n\nKey Difference:\n${result.summary}\n\n---\n\n${result.details}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'word-comparison.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Comparison downloaded successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Input Card (Unchanged) */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter words to compare, separated by commas (e.g., happy, joyful, ecstatic)"
            value={words}
            onChange={(e) => setWords(e.target.value)}
            className="min-h-[100px] bg-background/50 resize-none"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) compareWords() }}
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={compareWords}
              disabled={loading}
              className="flex-1 min-w-[200px] bg-mode-compare-accent hover:bg-mode-compare-accent/90 text-white"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Comparing...</> : <><Scale className="mr-2 h-4 w-4" />Compare Words</>}
            </Button>
            {result && !loading && <DownloadButton onClick={downloadComparison} />}
          </div>
          <p className="text-xs text-muted-foreground text-center sm:text-right pt-1">
            Pro tip: Use <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl + Enter</kbd> to submit.
          </p>
        </CardContent>
      </Card>

      {/* Results Section */}
      {loading ? (
        <Card className="bg-gradient-card border-border/50 shadow-elegant p-6"><div className="space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-1/2" /></div></Card>
      ) : result ? (
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Scale className="h-5 w-5 text-mode-compare-accent" />Comparison Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border/50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div>
                    <h3 className="font-semibold text-sm mb-1 text-foreground">Key Difference:</h3>
                    <p className="text-base text-foreground/90 font-light">{result.summary}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-6">
                  {/* --- UPDATED MARKDOWN RENDERER --- */}
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]} // <-- Allows the <mark> tag
                    remarkPlugins={[remarkGfm]}
                    // This components prop gives us full control over styling
                    components={{
                      h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-8 mb-4 pb-2 border-b border-border/50 first:mt-0" {...props} />,
                      p: ({ node, ...props }) => <p className="leading-relaxed mb-4" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 mb-4" {...props} />,
                      strong: ({ node, ...props }) => <strong className="text-foreground" {...props} />,
                      table: ({ node, ...props }) => <table className="w-full my-6" {...props} />,
                      thead: ({ node, ...props }) => <thead className="border-b border-border/50" {...props} />,
                      th: ({ node, ...props }) => <th className="text-left p-2 font-medium text-foreground" {...props} />,
                      td: ({ node, ...props }) => <td className="p-2" {...props} />,
                    }}
                  >
                    {result.details}
                  </ReactMarkdown>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-6 flex justify-center border-t border-border/50 pt-6">
              <DownloadButton onClick={downloadComparison} />
            </div>
           
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16 px-6 border-2 border-dashed border-border/50 rounded-lg bg-background/20">
          <div className="mx-auto h-12 w-12 text-muted-foreground"><Scale /></div>
          <h3 className="mt-2 text-lg font-semibold">Compare words to see the difference</h3>
          <p className="mt-1 text-sm text-muted-foreground">Enter two or more words to generate a detailed comparison.</p>
        </div>
      )}
    </div>
  )
}