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
import { handleError } from '../../helpers'
import { canWriteMemberPhone } from '../../helpers/memberWritePermissions'
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
  const { currentUserRole, currentMemberId, permissions } = useAuth()
  const { id: appId } = useApp()
  const [insertMember] = useMutation<
    { insert_member: { affected_rows: number } | null },
    Omit<hasura.INSERT_MEMBERVariables, 'phones'>
  >(INSERT_MEMBER)
  const canWritePhone = canWriteMemberPhone(currentUserRole, permissions)
  const [insertPhone] = useMutation(gql`
    mutation INSERT_CREATED_MEMBER_PHONE($memberId: String!, $phone: String!) {
      insert_member_phone_one(object: { member_id: $memberId, phone: $phone, is_primary: true }) {
        id
      }
    }
  `)
  const [form] = useForm<FieldProps>()
  const [account, setAccount] = useState({ email: '', username: '' })
  const status = useMember(account)
  const [loading, setLoading] = useState(false)

  const handleCreate = async (callback?: { onSuccess?: () => void }) => {
    try {
      const { email, username, role, phone } = await form.validateFields()
      setLoading(true)
      const memberId = uuidv4()
      const result = await insertMember({
        variables: {
          appId,
          id: memberId,
          email: email.toLowerCase().trim(),
          username: username.trim(),
          role: role || 'general-member',
          managerId: currentUserRole === 'general-member' ? currentMemberId : null,
          assignedAt: currentUserRole === 'general-member' ? new Date() : null,
        },
      })
      if (!result.data?.insert_member?.affected_rows) throw new Error('會員未建立，請確認建立會員權限後重試。')
      if (phone && canWritePhone) {
        try {
          const phoneResult = await insertPhone({ variables: { memberId, phone } })
          if (!phoneResult.data?.insert_member_phone_one) throw new Error('電話未新增')
        } catch {
          message.warning('會員已建立，但電話未儲存。請確認電話寫入權限後，到會員資料補填；不需重新建立會員。', 10)
        }
      }
      callback?.onSuccess?.()
    } catch (error) {
      if (error instanceof Error) handleError(error)
    } finally {
      setLoading(false)
    }
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
        <Form.Item
          label={formatMessage(commonMessages.label.phone)}
          name="phone"
          extra={!canWritePhone ? '目前沒有電話寫入權限；可先建立會員，再請有權限的人員補填。' : undefined}
        >
          <Input disabled={!canWritePhone} />
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
      }
    ) {
      affected_rows
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
