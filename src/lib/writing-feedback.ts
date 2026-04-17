// Writing Analysis & Feedback System
// Analyzes student essays and provides structured feedback

export interface WritingFeedback {
  score: number // 0-30 (TOEFL scale)
  wordCount: number
  sentenceCount: number
  avgSentenceLength: number
  paragraphCount: number
  connectorsUsed: string[]
  connectorsScore: number
  vocabularyLevel: string
  grammarIssues: string[]
  structureScore: number
  overallFeedback: string
  suggestions: string[]
}

const ACADEMIC_CONNECTORS = [
  // Addition
  'furthermore', 'moreover', 'in addition', 'additionally', 'also', 'besides',
  // Contrast
  'however', 'nevertheless', 'on the other hand', 'in contrast', 'although', 'despite', 'whereas', 'while',
  // Cause/Effect
  'therefore', 'consequently', 'as a result', 'thus', 'hence', 'because', 'since', 'due to',
  // Example
  'for example', 'for instance', 'such as', 'specifically', 'in particular',
  // Conclusion
  'in conclusion', 'to summarize', 'in summary', 'overall', 'ultimately',
  // Sequence
  'first', 'second', 'third', 'finally', 'firstly', 'secondly', 'next', 'then',
  // Emphasis
  'indeed', 'in fact', 'certainly', 'clearly', 'obviously',
]

const ADVANCED_VOCABULARY = [
  'significant', 'substantial', 'considerable', 'fundamental', 'essential',
  'demonstrate', 'illustrate', 'indicate', 'suggest', 'reveal',
  'impact', 'influence', 'affect', 'contribute', 'facilitate',
  'perspective', 'approach', 'methodology', 'analysis', 'evidence',
  'complex', 'diverse', 'comprehensive', 'contemporary', 'crucial',
  'establish', 'maintain', 'enhance', 'implement', 'evaluate',
  'phenomenon', 'hypothesis', 'theory', 'concept', 'framework',
  'beneficial', 'detrimental', 'prevalent', 'inevitable', 'controversial',
]

