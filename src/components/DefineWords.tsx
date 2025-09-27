import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Download, ExternalLink, Volume2, Search, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { GeminiApiService, processWordList } from './shared/apiService'
import { speakWord } from './shared/utils'
import { WordDefinition } from './shared/types'

// --- Props Interface (Unchanged) ---
interface DefineWordsProps {
  apiKey: string
  englishLevel: string
}

// --- Reusable Download Button Component ---
const DownloadResultsButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="outline" onClick={onClick} className="flex items-center gap-2">
    <Download className="h-4 w-4" />
    Download Results
  </Button>
);


// --- Main Component ---
export default function DefineWords({ apiKey, englishLevel }: DefineWordsProps) {
  const [words, setWords] = useState('')
  const [definitions, setDefinitions] = useState<WordDefinition[]>([])
  const [loading, setLoading] = useState(false)

  const parseDefinitions = (response: string, expectedWords: string[]): WordDefinition[] => {
    // ... (This function remains unchanged from the previous version)
    const parsedDefs: WordDefinition[] = []
    const blocks = response.split(/\n\s*\n/).filter(block => block.trim())

    blocks.forEach((block, index) => {
      let word = expectedWords[index]?.toLowerCase() || ''
      let partOfSpeech = ''
      let ukPhonetic = ''
      let usPhonetic = ''
      let definition = ''

      const lines = block.split('\n').map(line => line.trim()).filter(Boolean)

      const wordLine = lines.find(l => l.includes('|'))
      if (wordLine) {
        const parts = wordLine.split('|').map(p => p.trim())
        word = parts[0].toLowerCase()
        partOfSpeech = parts[1] || ''
      }

      const phoneticLine = lines.find(l => l.match(/uk\s*\/[^/]+\/.*us\s*\/[^/]+\//i))
      if (phoneticLine) {
        const ukMatch = phoneticLine.match(/uk\s*\/([^/]+)\//i)
        const usMatch = phoneticLine.match(/us\s*\/([^/]+)\//i)
        ukPhonetic = ukMatch ? ukMatch[1] : ''
        usPhonetic = usMatch ? usMatch[1] : ''
      }

      const examples = lines
        .filter(l => l.startsWith('- '))
        .map(l => l.substring(2).trim())

      const defLines = lines.filter(l =>
        !l.includes('|') &&
        !l.match(/uk\s*\/[^/]+\//i) &&
        !l.startsWith('- ')
      )
      definition = defLines.join(' ').trim()

      if (word) {
        parsedDefs.push({
          word,
          partOfSpeech,
          ukPhonetic,
          usPhonetic,
          level: '',
          definition: definition || 'Definition not available.',
          examples
        })
      }
    })
    return parsedDefs
  }

  const defineWords = async () => {
    // ... (This function remains unchanged)
    if (!words.trim()) {
      toast.error('Please enter at least one word')
      return
    }

    setLoading(true)
    setDefinitions([])

    try {
      const apiService = new GeminiApiService(apiKey)
      const processedWordList = processWordList(words)
      const wordList = processedWordList.join(', ')

      const getLevelInstruction = (level: string) => {
        switch (level) {
          case '5yrs-old':
            return 'Use very simple words that a 5-year-old would understand. Avoid complex terms and explain everything in the most basic way possible.'
          case 'Proficient':
            return 'Use sophisticated vocabulary and provide detailed, nuanced explanations suitable for advanced English learners.'
          default:
            return 'Use clear, standard explanations suitable for intermediate English learners.'
        }
      }

      const prompt = `Define these words: ${wordList}

      ${getLevelInstruction(englishLevel)}
      
      For EACH word, return EXACTLY this format (separate each word with TWO blank lines):
      
      word | part of speech
      uk /phonetic/ us /phonetic/
      clear definition in plain text (no HTML tags, no special formatting)
      - Example sentence 1
      - Example sentence 2
      
      CRITICAL: 
      - Return ${processedWordList.length} separate definition blocks
      - Each word must have its own complete block
      - Use exactly TWO blank lines between each word definition
      - NO HTML tags like <br>, <p>, etc.`

      const text = await apiService.generateContent(prompt)
      const parsedDefinitions = parseDefinitions(text, processedWordList)

      if (parsedDefinitions.length === 0 && text.trim()) {
        toast.error('Parsing failed, but response received. Try rephrasing or checking one word at a time.')
      } else if (parsedDefinitions.length > 0) {
        setDefinitions(parsedDefinitions)
        toast.success(`Successfully defined ${parsedDefinitions.length} word(s)!`)
      } else {
        toast.error('Received an empty response from the API. Please try again.')
      }

    } catch (error: any) {
      console.error('Error defining words:', error)
      if (error.message?.includes('API_KEY_INVALID')) {
        toast.error('Invalid API key. Please check your Gemini API key.')
      } else {
        toast.error(`Error: ${error.message || 'Failed to define words.'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadDefinitions = () => {
    // ... (This function remains unchanged)
    if (definitions.length === 0) {
      toast.error('No definitions to download')
      return
    }

    let content = 'Word Definitions\n\n'
    definitions.forEach((def, index) => {
      content += `${index + 1}. ${def.word} | ${def.partOfSpeech}\n`
      if (def.ukPhonetic || def.usPhonetic) {
        content += `   uk /${def.ukPhonetic}/ us /${def.usPhonetic}/\n`
      }
      content += `   Definition: ${def.definition}\n`
      if (def.examples.length > 0) {
        content += `   Examples:\n`
        def.examples.forEach(example => {
          content += `   - ${example}\n`
        })
      }
      content += '\n'
    })

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'word-definitions.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Definitions downloaded successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter words separated by commas or new lines (e.g., benevolent, ephemeral, ubiquitous)"
            value={words}
            onChange={(e) => setWords(e.target.value)}
            className="min-h-[100px] bg-background/50 resize-none"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) defineWords() }}
          />
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap items-center">
              <Button
                onClick={defineWords}
                disabled={loading}
                className="flex-1 min-w-[200px] bg-mode-define-accent hover:bg-mode-define-accent/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Define Words
                  </>
                )}
              </Button>
              {definitions.length > 0 && !loading && (
                <DownloadResultsButton onClick={downloadDefinitions} />
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center sm:text-right pt-1">
              Pro tip: Use <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl + Enter</kbd> to submit.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={loading ? 'loading' : 'results'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {loading ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">Generating Definitions...</h3>
              <div className="grid gap-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          ) : definitions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Definitions ({definitions.length})</h3>
              </div>
              <motion.div
                className="grid gap-4"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                initial="hidden"
                animate="visible"
              >
                {definitions.map((def, index) => (
                  <DefinitionCard key={index} definition={def} />
                ))}
              </motion.div>
              {/* --- NEW: Download button at the bottom of the results --- */}
              <div className="mt-6 flex justify-center">
                <DownloadResultsButton onClick={downloadDefinitions} />
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


// --- UI Sub-components ---

const DefinitionCard = ({ definition }: { definition: WordDefinition }) => (
  // ... (This component remains unchanged)
  <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
    <Card className="bg-gradient-card border-border/50 shadow-elegant hover:shadow-elegant-hover transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-foreground capitalize flex items-center gap-2">
              {definition.word}
              <Button variant="ghost" size="icon" onClick={() => speakWord(definition.word)} className="h-8 w-8 shrink-0 hover:bg-primary/10">
                <Volume2 className="h-4 w-4" />
              </Button>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {definition.partOfSpeech && <Badge variant="secondary">{definition.partOfSpeech}</Badge>}
            </div>
            {(definition.ukPhonetic || definition.usPhonetic) && (
              <CardDescription className="mt-2 font-mono text-sm">
                {definition.ukPhonetic && `UK: /${definition.ukPhonetic}/`}
                {definition.ukPhonetic && definition.usPhonetic && ' • '}
                {definition.usPhonetic && `US: /${definition.usPhonetic}/`}
              </CardDescription>
            )}
          </div>
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0 hover:bg-primary/10">
            <a href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(definition.word)}`} target="_blank" rel="noopener noreferrer" aria-label="View in Cambridge Dictionary">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">{definition.definition}</p>
        {definition.examples.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2 text-foreground">Examples:</h4>
              <ul className="space-y-2">
                {definition.examples.map((example, i) => (
                  <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/20 italic">
                    "{example}"
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  </motion.div>
)

const SkeletonCard = () => (
  // ... (This component remains unchanged)
  <Card className="bg-gradient-card border-border/50">
    <CardHeader>
      <Skeleton className="h-7 w-2/5" />
      <Skeleton className="h-4 w-1/4 mt-2" />
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
  </Card>
)

const EmptyState = () => (
  // ... (This component remains unchanged)
  <div className="text-center py-16 px-6 border-2 border-dashed border-border/50 rounded-lg bg-background/20">
    <div className="mx-auto h-12 w-12 text-muted-foreground">
      <FileText />
    </div>
    <h3 className="mt-2 text-lg font-semibold">Your definitions will appear here</h3>
    <p className="mt-1 text-sm text-muted-foreground">
      Enter some words above and click "Define Words" to get started.
    </p>
  </div>
)