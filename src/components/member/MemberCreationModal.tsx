import { FileAddOutlined } from '@ant-design/icons'
import { gql, useApolloClient, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { v4 as uuidv4 } from 'uuid'
import hasura from '../../hasura'
import { commonMessages, errorMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

const messages = defineMessages({
  createMember: { id: 'memberMessages.label.createMember', defaultMessage: '添加會員' },
  roleSettings: { id: 'memberMessages.label.roleSettings', defaultMessage: '添加身份' },
  username: { id: 'memberMessages.label.username', defaultMessage: '使用者名稱' },
  isExisted: { id: 'error.form.isExisted', defaultMessage: '{field}已存在' },
})

type MemberStatusType = 'idle' | 'searching' | 'unavailable' | 'available'

type FieldProps = {
  username: string
  email: string
  phone?: string
  role?: string
}

const MemberCreationModal: React.FC<
  AdminModalProps & {
    onRefetch?: () => void
  }
> = ({ onRefetch, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const { currentUserRole, currentMemberId } = useAuth()
  const { id: appId } = useApp()
  const [insertMember] = useMutation<hasura.INSERT_MEMBER, hasura.INSERT_MEMBERVariables>(INSERT_MEMBER)
  const [form] = useForm<FieldProps>()
  const [account, setAccount] = useState({ email: '', username: '' })
  const status = useMember(account)
  const [loading, setLoading] = useState(false)

  const handleCreate = async (callback?: { onSuccess?: () => void }) => {
    form
      .validateFields()
      .then(({ email, username, role, phone }) => {
        setLoading(true)
        insertMember({
          variables: {
            appId,
            id: uuidv4(),
            email: email.toLowerCase().trim(),
            username: username.trim(),
            role: role || 'general-member',
            managerId: currentUserRole === 'general-member' ? currentMemberId : null,
            assignedAt: currentUserRole === 'general-member' ? new Date() : null,
            phones: phone ? [{ phone, is_primary: true }] : [],
          },
        })
          .then(() => {
            callback?.onSuccess?.()
          })
          .catch(() => {
            message.error(formatMessage(errorMessages.text.memberAlreadyExist))
          })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (status === 'unavailable') {
      message.error(formatMessage(errorMessages.text.memberAlreadyExist))
    }
  }, [status])

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
      {...modalProps}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
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
          <Input onBlur={e => setAccount(props => ({ ...props, username: e.target.value }))} />
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
          <Input onBlur={e => setAccount(props => ({ ...props, email: e.target.value }))} />
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.phone)} name="phone">
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
  mutation INSERT_MEMBER(
    $id: String!
    $appId: String!
    $role: String!
    $username: String!
    $email: String!
    $managerId: String
    $assignedAt: timestamptz
    $phones: [member_phone_insert_input!]!
  ) {
    insert_member(
      objects: {
        id: $id
        app_id: $appId
        role: $role
        username: $username
        name: $username
        email: $email
        manager_id: $managerId
        assigned_at: $assignedAt
        member_phones: { data: $phones }
      }
    ) {
      returning {
        id
      }
    }
  }
`

export default MemberCreationModal

const useMember = (account: { email: string; username: string }): MemberStatusType => {
  const { email, username } = account
  const apolloClient = useApolloClient()
  const { id: appId } = useApp()
  const [status, setStatus] = useState<MemberStatusType>('idle')

  useEffect(() => {
    if (email || username) {
      setStatus('searching')
      apolloClient
        .query<hasura.SEARCH_MEMBERS, hasura.SEARCH_MEMBERSVariables>({
          query: gql`
            query SEARCH_MEMBERS($appId: String!, $email: String, $username: String) {
              member_public_aggregate(
                where: { _or: [{ email: { _eq: $email } }, { username: { _eq: $username } }], app_id: { _eq: $appId } }
              ) {
                aggregate {
                  count
                }
              }
            }
          `,
          variables: {
            email,
            username,
            appId,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const count = data?.member_public_aggregate.aggregate?.count || 0
          if (count) {
            setStatus('unavailable')
            return
          }
          setStatus('available')
        })
        .catch(() => {
          setStatus('idle')
        })
    }
  }, [email, username])

  return status
}
