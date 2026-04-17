// Types for In-TOEFL App

export type Skill = 'reading' | 'listening' | 'speaking' | 'writing' | 'vocabulary'
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export interface UserProgress {
  userId: string
  reading_level: number
  listening_level: number
  speaking_level: number
  writing_level: number
  vocabulary_level: number
  grammar_level: number
  xp: number
  streak: number
  lastActiveDate: string
  placementDone: boolean
}

export interface Exercise {
  id: string
  type: 'multiple_choice' | 'reorder' | 'fill_blank' | 'repeat' | 'guided_response' | 'describe' | 'guided_write' | 'free_write'
  instruction_pt: string
  passage?: string
  question?: string
  options?: string[]
  correct?: string
  explanation_pt?: string
  // Speaking
  target_text?: string
  audio_script?: string
  phonetic_hint?: string
  tip_pt?: string
  accepted_variations?: string[]
  // Writing
  scene_pt?: string
  sentence?: string
  words?: string[]
  correct_sentence?: string
  prompt?: string
  hint_pt?: string
  model_answer?: string
  key_vocabulary?: string[]
  grammar_focus_pt?: string
  // Listening
  transcript?: string
  audio_file?: string
}

export interface Level {
  level: number
  skill: Skill
  cefr: CEFR
  theme?: string
  exercises: Exercise[]
  words?: VocabWord[]
}

export interface VocabWord {
  id: string
  word: string
  translation_pt: string
  phonetic: string
  example_en: string
  example_pt: string
  audio_script: string
  exercise: {
    type: string
    instruction_pt: string
    options: string[]
    correct: string
  }
  fsrs: {
    difficulty: number
    stability: number
    reps: number
  }
}

export interface PlacementQuestion {
  id: string
  section: 'reading' | 'listening' | 'vocabulary' | 'grammar'
  difficulty: string
  cefr: CEFR
  instruction_pt: string
  passage?: string
  question: string
  options: string[]
  correct: string
  explanation_pt: string
  transcript?: string
}

export interface DailyLesson {
  date: string
  exercises: {
    reading: Exercise
    listening: Exercise
    speaking: Exercise
    writing: Exercise
    vocabulary: Exercise
  }
  completed: boolean
}
