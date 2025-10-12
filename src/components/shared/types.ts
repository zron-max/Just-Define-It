export interface WordDefinition {
  word: string
  partOfSpeech: string
  ukPhonetic: string
  usPhonetic: string
  level: string
  definition: string
  examples: string[]
}

export interface ComparisonData {
  word: string
  definition: string
  meaningType: string
  usage: string
  example: string
}

export interface SynonymData {
  word: string
  synonyms: string[]
  explanation: string
  originalExample: string
  synonymExample: string
}

export type PromptType = 'define' | 'difference' | 'synonyms'