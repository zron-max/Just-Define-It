import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Key, Lightbulb, CheckCircle, ShieldCheck } from 'lucide-react'
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
    // Full-screen overlay for a modal-like experience
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-sm md:max-w-4xl grid md:grid-cols-2 shadow-elegant overflow-hidden rounded-xl">

        {/* --- Left Panel: Informational/Branding --- */}
        <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-primary text-primary-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 mb-6">
            <Key className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Secure Your Access</h2>
          <p className="text-primary-foreground/80 mb-6">
            Your Google Gemini API key unlocks the full potential of DefineCraft, enabling powerful AI features.
          </p>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary-foreground/60 shrink-0" />
              <span>Access to all AI-powered word tools</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary-foreground/60 shrink-0" />
              <span>Personalized and faster responses</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary-foreground/60 shrink-0" />
              <span>Your key is stored securely in your browser</span>
            </div>
          </div>
        </div>

        {/* --- Right Panel: Input Form --- */}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl">Enter Your API Key</CardTitle>
            <CardDescription>
              Get your key from Google AI Studio to begin.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            <Input
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-background/50 h-11"
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
                  className="font-semibold text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={handleSaveApiKey} className="flex-1">
                Save & Continue
              </Button>
              {/* The Cancel button now shows if an API key was previously set */}
              {onCancel && initialApiKey && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}