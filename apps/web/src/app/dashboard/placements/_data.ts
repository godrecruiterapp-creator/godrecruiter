export type HealthStatus = 'healthy' | 'attention' | 'critical'
export type PlacementStatus = 'active' | 'starting_today' | 'starting_soon' | 'ending_soon' | 'completed' | 'needs_attention'
export type ComplianceStatus = 'completed' | 'pending' | 'expired' | 'missing'
export type FilterTab = 'all' | 'starting_today' | 'active' | 'needs_attention' | 'ending_soon' | 'completed' | 'redeployment'

export type ComplianceItem = { name: string; status: ComplianceStatus; date?: string }
export type TimelineEvent  = { event: string; date: string; user: string; done: boolean; note?: string }
export type ActivityItem   = { type: 'email' | 'note' | 'call' | 'sms' | 'upload' | 'task' | 'ai'; text: string; user: string; time: string }

export type Placement = {
  id: string
  candidate: string
  initials: string
  jobTitle: string
  client: string
  location: string
  recruiter: string
  accountManager: string
  startDate: string
  endDate: string
  status: PlacementStatus
  healthScore: number
  billRate: number
  payRate: number
  marginPct: number
  weeklyRevenue: number
  contractValue: number
  employmentType: 'Contract' | 'Contract-to-Hire' | 'Direct Hire' | 'Temp'
  issues: string[]
  compliance: ComplianceItem[]
  timeline: TimelineEvent[]
  activity: ActivityItem[]
}

export function healthStatus(score: number): HealthStatus {
  if (score >= 80) return 'healthy'
  if (score >= 50) return 'attention'
  return 'critical'
}

