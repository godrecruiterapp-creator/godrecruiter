// Shared mock data for the Interviews module

export type Interview = {
  id: string; interview_id: string; candidate: string; job: string; client: string
  recruiter: string; type: string; round: string; date: string; time: string
  timezone: string; interviewer: string; status: string; email_status: string
  confirmation: string; feedback: string
}

export const MOCK_INTERVIEWS: Interview[] = [
  { id:'1', interview_id:'INT-0001', candidate:'Sarah Johnson', job:'Senior Java Developer', client:'TechCorp Inc', recruiter:'Arun Kumar', type:'Technical Interview', round:'Round 2', date:'2026-06-28', time:'10:00 AM', timezone:'EST', interviewer:'Mike Chen', status:'scheduled', email_status:'opened', confirmation:'confirmed', feedback:'pending' },
  { id:'2', interview_id:'INT-0002', candidate:'James Martinez', job:'RN – ICU', client:'Metro Health', recruiter:'Arun Kumar', type:'Client Interview', round:'Round 1', date:'2026-06-28', time:'2:00 PM', timezone:'CST', interviewer:'Dr. Smith', status:'confirmed', email_status:'delivered', confirmation:'confirmed', feedback:'pending' },
  { id:'3', interview_id:'INT-0003', candidate:'Emily Chen', job:'DevOps Engineer', client:'CloudBase', recruiter:'Arun Kumar', type:'Video Interview', round:'Round 1', date:'2026-06-29', time:'11:00 AM', timezone:'PST', interviewer:'Tom Wilson', status:'scheduled', email_status:'sent', confirmation:'pending', feedback:'pending' },
  { id:'4', interview_id:'INT-0004', candidate:'Robert Kim', job:'Project Manager', client:'BuildRight', recruiter:'Arun Kumar', type:'Panel Interview', round:'Final', date:'2026-06-27', time:'9:00 AM', timezone:'EST', interviewer:'Panel', status:'completed', email_status:'replied', confirmation:'confirmed', feedback:'submitted' },
  { id:'5', interview_id:'INT-0005', candidate:'Lisa Thompson', job:'Data Scientist', client:'Analytics Co', recruiter:'Arun Kumar', type:'Phone Screen', round:'Round 1', date:'2026-06-27', time:'3:30 PM', timezone:'EST', interviewer:'HR Team', status:'completed', email_status:'opened', confirmation:'confirmed', feedback:'pending' },
  { id:'6', interview_id:'INT-0006', candidate:'David Park', job:'Software Architect', client:'FinTech Ltd', recruiter:'Arun Kumar', type:'Technical Interview', round:'Round 3', date:'2026-06-30', time:'1:00 PM', timezone:'EST', interviewer:'CTO Office', status:'scheduled', email_status:'delivered', confirmation:'pending', feedback:'pending' },
  { id:'7', interview_id:'INT-0007', candidate:'Maria Garcia', job:'Physical Therapist', client:'RehabCare', recruiter:'Arun Kumar', type:'HR Interview', round:'Round 1', date:'2026-06-26', time:'10:00 AM', timezone:'MST', interviewer:'HR Director', status:'cancelled', email_status:'bounced', confirmation:'declined', feedback:'pending' },
  { id:'8', interview_id:'INT-0008', candidate:'Kevin Brown', job:'Network Engineer', client:'NetSec Corp', recruiter:'Arun Kumar', type:'Technical Interview', round:'Round 2', date:'2026-06-25', time:'2:00 PM', timezone:'EST', interviewer:'Tech Lead', status:'no_show', email_status:'opened', confirmation:'confirmed', feedback:'pending' },
  { id:'9', interview_id:'INT-0009', candidate:'Amy Wilson', job:'UX Designer', client:'Creative Labs', recruiter:'Arun Kumar', type:'Client Interview', round:'Round 2', date:'2026-07-01', time:'11:30 AM', timezone:'PST', interviewer:'Design Head', status:'scheduled', email_status:'sent', confirmation:'pending', feedback:'pending' },
  { id:'10', interview_id:'INT-0010', candidate:'Chris Lee', job:'ML Engineer', client:'AI Startup', recruiter:'Arun Kumar', type:'Video Interview', round:'Round 1', date:'2026-07-02', time:'4:00 PM', timezone:'EST', interviewer:'Tech Team', status:'scheduled', email_status:'delivered', confirmation:'pending', feedback:'pending' },
  { id:'11', interview_id:'INT-0011', candidate:'Sandra Davis', job:'LPN – Acute Care', client:'City Hospital', recruiter:'Arun Kumar', type:'Final Interview', round:'Final', date:'2026-06-27', time:'9:30 AM', timezone:'EST', interviewer:'Nurse Manager', status:'rescheduled', email_status:'replied', confirmation:'confirmed', feedback:'pending' },
  { id:'12', interview_id:'INT-0012', candidate:'Tom Anderson', job:'Sales Manager', client:'RetailCo', recruiter:'Arun Kumar', type:'Manager Interview', round:'Round 1', date:'2026-07-03', time:'10:00 AM', timezone:'CST', interviewer:'VP Sales', status:'scheduled', email_status:'sent', confirmation:'pending', feedback:'pending' },
]
