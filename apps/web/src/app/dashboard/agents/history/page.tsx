import { getAgentRunsAction } from '../actions'
import { HistoryClient } from './history-client'

export default async function HistoryPage() {
  const runs = await getAgentRunsAction()
  return <HistoryClient runs={runs} />
}
