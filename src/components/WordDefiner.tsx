import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Key, Settings, ArrowRightLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getApiKey } from './shared/utils'
import { PromptType } from './shared/types'
import DefineWords from './DefineWords'
import CompareWords from './CompareWords'
import FindSynonyms from './FindSynonyms'
import ApiKeyInput from './ApiKeyInput'
import ToolSwitcher from './ToolSwitcher'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

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
        onCancel={() => apiKey && setShowApiKeyInput(false)}
        initialApiKey={apiKey || ''}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50 shadow-elegant overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <a href= "https://t.me/DefineCraft" className="font-semibold text-foreground">DefineCraft Tools</a>
          </CardTitle>
          <CardDescription>
            Choose a tool and configure its options to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select tool:</Label>
            <ToolSwitcher activeTool={promptType} onToolChange={setPromptType} />
          </div>

          <div className="space-y-4 rounded-lg border border-border/50 p-4 bg-background/20">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Options
            </Label>
            <div className="space-y-2">
              <Label htmlFor="english-level" className="text-xs font-medium text-muted-foreground">
                English Level
              </Label>
              <Select value={englishLevel} onValueChange={setEnglishLevel}>
                <SelectTrigger id="english-level" className="w-full bg-background/50">
                  <SelectValue placeholder="Select your English level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5yrs-old">5-year-old (Simple)</SelectItem>
                  <SelectItem value="Average">
                    <div className="flex items-center justify-between w-full">
                      <span>Average (Standard)</span>
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 font-semibold">
                        Recommended
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="Proficient">Proficient (Advanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowApiKeyInput}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Key className="h-4 w-4" />
                Manage API Key
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={promptType}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {promptType === 'define' && <DefineWords apiKey={apiKey || ''} englishLevel={englishLevel} />}
            {promptType === 'difference' && <CompareWords apiKey={apiKey || ''} englishLevel={englishLevel} />}
            {promptType === 'synonyms' && <FindSynonyms apiKey={apiKey || ''} englishLevel={englishLevel} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}