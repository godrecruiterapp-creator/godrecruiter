import { getProjectsAction } from '../actions'
import ProjectsListClient from './projects-list-client'

export default async function MyProjectsPage() {
  const projects = await getProjectsAction()
  return <ProjectsListClient projects={projects} />
}
