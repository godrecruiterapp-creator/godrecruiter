// Shared mock data for the Projects module

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

export const PROJECTS: Project[] = [
  {
    id: '1', name: 'Texas ICU Nurses', description: 'Healthcare pipeline for critical care nurses across Texas hospitals.',
    type: 'Hiring Campaign', status: 'active', owner: 'Arun Kumar', team: ['Sarah M.', 'James R.'],
    candidateCount: 87, openJobs: 5, createdAt: 'Jun 10, 2026', lastActivity: '2 hours ago', healthScore: 82, visibility: 'team',
  },
  {
    id: '2', name: 'Senior Java Developers', description: 'Tech hiring initiative for fintech clients needing senior backend engineers.',
    type: 'Pipeline', status: 'active', owner: 'Arun Kumar', team: ['Emily T.'],
    candidateCount: 143, openJobs: 8, createdAt: 'May 28, 2026', lastActivity: '30 min ago', healthScore: 91, visibility: 'organization',
  },
  {
    id: '3', name: 'Redeployment Candidates', description: 'Candidates nearing end of current placements available for redeployment.',
    type: 'Redeployment', status: 'active', owner: 'Sarah M.', team: ['Arun Kumar', 'James R.', 'Emily T.'],
    candidateCount: 34, openJobs: 12, createdAt: 'Jun 1, 2026', lastActivity: '1 day ago', healthScore: 65, visibility: 'team',
  },
  {
    id: '4', name: 'Healthcare Pipeline Q3', description: 'Broad healthcare talent pool for Q3 client expansion across 3 states.',
    type: 'Talent Pool', status: 'paused', owner: 'James R.', team: ['Arun Kumar'],
    candidateCount: 210, openJobs: 0, createdAt: 'Apr 15, 2026', lastActivity: '5 days ago', healthScore: 44, visibility: 'team',
  },
  {
    id: '5', name: 'Travel Nurses — Summer', description: 'Seasonal travel nurse initiative for summer contract openings.',
    type: 'Hiring Campaign', status: 'active', owner: 'Emily T.', team: ['Sarah M.'],
    candidateCount: 61, openJobs: 3, createdAt: 'Jun 18, 2026', lastActivity: '4 hours ago', healthScore: 78, visibility: 'organization',
  },
  {
    id: '6', name: 'Bench Candidates', description: 'Consultants currently on bench and ready for immediate placement.',
    type: 'Future Hiring', status: 'active', owner: 'Arun Kumar', team: [],
    candidateCount: 28, openJobs: 6, createdAt: 'Jun 20, 2026', lastActivity: '10 min ago', healthScore: 88, visibility: 'private',
  },
]

export const PROJECT_CANDIDATES = [
  { id: 'c1', name: 'Maria Lopez',    title: 'ICU RN',            company: 'St. Luke\'s Hospital', exp: '8 yrs', skills: ['CCRN','ICU','ACLS'], location: 'Houston, TX', auth: 'USC', availability: 'Immediate', recruiter: 'Arun Kumar', lastContact: '2 days ago', aiScore: 96, stage: 'Submitted',  tags: ['Hot', 'Travel OK'] },
  { id: 'c2', name: 'James Wilson',   title: 'Sr. Java Developer',company: 'FinCore Inc',           exp: '10 yrs',skills: ['Java','Spring','AWS'],  location: 'Austin, TX',   auth: 'GC',  availability: '2 weeks',   recruiter: 'Sarah M.',   lastContact: '1 day ago',  aiScore: 91, stage: 'Interviewing', tags: ['Priority'] },
  { id: 'c3', name: 'Sarah Chen',     title: 'ER Nurse',           company: 'Memorial Medical',      exp: '6 yrs', skills: ['ER','BLS','TNCC'],    location: 'Dallas, TX',   auth: 'USC', availability: '1 month',   recruiter: 'Emily T.',   lastContact: '5 days ago', aiScore: 84, stage: 'Contacted',  tags: [] },
  { id: 'c4', name: 'Raj Patel',      title: 'Java Architect',     company: 'TechVision',            exp: '14 yrs',skills: ['Java','Microservices'], location: 'Remote',       auth: 'H1B', availability: '30 days',   recruiter: 'Arun Kumar', lastContact: '3 days ago', aiScore: 88, stage: 'New',        tags: ['Visa Risk'] },
  { id: 'c5', name: 'Linda Torres',   title: 'OR Nurse',           company: 'Houston Methodist',     exp: '11 yrs',skills: ['OR','CNOR','Surgical'],location: 'Houston, TX',  auth: 'USC', availability: 'Immediate', recruiter: 'James R.',   lastContact: 'Today',      aiScore: 93, stage: 'Offer',      tags: ['Hot'] },
  { id: 'c6', name: 'Michael Grant',  title: 'Backend Engineer',   company: 'DataStream',            exp: '7 yrs', skills: ['Java','Kafka','Redis'], location: 'Chicago, IL',  auth: 'GC',  availability: '2 weeks',   recruiter: 'Sarah M.',   lastContact: '7 days ago', aiScore: 79, stage: 'Reviewed',   tags: [] },
  { id: 'c7', name: 'Anna Kim',       title: 'Travel Nurse',       company: 'Cross Country',         exp: '5 yrs', skills: ['ICU','ER','Float'],    location: 'Remote',       auth: 'USC', availability: 'Immediate', recruiter: 'Emily T.',   lastContact: '1 day ago',  aiScore: 87, stage: 'Submitted',  tags: ['Travel OK'] },
  { id: 'c8', name: 'Carlos Rivera',  title: 'Full Stack Developer',company: 'StartupHub',           exp: '9 yrs', skills: ['Java','React','Docker'],location: 'Denver, CO',   auth: 'EAD', availability: '1 month',   recruiter: 'Arun Kumar', lastContact: '4 days ago', aiScore: 82, stage: 'Contacted',  tags: [] },
]

export const KANBAN_STAGES = ['New','Reviewed','Contacted','Interested','Submitted','Interview','Offer','Placed','Future','Rejected']
