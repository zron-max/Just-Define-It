import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, ScrollText, Languages, History, CalendarClock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { GeminiApiService } from './shared/apiService'

// --- TypeScript interface for the expected JSON structure ---
interface EtymologyData {
    word: string;
    languageOfOrigin: string;
    rootWord: string;
    firstKnownUse: string;
    explanation: string;
    timeline: {
        period: string;
        change: string;
    }[];
}

interface EtymologyFinderProps {
    apiKey: string;
}

// --- Main Component ---
export default function EtymologyFinder({ apiKey }: EtymologyFinderProps) {
    const [word, setWord] = useState('')
    const [result, setResult] = useState<EtymologyData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const findEtymology = async () => {
        if (!word.trim()) {
            toast.error('Please enter a word to trace.')
            return
        }

        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const apiService = new GeminiApiService(apiKey)

            const prompt = `
      Analyze the etymology of the word "${word.trim()}".
      
      You MUST return your response as a single, minified JSON object. 
      Do NOT include any text, notes, or markdown formatting outside of the JSON object.
      
      The JSON object must match this exact structure:
      {
        "word": "${word.trim()}",
        "languageOfOrigin": "e.g., Latin, Old French",
        "rootWord": "The original root word and its meaning",
        "firstKnownUse": "e.g., 14th Century",
        "explanation": "A concise, engaging story about the word's journey.",
        "timeline": [
          { "period": "e.g., 12th Century", "change": "Description of the word's form and meaning during this period." },
          { "period": "e.g., 14th Century", "change": "Description of its entry into English and any changes." }
        ]
      }
      `

            const text = await apiService.generateContent(prompt)

            // Attempt to parse the JSON response
            const parsedResult: EtymologyData = JSON.parse(text)
            setResult(parsedResult)
            toast.success(`Successfully traced the history of "${parsedResult.word}"!`)

        } catch (e: any) {
            console.error('Etymology parsing error:', e)
            const errorMessage = "The AI's response was not in the expected format. Please try again."
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-card border-border/50 shadow-elegant">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ScrollText className="h-5 w-5 text-primary" />
                        Etymology Finder
                    </CardTitle>
                    <CardDescription>
                        Enter a single word to uncover its origin, history, and the story of how it came to be.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., serendipity"
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                            className="bg-background/50 h-10"
                            onKeyDown={(e) => { if (e.key === 'Enter') findEtymology() }}
                        />
                        <Button onClick={findEtymology} disabled={loading} className="h-10">
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <History className="mr-2 h-4 w-4" />
                            )}
                            Trace History
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence mode="wait">
                {loading && <EtymologySkeletonCard key="loader" />}
                {result && <EtymologyResultCard key="result" data={result} />}
                {!loading && !result && <EmptyState key="empty" error={error} />}
            </AnimatePresence>
        </div>
    )
}


// --- UI Sub-components ---

const EtymologyResultCard = ({ data }: { data: EtymologyData }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <Card className="bg-gradient-card border-border/50 shadow-elegant overflow-hidden">
            <CardHeader>
                <CardTitle className="text-2xl font-bold capitalize">Origin of "{data.word}"</CardTitle>
                <CardDescription>{data.explanation}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <InfoBlock icon={Languages} label="Origin" value={data.languageOfOrigin} />
                    <InfoBlock icon={ScrollText} label="Root Word" value={data.rootWord} />
                    <InfoBlock icon={CalendarClock} label="First Known Use" value={data.firstKnownUse} />
                </div>
                <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><History className="h-4 w-4" /> Timeline of Changes</h3>
                    <div className="relative pl-6 space-y-6 border-l-2 border-dashed border-border/80">
                        {data.timeline.map((item, index) => (
                            <div key={index} className="relative">
                                <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary/20 border-4 border-background" />
                                <p className="font-semibold text-primary">{item.period}</p>
                                <p className="text-sm text-muted-foreground">{item.change}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
)

const InfoBlock = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
        <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
        <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
    </div>
)

const EtymologySkeletonCard = () => (
    <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
            <Skeleton className="h-8 w-3/5" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-12 w-full" />
            </div>
        </CardContent>
    </Card>
)

const EmptyState = ({ error }: { error: string | null }) => (
    <div className="text-center py-16 px-6 border-2 border-dashed border-border/50 rounded-lg bg-background/20">
        {error ? (
            <>
                <div className="mx-auto h-12 w-12 text-destructive"><AlertCircle /></div>
                <h3 className="mt-2 text-lg font-semibold text-destructive">An Error Occurred</h3>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </>
        ) : (
            <>
                <div className="mx-auto h-12 w-12 text-muted-foreground"><History /></div>
                <h3 className="mt-2 text-lg font-semibold">Trace a Word's History</h3>
                <p className="mt-1 text-sm text-muted-foreground">The story of your word will appear here once you trace its history.</p>
            </>
        )}
    </div>
)