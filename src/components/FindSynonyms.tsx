import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Download, Sparkles, Hash } from 'lucide-react'
import { toast } from 'sonner'
import { GeminiApiService, processWordList } from './shared/apiService'
import { SynonymData } from './shared/types'

interface FindSynonymsProps {
  apiKey: string
  englishLevel: string
}

export default function FindSynonyms({ apiKey, englishLevel }: FindSynonymsProps) {
  const [words, setWords] = useState('')
  const [synonyms, setSynonyms] = useState<SynonymData[]>([])
  const [loading, setLoading] = useState(false)

  const parseSynonyms = (response: string, expectedWords: string[]): SynonymData[] => {
    const synonymData: SynonymData[] = []
    
    const tryParseStructured = (text: string): SynonymData[] => {
      const structured: SynonymData[] = []
      
      expectedWords.forEach(word => {
        // Look for word sections with flexible patterns
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
          
          // Extract synonyms with multiple strategies
          const extractSynonyms = (): string[] => {
            const patterns = [
              /synonyms?[:\-\s]*([^\n]+(?:\n(?![\w\s]*:)[^\n]+)*)/i,
              /similar\s+words?[:\-\s]*([^\n]+)/i,
              /alternatives?[:\-\s]*([^\n]+)/i,
              /other\s+words?[:\-\s]*([^\n]+)/i
            ]
            
            for (const pattern of patterns) {
              const match = section.match(pattern)
              if (match && match[1]) {
                const synonymsText = match[1].replace(/\n/g, ' ')
                const synonyms = synonymsText
                  .split(/[,;]|\s+and\s+|\s+or\s+|\s*\|\s*/)
                  .map(s => s.trim().replace(/[^\w\s-']/g, '').trim())
                  .filter(s => s && s.length > 1 && s.toLowerCase() !== word.toLowerCase())
                  .slice(0, 8)
                
                if (synonyms.length > 0) return synonyms
              }
            }
            
            // Try to extract from any line that contains multiple words
            const lines = section.split('\n')
            for (const line of lines) {
              if (line.includes(',') || line.includes(';')) {
                const words = line
                  .split(/[,;]/)
                  .map(s => s.trim().replace(/[^\w\s-']/g, '').trim())
                  .filter(s => s && s.length > 1 && s.toLowerCase() !== word.toLowerCase())
                
                if (words.length >= 2) return words.slice(0, 6)
              }
            }
            
            return []
          }
          
          const synonyms = extractSynonyms()
          
          // Extract explanation
          const extractExplanation = (): string => {
            const patterns = [
              /explanation[:\-\s]*([^\n]+(?:\n(?![\w\s]*:)[^\n]+)*)/i,
              /note[:\-\s]*([^\n]+)/i,
              /description[:\-\s]*([^\n]+)/i
            ]
            
            for (const pattern of patterns) {
              const match = section.match(pattern)
              if (match && match[1]?.trim()) {
                return match[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ')
              }
            }
            
            return synonyms.length > 0 
              ? `Alternative words for "${word}" with similar meanings.`
              : `Synonym information for "${word}" - see complete analysis below.`
          }
          
          // Extract examples
          const extractExample = (type: 'original' | 'synonym'): string => {
            const patterns = type === 'original' 
              ? [/(?:original|example)[:\-\s]*([^\n]+)/i, /e\.g\.?[:\-\s]*([^\n]+)/i]
              : [/(?:synonym\s+example|alternative)[:\-\s]*([^\n]+)/i, /instead[:\-\s]*([^\n]+)/i]
            
            for (const pattern of patterns) {
              const match = section.match(pattern)
              if (match && match[1]?.trim()) {
                return match[1].trim()
              }
            }
            
            return type === 'original' 
              ? `Example sentence using "${word}"`
              : 'Alternative example not provided'
          }
          
          structured.push({
            word: word.trim(),
            synonyms: synonyms.length > 0 ? synonyms : [`Related to ${word}`],
            explanation: extractExplanation(),
            originalExample: extractExample('original'),
            synonymExample: extractExample('synonym')
          })
        }
      })
      
      return structured
    }
    
    // Try structured parsing
    const structured = tryParseStructured(response)
    
    // If we got good results for most words, use structured
    if (structured.length >= expectedWords.length * 0.7) {
      // Fill in missing words
      expectedWords.forEach(word => {
        if (!structured.find(syn => syn.word.toLowerCase() === word.toLowerCase())) {
          structured.push({
            word: word.trim(),
            synonyms: ['See detailed analysis below'],
            explanation: 'Comprehensive synonym information available in the complete response.',
            originalExample: 'Check full response for examples',
            synonymExample: 'Refer to complete analysis'
          })
        }
      })
      return structured
    }
    
    // Fallback: create basic entries
    return expectedWords.map(word => ({
      word: word.trim(),
      synonyms: ['Detailed in full response'],
      explanation: 'Complete synonym analysis provided below - structured parsing unavailable.',
      originalExample: 'Examples available in full response',
      synonymExample: 'See complete analysis for alternatives'
    }))
  }

  const findSynonyms = async () => {
    if (!words.trim()) {
      toast.error('Please enter at least one word')
      return
    }

    setLoading(true)
    setSynonyms([])

    try {
      const apiService = new GeminiApiService(apiKey)
      const processedWordList = processWordList(words)
      const wordList = processedWordList.join(', ')

      const getLevelInstruction = (level: string) => {
        switch (level) {
          case '5yrs-old':
            return 'Provide simple synonyms that a 5-year-old would understand. Use basic words and simple explanations about when to use each word.'
          case 'Proficient':
            return 'Include sophisticated synonyms with subtle distinctions, advanced usage contexts, and detailed explanations of connotative differences.'
          default:
            return 'Provide standard synonyms with clear explanations suitable for intermediate English learners.'
        }
      }

      const prompt = `Provide 3–5 close synonyms for each word in the following list: ${wordList}

${getLevelInstruction(englishLevel)}

For each word, format your response like this (repeat for all ${processedWordList.length} words):

word | synonyms
synonym1, synonym2, synonym3, synonym4, synonym5

A brief explanation of how these synonyms differ in tone, usage, or context (plain language only)

One example sentence using the original word

One example sentence using a synonym in a similar context

Formatting rules:

Use plain text only (NO HTML tags)

Separate each word block with TWO blank lines

Make the tone clear, helpful, and concise`

      const text = await apiService.generateContent(prompt)
      const parsedSynonyms = parseSynonyms(text, processedWordList)
      
      if (parsedSynonyms.length === 0) {
        // Fallback: create basic synonym data from raw response
        const fallbackSynonyms: SynonymData[] = processedWordList.map(word => ({
          word: word.toLowerCase(),
          synonyms: [],
          explanation: `AI response parsing failed. Raw response: ${text.slice(0, 200)}...`,
          originalExample: 'No example available',
          synonymExample: 'No example available'
        }))
        setSynonyms(fallbackSynonyms)
        toast.error('Parsing failed, showing raw response. Please try again.')
      } else {
        setSynonyms(parsedSynonyms)
        toast.success(`Successfully found synonyms for ${parsedSynonyms.length} word(s)!`)
      }
    } catch (error: any) {
      console.error('Error finding synonyms:', error)
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('Invalid API key')) {
        toast.error('Invalid API key. Please check your Gemini API key.')
      } else {
        toast.error(`Error: ${error.message || 'Failed to find synonyms. Please try again.'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadSynonyms = () => {
    if (synonyms.length === 0) {
      toast.error('No synonyms to download')
      return
    }

    let content = 'Word Synonyms\n\n'
    synonyms.forEach((syn, index) => {
      content += `${index + 1}. ${syn.word}\n`
      content += `   Synonyms: ${syn.synonyms.join(', ')}\n`
      content += `   Explanation: ${syn.explanation}\n`
      content += `   Original Example: ${syn.originalExample}\n`
      content += `   Synonym Example: ${syn.synonymExample}\n\n`
    })

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

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <Textarea
          placeholder="Enter words to find synonyms for, separated by commas (e.g., happy, beautiful, smart)"
          value={words}
          onChange={(e) => setWords(e.target.value)}
          className="min-h-[100px] bg-background/50 resize-none"
        />
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={findSynonyms} 
            disabled={loading}
            className="flex-1 min-w-[200px] bg-mode-synonyms-accent hover:bg-mode-synonyms-accent/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding Synonyms...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Find Synonyms
              </>
            )}
          </Button>
          
          {synonyms.length > 0 && (
            <Button
              variant="outline"
              onClick={downloadSynonyms}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {synonyms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-mode-synonyms-accent" />
              Synonyms ({synonyms.length})
            </h3>
          </div>
          
          <div className="grid gap-6 max-h-[600px] overflow-y-auto pr-2">
            {synonyms.map((synonym, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 shadow-elegant hover:shadow-elegant-hover transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-foreground capitalize flex items-center gap-2">
                    {synonym.word}
                    <Badge variant="secondary" className="bg-mode-synonyms-accent/10 text-mode-synonyms-accent">
                      <Hash className="h-3 w-3 mr-1" />
                      {synonym.synonyms.length} synonyms
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Synonyms Grid */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-foreground">Synonyms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {synonym.synonyms.map((syn, synIndex) => (
                        <Badge 
                          key={synIndex} 
                          variant="outline"
                          className="bg-mode-synonyms-accent/5 border-mode-synonyms-accent/30 text-foreground hover:bg-mode-synonyms-accent/10 transition-colors"
                        >
                          {syn}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Explanation */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-foreground">Usage Notes:</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {synonym.explanation}
                    </p>
                  </div>
                  
                  {/* Examples */}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="bg-mode-synonyms-accent/5 p-3 rounded-lg border border-mode-synonyms-accent/20">
                      <h5 className="font-semibold text-xs mb-1 text-foreground uppercase tracking-wide">Original Word:</h5>
                      <p className="text-foreground/80 text-sm italic">
                        {synonym.originalExample}
                      </p>
                    </div>
                    
                    <div className="bg-mode-synonyms-accent/10 p-3 rounded-lg border border-mode-synonyms-accent/30">
                      <h5 className="font-semibold text-xs mb-1 text-foreground uppercase tracking-wide">Using Synonym:</h5>
                      <p className="text-foreground/80 text-sm italic">
                        {synonym.synonymExample}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}