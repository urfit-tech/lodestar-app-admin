import { FileAddOutlined } from '@ant-design/icons'
import { useApolloClient, useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
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
  isExisted: { id: 'error.form.isExisted', defaultMessage: '{field}已存在' },
})

const StyledErrorMessage = styled.span`
  color: ${props => props.theme['@error-color']};
`

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
  const searchMember = useSearchMember()
  const [insertMember] = useMutation<hasura.INSERT_MEMBER, hasura.INSERT_MEMBERVariables>(INSERT_MEMBER)
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [isExist, setIsExist] = useState({ username: false, email: false })

  const handleCreateAsync = async (callback?: { onSuccess?: () => void }) => {
    if (form.getFieldValue('username') || form.getFieldValue('email')) {
      setLoading(true)
      const usernameIsExist =
        !!form.getFieldValue('username') && (await searchMember({ username: form.getFieldValue('username') }))
      const EmailIsExist = !!form.getFieldValue('email') && (await searchMember({ email: form.getFieldValue('email') }))
      setIsExist({
        email: EmailIsExist,
        username: usernameIsExist,
      })
      if (usernameIsExist || EmailIsExist) {
        setLoading(false)
        return
      }
    }

    form
      .validateFields()
      .then(({ email, username, role, phone }) => {
        setLoading(true)
        insertMember({
          variables: {
            appId,
            id: uuidv4(),
            email,
            username,
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
              handleCreateAsync({
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
          validateStatus={isExist.username ? 'error' : undefined}
          extra={
            isExist.username && (
              <StyledErrorMessage>
                {formatMessage(messages.isExisted, {
                  field: formatMessage(messages.username),
                })}
              </StyledErrorMessage>
            )
          }
        >
          <Input
            onFocus={e => {
              setIsExist(props => ({ ...props, username: false }))
            }}
          />
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
          validateStatus={isExist.email ? 'warning' : undefined}
          extra={
            isExist.email && (
              <StyledErrorMessage>
                {formatMessage(messages.isExisted, {
                  field: formatMessage(commonMessages.label.email),
                })}
              </StyledErrorMessage>
            )
          }
        >
          <Input
            onFocus={e => {
              setIsExist(props => ({ ...props, email: false }))
            }}
          />
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

const useSearchMember = () => {
  const apolloClient = useApolloClient()
  const { id: appId } = useApp()
  const searchMember = async (props: { email?: string; username?: string }) => {
    try {
      const { data } = await apolloClient.query<hasura.SEARCH_MEMBERS, hasura.SEARCH_MEMBERSVariables>({
        query: gql`
          query SEARCH_MEMBERS($appId: String!, $email: String, $username: String) {
            member_public_aggregate(
              where: { email: { _eq: $email }, username: { _eq: $username }, app_id: { _eq: $appId } }
            ) {
              aggregate {
                count
              }
            }
          }
        `,
        variables: {
          email: props.email,
          username: props.username,
          appId,
        },
        fetchPolicy: 'no-cache',
      })

      const count = !!data?.member_public_aggregate.aggregate?.count || false

      return count
    } catch {
      return false
    }
  }

  return searchMember
}
