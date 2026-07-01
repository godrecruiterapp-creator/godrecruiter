// Shared mock data for Work Queue module

export type WQStatus = 'needs_assignment' | 'assigned' | 'in_progress' | 'no_activity' | 'completed' | 'overdue'
export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low'
export type RecruiterAvail = 'available' | 'busy' | 'at_capacity' | 'on_leave'

export type WQJob = {
  id: string
  title: string
  client: string
  location: string
  type: 'Contract' | 'Full Time' | 'Contract to Hire'
  billRate: string
  priority: Priority
  vmsSource: string
  receivedAt: string
  slaDue: string
  slaHoursLeft: number
  status: WQStatus
  assignedTo: string | null
  candidatesReviewed: number
  submitted: number
  interviewed: number
  aiScore: number
  tags: string[]
}

export type WQRecruiter = {
  id: string
  name: string
  initials: string
  maxJobs: number
  currentJobs: number
  submissions: number
  fillRate: number
  avgSubmitTime: string
  availability: RecruiterAvail
  skills: string[]
}

export const RECRUITERS: WQRecruiter[] = [
  { id: 'r1', name: 'Arun Kumar',      initials: 'AK', maxJobs: 12, currentJobs: 8,  submissions: 24, fillRate: 78, avgSubmitTime: '4.2h', availability: 'available',   skills: ['Java','Healthcare','Nursing','ICU'] },
  { id: 'r2', name: 'Sarah Mitchell',  initials: 'SM', maxJobs: 10, currentJobs: 9,  submissions: 18, fillRate: 71, avgSubmitTime: '5.1h', availability: 'busy',        skills: ['Java','AWS','FinTech','Python'] },
  { id: 'r3', name: 'James Rodriguez', initials: 'JR', maxJobs: 12, currentJobs: 5,  submissions: 31, fillRate: 82, avgSubmitTime: '3.8h', availability: 'available',   skills: ['Healthcare','Nursing','Travel','OR','ICU'] },
  { id: 'r4', name: 'Emily Thompson',  initials: 'ET', maxJobs: 10, currentJobs: 7,  submissions: 22, fillRate: 75, avgSubmitTime: '4.5h', availability: 'available',   skills: ['React','Node','Frontend','JavaScript'] },
  { id: 'r5', name: 'David Park',      initials: 'DP', maxJobs: 8,  currentJobs: 8,  submissions: 14, fillRate: 65, avgSubmitTime: '6.2h', availability: 'at_capacity', skills: ['DevOps','AWS','Kubernetes','Docker'] },
  { id: 'r6', name: 'Lisa Chen',       initials: 'LC', maxJobs: 12, currentJobs: 3,  submissions: 37, fillRate: 88, avgSubmitTime: '2.9h', availability: 'available',   skills: ['Java','Healthcare','ICU','Nursing','Travel'] },
]

