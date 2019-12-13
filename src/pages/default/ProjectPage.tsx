import React from 'react'
import useRouter from 'use-react-router'
import DefaultLayout from '../../components/layout/DefaultLayout'
import ProjectContent from '../../containers/project/ProjectContent'

const ProjectPage = () => {
  const { match } = useRouter<{ projectId: string }>()

  return (
    <DefaultLayout white noFooter>
      <ProjectContent projectId={match.params.projectId} />
    </DefaultLayout>
  )
}

export default ProjectPage