export const PLACEMENTS: Placement[] = [
  {
    id: 'p1',
    candidate: 'Maria Gonzalez', initials: 'MG',
    jobTitle: 'Travel RN – ICU', client: 'Houston Methodist', location: 'Houston, TX',
    recruiter: 'Sarah Mitchell', accountManager: 'Arun Kumar',
    startDate: 'Jun 29, 2026', endDate: 'Sep 27, 2026',
    status: 'starting_today', healthScore: 91,
    billRate: 95, payRate: 68, marginPct: 28.4, weeklyRevenue: 3800, contractValue: 49400,
    employmentType: 'Contract',
    issues: [],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'Jun 10' },
      { name: 'Drug Screen',      status: 'completed', date: 'Jun 11' },
      { name: 'I-9',              status: 'completed', date: 'Jun 12' },
      { name: 'RN License (TX)',  status: 'completed', date: 'Valid → Jun 2028' },
      { name: 'BLS Certification',status: 'completed', date: 'Valid → Dec 2026' },
      { name: 'ACLS',             status: 'completed', date: 'Valid → Dec 2026' },
      { name: 'References',       status: 'completed', date: 'Jun 9' },
    ],
    timeline: [
      { event: 'Offer Accepted',     date: 'Jun 5, 2026',  user: 'Sarah Mitchell', done: true },
      { event: 'Compliance Started', date: 'Jun 6, 2026',  user: 'System',         done: true },
      { event: 'Documents Received', date: 'Jun 12, 2026', user: 'Maria Gonzalez', done: true },
      { event: 'Ready to Start',     date: 'Jun 25, 2026', user: 'Sarah Mitchell', done: true },
      { event: 'Starts Today',       date: 'Jun 29, 2026', user: 'Maria Gonzalez', done: false },
      { event: '30-Day Check-In',    date: 'Jul 29, 2026', user: 'Sarah Mitchell', done: false },
      { event: 'Contract End',       date: 'Sep 27, 2026', user: '—',              done: false },
    ],
    activity: [
      { type: 'email',  text: 'Welcome email and start details sent',     user: 'Sarah Mitchell', time: 'Today 8:00 AM' },
      { type: 'note',   text: 'Candidate confirmed start time 7:00 AM',   user: 'Sarah Mitchell', time: 'Jun 28 3:00 PM' },
      { type: 'upload', text: 'Orientation documents uploaded',           user: 'Maria Gonzalez', time: 'Jun 27 11:00 AM' },
    ],
  },
  {
    id: 'p2',
    candidate: 'James Rodriguez', initials: 'JR',
    jobTitle: 'Senior Java Developer', client: 'JPMorgan Chase', location: 'Dallas, TX',
    recruiter: 'James Rodriguez', accountManager: 'Sarah Mitchell',
    startDate: 'Jun 15, 2026', endDate: 'Dec 14, 2026',
    status: 'active', healthScore: 94,
    billRate: 130, payRate: 95, marginPct: 26.9, weeklyRevenue: 5200, contractValue: 135200,
    employmentType: 'Contract',
    issues: [],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'Jun 1' },
      { name: 'Drug Screen',      status: 'completed', date: 'Jun 2' },
      { name: 'I-9',              status: 'completed', date: 'Jun 3' },
      { name: 'References',       status: 'completed', date: 'May 30' },
      { name: 'Security Clearance',status: 'completed',date: 'Jun 10' },
    ],
    timeline: [
      { event: 'Offer Accepted',     date: 'May 28, 2026', user: 'James Rodriguez', done: true },
      { event: 'Compliance Cleared', date: 'Jun 10, 2026', user: 'System',           done: true },
      { event: 'Started',            date: 'Jun 15, 2026', user: 'James Rodriguez', done: true },
      { event: '30-Day Check-In',    date: 'Jul 15, 2026', user: 'Sarah Mitchell',  done: false },
      { event: 'Mid-Contract Review',date: 'Sep 14, 2026', user: 'Sarah Mitchell',  done: false },
      { event: 'Contract End',       date: 'Dec 14, 2026', user: '—',               done: false },
    ],
    activity: [
      { type: 'note',  text: '2-week check-in: candidate very happy with the role', user: 'James Rodriguez', time: 'Jun 28 10:00 AM' },
      { type: 'email', text: 'Timesheet confirmation sent for week of Jun 22',       user: 'System',          time: 'Jun 22 5:00 PM' },
      { type: 'task',  text: '30-day check-in task created',                         user: 'Sarah Mitchell',  time: 'Jun 15 9:00 AM' },
    ],
  },
  {
    id: 'p3',
    candidate: 'Emily Thompson', initials: 'ET',
    jobTitle: 'Travel RN – ER', client: 'Baylor Scott & White', location: 'Austin, TX',
    recruiter: 'Emily Thompson', accountManager: 'Arun Kumar',
    startDate: 'Jul 6, 2026', endDate: 'Oct 4, 2026',
    status: 'starting_soon', healthScore: 72,
    billRate: 92, payRate: 65, marginPct: 29.3, weeklyRevenue: 3680, contractValue: 47840,
    employmentType: 'Contract',
    issues: ['Drug screen pending', 'ACLS certification missing'],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'Jun 15' },
      { name: 'Drug Screen',      status: 'pending' },
      { name: 'I-9',              status: 'completed', date: 'Jun 16' },
      { name: 'RN License (TX)',  status: 'completed', date: 'Valid → Aug 2027' },
      { name: 'BLS Certification',status: 'completed', date: 'Valid → Mar 2027' },
      { name: 'ACLS',             status: 'missing' },
      { name: 'References',       status: 'completed', date: 'Jun 14' },
    ],
    timeline: [
      { event: 'Offer Accepted',     date: 'Jun 14, 2026', user: 'Emily Thompson', done: true },
      { event: 'Compliance Started', date: 'Jun 15, 2026', user: 'System',         done: true },
      { event: 'Drug Screen Due',    date: 'Jul 1, 2026',  user: 'Emily Thompson', done: false },
      { event: 'Ready to Start',     date: 'Jul 5, 2026',  user: 'System',         done: false },
      { event: 'Starts',             date: 'Jul 6, 2026',  user: 'Emily Thompson', done: false },
      { event: 'Contract End',       date: 'Oct 4, 2026',  user: '—',              done: false },
    ],
    activity: [
      { type: 'email', text: 'Drug screen order sent to LabCorp',             user: 'Emily Thompson', time: 'Jun 27 2:00 PM' },
      { type: 'note',  text: 'Candidate notified ACLS needed before start',   user: 'Emily Thompson', time: 'Jun 26 4:30 PM' },
      { type: 'email', text: 'Offer letter and start details sent',           user: 'Emily Thompson', time: 'Jun 14 3:00 PM' },
    ],
  },
  {
    id: 'p4',
    candidate: 'David Park', initials: 'DP',
    jobTitle: 'DevOps Engineer', client: 'Dell Technologies', location: 'Austin, TX',
    recruiter: 'David Park', accountManager: 'Sarah Mitchell',
    startDate: 'May 1, 2026', endDate: 'Jul 13, 2026',
    status: 'ending_soon', healthScore: 88,
    billRate: 115, payRate: 82, marginPct: 28.7, weeklyRevenue: 4600, contractValue: 59800,
    employmentType: 'Contract',
    issues: ['Contract ends in 14 days — extension not confirmed'],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'Apr 15' },
      { name: 'Drug Screen',      status: 'completed', date: 'Apr 16' },
      { name: 'I-9',              status: 'completed', date: 'Apr 17' },
      { name: 'References',       status: 'completed', date: 'Apr 14' },
    ],
    timeline: [
      { event: 'Offer Accepted',   date: 'Apr 14, 2026', user: 'David Park',     done: true },
      { event: 'Started',          date: 'May 1, 2026',  user: 'David Park',     done: true },
      { event: '30-Day Check-In',  date: 'Jun 1, 2026',  user: 'Sarah Mitchell', done: true },
      { event: 'Extension Due',    date: 'Jul 6, 2026',  user: 'Sarah Mitchell', done: false },
      { event: 'Contract End',     date: 'Jul 13, 2026', user: '—',              done: false },
    ],
    activity: [
      { type: 'note',  text: 'Client very happy — likely to extend',             user: 'Sarah Mitchell', time: 'Jun 25 11:00 AM' },
      { type: 'email', text: 'Extension inquiry sent to hiring manager',          user: 'Sarah Mitchell', time: 'Jun 24 3:00 PM' },
      { type: 'task',  text: 'Follow up on extension by Jul 1',                  user: 'Sarah Mitchell', time: 'Jun 24 3:01 PM' },
    ],
  },
  {
    id: 'p5',
    candidate: 'Lisa Chen', initials: 'LC',
    jobTitle: 'Travel RN – NICU', client: 'Texas Children\'s Hospital', location: 'Houston, TX',
    recruiter: 'Lisa Chen', accountManager: 'Arun Kumar',
    startDate: 'Apr 7, 2026', endDate: 'Jul 5, 2026',
    status: 'needs_attention', healthScore: 48,
    billRate: 98, payRate: 70, marginPct: 28.6, weeklyRevenue: 3920, contractValue: 50960,
    employmentType: 'Contract',
    issues: ['Timesheet missing — Week of Jun 22', 'RN license expires Jul 15', 'Candidate not responding'],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'Mar 20' },
      { name: 'Drug Screen',      status: 'completed', date: 'Mar 21' },
      { name: 'I-9',              status: 'completed', date: 'Mar 22' },
      { name: 'RN License (TX)',  status: 'expired',   date: 'Expired Jun 15' },
      { name: 'BLS Certification',status: 'completed', date: 'Valid → Sep 2026' },
      { name: 'ACLS',             status: 'completed', date: 'Valid → Sep 2026' },
      { name: 'References',       status: 'completed', date: 'Mar 19' },
    ],
    timeline: [
      { event: 'Offer Accepted', date: 'Mar 18, 2026', user: 'Lisa Chen', done: true },
      { event: 'Started',        date: 'Apr 7, 2026',  user: 'Lisa Chen', done: true },
      { event: '30-Day Check-In',date: 'May 7, 2026',  user: 'Lisa Chen', done: true },
      { event: 'Contract End',   date: 'Jul 5, 2026',  user: '—',         done: false },
    ],
    activity: [
      { type: 'note',  text: 'Attempted call — no answer',             user: 'Lisa Chen', time: 'Jun 28 2:00 PM' },
      { type: 'sms',   text: 'SMS sent re: missing timesheet',         user: 'Lisa Chen', time: 'Jun 27 9:00 AM' },
      { type: 'email', text: 'License renewal reminder sent',          user: 'System',    time: 'Jun 25 8:00 AM' },
    ],
  },
  {
    id: 'p6',
    candidate: 'Carlos Mendez', initials: 'CM',
    jobTitle: 'Business Analyst', client: 'ExxonMobil', location: 'Houston, TX',
    recruiter: 'Sarah Mitchell', accountManager: 'Arun Kumar',
    startDate: 'Mar 3, 2026', endDate: 'Jun 1, 2026',
    status: 'completed', healthScore: 97,
    billRate: 105, payRate: 75, marginPct: 28.6, weeklyRevenue: 4200, contractValue: 109200,
    employmentType: 'Contract',
    issues: [],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'Feb 15' },
      { name: 'Drug Screen',      status: 'completed', date: 'Feb 16' },
      { name: 'I-9',              status: 'completed', date: 'Feb 17' },
      { name: 'References',       status: 'completed', date: 'Feb 14' },
    ],
    timeline: [
      { event: 'Offer Accepted', date: 'Feb 14, 2026', user: 'Carlos Mendez',  done: true },
      { event: 'Started',        date: 'Mar 3, 2026',  user: 'Carlos Mendez',  done: true },
      { event: 'Completed',      date: 'Jun 1, 2026',  user: 'Sarah Mitchell', done: true },
    ],
    activity: [
      { type: 'note',  text: 'Excellent performance — client wants to rehire',  user: 'Sarah Mitchell', time: 'Jun 1 4:00 PM' },
      { type: 'ai',    text: 'AI found 3 matching jobs for redeployment',       user: 'AI',             time: 'Jun 1 4:01 PM' },
    ],
  },
  {
    id: 'p7',
    candidate: 'Priya Sharma', initials: 'PS',
    jobTitle: 'Data Engineer', client: 'Chevron', location: 'Houston, TX',
    recruiter: 'James Rodriguez', accountManager: 'Sarah Mitchell',
    startDate: 'Jun 22, 2026', endDate: 'Dec 21, 2026',
    status: 'active', healthScore: 89,
    billRate: 118, payRate: 84, marginPct: 28.8, weeklyRevenue: 4720, contractValue: 122720,
    employmentType: 'Contract',
    issues: [],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'Jun 8' },
      { name: 'Drug Screen',      status: 'completed', date: 'Jun 9' },
      { name: 'I-9',              status: 'completed', date: 'Jun 10' },
      { name: 'References',       status: 'completed', date: 'Jun 7' },
    ],
    timeline: [
      { event: 'Offer Accepted', date: 'Jun 7, 2026',  user: 'Priya Sharma',   done: true },
      { event: 'Started',        date: 'Jun 22, 2026', user: 'Priya Sharma',   done: true },
      { event: '30-Day Check-In',date: 'Jul 22, 2026', user: 'James Rodriguez',done: false },
      { event: 'Contract End',   date: 'Dec 21, 2026', user: '—',              done: false },
    ],
    activity: [
      { type: 'note',  text: 'First week went well — integrating with team',   user: 'James Rodriguez', time: 'Jun 28 9:00 AM' },
    ],
  },
  {
    id: 'p8',
    candidate: 'Tom Kowalski', initials: 'TK',
    jobTitle: 'Travel RN – OR', client: 'HCA Houston Healthcare', location: 'Houston, TX',
    recruiter: 'Emily Thompson', accountManager: 'Arun Kumar',
    startDate: 'Jul 13, 2026', endDate: 'Oct 11, 2026',
    status: 'starting_soon', healthScore: 55,
    billRate: 96, payRate: 68, marginPct: 29.2, weeklyRevenue: 3840, contractValue: 49920,
    employmentType: 'Contract',
    issues: ['Background check pending', 'I-9 not submitted'],
    compliance: [
      { name: 'Background Check', status: 'pending' },
      { name: 'Drug Screen',      status: 'completed', date: 'Jun 20' },
      { name: 'I-9',              status: 'missing' },
      { name: 'RN License (TX)',  status: 'completed', date: 'Valid → Nov 2027' },
      { name: 'BLS Certification',status: 'completed', date: 'Valid → May 2027' },
      { name: 'References',       status: 'completed', date: 'Jun 19' },
    ],
    timeline: [
      { event: 'Offer Accepted',     date: 'Jun 18, 2026', user: 'Tom Kowalski',  done: true },
      { event: 'Compliance Started', date: 'Jun 19, 2026', user: 'System',        done: true },
      { event: 'Background Check',   date: 'Jul 5, 2026',  user: 'Tom Kowalski', done: false },
      { event: 'Ready to Start',     date: 'Jul 12, 2026', user: 'System',       done: false },
      { event: 'Starts',             date: 'Jul 13, 2026', user: 'Tom Kowalski', done: false },
      { event: 'Contract End',       date: 'Oct 11, 2026', user: '—',            done: false },
    ],
    activity: [
      { type: 'email', text: 'Background check package sent to Checkr',      user: 'Emily Thompson', time: 'Jun 27 10:00 AM' },
      { type: 'note',  text: 'Candidate needs to submit I-9 documents',       user: 'Emily Thompson', time: 'Jun 26 2:00 PM' },
    ],
  },
  {
    id: 'p9',
    candidate: 'Angela White', initials: 'AW',
    jobTitle: 'QA Automation Engineer', client: 'AT&T', location: 'Dallas, TX',
    recruiter: 'David Park', accountManager: 'Sarah Mitchell',
    startDate: 'Jun 8, 2026', endDate: 'Dec 7, 2026',
    status: 'active', healthScore: 96,
    billRate: 108, payRate: 77, marginPct: 28.7, weeklyRevenue: 4320, contractValue: 112320,
    employmentType: 'Contract',
    issues: [],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'May 25' },
      { name: 'Drug Screen',      status: 'completed', date: 'May 26' },
      { name: 'I-9',              status: 'completed', date: 'May 27' },
      { name: 'References',       status: 'completed', date: 'May 24' },
    ],
    timeline: [
      { event: 'Offer Accepted', date: 'May 24, 2026', user: 'Angela White',  done: true },
      { event: 'Started',        date: 'Jun 8, 2026',  user: 'Angela White',  done: true },
      { event: '30-Day Check-In',date: 'Jul 8, 2026',  user: 'David Park',    done: false },
      { event: 'Contract End',   date: 'Dec 7, 2026',  user: '—',             done: false },
    ],
    activity: [
      { type: 'note',  text: 'Manager very pleased with quality of work',    user: 'David Park', time: 'Jun 22 11:00 AM' },
    ],
  },
  {
    id: 'p10',
    candidate: 'Marcus Johnson', initials: 'MJ',
    jobTitle: 'Travel RN – Telemetry', client: 'Memorial Hermann', location: 'Houston, TX',
    recruiter: 'Sarah Mitchell', accountManager: 'Arun Kumar',
    startDate: 'May 18, 2026', endDate: 'Aug 16, 2026',
    status: 'needs_attention', healthScore: 61,
    billRate: 94, payRate: 67, marginPct: 28.7, weeklyRevenue: 3760, contractValue: 48880,
    employmentType: 'Contract',
    issues: ['Payroll issue — W-2 form not on file', 'CPR certification expires Jul 1'],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'May 5' },
      { name: 'Drug Screen',      status: 'completed', date: 'May 6' },
      { name: 'I-9',              status: 'completed', date: 'May 7' },
      { name: 'RN License (TX)',  status: 'completed', date: 'Valid → Jan 2028' },
      { name: 'BLS Certification',status: 'expired',   date: 'Expired Jun 1' },
      { name: 'References',       status: 'completed', date: 'May 4' },
      { name: 'W-2 / Tax Form',   status: 'missing' },
    ],
    timeline: [
      { event: 'Offer Accepted', date: 'May 4, 2026',  user: 'Marcus Johnson', done: true },
      { event: 'Started',        date: 'May 18, 2026', user: 'Marcus Johnson', done: true },
      { event: '30-Day Check-In',date: 'Jun 18, 2026', user: 'Sarah Mitchell', done: true },
      { event: 'Contract End',   date: 'Aug 16, 2026', user: '—',              done: false },
    ],
    activity: [
      { type: 'email', text: 'Payroll team alerted re: missing W-2',           user: 'Sarah Mitchell', time: 'Jun 27 9:00 AM' },
      { type: 'email', text: 'BLS renewal reminder sent to candidate',         user: 'System',         time: 'Jun 20 8:00 AM' },
    ],
  },
  {
    id: 'p11',
    candidate: 'Yuki Tanaka', initials: 'YT',
    jobTitle: 'Cloud Architect', client: 'Shell', location: 'Houston, TX',
    recruiter: 'James Rodriguez', accountManager: 'Arun Kumar',
    startDate: 'Jun 1, 2026', endDate: 'Nov 30, 2026',
    status: 'active', healthScore: 93,
    billRate: 145, payRate: 105, marginPct: 27.6, weeklyRevenue: 5800, contractValue: 150800,
    employmentType: 'Contract',
    issues: [],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'May 18' },
      { name: 'Drug Screen',      status: 'completed', date: 'May 19' },
      { name: 'I-9',              status: 'completed', date: 'May 20' },
      { name: 'References',       status: 'completed', date: 'May 17' },
      { name: 'Security Clearance',status:'completed', date: 'May 28' },
    ],
    timeline: [
      { event: 'Offer Accepted',  date: 'May 17, 2026', user: 'Yuki Tanaka',    done: true },
      { event: 'Started',         date: 'Jun 1, 2026',  user: 'Yuki Tanaka',    done: true },
      { event: '30-Day Check-In', date: 'Jul 1, 2026',  user: 'James Rodriguez',done: false },
      { event: 'Contract End',    date: 'Nov 30, 2026', user: '—',              done: false },
    ],
    activity: [
      { type: 'note',  text: 'Excellent feedback from Shell leadership',       user: 'James Rodriguez', time: 'Jun 25 3:00 PM' },
    ],
  },
  {
    id: 'p12',
    candidate: 'Sandra Kim', initials: 'SK',
    jobTitle: 'Travel RN – PICU', client: 'Children\'s Medical Center', location: 'Dallas, TX',
    recruiter: 'Emily Thompson', accountManager: 'Sarah Mitchell',
    startDate: 'Jun 1, 2026', endDate: 'Aug 30, 2026',
    status: 'ending_soon', healthScore: 85,
    billRate: 97, payRate: 69, marginPct: 28.9, weeklyRevenue: 3880, contractValue: 50440,
    employmentType: 'Contract',
    issues: ['Contract ends in 62 days — redeployment recommended'],
    compliance: [
      { name: 'Background Check', status: 'completed', date: 'May 17' },
      { name: 'Drug Screen',      status: 'completed', date: 'May 18' },
      { name: 'I-9',              status: 'completed', date: 'May 19' },
      { name: 'RN License (TX)',  status: 'completed', date: 'Valid → Mar 2028' },
      { name: 'BLS Certification',status: 'completed', date: 'Valid → Nov 2026' },
      { name: 'ACLS',             status: 'completed', date: 'Valid → Nov 2026' },
      { name: 'References',       status: 'completed', date: 'May 16' },
    ],
    timeline: [
      { event: 'Offer Accepted', date: 'May 16, 2026', user: 'Sandra Kim',    done: true },
      { event: 'Started',        date: 'Jun 1, 2026',  user: 'Sandra Kim',    done: true },
      { event: '30-Day Check-In',date: 'Jul 1, 2026',  user: 'Emily Thompson',done: false },
      { event: 'Contract End',   date: 'Aug 30, 2026', user: '—',             done: false },
    ],
    activity: [
      { type: 'ai',   text: 'AI found 4 matching PICU openings for redeployment', user: 'AI',             time: 'Jun 28 8:00 AM' },
      { type: 'note', text: 'Candidate expressed interest in extension',          user: 'Emily Thompson', time: 'Jun 25 2:00 PM' },
    ],
  },
]

export const PLACEMENT_FALLBACK: Placement = PLACEMENTS[0]!

export function getPlacementById(id: string): Placement {
  return PLACEMENTS.find(p => p.id === id) ?? PLACEMENT_FALLBACK
}

export function filterPlacements(placements: Placement[], tab: FilterTab, search: string): Placement[] {
  let result = placements
  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(p =>
      p.candidate.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q) ||
      p.jobTitle.toLowerCase().includes(q) ||
      p.recruiter.toLowerCase().includes(q) ||
      p.id.includes(q)
    )
  }
  switch (tab) {
    case 'starting_today':  return result.filter(p => p.status === 'starting_today')
    case 'active':          return result.filter(p => p.status === 'active')
    case 'needs_attention': return result.filter(p => p.status === 'needs_attention' || p.healthScore < 70)
    case 'ending_soon':     return result.filter(p => p.status === 'ending_soon')
    case 'completed':       return result.filter(p => p.status === 'completed')
    case 'redeployment':    return result.filter(p => p.status === 'completed' || p.status === 'ending_soon')
    default:                return result
  }
}
