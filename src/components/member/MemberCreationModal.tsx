import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { commonMessages, errorMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

const messages = defineMessages({
  createMember: { id: 'memberMessages.label.createMember', defaultMessage: '添加會員' },
  roleSettings: { id: 'memberMessages.label.roleSettings', defaultMessage: '添加身份' },
  username: { id: 'memberMessages.label.username', defaultMessage: '使用者名稱' },
})

type FieldProps = {
  username: string
  email: string
  role?: string
}

const MemberCreationModal: React.FC<
  AdminModalProps & {
    onRefetch?: () => void
  }
> = ({ onRefetch, ...restProps }) => {
  const { formatMessage } = useIntl()
  const { currentUserRole } = useAuth()
  const { id: appId } = useApp()
  const [insertMember] = useMutation<hasura.INSERT_MEMBER, hasura.INSERT_MEMBERVariables>(INSERT_MEMBER)
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

  const handleCreate = (callback?: { onSuccess?: () => void }) => {
    form.validateFields().then(values => {
      setLoading(true)
      insertMember({
        variables: {
          id: uuidv4(),
          email: values.email,
          username: values.username,
          role: values.role || 'general-member',
          appId,
        },
      })
        .then(() => {
          callback?.onSuccess?.()
        })
        .catch(() => {
          message.error(formatMessage(errorMessages.text.memberAlreadyExist))
        })
        .finally(() => setLoading(false))
    })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button className="ml-2" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(messages.createMember)}
        </Button>
      )}
      title={formatMessage(messages.createMember)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() =>
              handleCreate({
                onSuccess: () => {
                  message.success(formatMessage(commonMessages.event.successfullyCreated))
                  onRefetch?.()
                  setVisible(false)
                  form.resetFields()
                },
              })
            }
          >
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      {...restProps}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          role: 'general-member',
        }}
      >
        <Form.Item
          label={formatMessage(messages.username)}
          name="username"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(messages.username),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: 'Email',
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        {currentUserRole === 'app-owner' && (
          <Form.Item label={formatMessage(messages.roleSettings)} name="role">
            <Select<string>>
              <Select.Option value="general-member">{formatMessage(commonMessages.label.generalMember)}</Select.Option>
              <Select.Option value="content-creator">
                {formatMessage(commonMessages.label.contentCreator)}
              </Select.Option>
              <Select.Option value="app-owner">{formatMessage(commonMessages.label.appOwner)}</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </AdminModal>
  )
}

const INSERT_MEMBER = gql`
  mutation INSERT_MEMBER($id: String!, $appId: String!, $role: String!, $username: String!, $email: String!) {
    insert_member(
      objects: { id: $id, app_id: $appId, role: $role, username: $username, name: $username, email: $email }
    ) {
      returning {
        id
      }
    }
  }
`

export default MemberCreationModal
