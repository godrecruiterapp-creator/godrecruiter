import { getAutomationRunsAction } from '../actions'
import { HistoryClient } from './history-client'

export default async function HistoryPage() {
  const runs = await getAutomationRunsAction()
  return <HistoryClient runs={runs} />
}
