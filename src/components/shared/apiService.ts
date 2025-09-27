import { GoogleGenerativeAI } from '@google/generative-ai'

export class GeminiApiService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
  }

  async generateContent(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt)
    const response = await result.response
    return response.text()
  }
}

export const processWordList = (words: string): string[] => {
  return words
    .split(',')
    .map(w => w.trim())
    .filter(w => w)
}