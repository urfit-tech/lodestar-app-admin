import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Modal, Select, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ModalProps } from 'antd/lib/modal'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { AppContext } from '../../contexts/AppContext'
import { currencyFormatter, handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { UserRole } from '../../types/general'
import { AvatarImage } from './Image'

const messages = defineMessages({
  creatorPageLink: { id: 'common.ui.creatorPageLink', defaultMessage: '創作者主頁' },
  memberPageLink: { id: 'common.ui.memberPageLink', defaultMessage: '學員主頁' },
  roleSettings: { id: 'common.label.roleSettings', defaultMessage: '設定身份' },
  accountData: { id: 'common.label.accountData', defaultMessage: '帳號資料' },
  memberLog: { id: 'common.label.memberLog', defaultMessage: '會員紀錄' },
})

const StyledMetaBlock = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.18px;
`

export type MemberInfoProps = {
  id: string
  avatarUrl: string | null
  name: string
  email: string
  loginedAt: Date | null
  role: UserRole
  points: number
  consumption: number
}

const MemberAdminModal: React.FC<
  ModalProps & {
    member: MemberInfoProps | null
    onCancel?: () => void
    onSuccess?: () => void
  }
> = ({ member, onCancel, onSuccess, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const app = useContext(AppContext)
  const [form] = useForm()
  const [updateMemberInfo] = useMutation<types.UPDATE_MEMBER_INFO, types.UPDATE_MEMBER_INFOVariables>(gql`
    mutation UPDATE_MEMBER_INFO($memberId: String!, $name: String, $email: String, $role: String) {
      update_member(where: { id: { _eq: $memberId } }, _set: { name: $name, email: $email, role: $role }) {
        affected_rows
      }
    }
  `)
  const [selectedRole, setSelectedRole] = useState<UserRole>(member?.role || 'anonymous')
  const [loading, setLoading] = useState(false)

  if (!member) {
    return null
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateMemberInfo({
      variables: {
        memberId: member.id,
        name: values.name,
        email: values.email,
        role: selectedRole,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onSuccess && onSuccess()
      })
      .catch(error => handleError(error))
      .finally(() => setLoading(false))
  }

  return (
    <Modal title={null} footer={null} onCancel={() => onCancel && onCancel()} {...modalProps}>
      <AvatarImage src={member.avatarUrl} size={120} className="mx-auto mb-4" />

      <div className="row no-gutters align-items-center justify-content-center">
        {member.role === 'content-creator' && (
          <a
            href={`//${app.settings['host']}/creators/${member.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-5 text-center"
          >
            <Button type="link">{formatMessage(messages.creatorPageLink)}</Button>
          </a>
        )}
        {member.role === 'general-member' && (
          <a
            href={`//${app.settings['host']}/members/${member.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-5 text-center"
          >
            <Button type="link">{formatMessage(messages.memberPageLink)}</Button>
          </a>
        )}
      </div>

      <Tabs defaultActiveKey="account">
        <Tabs.TabPane key="account" tab={formatMessage(messages.accountData)}>
          <Form
            form={form}
            layout="vertical"
            colon={false}
            hideRequiredMark
            initialValues={{
              name: member.name,
              email: member.email,
            }}
            onFinish={handleSubmit}
          >
            <Form.Item
              label={formatMessage(commonMessages.term.memberName)}
              name="name"
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(commonMessages.term.memberName),
                  }),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={formatMessage(commonMessages.term.email)}
              name="email"
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(commonMessages.term.email),
                  }),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={formatMessage(messages.roleSettings)}>
              <Select onChange={(value: UserRole) => setSelectedRole(value)} value={selectedRole}>
                <Select.Option value="general-member">{formatMessage(commonMessages.term.generalMember)}</Select.Option>
                <Select.Option value="content-creator">
                  {formatMessage(commonMessages.term.contentCreator)}
                </Select.Option>
                <Select.Option value="app-owner">{formatMessage(commonMessages.term.appOwner)}</Select.Option>
              </Select>
            </Form.Item>

            <div className="text-right">
              <Button
                className="mr-2"
                onClick={() => {
                  form.resetFields()
                  onCancel && onCancel()
                }}
              >
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {formatMessage(commonMessages.ui.save)}
              </Button>
            </div>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane key="log" tab={formatMessage(messages.memberLog)}>
          <StyledMetaBlock>
            <div className="row no-gutters mb-2">
              <div className="col-5">{formatMessage(commonMessages.label.lastLogin)}</div>
              <div className="col-7">{member.loginedAt ? moment(member.loginedAt).fromNow() : null}</div>
            </div>
            <div className="row no-gutters mb-2">
              <div className="col-5">{formatMessage(commonMessages.label.holdingPoints)}</div>
              <div className="col-7">{formatMessage(commonMessages.label.points, { points: member.points })}</div>
            </div>
            <div className="row no-gutters mb-2">
              <div className="col-5">{formatMessage(commonMessages.label.consumption)}</div>
              <div className="col-7">{currencyFormatter(member.consumption)}</div>
            </div>
          </StyledMetaBlock>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
}

export default MemberAdminModal
