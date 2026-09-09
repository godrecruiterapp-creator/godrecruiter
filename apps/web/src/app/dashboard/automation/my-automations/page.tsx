import { getAutomationsAction } from '../actions'
import { MyAutomationsClient } from './my-automations-client'

export default async function MyAutomationsPage() {
  const automations = await getAutomationsAction()
  return <MyAutomationsClient automations={automations} />
}
