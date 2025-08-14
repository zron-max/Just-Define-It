import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Key, Lightbulb } from 'lucide-react'
import { saveApiKey } from './shared/utils'

interface ApiKeyInputProps {
  onApiKeySaved: (apiKey: string) => void
  onCancel?: () => void
  initialApiKey?: string
}

export default function ApiKeyInput({ onApiKeySaved, onCancel, initialApiKey = '' }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState(initialApiKey)

  const handleSaveApiKey = () => {
    if (saveApiKey(apiKey)) {
      onApiKeySaved(apiKey)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Enter API Key</CardTitle>
          <CardDescription>
            Enter your Google Gemini API key to start using the word tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter your Gemini API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-background/50"
            onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
          />
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Get your API key from the{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={handleSaveApiKey} className="flex-1">
              Save API Key
            </Button>
            {onCancel && apiKey && (
              <Button 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}