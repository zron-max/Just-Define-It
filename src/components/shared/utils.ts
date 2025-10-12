import { toast } from 'sonner'

export const saveApiKey = (apiKey: string): boolean => {
  if (!apiKey.trim()) {
    toast.error('Please enter a valid API key')
    return false
  }
  localStorage.setItem('gemini-api-key', apiKey)
  toast.success('API key saved successfully!')
  return true
}

export const getApiKey = (): string => {
  return localStorage.getItem('gemini-api-key') || ''
}

export const speakWord = (word: string): void => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.volume = 1
    speechSynthesis.speak(utterance)
  } else {
    toast.error('Speech synthesis not supported in this browser')
  }
}