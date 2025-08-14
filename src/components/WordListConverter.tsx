import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, RotateCcw, ArrowRightLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function WordListConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  // Real-time conversion
  const convertToCommaList = (text: string) => {
    if (!text.trim()) {
      setOutput('')
      return
    }
    
    const words = text
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0)
    
    const result = words.join(', ')
    setOutput(result)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value
    setInput(newInput)
    convertToCommaList(newInput)
  }

  const copyOutput = async () => {
    if (!output) {
      toast.error('No output to copy')
      return
    }
    
    try {
      await navigator.clipboard.writeText(output)
      toast.success('Output copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy output')
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    toast.success('Fields cleared')
  }

  const handleConvert = () => {
    convertToCommaList(input)
    if (output) {
      toast.success('List converted successfully!')
    }
  }

  return (
    <Card className="bg-gradient-card border-border/50 shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          Word List Converter
        </CardTitle>
        <CardDescription>
          Convert a vertical list of words (one per line) into a comma-separated format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Input (one word per line)
            </label>
            <Textarea
              placeholder="apple&#10;banana&#10;cherry&#10;date"
              value={input}
              onChange={handleInputChange}
              className="bg-background/50 min-h-[120px] resize-none"
              rows={5}
            />
          </div>

          {/* Output Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Output (comma-separated)
            </label>
            <Textarea
              value={output}
              readOnly
              className="bg-muted/30 min-h-[120px] resize-none cursor-default"
              rows={5}
              placeholder="apple, banana, cherry, date"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleConvert}
            disabled={!input.trim()}
            variant="default"
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Convert
          </Button>
          
          <Button 
            onClick={copyOutput}
            disabled={!output}
            variant="outline"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Output
          </Button>
          
          <Button 
            onClick={clearAll}
            disabled={!input && !output}
            variant="outline"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* Stats */}
        {input && (
          <div className="text-xs text-muted-foreground">
            {input.split('\n').filter(word => word.trim()).length} words detected
          </div>
        )}
      </CardContent>
    </Card>
  )
}