export const WQ_JOBS: WQJob[] = [
  { id: 'j1',  title: 'ICU RN',               client: 'Houston Methodist',    location: 'Houston, TX',    type: 'Contract',        billRate: '$95/hr',  priority: 'Urgent', vmsSource: 'Beeline',      receivedAt: '1h ago',    slaDue: 'Today 5:00 PM',    slaHoursLeft: 3,  status: 'needs_assignment', assignedTo: null,             candidatesReviewed: 0,  submitted: 0, interviewed: 0, aiScore: 97, tags: ['Hot','VMS Priority'] },
  { id: 'j2',  title: 'Sr. Java Developer',   client: 'Accenture',            location: 'Austin, TX',     type: 'Contract',        billRate: '$110/hr', priority: 'High',   vmsSource: 'Fieldglass',   receivedAt: '2h ago',    slaDue: 'Tomorrow 12:00 PM',slaHoursLeft: 22, status: 'needs_assignment', assignedTo: null,             candidatesReviewed: 0,  submitted: 0, interviewed: 0, aiScore: 91, tags: [] },
  { id: 'j3',  title: 'ER Nurse',             client: 'Memorial Hermann',     location: 'Dallas, TX',     type: 'Contract',        billRate: '$88/hr',  priority: 'Urgent', vmsSource: 'IQNavigator',  receivedAt: '30m ago',   slaDue: 'Today 3:00 PM',    slaHoursLeft: 1,  status: 'needs_assignment', assignedTo: null,             candidatesReviewed: 0,  submitted: 0, interviewed: 0, aiScore: 94, tags: ['Urgent','Hot'] },
  { id: 'j4',  title: 'DevOps Engineer',      client: 'Dell Technologies',    location: 'Remote',         type: 'Contract',        billRate: '$115/hr', priority: 'High',   vmsSource: 'Beeline',      receivedAt: '3h ago',    slaDue: 'Tomorrow 9:00 AM', slaHoursLeft: 19, status: 'assigned',         assignedTo: 'David Park',     candidatesReviewed: 3,  submitted: 0, interviewed: 0, aiScore: 73, tags: [] },
  { id: 'j5',  title: 'OR Nurse',             client: "St. Luke's Hospital",           location: 'Houston, TX',    type: 'Contract',        billRate: '$90/hr',  priority: 'High',   vmsSource: 'Fieldglass',   receivedAt: '4h ago',    slaDue: 'Tomorrow 2:00 PM', slaHoursLeft: 26, status: 'in_progress',      assignedTo: 'James Rodriguez',candidatesReviewed: 8,  submitted: 2, interviewed: 0, aiScore: 89, tags: ['Travel OK'] },
  { id: 'j6',  title: 'React Developer',      client: 'IBM',                  location: 'Remote',         type: 'Contract to Hire',billRate: '$95/hr',  priority: 'Medium', vmsSource: 'Beeline',      receivedAt: '5h ago',    slaDue: 'Jun 30 5:00 PM',   slaHoursLeft: 48, status: 'in_progress',      assignedTo: 'Emily Thompson', candidatesReviewed: 5,  submitted: 1, interviewed: 0, aiScore: 82, tags: [] },
  { id: 'j7',  title: 'Travel ICU Nurse',     client: 'AMN Healthcare',       location: 'Phoenix, AZ',    type: 'Contract',        billRate: '$105/hr', priority: 'Urgent', vmsSource: 'IQNavigator',  receivedAt: '6h ago',    slaDue: 'Today 6:00 PM',    slaHoursLeft: 4,  status: 'needs_assignment', assignedTo: null,             candidatesReviewed: 0,  submitted: 0, interviewed: 0, aiScore: 96, tags: ['Hot','Travel'] },
  { id: 'j8',  title: 'Java Architect',       client: 'JPMorgan Chase',       location: 'New York, NY',   type: 'Contract',        billRate: '$145/hr', priority: 'High',   vmsSource: 'Fieldglass',   receivedAt: 'Yesterday', slaDue: 'Jun 29 5:00 PM',   slaHoursLeft: 0,  status: 'overdue',          assignedTo: 'Arun Kumar',     candidatesReviewed: 2,  submitted: 0, interviewed: 0, aiScore: 65, tags: ['Rare Tech'] },
  { id: 'j9',  title: 'NICU Nurse',           client: "Texas Children's Hospital",     location: 'Houston, TX',    type: 'Contract',        billRate: '$98/hr',  priority: 'Medium', vmsSource: 'Beeline',      receivedAt: 'Yesterday', slaDue: 'Jun 30 12:00 PM',  slaHoursLeft: 36, status: 'assigned',         assignedTo: 'Lisa Chen',      candidatesReviewed: 4,  submitted: 0, interviewed: 0, aiScore: 92, tags: [] },
  { id: 'j10', title: 'Python Data Engineer', client: 'ExxonMobil',           location: 'Houston, TX',    type: 'Full Time',       billRate: '$130/hr', priority: 'Medium', vmsSource: 'Beeline',      receivedAt: 'Yesterday', slaDue: 'Jul 1 5:00 PM',    slaHoursLeft: 60, status: 'in_progress',      assignedTo: 'Sarah Mitchell', candidatesReviewed: 6,  submitted: 2, interviewed: 1, aiScore: 77, tags: [] },
  { id: 'j11', title: 'ER Physician',         client: 'Memorial Hermann',     location: 'Houston, TX',    type: 'Contract',        billRate: '$220/hr', priority: 'Urgent', vmsSource: 'IQNavigator',  receivedAt: '2 days ago',slaDue: 'Jun 28 9:00 AM',   slaHoursLeft: 0,  status: 'overdue',          assignedTo: 'James Rodriguez',candidatesReviewed: 1,  submitted: 0, interviewed: 0, aiScore: 42, tags: ['Hard to Fill','Rare Tech'] },
  { id: 'j12', title: 'AWS Solutions Arch.',  client: 'AT&T',                 location: 'Dallas, TX',     type: 'Contract',        billRate: '$125/hr', priority: 'High',   vmsSource: 'Fieldglass',   receivedAt: '2 days ago',slaDue: 'Jun 30 5:00 PM',   slaHoursLeft: 44, status: 'no_activity',      assignedTo: 'David Park',     candidatesReviewed: 0,  submitted: 0, interviewed: 0, aiScore: 68, tags: [] },
  { id: 'j13', title: 'OR Tech',              client: "St. Luke's Hospital",           location: 'Houston, TX',    type: 'Contract',        billRate: '$65/hr',  priority: 'Low',    vmsSource: 'Beeline',      receivedAt: '3 days ago',slaDue: 'Jul 2 5:00 PM',    slaHoursLeft: 72, status: 'assigned',         assignedTo: 'Arun Kumar',     candidatesReviewed: 2,  submitted: 0, interviewed: 0, aiScore: 85, tags: [] },
  { id: 'j14', title: 'Travel PACU Nurse',    client: 'AMN Healthcare',       location: 'Miami, FL',      type: 'Contract',        billRate: '$102/hr', priority: 'High',   vmsSource: 'IQNavigator',  receivedAt: '3 days ago',slaDue: 'Jun 29 3:00 PM',   slaHoursLeft: 0,  status: 'overdue',          assignedTo: null,             candidatesReviewed: 0,  submitted: 0, interviewed: 0, aiScore: 88, tags: ['Travel','Unassigned'] },
  { id: 'j15', title: 'Sr. Network Engineer', client: 'Cisco',                location: 'San Jose, CA',   type: 'Contract',        billRate: '$120/hr', priority: 'Medium', vmsSource: 'Beeline',      receivedAt: '3 days ago',slaDue: 'Jul 1 12:00 PM',   slaHoursLeft: 54, status: 'in_progress',      assignedTo: 'Emily Thompson', candidatesReviewed: 4,  submitted: 1, interviewed: 0, aiScore: 71, tags: [] },
  { id: 'j16', title: 'ICU RN Travel',        client: 'Cross Country',        location: 'Chicago, IL',    type: 'Contract',        billRate: '$99/hr',  priority: 'High',   vmsSource: 'Fieldglass',   receivedAt: '4 days ago',slaDue: 'Jun 30 9:00 AM',   slaHoursLeft: 28, status: 'in_progress',      assignedTo: 'Lisa Chen',      candidatesReviewed: 11, submitted: 4, interviewed: 2, aiScore: 94, tags: ['Travel OK','Hot'] },
  { id: 'j17', title: 'Kubernetes Engineer',  client: 'Dell Technologies',    location: 'Remote',         type: 'Contract',        billRate: '$118/hr', priority: 'Low',    vmsSource: 'Beeline',      receivedAt: '5 days ago',slaDue: 'Jul 3 5:00 PM',    slaHoursLeft: 90, status: 'no_activity',      assignedTo: 'David Park',     candidatesReviewed: 0,  submitted: 0, interviewed: 0, aiScore: 55, tags: [] },
  { id: 'j18', title: 'L&D RN',              client: "St. Luke's Hospital",           location: 'Houston, TX',    type: 'Contract',        billRate: '$88/hr',  priority: 'Medium', vmsSource: 'IQNavigator',  receivedAt: '5 days ago',slaDue: 'Jul 2 12:00 PM',   slaHoursLeft: 66, status: 'assigned',         assignedTo: 'James Rodriguez',candidatesReviewed: 3,  submitted: 0, interviewed: 0, aiScore: 83, tags: [] },
  { id: 'j19', title: 'COBOL Developer',      client: 'Bank of America',      location: 'Charlotte, NC',  type: 'Contract',        billRate: '$135/hr', priority: 'High',   vmsSource: 'Fieldglass',   receivedAt: '5 days ago',slaDue: 'Jun 30 5:00 PM',   slaHoursLeft: 44, status: 'needs_assignment', assignedTo: null,             candidatesReviewed: 0,  submitted: 0, interviewed: 0, aiScore: 28, tags: ['Hard to Fill','Rare Tech'] },
  { id: 'j20', title: 'Sr. Java Developer',   client: 'Cognizant',            location: 'Remote',         type: 'Contract',        billRate: '$105/hr', priority: 'Medium', vmsSource: 'Beeline',      receivedAt: '6 days ago',slaDue: 'Jul 1 5:00 PM',    slaHoursLeft: 58, status: 'completed',        assignedTo: 'Sarah Mitchell', candidatesReviewed: 12, submitted: 5, interviewed: 2, aiScore: 86, tags: [] },
]

export type QueueDef = {
  id: string
  label: string
  filter: (j: WQJob) => boolean
}

export const QUEUE_DEFS: QueueDef[] = [
  { id: 'all',             label: 'All Incoming',       filter: () => true },
  { id: 'needs_assignment',label: 'Needs Assignment',   filter: j => j.status === 'needs_assignment' },
  { id: 'assigned',        label: 'Assigned',           filter: j => j.status === 'assigned' },
  { id: 'in_progress',     label: 'In Progress',        filter: j => j.status === 'in_progress' },
  { id: 'no_activity',     label: 'No Activity',        filter: j => j.status === 'no_activity' },
  { id: 'urgent',          label: 'Urgent',             filter: j => j.priority === 'Urgent' },
  { id: 'high_priority',   label: 'High Priority',      filter: j => j.priority === 'High' || j.priority === 'Urgent' },
  { id: 'overdue',         label: 'Overdue',            filter: j => j.status === 'overdue' },
  { id: 'completed',       label: 'Completed',          filter: j => j.status === 'completed' },
]