const GRAMMAR_PATTERNS = [
  { pattern: /\bi\b(?!['''])/g, issue: "Capitalize 'I' — sempre maiúsculo em inglês" },
  { pattern: /\b(he|she|it) (have|do|go|make|take)\b/gi, issue: "Terceira pessoa: he/she/it + has/does/goes/makes/takes" },
  { pattern: /\b(dont|doesnt|didnt|isnt|arent|wasnt|werent|wont|cant|shouldnt|wouldnt|couldnt)\b/gi, issue: "Use apóstrofo: don't, doesn't, didn't, isn't, etc." },
  { pattern: /\b(alot)\b/gi, issue: "'A lot' são duas palavras, não 'alot'" },
  { pattern: /\b(informations|advices|furnitures|equipments)\b/gi, issue: "Substantivo incontável: não use plural (information, advice, furniture, equipment)" },
  { pattern: /\b(more better|more worse|more bigger|more smaller)\b/gi, issue: "Comparativo duplo: use 'better' (não 'more better')" },
  { pattern: /\b(according me|according my)\b/gi, issue: "Use 'according to me/my'" },
  { pattern: /\b(depend of)\b/gi, issue: "Use 'depend on' (não 'depend of')" },
]

export function analyzeWriting(text: string): WritingFeedback {
  if (!text.trim()) {
    return {
      score: 0, wordCount: 0, sentenceCount: 0, avgSentenceLength: 0,
      paragraphCount: 0, connectorsUsed: [], connectorsScore: 0,
      vocabularyLevel: 'N/A', grammarIssues: [], structureScore: 0,
      overallFeedback: 'Escreva sua resposta para receber feedback.',
      suggestions: [],
    }
  }

  const words = text.trim().split(/\s+/)
  const wordCount = words.length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const sentenceCount = sentences.length
  const avgSentenceLength = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const paragraphCount = paragraphs.length || 1

  // Check connectors
  const textLower = text.toLowerCase()
  const connectorsUsed = ACADEMIC_CONNECTORS.filter(c => textLower.includes(c))
  const connectorsScore = Math.min(10, connectorsUsed.length * 2)

  // Check vocabulary level
  const advancedWordsUsed = ADVANCED_VOCABULARY.filter(w => textLower.includes(w))
  let vocabularyLevel = 'Básico'
  if (advancedWordsUsed.length >= 8) vocabularyLevel = 'Avançado'
  else if (advancedWordsUsed.length >= 4) vocabularyLevel = 'Intermediário-Avançado'
  else if (advancedWordsUsed.length >= 2) vocabularyLevel = 'Intermediário'

  // Check grammar
  const grammarIssues: string[] = []
  for (const gp of GRAMMAR_PATTERNS) {
    if (gp.pattern.test(text)) {
      grammarIssues.push(gp.issue)
    }
    gp.pattern.lastIndex = 0
  }

  // Structure score
  let structureScore = 0
  if (paragraphCount >= 3) structureScore += 3 // Has intro/body/conclusion
  if (paragraphCount >= 4) structureScore += 2 // Multiple body paragraphs
  if (textLower.includes('in conclusion') || textLower.includes('to summarize') || textLower.includes('in summary')) structureScore += 2
  if (textLower.includes('i believe') || textLower.includes('in my opinion') || textLower.includes('i think') || textLower.includes('i agree') || textLower.includes('i disagree')) structureScore += 2
  if (connectorsUsed.length >= 3) structureScore += 1
  structureScore = Math.min(10, structureScore)

  // Calculate score (0-30)
  let score = 0

  // Word count scoring (TOEFL expects 300-400 words)
  if (wordCount >= 300) score += 8
  else if (wordCount >= 200) score += 6
  else if (wordCount >= 150) score += 4
  else if (wordCount >= 100) score += 2
  else score += 1

  // Connectors (max 7)
  score += Math.min(7, connectorsScore * 0.7)

  // Vocabulary (max 5)
  score += Math.min(5, advancedWordsUsed.length)

  // Structure (max 5)
  score += Math.min(5, structureScore * 0.5)

  // Grammar penalty
  score -= Math.min(5, grammarIssues.length * 1.5)

  // Sentence variety bonus
  if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 2
  if (sentenceCount >= 10) score += 1

  score = Math.max(0, Math.min(30, Math.round(score)))

  // Generate feedback
  const suggestions: string[] = []
  let overallFeedback = ''

  if (wordCount < 150) suggestions.push('Escreva pelo menos 300 palavras para um essay TOEFL completo')
  if (paragraphCount < 3) suggestions.push('Organize em pelo menos 3 parágrafos: introdução, corpo e conclusão')
  if (connectorsUsed.length < 3) suggestions.push('Use mais conectores acadêmicos (However, Furthermore, In conclusion...)')
  if (advancedWordsUsed.length < 3) suggestions.push('Inclua vocabulário acadêmico (significant, demonstrate, contribute...)')
  if (grammarIssues.length > 0) suggestions.push('Corrija os erros gramaticais identificados')
  if (avgSentenceLength < 8) suggestions.push('Suas frases são muito curtas — tente elaborar mais suas ideias')
  if (avgSentenceLength > 30) suggestions.push('Suas frases são muito longas — divida em frases menores')

  if (score >= 25) overallFeedback = 'Excelente! Seu essay está no nível TOEFL avançado.'
  else if (score >= 20) overallFeedback = 'Muito bom! Alguns ajustes e você alcança o nível máximo.'
  else if (score >= 15) overallFeedback = 'Bom progresso! Foque em vocabulário acadêmico e estrutura.'
  else if (score >= 10) overallFeedback = 'Razoável. Pratique mais a organização de ideias e use conectores.'
  else overallFeedback = 'Continue praticando! Foque em escrever parágrafos completos com ideias conectadas.'

  return {
    score, wordCount, sentenceCount, avgSentenceLength,
    paragraphCount, connectorsUsed, connectorsScore,
    vocabularyLevel, grammarIssues, structureScore,
    overallFeedback, suggestions,
  }
}
