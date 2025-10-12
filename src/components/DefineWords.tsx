import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Loader2,
  Download,
  ExternalLink,
  Volume2,
  Search,
  FileText,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { GeminiApiService, processWordList } from './shared/apiService'
import { speakWord } from './shared/utils'
import { WordDefinition } from './shared/types'

interface DefineWordsProps {
  apiKey: string
  englishLevel: string
}

const showSuccess = (title: string, details?: string) => {
  const msg = details ? `✅ ${title} — ${details}` : `✅ ${title}`
  toast.success(msg)
}
const showError = (message: string) => {
  toast.error(`❌ ${message}`)
}

const DownloadButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className="flex items-center gap-2 h-10 px-4"
    title="Download definitions"
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
    title="Import previously saved definitions"
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

export default function DefineWords({ apiKey, englishLevel }: DefineWordsProps) {
  const [words, setWords] = useState('')
  const [definitions, setDefinitions] = useState<WordDefinition[]>([])
  const [loading, setLoading] = useState(false)
  const [importMeta, setImportMeta] = useState<{ filename?: string; count?: number } | null>(null)

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

  const parseDefinitions = (response: string, expectedWords: string[]): WordDefinition[] => {
    if (!response) return []
    const rawBlocks = response.split(/\n\s*\n{1,}/).map(b => b.trim()).filter(Boolean)
    const potentialBlocks = rawBlocks.filter(block => /[A-Za-z0-9'’\-]+\s*\|/.test(block) || /uk\s*\/[^/]+\//i.test(block) || /definition\s*:/i.test(block))

    const findBlockForWord = (word: string, usedIdxs: Set<number>): { idx: number; block: string } | null => {
      const lowerWord = word.toLowerCase()
      for (let i = 0; i < potentialBlocks.length; i++) {
        if (usedIdxs.has(i)) continue
        const b = potentialBlocks[i]
        if (new RegExp(`\\b${escapeRegExp(lowerWord)}\\b`, 'i').test(b)) {
          return { idx: i, block: b }
        }
      }
      for (let i = 0; i < potentialBlocks.length; i++) {
        if (!usedIdxs.has(i)) return { idx: i, block: potentialBlocks[i] }
      }
      return null
    }

    const parsed: WordDefinition[] = []
    const usedBlocks = new Set<number>()

    for (let wi = 0; wi < expectedWords.length; wi++) {
      const expected = expectedWords[wi].toLowerCase()
      const found = findBlockForWord(expected, usedBlocks)
      let blockText = found ? found.block : rawBlocks[wi] || ''
      const foundIdx = found ? found.idx : -1
      if (foundIdx >= 0) usedBlocks.add(foundIdx)
      if (!blockText) continue

      const multiMatches = [...blockText.matchAll(/(^|\n)\s*([A-Za-z'’\-\s]{1,40}?)\s*\|/g)]
      if (multiMatches && multiMatches.length > 1) {
        const second = multiMatches[1]
        const cutIndex = second.index || 0
        blockText = blockText.slice(0, cutIndex).trim()
      }

      const lines = blockText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      let word = expected
      let partOfSpeech = ''
      let ukPhonetic = ''
      let usPhonetic = ''
      let level = ''
      let definition = ''
      const examples: string[] = []

      const wordLineIdx = lines.findIndex(l => l.includes('|'))
      if (wordLineIdx !== -1) {
        const wl = lines[wordLineIdx]
        const parts = wl.split('|').map(p => p.trim())
        if (parts[0]) word = parts[0].toLowerCase()
        if (parts[1]) partOfSpeech = parts[1]
      } else {
        const maybe = lines[0] || ''
        const m = maybe.match(/^([A-Za-z'’\-]+)\s*$/)
        if (m) word = m[1].toLowerCase()
      }

      const phoneticLine = lines.find(l => /uk\s*\/[^/]+\//i.test(l) || /us\s*\/[^/]+\//i.test(l))
      if (phoneticLine) {
        const ukMatch = phoneticLine.match(/uk\s*\/([^/]+)\//i)
        const usMatch = phoneticLine.match(/us\s*\/([^/]+)\//i)
        ukPhonetic = ukMatch ? ukMatch[1].trim() : ''
        usPhonetic = usMatch ? usMatch[1].trim() : ''
      } else {
        const ukLine = lines.find(l => /^uk\s*:/i.test(l) || /^uk\s*\//i.test(l))
        if (ukLine) {
          const m = ukLine.match(/uk\s*[:\/]\s*\/?([^/]+)\/?/i)
          if (m) ukPhonetic = m[1].trim()
        }
        const usLine = lines.find(l => /^us\s*:/i.test(l) || /^us\s*\//i.test(l))
        if (usLine) {
          const m2 = usLine.match(/us\s*[:\/]\s*\/?([^/]+)\/?/i)
          if (m2) usPhonetic = m2[1].trim()
        }
      }

      const lvlLine = lines.find(l => /^level\s*:/i.test(l))
      if (lvlLine) level = lvlLine.replace(/^level\s*:\s*/i, '').trim()

      const fullBlock = blockText
      const exBlockMatch = fullBlock.match(/<<EXAMPLES>>\s*([\s\S]*?)\s*<<?\/EXAMPLES>>/i)
      if (exBlockMatch) {
        exBlockMatch[1]
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(Boolean)
          .forEach(l => {
            if (l.startsWith('- ')) examples.push(l.replace(/^- /, '').trim())
            else examples.push(l)
          })
      } else {
        lines.forEach(l => {
          if (l.startsWith('- ')) examples.push(l.replace(/^- /, '').trim())
        })
      }

      const defLineIdx = lines.findIndex(l => /^definition\s*:/i.test(l))
      if (defLineIdx !== -1) {
        const defParts: string[] = []
        for (let i = defLineIdx; i < lines.length; i++) {
          const ln = lines[i]
          if (/^examples\s*:/i.test(ln)) break
          if (/^- /.test(ln)) break
          if (/^(word|partofspeech|level|uk|us)\s*:/i.test(ln)) continue
          defParts.push(ln.replace(/^definition\s*:\s*/i, ''))
        }
        definition = defParts.join(' ').trim()
      } else {
        const nonLabelLines = lines.filter(l => !/^(word|partofspeech|level|uk|us|examples)\s*:/i.test(l) && !l.startsWith('- '))
        if (wordLineIdx !== -1) nonLabelLines.splice(wordLineIdx, 1)
        definition = nonLabelLines.join(' ').trim()
      }

      definition = definition.replace(/\s{2,}/g, ' ').trim()
      parsed.push({ word, partOfSpeech, ukPhonetic, usPhonetic, level, definition: definition || 'Definition not available.', examples })
    }

    return parsed
  }

  const defineWords = async () => {
    if (!words.trim()) {
      showError('Please enter at least one word')
      return
    }

    setLoading(true)
    setDefinitions([])
    setImportMeta(null)

    try {
      const apiService = new GeminiApiService(apiKey)
      const processedWordList = processWordList(words)
      const wordList = processedWordList.join(', ')

      const getLevelInstruction = (level: string) => {
        switch (level) {
          case '5yrs-old':
            return 'Use very simple words that a 5-year-old would understand.'
          case 'Proficient':
            return 'Use sophisticated vocabulary and provide detailed, nuanced explanations.'
          default:
            return 'Use clear, standard explanations suitable for intermediate English learners.'
        }
      }

      const prompt = `Define these words: ${wordList}

${getLevelInstruction(englishLevel)}

For EACH word, return EXACTLY this format (separate each word with TWO blank lines):

word | part of speech
Level: <B1/B2/C1>   # OPTIONAL - include if you can estimate CEFR level
uk /phonetic/ us /phonetic/
Definition: clear definition in plain text
- Example sentence 1
- Example sentence 2

CRITICAL:
- Return ${processedWordList.length} separate definition blocks
- Each word must have its own complete block
- Use exactly TWO blank lines between each word definition.`

      const text = await apiService.generateContent(prompt)
      const parsed = parseDefinitions(text, processedWordList)

      if (parsed.length === 0 && text.trim()) {
        showError('Parsing failed, but response received. Try single word or rephrase prompt.')
      } else if (parsed.length > 0) {
        setDefinitions(parsed)
        showSuccess('Definitions generated', `${parsed.length} word(s)`)
      } else {
        showError('Received an empty response from the API. Please try again.')
      }
    } catch (error: any) {
      console.error('Error defining words:', error)
      if (error.message?.includes('API_KEY_INVALID')) {
        showError('Invalid API key. Please check your Gemini API key.')
      } else {
        showError(`Error: ${error.message || 'Failed to define words.'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadDefinitions = () => {
    if (definitions.length === 0) {
      showError('No definitions to download')
      return
    }

    const header = [
      'Word Definitions',
      `GeneratedAt: ${new Date().toISOString()}`,
      'Version: 2',
      ''
    ].join('\n')

    const entries = definitions.map((def) => {
      const lines: string[] = []
      lines.push('---ENTRY---')
      lines.push(`Word: ${def.word}`)
      if (def.partOfSpeech) lines.push(`PartOfSpeech: ${def.partOfSpeech}`)
      if (def.level) lines.push(`Level: ${def.level}`)
      if (def.ukPhonetic) lines.push(`UK: /${def.ukPhonetic}/`)
      if (def.usPhonetic) lines.push(`US: /${def.usPhonetic}/`)
      lines.push(`Definition: ${def.definition}`)
      lines.push('Examples:')
      lines.push('<<EXAMPLES>>')
      def.examples.forEach(ex => lines.push(`- ${ex}`))
      lines.push('<</EXAMPLES>>')
      lines.push('')
      return lines.join('\n')
    })

    const content = [header, ...entries].join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'word-definitions.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showSuccess('Definitions downloaded', `${definitions.length} word(s)`)
  }

  const importDefinitions = async (file: File) => {
    try {
      const text = await file.text()
      if (!text || !/word definitions/i.test((text.split(/\r?\n/)[0] || ''))) {
        showError('Invalid file format. Please select a valid exported definition file.')
        return
      }

      if (text.includes('---ENTRY---')) {
        const rawEntries = text.split(/---ENTRY---/).map(e => e.trim()).filter(Boolean)
        const parsed = rawEntries.map(entry => {
          const getLine = (key: string) => {
            const re = new RegExp(`^${key}\\s*:\\s*(.*)$`, 'im')
            const m = entry.match(re)
            return m ? m[1].trim() : ''
          }
          const word = getLine('Word') || ''
          const partOfSpeech = getLine('PartOfSpeech') || ''
          const level = getLine('Level') || ''
          const ukMatch = entry.match(/UK\s*:\s*\/([^/]+)\//i)
          const usMatch = entry.match(/US\s*:\s*\/([^/]+)\//i)
          const ukPhonetic = ukMatch ? ukMatch[1] : ''
          const usPhonetic = usMatch ? usMatch[1] : ''
          const defMatch = entry.match(/Definition\s*:\s*([\s\S]*?)(?=\nExamples\s*:|\n<<EXAMPLES>>|$)/i)
          const definition = defMatch ? defMatch[1].trim() : ''
          const examples: string[] = []
          const examplesBlock = entry.match(/<<EXAMPLES>>\s*([\s\S]*?)\s*<<?\/EXAMPLES>>/i)
          if (examplesBlock) {
            examplesBlock[1].split(/\r?\n/).forEach(l => {
              const trimmed = l.trim()
              if (!trimmed) return
              if (/^- /.test(trimmed)) examples.push(trimmed.replace(/^- /, '').trim())
              else examples.push(trimmed)
            })
          } else {
            entry.split(/\r?\n/).forEach(l => {
              if (/^- /.test(l.trim())) examples.push(l.replace(/^- /, '').trim())
            })
          }
          return {
            word: word.toLowerCase(),
            partOfSpeech,
            ukPhonetic,
            usPhonetic,
            level,
            definition: definition || '(imported definition)',
            examples
          } as WordDefinition
        }).filter(d => d.word)

        if (parsed.length === 0) {
          showError('No valid definitions found in the file.')
          return
        }

        setDefinitions(parsed)
        setImportMeta({ filename: file.name, count: parsed.length })
        showSuccess('Imported definitions', `${parsed.length} word(s) from ${file.name}`)
        return
      }

      const numberedSections = text.split(/\n(?=\d+\.\s)/).map(s => s.trim()).filter(Boolean)
      const parsedFallback: WordDefinition[] = []

      numberedSections.forEach(section => {
        const cleaned = section.replace(/^\d+\.\s*/, '').trim()
        const segLines = cleaned.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
        if (segLines.length === 0) return
        const first = segLines[0] || ''
        const [wordPart, posPart] = first.split('|').map(p => p.trim())
        const rest = segLines.slice(1).join('\n')
        const ukMatch = rest.match(/uk\s*\/([^/]+)\//i)
        const usMatch = rest.match(/us\s*\/([^/]+)\//i)
        const defMatch = rest.match(/Definition\s*:\s*([\s\S]*?)(?=Examples\s*:|$)/i)
        const examples: string[] = []
        segLines.forEach(l => {
          if (/^- /.test(l)) examples.push(l.replace(/^- /, '').trim())
        })
        parsedFallback.push({
          word: (wordPart || '').toLowerCase(),
          partOfSpeech: posPart || '',
          ukPhonetic: ukMatch ? ukMatch[1] : '',
          usPhonetic: usMatch ? usMatch[1] : '',
          level: '',
          definition: defMatch ? defMatch[1].trim() : '(imported definition)',
          examples
        })
      })

      if (parsedFallback.length === 0) {
        showError('No valid definitions found in the file.')
        return
      }

      setDefinitions(parsedFallback)
      setImportMeta({ filename: file.name, count: parsedFallback.length })
      showSuccess('Imported definitions', `${parsedFallback.length} word(s) from ${file.name}`)
    } catch (err) {
      console.error(err)
      showError('Failed to import definitions.')
    }
  }

  const levelBadgeClass = (level?: string) => {
    const l = (level || '').toUpperCase()
    switch (l) {
      case 'B1':
        return 'bg-blue-100 text-blue-800'
      case 'B2':
        return 'bg-amber-100 text-amber-800'
      case 'C1':
        return 'bg-rose-100 text-rose-800'
      case 'C2':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-muted/10 text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter words separated by commas or new lines (e.g., benevolent, ephemeral, ubiquitous)"
            value={words}
            onChange={(e) => setWords(e.target.value)}
            className="min-h-[100px] bg-background/50 resize-none"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) defineWords() }}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button
              onClick={defineWords}
              disabled={loading}
              className="w-full sm:flex-1 bg-mode-define-accent hover:bg-mode-define-accent/90 text-white h-11 transition-transform hover:scale-[1.02]"
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

            <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <ImportButton onImport={importDefinitions} />
              {definitions.length > 0 && !loading && <DownloadButton onClick={downloadDefinitions} />}
              {importMeta && (
                <div className="ml-2 hidden sm:flex items-center gap-2">
                  <Badge className="px-2 py-1 text-sm">{importMeta.filename}</Badge>
                  <Badge className="px-2 py-1 text-sm">{importMeta.count} words</Badge>
                </div>
              )}
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold">Definitions ({definitions.length})</h3>
                {importMeta && (
                  <div className="flex items-center gap-2 sm:hidden">
                    <Badge className="px-2 py-1 text-sm">{importMeta.filename}</Badge>
                    <Badge className="px-2 py-1 text-sm">{importMeta.count} words</Badge>
                  </div>
                )}
              </div>

              <motion.div
                className="grid gap-4"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.06 }
                  }
                }}
                initial="hidden"
                animate="visible"
              >
                {definitions.map((def, index) => (
                  <DefinitionCard key={index} definition={def} levelBadgeClass={levelBadgeClass} />
                ))}
              </motion.div>

              <div className="mt-6 flex justify-center gap-3">
                <DownloadButton onClick={downloadDefinitions} />
                <ImportButton onImport={importDefinitions} />
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

const DefinitionCard = ({ definition, levelBadgeClass }: { definition: WordDefinition, levelBadgeClass: (l?: string) => string }) => (
  <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
    <Card className="bg-card/50 border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-semibold tracking-tight capitalize">
                {definition.word}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speakWord(definition.word)}
                className="h-8 w-8 shrink-0 hover:bg-primary/10"
                aria-label={`Play pronunciation for ${definition.word}`}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {definition.partOfSpeech && (
                <Badge variant="secondary" className="rounded-full text-xs px-3 py-0.5">
                  {definition.partOfSpeech}
                </Badge>
              )}
              {definition.level && (
                <span className={`rounded-full text-xs font-medium px-3 py-0.5 ${levelBadgeClass(definition.level)}`}>
                  {definition.level.toUpperCase()}
                </span>
              )}
            </div>

            {(definition.ukPhonetic || definition.usPhonetic) && (
              <CardDescription className="mt-2 text-sm font-mono tracking-wide text-muted-foreground">
                {definition.ukPhonetic && <>UK: /{definition.ukPhonetic}/</>}
                {definition.ukPhonetic && definition.usPhonetic && ' • '}
                {definition.usPhonetic && <>US: /{definition.usPhonetic}/</>}
              </CardDescription>
            )}
          </div>

          <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0 hover:bg-primary/10">
            <a
              href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(definition.word)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View in Cambridge Dictionary"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <p className="text-foreground text-base leading-relaxed">
          {definition.definition}
        </p>

        {definition.examples.length > 0 && (
          <>
            <Separator className="my-2 opacity-40" />
            <div>
              <h4 className="font-semibold text-sm mb-2 text-foreground">Examples:</h4>
              <ul className="space-y-2">
                {definition.examples.map((example, i) => (
                  <li key={i} className="text-sm text-muted-foreground italic pl-4 border-l-2 border-primary/20">
                    “{example}”
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
  <div className="text-center py-16 px-6 border-2 border-dashed border-border/50 rounded-lg bg-background/20">
    <div className="mx-auto h-12 w-12 text-muted-foreground">
      <FileText />
    </div>
    <h3 className="mt-2 text-lg font-semibold">Your definitions will appear here</h3>
    <p className="mt-1 text-sm text-muted-foreground">
      Enter some words above, or import a saved file to get started.
    </p>
  </div>
)

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
