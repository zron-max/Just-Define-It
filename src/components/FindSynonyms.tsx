import { useState, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Download, Sparkles, Tags, Quote, BookText, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { GeminiApiService, processWordList } from './shared/apiService'

interface FindSynonymsProps {
  apiKey: string
  englishLevel: string
}

// --- Reusable Button Components ---
const DownloadButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className="flex items-center gap-2 h-10 px-4"
    title="Download synonyms result"
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
    title="Import previously saved synonyms"
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

export default function FindSynonyms({ apiKey, englishLevel }: FindSynonymsProps) {
  const [words, setWords] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleWordsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target
    // Auto-format when a newline is detected. This is a good signal for multi-word input.
    if (/\n/.test(value)) {
      const formattedWords = value
        .split(/[\s,\n]+/) // Split by spaces, commas, or newlines
        .map((word) => word.trim())
        .filter(Boolean) // Remove empty strings
      const uniqueWords = [...new Set(formattedWords)] // Remove duplicates
      setWords(uniqueWords.join(', '))
    } else {
      setWords(value)
    }
  }

  const handleBlur = () => {
    // Clean up on blur, handling cases where newlines weren't used.
    const formattedWords = words
      .split(/[\s,]+/) // Split by spaces or commas
      .map((word) => word.trim())
      .filter(Boolean)
    const uniqueWords = [...new Set(formattedWords)]
    setWords(uniqueWords.join(', '))
  }

  const findSynonyms = async () => {
    const processedWordList = processWordList(words)
    if (processedWordList.length < 1) {
      toast.error('Please enter at least one word')
      return
    }

    setLoading(true)
    setResults([])

    try {
      const apiService = new GeminiApiService(apiKey)
      const wordList = processedWordList.join(', ')

      const getLevelInstruction = (level: string) => {
        switch (level) {
          case 'beginner':
            return 'Use simple vocabulary and avoid complex sentence structures.'
          case 'intermediate':
            return 'Use moderately challenging vocabulary suitable for intermediate learners.'
          case 'advanced':
            return 'Use rich and nuanced language appropriate for advanced learners.'
          default:
            return ''
        }
      }

      const prompt = `
      For each word in this list: "${wordList}", provide a detailed synonym analysis.

      **Formatting Rules:**
      - **USE MARKDOWN** for the entire response.
      - For each word, create a Level 2 Heading (e.g., '## Happy').
      - Under each heading, provide the following sections with bolded labels:
        - '**Synonyms:**' A comma-separated list of 5-7 relevant synonyms.
        - '**Usage Notes:**' A brief paragraph explaining the nuances.
        - '**Examples:**' A bulleted list with two sentences.
      - **CRITICAL: Throughout "Usage Notes" and "Examples", wrap important keywords in HTML <mark> tags to highlight them.**

      ${getLevelInstruction(englishLevel)}
      `

      const text = await apiService.generateContent(prompt)
      const sections = text.split(/\n(?=## )/).filter(section => section.trim().length > 0)
      setResults(sections)
      toast.success(`Successfully found synonyms for ${sections.length} word(s)!`)
    } catch (error: any) {
      console.error('Error finding synonyms:', error)
      toast.error(`Error: ${error.message || 'Failed to find synonyms.'}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadSynonyms = () => {
    if (results.length === 0) return
    const content = `Word Synonym Analysis\n\n${results.join('\n\n---\n\n')}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'word-synonyms.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Synonyms downloaded successfully!')
  }

  const importSynonyms = async (file: File) => {
    try {
      const text = await file.text()

      if (!text.includes('Word Synonym Analysis')) {
        toast.error('Invalid file format. Please select a valid exported synonym file.')
        return
      }

      const importedSections = text.split(/\n(?=## )/).filter(section => section.trim().length > 0)
      if (importedSections.length === 0) {
        toast.error('No valid content found in the file.')
        return
      }

      setResults(importedSections)
      toast.success('Synonyms imported successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to import synonyms.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter words to find synonyms for (e.g., happy, beautiful, smart)"
            value={words}
            onChange={handleWordsChange}
            onBlur={handleBlur}
            className="min-h-[100px] bg-background/50 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) findSynonyms()
            }}
          />

          {/* Improved Button Layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Primary Action */}
            <Button
              onClick={findSynonyms}
              disabled={loading}
              className="w-full sm:flex-1 bg-mode-synonyms-accent hover:bg-mode-synonyms-accent/90 text-white h-11 transition-transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Synonyms...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Find Synonyms
                </>
              )}
            </Button>

            {/* Secondary Actions */}
            <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <ImportButton onImport={importSynonyms} />
              {results.length > 0 && !loading && <DownloadButton onClick={downloadSynonyms} />}
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

      <AnimatePresence>
        {loading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </motion.div>
        ) : results.length > 0 ? (
          <motion.div
            key="results"
            className="space-y-6"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            initial="hidden"
            animate="visible"
          >
            {results.map((content, index) => (
              <SynonymResultCard key={index} markdownContent={content} />
            ))}
            <div className="flex justify-center border-t border-border/50 pt-6 gap-3">
              <DownloadButton onClick={downloadSynonyms} />
              <ImportButton onImport={importSynonyms} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center py-16 px-6 border-2 border-dashed border-border/50 rounded-lg bg-background/20">
              <div className="mx-auto h-12 w-12 text-muted-foreground">
                <Sparkles />
              </div>
              <h3 className="mt-2 text-lg font-semibold">Discover new words and alternatives</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter a word to generate a list of synonyms or import a saved result.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const SynonymResultCard = ({ markdownContent }: { markdownContent: string }) => {
  const extractSection = (start: string, end?: string): string => {
    const lower = markdownContent.toLowerCase()
    const startIdx = lower.indexOf(start)
    if (startIdx === -1) return ''
    const from = startIdx + start.length
    const endIdx = end ? lower.indexOf(end, from) : -1
    return markdownContent.substring(from, endIdx !== -1 ? endIdx : undefined).trim()
  }

  const titleMatch = markdownContent.match(/^##\s*(.*)/)
  const title = titleMatch ? titleMatch[1] : 'Synonym Analysis'

  const synonymsText = extractSection('**synonyms:**', '**usage notes:**')
  const usageNotesText = extractSection('**usage notes:**', '**examples:**')
  const examplesText = extractSection('**examples:**')
  const synonyms = synonymsText
    .split(/, | and /)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl capitalize">
            <Sparkles className="h-5 w-5 text-mode-synonyms-accent" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {synonyms.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
                <Tags className="h-4 w-4 text-muted-foreground" />
                Synonyms
              </h4>
              <div className="flex flex-wrap gap-2">
                {synonyms.map((syn, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-background hover:bg-muted transition-colors cursor-default"
                  >
                    {syn}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-foreground">
              <BookText className="h-4 w-4 text-muted-foreground" />
              Usage Notes
            </h4>
            <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{usageNotesText}</ReactMarkdown>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-foreground">
              <Quote className="h-4 w-4 text-muted-foreground" />
              Examples
            </h4>
            <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  ul: ({ node, ...props }) => <ul className="space-y-3" {...props} />,
                  li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                }}
              >
                {examplesText}
              </ReactMarkdown>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
