import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Triangle, Scale, Sparkles, Key, GraduationCap } from 'lucide-react'
import { getApiKey } from './shared/utils'
import { PromptType } from './shared/types'
import DefineWords from './DefineWords'
import CompareWords from './CompareWords'
import FindSynonyms from './FindSynonyms'
import ApiKeyInput from './ApiKeyInput'

export default function WordDefiner() {
  const [apiKey, setApiKey] = useState(() => getApiKey())
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey)
  const [promptType, setPromptType] = useState<PromptType>('define')
  const [englishLevel, setEnglishLevel] = useState<string>('Average')

  const handleApiKeySaved = (newApiKey: string) => {
    setApiKey(newApiKey)
    setShowApiKeyInput(false)
  }

  const handleShowApiKeyInput = () => {
    setShowApiKeyInput(true)
  }

  if (showApiKeyInput) {
    return (
      <ApiKeyInput 
        onApiKeySaved={handleApiKeySaved}
        onCancel={() => setShowApiKeyInput(false)}
        initialApiKey={apiKey}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Switcher Section */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            DefineCraft Tools
          </CardTitle>
          <CardDescription>
            Choose your tool: define words, compare differences, or find synonyms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab Switcher */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Select tool:</Label>
            <div className="relative">
              {/* Background glow effect based on active mode */}
              <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                promptType === 'define' ? 'bg-mode-define-bg/20' :
                promptType === 'difference' ? 'bg-mode-compare-bg/20' :
                'bg-mode-synonyms-bg/20'
              }`} />
              
              {/* Floating mode indicator */}
              <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 animate-float ${
                promptType === 'define' ? 'bg-mode-define-accent text-white' :
                promptType === 'difference' ? 'bg-mode-compare-accent text-white' :
                'bg-mode-synonyms-accent text-white'
              }`}>
                {promptType === 'define' && <Triangle className="h-3 w-3" />}
                {promptType === 'difference' && <Scale className="h-3 w-3" />}
                {promptType === 'synonyms' && <Sparkles className="h-3 w-3" />}
              </div>
              
              {/* Tab buttons */}
              <div className="relative bg-card/50 backdrop-blur-sm rounded-xl p-2 border border-border/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Define Words Tab */}
                  <button
                    onClick={() => setPromptType('define')}
                    className={`group relative flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      promptType === 'define' 
                        ? 'bg-mode-define-accent text-white shadow-lg transform scale-[1.02]' 
                        : 'bg-background hover:bg-mode-define-hover border border-border/50 text-foreground hover:scale-[1.01] hover:shadow-md'
                    }`}
                  >
                    <div className={`transition-all duration-300 ${
                      promptType === 'define' ? 'animate-pulse-glow' : 'group-hover:animate-wiggle'
                    }`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">Define Words</div>
                      <div className={`text-xs opacity-80 ${promptType === 'define' ? 'text-white/80' : 'text-muted-foreground'}`}>
                        Get detailed definitions
                      </div>
                    </div>
                  </button>

                  {/* Compare Differences Tab */}
                  <button
                    onClick={() => setPromptType('difference')}
                    className={`group relative flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      promptType === 'difference' 
                        ? 'bg-mode-compare-accent text-white shadow-lg transform scale-[1.02]' 
                        : 'bg-background hover:bg-mode-compare-hover border border-border/50 text-foreground hover:scale-[1.01] hover:shadow-md'
                    }`}
                  >
                    <div className={`transition-all duration-300 ${
                      promptType === 'difference' ? 'animate-pulse-glow' : 'group-hover:animate-wiggle'
                    }`}>
                      <Scale className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">Compare Words</div>
                      <div className={`text-xs opacity-80 ${promptType === 'difference' ? 'text-white/80' : 'text-muted-foreground'}`}>
                        Find key differences
                      </div>
                    </div>
                  </button>

                  {/* Find Synonyms Tab */}
                  <button
                    onClick={() => setPromptType('synonyms')}
                    className={`group relative flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      promptType === 'synonyms' 
                        ? 'bg-mode-synonyms-accent text-white shadow-lg transform scale-[1.02]' 
                        : 'bg-background hover:bg-mode-synonyms-hover border border-border/50 text-foreground hover:scale-[1.01] hover:shadow-md'
                    }`}
                  >
                    <div className={`transition-all duration-300 ${
                      promptType === 'synonyms' ? 'animate-pulse-glow' : 'group-hover:animate-wiggle'
                    }`}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">Find Synonyms</div>
                      <div className={`text-xs opacity-80 ${promptType === 'synonyms' ? 'text-white/80' : 'text-muted-foreground'}`}>
                        Discover alternatives
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* English Level Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              English Level:
            </Label>
            <Select value={englishLevel} onValueChange={setEnglishLevel}>
              <SelectTrigger className="w-full bg-background/50">
                <SelectValue placeholder="Select your English level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5yrs-old">5yrs-old (Simple explanations)</SelectItem>
                <SelectItem value="Average">Average (Standard explanations)</SelectItem>
                <SelectItem value="Proficient">Proficient (Advanced explanations)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key Button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={handleShowApiKeyInput}
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Component Based on Selected Tab */}
      {promptType === 'define' && <DefineWords apiKey={apiKey} englishLevel={englishLevel} />}
      {promptType === 'difference' && <CompareWords apiKey={apiKey} englishLevel={englishLevel} />}
      {promptType === 'synonyms' && <FindSynonyms apiKey={apiKey} englishLevel={englishLevel} />}
    </div>
  )
}