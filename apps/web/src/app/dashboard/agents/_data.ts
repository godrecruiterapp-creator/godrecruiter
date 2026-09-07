// Shared types + config for the Agents module.
// Live agent data comes from the database via ./actions.ts.

export type AgentStatus = 'draft' | 'active' | 'paused'

export type Agent = {
  id: string
  name: string
  category: string
  status: AgentStatus
  trigger: string
  last_run: string      // 'Never' until an execution engine writes runs
  next_run: string      // derived from status + trigger
  success_rate: number | null   // null until runs exist
  owner: string
}

export const AGENT_CATEGORIES = ['Recruiting', 'Candidate', 'Job', 'Communication', 'Compliance', 'Productivity', 'Analytics', 'Custom']
