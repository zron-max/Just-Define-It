import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Download, ExternalLink, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { GeminiApiService, processWordList } from './shared/apiService'
import { speakWord } from './shared/utils'
import { WordDefinition } from './shared/types'

interface DefineWordsProps {
  apiKey: string
  englishLevel: string
}

export default function DefineWords({ apiKey, englishLevel }: DefineWordsProps) {
  const [words, setWords] = useState('')
  const [definitions, setDefinitions] = useState<WordDefinition[]>([])
  const [loading, setLoading] = useState(false)

  const parseDefinitions = (response: string, expectedWords: string[]): WordDefinition[] => {
    const definitions: WordDefinition[] = []
    
    // Split response into blocks for each word definition
    const blocks = response.split(/\n\s*\n/).filter(block => block.trim())
    
    blocks.forEach((block, index) => {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line)
      if (lines.length === 0) return
      
      let word = expectedWords[index] || ''
      let partOfSpeech = ''
      let ukPhonetic = ''
      let usPhonetic = ''
      let definition = ''
      let examples: string[] = []
      
      let lineIndex = 0
      
      // Parse line by line in order
      for (const line of lines) {
        lineIndex++
        
        // First line: word | part of speech
        if (lineIndex === 1 && line.includes('|')) {
          const parts = line.split('|')
          word = parts[0].trim().toLowerCase()
          partOfSpeech = parts[1] ? parts[1].trim() : ''
        }
        
        // Second line: phonetics
        else if (lineIndex === 2 && line.match(/uk\s*\/[^/]+\/.*us\s*\/[^/]+\//i)) {
          const ukMatch = line.match(/uk\s*\/([^/]+)\//i)
          const usMatch = line.match(/us\s*\/([^/]+)\//i)
          ukPhonetic = ukMatch ? ukMatch[1] : ''
          usPhonetic = usMatch ? usMatch[1] : ''
        }
        
        // Third line: definition (should be the main definition text)
        else if (lineIndex === 3 && !line.startsWith('-') && line.length > 3) {
          definition = line.trim()
        }
        
        // Examples: lines starting with dash
        else if (line.startsWith('-')) {
          examples.push(line.substring(1).trim())
        }
        
        // If definition is still empty, try to get it from any non-example line
        else if (!definition && !line.startsWith('-') && line.length > 3 && !line.includes('|')) {
          definition = line.trim()
        }
      }
      
      // Clean up definition - remove HTML tags and invalid content
      if (definition) {
        definition = definition
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&nbsp;/g, ' ') // Replace HTML entities
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim()
        
        // If definition is just HTML remnants or too short, mark as unavailable
        if (definition.length < 5 || definition.match(/^(br|p|div|span)$/i)) {
          definition = 'Definition not available'
        }
      }
      
      // Use expected word if parsing failed to extract it
      if (!word && expectedWords[index]) {
        word = expectedWords[index].toLowerCase()
      }
      
      // If we have essential info, add the definition
      if (word) {
        definitions.push({
          word,
          partOfSpeech,
          ukPhonetic,
          usPhonetic,
          level: '',
          definition: definition || 'Definition not available',
          examples
        })
      }
    })
    
    return definitions
  }

  const defineWords = async () => {
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
- NO HTML tags like <br>, <p>, etc.
- NO special formatting in definition text
- Only plain text definitions`

      const text = await apiService.generateContent(prompt)
      const parsedDefinitions = parseDefinitions(text, processedWordList)
      
      if (parsedDefinitions.length === 0) {
        // Fallback: create basic definitions from the raw response
        const fallbackDefinitions: WordDefinition[] = processedWordList.map(word => ({
          word: word.toLowerCase(),
          partOfSpeech: '',
          ukPhonetic: '',
          usPhonetic: '',
          level: '',
          definition: `AI response parsing failed. Raw response: ${text.slice(0, 300)}...`,
          examples: []
        }))
        setDefinitions(fallbackDefinitions)
        toast.error('Parsing failed, showing raw response. Please try again.')
      } else {
        setDefinitions(parsedDefinitions)
        toast.success(`Successfully defined ${parsedDefinitions.length} word(s)!`)
      }
    } catch (error: any) {
      console.error('Error defining words:', error)
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('Invalid API key')) {
        toast.error('Invalid API key. Please check your Gemini API key.')
      } else if (error.message?.includes('models/gemini-pro is not found')) {
        toast.error('Model not found. Please check your API key permissions.')
      } else {
        toast.error(`Error: ${error.message || 'Failed to define words. Please try again.'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadDefinitions = () => {
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
      if (def.level) {
        content += `   Level: ${def.level}\n`
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
      {/* Input */}
      <div className="space-y-4">
        <Textarea
          placeholder="Enter words separated by commas (e.g., apple, banana, cherry)"
          value={words}
          onChange={(e) => setWords(e.target.value)}
          className="min-h-[100px] bg-background/50 resize-none"
        />
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={defineWords} 
            disabled={loading}
            className="flex-1 min-w-[200px] bg-mode-define-accent hover:bg-mode-define-accent/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Defining Words... In Procress.
              </>
            ) : (
              'Define Words'
            )}
          </Button>
          
          {definitions.length > 0 && (
            <Button
              variant="outline"
              onClick={downloadDefinitions}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {definitions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Definitions ({definitions.length})</h3>
          </div>
          
          <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
            {definitions.map((definition, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 shadow-elegant hover:shadow-elegant-hover transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-foreground capitalize flex items-center gap-2">
                        {definition.word}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakWord(definition.word)}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {definition.partOfSpeech && (
                          <Badge variant="secondary" className="text-xs">
                            {definition.partOfSpeech}
                          </Badge>
                        )}
                        {definition.level && (
                          <Badge variant="outline" className="text-xs">
                            {definition.level}
                          </Badge>
                        )}
                      </div>

                      {(definition.ukPhonetic || definition.usPhonetic) && (
                        <CardDescription className="mt-2 font-mono text-sm">
                          {definition.ukPhonetic && `UK: /${definition.ukPhonetic}/`}
                          {definition.ukPhonetic && definition.usPhonetic && ' • '}
                          {definition.usPhonetic && `US: /${definition.usPhonetic}/`}
                        </CardDescription>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <a
                        href={`https://dictionary.cambridge.org/dictionary/learner-english/${encodeURIComponent(definition.word)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-foreground leading-relaxed">
                      {definition.definition}
                    </p>
                  </div>
                  
                  {definition.examples.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-foreground">Examples:</h4>
                        <ul className="space-y-1">
                          {definition.examples.map((example, exampleIndex) => (
                            <li key={exampleIndex} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/20">
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}