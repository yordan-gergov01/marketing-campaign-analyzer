import { CopyPlatform, CopyRequest, Language, Objective, Tone } from "../types/api-types"

export const OBJECTIVES: Objective[] = ['conversions', 'traffic', 'awareness', 'leads', 'engagement']
export const TONES: Tone[] = ['professional', 'casual', 'urgent', 'emotional', 'humorous']
export const PLATFORMS: CopyPlatform[]= ['meta', 'google', 'linkedin', 'tiktok']
export const LANGUAGES: Language[] = ['english', 'bulgarian']
export const INITIAL_FORM: CopyRequest = {
    objective: 'conversions',
    audience: '',
    product_description: '',
    tone: 'professional',
    platform: 'meta',
    language: 'english',
  }