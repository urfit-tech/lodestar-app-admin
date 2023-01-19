import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminModal from '../../components/admin/AdminModal'
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
  const { rejectProjectRole } = useProject()

  const handleSubmit = (projectRoleId: string, setVisible: (visible: boolean) => void) => {
    setLoading(true)
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()
        rejectProjectRole({ variables: { projectRoleId: projectRoleId, rejectedReason: values.reason } })
          .then(() => {
            message.error(formatMessage(projectMessages.ProjectRejectMarkModal.hasRejectedMark))
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
        <Button onClick={() => setVisible(true)}>{formatMessage(commonMessages['ui'].reject)}</Button>
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
