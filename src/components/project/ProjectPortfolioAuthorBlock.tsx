import { PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Form, message, Modal, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import RoleAdminBlock from '../admin/RoleAdminBlock'
import ContentCreatorSelector from '../form/ContentCreatorSelector'

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

type FieldPRops = {
  memberId: string
}

const ProjectPortfolioAuthorBlock: React.FC<{
  projectId: string
}> = ({ projectId }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldPRops>()
  const [updatePortfolioAuthor] = useMutation<hasura.UPDATE_PORTFOLIO_AUTHOR, hasura.UPDATE_PORTFOLIO_AUTHORVariables>(
    UPDATE_PORTFOLIO_AUTHOR,
  )
  const [isVisible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const { authorData, authorDataRefetch } = usePortfolioAuthor(projectId)

  if (!projectId) {
    return <Skeleton active />
  }

  const handleDelete = () => {
    setLoading(true)
    updatePortfolioAuthor({
      variables: {
        projectRoleId: authorData.projectRoleId,
        memberId: '',
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullyDeleted))
        setVisible(false)
        authorDataRefetch()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: FieldPRops) => {
    setLoading(true)
    updatePortfolioAuthor({
      variables: {
        projectRoleId: authorData.projectRoleId,
        memberId: values.memberId,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        setVisible(false)
        authorDataRefetch()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <>
      {authorData.member.id && (
        <RoleAdminBlock
          key={authorData.member.id}
          name={authorData.member.name}
          pictureUrl={authorData.member.pictureUrl}
          onDelete={() => handleDelete()}
        />
      )}

      {!authorData.member.id && (
        <Button type="link" icon={<PlusOutlined />} size="small" onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.addAuthor)}
        </Button>
      )}

      <Modal footer={null} centered destroyOnClose visible={isVisible} onCancel={() => setVisible(false)}>
        <StyledModalTitle className="mb-4">{formatMessage(commonMessages.ui.addAuthor)}</StyledModalTitle>

        <Form form={form} layout="vertical" colon={false} hideRequiredMark onFinish={handleSubmit}>
          <Form.Item label={formatMessage(commonMessages.label.selectAuthor)} name="memberId">
            <ContentCreatorSelector allowedPermission="POST_ADMIN" />
          </Form.Item>

          <Form.Item className="text-right">
            <Button className="mr-2" onClick={() => setVisible(false)}>
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(commonMessages.ui.add)}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const usePortfolioAuthor = (projectId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_PORTFOLIO_AUTHOR, hasura.GET_PORTFOLIO_AUTHORVariables>(
    GET_PORTFOLIO_AUTHOR,
    {
      variables: { projectId },
    },
  )
  const authorData = {
    projectRoleId: data?.project_role[0]?.id,
    identityId: data?.project_role[0]?.identity?.id,
    member: {
      id: data?.project_role[0]?.member?.id,
      name: data?.project_role[0]?.member?.name || '',
      pictureUrl: data?.project_role[0]?.member?.picture_url || '',
    },
  }
  return { authorDataLoading: loading, authorData: authorData, authorDataRefetch: refetch }
}

const GET_PORTFOLIO_AUTHOR = gql`
  query GET_PORTFOLIO_AUTHOR($projectId: uuid!) {
    project_role(where: { project: { id: { _eq: $projectId } }, identity: { name: { _eq: "author" } } }) {
      id
      member {
        id
        name
        picture_url
      }
      identity {
        id
      }
    }
  }
`

const UPDATE_PORTFOLIO_AUTHOR = gql`
  mutation UPDATE_PORTFOLIO_AUTHOR($projectRoleId: uuid!, $memberId: String!) {
    update_project_role_by_pk(pk_columns: { id: $projectRoleId }, _set: { member_id: $memberId }) {
      member_id
    }
  }
`

export default ProjectPortfolioAuthorBlock
