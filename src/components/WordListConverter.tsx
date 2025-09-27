import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

type ConversionMode = 'list-to-comma' | 'comma-to-list';

export default function WordListConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [conversionMode, setConversionMode] = useState<ConversionMode>('list-to-comma');

  const convert = (text: string, mode: ConversionMode) => {
    if (!text.trim()) {
      setOutput('');
      return;
    }

    if (mode === 'list-to-comma') {
      const words = text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
      setOutput(words.join(', '));
    } else {
      const words = text.split(',').map(word => word.trim()).filter(word => word.length > 0);
      setOutput(words.join('\n'));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    convert(newInput, conversionMode);
  };

  const swapConversion = () => {
    setConversionMode(prevMode => (prevMode === 'list-to-comma' ? 'comma-to-list' : 'list-to-comma'));
    setInput(output);
    setOutput(input);
    toast.info('Conversion direction swapped');
  };

  const copyOutput = async () => {
    if (!output) {
      toast.error('No output to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      toast.success('Output copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy output');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    toast.success('Fields cleared');
  };

  const getWordCount = () => {
    if (!input.trim()) return 0;
    const separator = conversionMode === 'list-to-comma' ? '\n' : ',';
    return input.split(separator).filter(word => word.trim()).length;
  };

  const isListToComma = conversionMode === 'list-to-comma';
  const inputLabel = isListToComma ? 'Input (one word per line)' : 'Input (comma-separated)';
  const outputLabel = isListToComma ? 'Output (comma-separated)' : 'Output (one word per line)';
  const inputPlaceholder = isListToComma ? "apple\nbanana\ncherry" : "apple, banana, cherry";
  const outputPlaceholder = isListToComma ? "apple, banana, cherry" : "apple\nbanana\ncherry";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Input Section */}
        <div className="space-y-2">
          <label htmlFor="inputArea" className="text-sm font-medium text-foreground">
            {inputLabel}
          </label>
          <Textarea
            id="inputArea"
            placeholder={inputPlaceholder}
            value={input}
            onChange={handleInputChange}
            className="bg-background/50 min-h-[120px] resize-none"
            rows={5}
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button onClick={swapConversion} variant="ghost" size="icon" aria-label="Swap conversion direction">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </Button>
        </div>

        {/* Output Section */}
        <div className="space-y-2">
          <label htmlFor="outputArea" className="text-sm font-medium text-foreground">
            {outputLabel}
          </label>
          <Textarea
            id="outputArea"
            value={output}
            readOnly
            className="bg-muted/30 min-h-[120px] resize-none cursor-default"
            rows={5}
            placeholder={outputPlaceholder}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={copyOutput} disabled={!output} variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          Copy Output
        </Button>
        <Button onClick={clearAll} disabled={!input && !output} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      {/* Stats */}
      {input && (
        <div className="text-xs text-muted-foreground pt-2">
          {getWordCount()} words detected in input
        </div>
      )}
    </div>
  );
}