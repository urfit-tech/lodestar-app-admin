import Icon from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import ProjectCollectionTabs from '../../components/project/ProjectCollectionTabs'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, projectMessages } from '../../helpers/translation'
import { ReactComponent as ProjectIcon } from '../../images/icon/project.svg'
import types from '../../types'

const ProjectFundingPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, currentUserRole } = useAuth()
  const { id: appId } = useApp()
  const [createProject] = useMutation<types.INSERT_PROJECT, types.INSERT_PROJECTVariables>(INSERT_PROJECT)

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ProjectIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.projectFunding)}</span>
      </AdminPageTitle>
      {currentMemberId && (
        <div className="row mb-5">
          <div className="col-8">
            <ProductCreationModal
              memberPermission={'PROJECT_FUNDING_ADMIN'}
              withCreatorSelector={currentUserRole === 'app-owner'}
              creatorAppellation={formatMessage(projectMessages.label.sponsor)}
              customTitle={formatMessage(projectMessages.label.projectTitle)}
              customTitleDefault={formatMessage(projectMessages.label.unnamedProject)}
              onCreate={({ title, creatorId }) =>
                createProject({
                  variables: {
                    appId,
                    title,
                    memberId: creatorId || currentMemberId,
                    type: 'funding',
                  },
                }).then(({ data }) => {
                  const projectId = data?.insert_project?.returning[0]?.id
                  projectId && history.push(`/projects/${projectId}`)
                })
              }
            />
          </div>
        </div>
      )}
      <ProjectCollectionTabs projectType="funding" />
    </AdminLayout>
  )
}
const INSERT_PROJECT = gql`
  mutation INSERT_PROJECT($appId: String!, $title: String!, $memberId: String!, $type: String!) {
    insert_project(objects: { app_id: $appId, title: $title, creator_id: $memberId, type: $type }) {
      affected_rows
      returning {
        id
      }
    }
  }
`
export default ProjectFundingPage
