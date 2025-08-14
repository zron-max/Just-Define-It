import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Download, Scale } from 'lucide-react'
import { toast } from 'sonner'
import { GeminiApiService, processWordList } from './shared/apiService'
import { ComparisonData } from './shared/types'

interface CompareWordsProps {
  apiKey: string
  englishLevel: string
}

export default function CompareWords({ apiKey, englishLevel }: CompareWordsProps) {
  const [words, setWords] = useState('')
  const [comparisons, setComparisons] = useState<ComparisonData[]>([])
  const [rawComparison, setRawComparison] = useState('')
  const [loading, setLoading] = useState(false)

  const parseComparisons = (response: string, expectedWords: string[]): ComparisonData[] => {
    const comparisons: ComparisonData[] = []
    
    const tryParseStructured = (text: string): ComparisonData[] => {
      const structured: ComparisonData[] = []
      
      expectedWords.forEach(word => {
        // Look for word sections with various formats
        const wordRegex = new RegExp(`(?:^|\\n)(?:\\d+\\.?\\s*)?(?:\\*\\*)?${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\*\\*)?[:\\s]`, 'im')
        const match = text.search(wordRegex)
        
        if (match !== -1) {
          // Extract section for this word
          const nextWordIndex = expectedWords.findIndex((w, i) => 
            i > expectedWords.indexOf(word) && text.indexOf(w, match + 1) > match
          )
          const sectionEnd = nextWordIndex >= 0 ? 
            text.indexOf(expectedWords[nextWordIndex], match + 1) : 
            text.length
          
          const section = text.slice(match, sectionEnd)
          
          // Extract information with flexible patterns
          const extractInfo = (patterns: string[], defaultValue: string) => {
            for (const pattern of patterns) {
              const regex = new RegExp(pattern, 'is')
              const match = section.match(regex)
              if (match && match[1]?.trim()) {
                return match[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ')
              }
            }
            return defaultValue
          }
          
          const definition = extractInfo([
            'definition[:\\s-]*([^\\n]+(?:\\n(?!\\w+:)[^\\n]+)*)',
            'means?[:\\s-]*([^\\n]+)',
            '^[^\\n]*?[:\\s-]([^\\n]+)'
          ], 'Definition not clearly available')
          
          const meaningType = extractInfo([
            'meaning\\s*type[:\\s-]*([^\\n]+)',
            'type[:\\s-]*([^\\n]+)',
            'category[:\\s-]*([^\\n]+)'
          ], 'General usage')
          
          const usage = extractInfo([
            'usage[:\\s-]*([^\\n]+(?:\\n(?!\\w+:)[^\\n]+)*)',
            'used[:\\s-]*([^\\n]+)',
            'context[:\\s-]*([^\\n]+)'
          ], 'Common usage')
          
          const example = extractInfo([
            'example[:\\s-]*([^\\n]+(?:\\n(?!\\w+:)[^\\n]+)*)',
            'e\\.g\\.?[:\\s-]*([^\\n]+)',
            '"([^"]+)"'
          ], 'No example available')
          
          structured.push({
            word: word.trim(),
            definition,
            meaningType,
            usage,
            example
          })
        }
      })
      
      return structured
    }
    
    // Try structured parsing first
    const structured = tryParseStructured(response)
    
    // If we got good results for most words, use structured
    if (structured.length >= expectedWords.length * 0.7) {
      // Fill in missing words with fallback
      expectedWords.forEach(word => {
        if (!structured.find(comp => comp.word.toLowerCase() === word.toLowerCase())) {
          structured.push({
            word: word.trim(),
            definition: 'Information not clearly structured in response',
            meaningType: 'General',
            usage: 'See detailed comparison below',
            example: 'Refer to complete analysis'
          })
        }
      })
      return structured
    }
    
    // Fallback: create basic entries pointing to full response
    return expectedWords.map(word => ({
      word: word.trim(),
      definition: 'See detailed comparison below',
      meaningType: 'Comparison available',
      usage: 'Check full analysis section',
      example: 'Examples provided in complete response'
    }))
  }

  const compareWords = async () => {
    if (!words.trim()) {
      toast.error('Please enter at least two words to compare')
      return
    }

    setLoading(true)
    setComparisons([])
    setRawComparison('')

    try {
      const apiService = new GeminiApiService(apiKey)
      const processedWordList = processWordList(words)
      
      if (processedWordList.length < 2) {
        toast.error('Please enter at least two words to compare')
        setLoading(false)
        return
      }
      
      const wordList = processedWordList.join(', ')

      const getLevelInstruction = (level: string) => {
        switch (level) {
          case '5yrs-old':
            return 'Explain differences using very simple words that a 5-year-old would understand. Use everyday examples and avoid complex terms.'
          case 'Proficient':
            return 'Provide sophisticated analysis with nuanced distinctions, detailed etymological information, and advanced usage contexts.'
          default:
            return 'Use clear, standard explanations suitable for intermediate English learners.'
        }
      }

      const prompt = `Compare and explain the differences between the following words: ${wordList}

${getLevelInstruction(englishLevel)}

For each word, provide:

A concise definition (adjusted for the specified level)

The type of meaning (e.g., physical, emotional, abstract, metaphorical)

Typical usage or contexts

One clear example sentence

Then, summarize the key difference(s) between each pair.

Format Requirements:

Group all words together in a summary comparison table at the end (optional but preferred)

Use plain text only — no HTML tags

Separate each word's section with one blank line

Separate each pairwise comparison with two blank lines

Keep the tone clear, informative, and easy to understand`

      const text = await apiService.generateContent(prompt)
      const parsedComparisons = parseComparisons(text, processedWordList)
      
      // Always show the raw comparison for this type
      setRawComparison(text)
      
      if (parsedComparisons.length > 0) {
        setComparisons(parsedComparisons)
        toast.success(`Successfully compared ${parsedComparisons.length} word(s)!`)
      } else {
        toast.success('Comparison completed! View the detailed analysis below.')
      }
    } catch (error: any) {
      console.error('Error comparing words:', error)
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('Invalid API key')) {
        toast.error('Invalid API key. Please check your Gemini API key.')
      } else {
        toast.error(`Error: ${error.message || 'Failed to compare words. Please try again.'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadComparison = () => {
    if (!rawComparison) {
      toast.error('No comparison to download')
      return
    }

    const content = `Word Comparison Analysis\n\n${rawComparison}`
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
      {/* Input */}
      <div className="space-y-4">
        <Textarea
          placeholder="Enter words to compare, separated by commas (e.g., happy, joyful, ecstatic)"
          value={words}
          onChange={(e) => setWords(e.target.value)}
          className="min-h-[100px] bg-background/50 resize-none"
        />
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={compareWords} 
            disabled={loading}
            className="flex-1 min-w-[200px] bg-mode-compare-accent hover:bg-mode-compare-accent/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Comparing Words...
              </>
            ) : (
              <>
                <Scale className="h-4 w-4" />
                Compare Words
              </>
            )}
          </Button>
          
          {rawComparison && (
            <Button
              variant="outline"
              onClick={downloadComparison}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Individual Word Analysis Cards */}
      {comparisons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Scale className="h-5 w-5 text-mode-compare-accent" />
              Word Analysis ({comparisons.length})
            </h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {comparisons.map((comparison, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 shadow-elegant hover:shadow-elegant-hover transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-foreground capitalize flex items-center gap-2">
                    {comparison.word}
                    <Badge variant="secondary" className="bg-mode-compare-accent/10 text-mode-compare-accent">
                      {comparison.meaningType}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-foreground">Definition:</h4>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      {comparison.definition}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-foreground">Usage Context:</h4>
                    <p className="text-muted-foreground text-sm">
                      {comparison.usage}
                    </p>
                  </div>
                  
                  <div className="bg-mode-compare-accent/5 p-3 rounded-lg border border-mode-compare-accent/20">
                    <h4 className="font-semibold text-sm mb-1 text-foreground">Example:</h4>
                    <p className="text-foreground/80 text-sm italic">
                      "{comparison.example}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Full Comparison Analysis */}
      {rawComparison && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Scale className="h-5 w-5 text-mode-compare-accent" />
              Detailed Comparison Analysis
            </h3>
          </div>
          
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg">Complete Analysis</CardTitle>
              <CardDescription>
                Detailed comparison including differences and relationships between words
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background/50 p-4 rounded-lg border border-border/50 max-h-[500px] overflow-y-auto">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {rawComparison}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}