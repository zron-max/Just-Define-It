import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Download, Upload, Scale } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { GeminiApiService, processWordList } from './shared/apiService'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface ComparisonResult {
  summary: string
  details: string
}

interface CompareWordsProps {
  apiKey: string
  englishLevel: string
}

const DownloadButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className="flex items-center gap-2 h-10 px-4"
    title="Download comparison result"
  >
    <Download className="h-4 w-4" />
    Download
  </Button>
)

const ImportButton = ({ onImport }: { onImport: (file: File) => void }) => (
  <Button
    variant="secondary"
    asChild
    className="flex items-center gap-2 h-10 px-4"
    title="Import previously saved comparison"
  >
    <label className="flex items-center gap-2 cursor-pointer">
      <Upload className="h-4 w-4" />
      Import
      <input
        type="file"
        accept=".txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImport(file)
        }}
      />
    </label>
  </Button>
)

export default function CompareWords({ apiKey, englishLevel }: CompareWordsProps) {
  const [words, setWords] = useState('')
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)

  // --- Auto-formatting logic ---
  useEffect(() => {
    if (!words) return
    const cleanWords = words
      .replace(/[\n\r]+/g, ',')
      .split(',')
      .map(w => w.trim().toLowerCase())
      .filter(Boolean)
    const uniqueWords = Array.from(new Set(cleanWords))
    const finalString = uniqueWords.join(', ')
    if (finalString !== words) setWords(finalString)
  }, [words])

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

      const getLevelInstruction = (level: string) => {
        switch (level.toLowerCase()) {
          case 'beginner':
            return 'Keep explanations simple and clear, using short sentences.'
          case 'intermediate':
            return 'Use moderate depth, providing both meaning and subtle differences.'
          case 'advanced':
            return 'Include detailed linguistic nuances, idiomatic usage, and tone differences.'
          default:
            return ''
        }
      }

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
        setResult({ summary: 'Could not automatically summarize the key difference.', details: text })
        toast.warning('AI response format was unexpected, showing full details.')
      }
    } catch (error: any) {
      console.error('Error comparing words:', error)
      toast.error(`Error: ${error.message || 'Failed to compare words.'}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadComparison = () => {
    if (!result) return
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

  const importComparison = async (file: File) => {
    try {
      const text = await file.text()

      if (!text.includes('Word Comparison Analysis')) {
        toast.error('Invalid file format. Please select a valid exported comparison file.')
        return
      }

      const sections = text.split('---')
      if (sections.length < 2) {
        toast.error('Invalid file format or missing separator.')
        return
      }

      const summary = text
        .split('Key Difference:')[1]
        ?.split('---')[0]
        ?.trim() || 'No summary found.'

      const details = sections.slice(1).join('---').trim()

      setResult({ summary, details })
      toast.success('Comparison imported successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to import comparison.')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter words to compare, separated by commas or new lines (e.g., happy, joyful, ecstatic)"
            value={words}
            onChange={(e) => setWords(e.target.value)}
            className="min-h-[100px] bg-background/50 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) compareWords()
            }}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button
              onClick={compareWords}
              disabled={loading}
              className="w-full sm:flex-1 bg-mode-compare-accent hover:bg-mode-compare-accent/90 text-white h-11 transition-transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  <Scale className="mr-2 h-4 w-4" />
                  Compare Words
                </>
              )}
            </Button>

            <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <ImportButton onImport={importComparison} />
              {result && !loading && <DownloadButton onClick={downloadComparison} />}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center sm:text-right pt-1">
            Pro tip: Use{' '}
            <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              Ctrl + Enter
            </kbd>{' '}
            to submit.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="bg-gradient-card border-border/50 shadow-elegant p-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </Card>
      ) : result ? (
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Scale className="h-5 w-5 text-mode-compare-accent" />
              Comparison Result
            </CardTitle>
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
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-lg font-semibold mt-8 mb-4 pb-2 border-b border-border/50 first:mt-0"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => <p className="leading-relaxed mb-4" {...props} />,
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-5 space-y-2 mb-4" {...props} />
                      ),
                      strong: ({ node, ...props }) => <strong className="text-foreground" {...props} />,
                      table: ({ node, ...props }) => <table className="w-full my-6" {...props} />,
                      thead: ({ node, ...props }) => <thead className="border-b border-border/50" {...props} />,
                      th: ({ node, ...props }) => (
                        <th className="text-left p-2 font-medium text-foreground" {...props} />
                      ),
                      td: ({ node, ...props }) => <td className="p-2" {...props} />,
                    }}
                  >
                    {result.details}
                  </ReactMarkdown>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-6 flex justify-center border-t border-border/50 pt-6 gap-3">
              <DownloadButton onClick={downloadComparison} />
              <ImportButton onImport={importComparison} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16 px-6 border-2 border-dashed border-border/50 rounded-lg bg-background/20">
          <div className="mx-auto h-12 w-12 text-muted-foreground">
            <Scale />
          </div>
          <h3 className="mt-2 text-lg font-semibold">Compare words to see the difference</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter two or more words to generate a detailed comparison or import a saved result.
          </p>
        </div>
      )}
    </div>
  )
}
