import type { Platform, ContentFormat, ProofContent } from './content-explorer'

// ─── Step 1: 브리프 ───
export type CampaignObjective = 'awareness' | 'engagement' | 'conversion' | 'traffic'
export type ToneStyle = 'natural' | 'professional' | 'humorous' | 'trendy' | 'luxurious'

export interface CampaignBrief {
  brandName: string
  productName: string
  objective: CampaignObjective
  targetAudience: string
  toneStyle: ToneStyle
  budgetRange: string
  platforms: Platform[]
  formats: ContentFormat[]
  keywords: string[]
}

// ─── Step 2: 후보 선정 ───
export interface ProposalCandidate {
  influencerId: number
  name: string
  handle: string
  platform: Platform
  followerCount: string
  er: string
  categories: string[]
  brandFitScore: number
  estimatedPrice: string
  isSelected: boolean
}

export interface CandidateSummary {
  totalEstimatedCost: string
  avgBrandFit: number
  totalExpectedReach: string
  selectedCount: number
}

// ─── Step 3: 근거 & 레퍼런스 ───
export interface ProofSection {
  influencerId: number
  handle: string
  proofContents: ProofContent[]
  matchReasons: string[]
  aiSummary: string
}

export interface ContentCluster {
  id: string
  platform: Platform
  placement: ContentFormat
  duration: '0-10s' | '11-20s' | '21-40s' | '41-60s' | '60s+'
  structure: 'talking-head' | 'hands-demo' | 'vlog' | 'interview' | 'voiceover' | 'text-only'
  editing: 'fast-cuts' | 'slow' | 'asmr' | 'slideshow'
  label: string
}

export interface ReferenceContent {
  id: string
  creatorHandle: string
  contentType: ContentFormat
  engagementRate: number
  cluster: ContentCluster
  description: string
}

export interface CreativeBriefIdea {
  hookIdeas: string[]
  contiSuggestion: string
  messageDirection: string
}

// ─── Step 4: 제안서 ───
export interface ProposalDocument {
  brief: CampaignBrief
  candidates: ProposalCandidate[]
  proofSections: ProofSection[]
  referenceContents: ReferenceContent[]
  creativeBrief: CreativeBriefIdea
  summary: CandidateSummary
  generatedAt: string
}

// ─── Wizard 상태 ───
export type ProposalStep = 1 | 2 | 3 | 4
