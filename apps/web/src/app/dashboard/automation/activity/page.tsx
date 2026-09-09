import { getAutomationRunsAction } from '../actions'
import { ActivityClient } from './activity-client'

export default async function ActivityPage() {
  const runs = await getAutomationRunsAction()
  return <ActivityClient runs={runs} />
}
