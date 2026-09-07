import { getAgentsAction } from '../actions'
import { MyAgentsClient } from './my-agents-client'

export default async function MyAgentsPage() {
  const agents = await getAgentsAction()
  return <MyAgentsClient agents={agents} />
}
