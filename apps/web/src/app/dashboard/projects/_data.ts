// Shared types + config for the Projects module.
// Live project data comes from the database via ./actions.ts.

export type Project = {
  id: string
  name: string
  description: string
  type: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  owner: string
  team: string[]
  candidateCount: number
  openJobs: number
  createdAt: string
  lastActivity: string
  healthScore: number   // 0-100
  visibility: 'private' | 'team' | 'organization'
}

export const PROJECT_FALLBACK: Project = {
  id: '', name: '', description: '', type: '', status: 'active',
  owner: '', team: [], candidateCount: 0, openJobs: 0,
  createdAt: '', lastActivity: '', healthScore: 0, visibility: 'private',
}

export type ProjectCandidate = {
  id: string
  name: string
  title: string
  company: string
  exp: string
  skills: string[]
  location: string
  auth: string
  availability: string
  recruiter: string
  lastContact: string
  aiScore: number
  stage: string
  tags: string[]
}

// Candidates are attached to a project at runtime; no seed data.
export const PROJECT_CANDIDATES: ProjectCandidate[] = []

export const KANBAN_STAGES = ['New', 'Reviewing', 'Submitted', 'Interview Scheduled', 'Offer Sent', 'Placed', 'Rejected']
