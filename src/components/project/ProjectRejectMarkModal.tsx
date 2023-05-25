import { MoreOutlined } from '@ant-design/icons'
import { gql, useApolloClient } from '@apollo/client'
import { Button, Dropdown, Form, Input, Menu, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useProject } from '../../hooks/project'
import projectMessages from './translation'

type RenameFieldProps = {
  reason: string
}

const ProjectRejectMarkModal: React.VFC<{
  projectRoleId: string
  onRefetch?: () => void
}> = ({ projectRoleId, onRefetch }) => {
  const [form] = useForm<RenameFieldProps>()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const apolloClient = useApolloClient()
  const { rejectProjectRole } = useProject()

  const handleSubmit = async (projectRoleId: string, setVisible: (visible: boolean) => void) => {
    const { data } = await apolloClient.query<hasura.GetProjectPublishedAt, hasura.GetProjectPublishedAtVariables>({
      query: gql`
        query GetProjectPublishedAt($projectRoleId: uuid!) {
          project_role(where: { id: { _eq: $projectRoleId } }) {
            id
            project {
              id
              published_at
            }
          }
        }
      `,
      variables: { projectRoleId },
    })

    setLoading(true)
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()
        rejectProjectRole({
          variables: {
            projectRoleId: projectRoleId,
            rejectedReason: values.reason,
            markedNotificationStatus: data?.project_role[0]?.project?.published_at ? 'readyToSend' : 'unsend',
          },
        })
          .then(() => {
            message.success(formatMessage(projectMessages.ProjectRejectMarkModal.hasRejectedMark))
            onRefetch?.()
          })
          .catch(handleError)
          .finally(() => setVisible(false))
      })
      .finally(() => setLoading(false))
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item>
                <div className="m-2" onClick={() => setVisible(true)}>
                  {formatMessage(commonMessages['ui'].reject)}
                </div>
              </Menu.Item>
            </Menu>
          }
          trigger={['hover']}
        >
          <div style={{ width: '100%' }}>
            <MoreOutlined />
          </div>
        </Dropdown>
      )}
      title={formatMessage(projectMessages.ProjectRejectMarkModal.rejectMark)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages['ui'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(projectRoleId, setVisible)}>
            {formatMessage(commonMessages['ui'].send)}
          </Button>
        </>
      )}
    >
      <Form form={form} layout="vertical" hideRequiredMark>
        <Form.Item
          label={formatMessage(projectMessages.ProjectRejectMarkModal.reason)}
          name="reason"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.TextArea
            placeholder={formatMessage(projectMessages.ProjectRejectMarkModal.pleaseEnterAReasonForRejection)}
          />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default ProjectRejectMarkModal
