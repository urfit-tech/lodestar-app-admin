import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, Form, Input, message, Modal, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ModalProps } from 'antd/lib/modal'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { AvatarImage } from '../../components/common/Image'
import { AppContext } from '../../contexts/AppContext'
import { currencyFormatter, handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { UserRole } from '../../schemas/general'
import types from '../../types'
import ZoomUserSelector from './ZoomUserSelector'

const messages = defineMessages({
  creatorPageLink: { id: 'common.ui.creatorPageLink', defaultMessage: '創作者主頁' },
  memberPageLink: { id: 'common.ui.memberPageLink', defaultMessage: '學員主頁' },
  roleSettings: { id: 'common.label.roleSettigs', defaultMessage: '設定身份' },
})

const StyledMetaBlock = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.18px;
`

export type MemberInfo = {
  id: string
  avatarUrl: string | null
  name: string
  email: string
  loginedAt: Date | null
  role: UserRole
  points: number
  consumption: number
  zoomUserId: string | null
}

type MemberAdminModalProps = FormComponentProps &
  ModalProps & {
    member: MemberInfo | null
    onCancel?: () => void
    onSuccess?: () => void
  }

const MemberAdminModal: React.FC<MemberAdminModalProps> = ({ form, member, onCancel, onSuccess, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const app = useContext(AppContext)
  const [updateMemberInfo] = useMutation<types.UPDATE_MEMBER_INFO, types.UPDATE_MEMBER_INFOVariables>(gql`
    mutation UPDATE_MEMBER_INFO($memberId: String!, $name: String, $email: String, $role: String, $zoomUserId: String) {
      update_member(
        where: { id: { _eq: $memberId } }
        _set: { name: $name, email: $email, role: $role, zoom_user_id: $zoomUserId }
      ) {
        affected_rows
      }
    }
  `)
  const [loading, setLoading] = useState(false)

  if (!member) {
    return null
  }

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)

      updateMemberInfo({
        variables: {
          memberId: member.id,
          name: values.name,
          email: values.email,
          role: values.role,
          zoomUserId: values.zoomUserId,
        },
      })
        .then(() => {
          message.success(formatMessage(commonMessages.event.successfullySaved))
          onSuccess && onSuccess()
        })
        .catch(error => handleError(error))
        .finally(() => setLoading(false))
    })
  }

  return (
    <Modal {...modalProps} title={null} footer={null} onCancel={() => onCancel && onCancel()}>
      <AvatarImage src={member.avatarUrl} size={120} className="mx-auto mb-4" />

      <div className="row no-gutters align-items-center justify-content-center">
        {member.role === 'content-creator' && (
          <a
            href={`//${app.domain}/creators/${member.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-5 text-center"
          >
            <Button type="link">{formatMessage(messages.creatorPageLink)}</Button>
          </a>
        )}
        {member.role === 'general-member' && (
          <a
            href={`//${app.domain}/members/${member.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-5 text-center"
          >
            <Button type="link">{formatMessage(messages.memberPageLink)}</Button>
          </a>
        )}
      </div>

      <Form
        hideRequiredMark
        colon={false}
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <Form.Item label={formatMessage(commonMessages.term.memberName)}>
          {form.getFieldDecorator('name', {
            initialValue: member.name,
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.memberName),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.term.email)}>
          {form.getFieldDecorator('email', {
            initialValue: member.email,
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.email),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.roleSettings)}>
          {form.getFieldDecorator('role', {
            initialValue: member.role,
          })(
            <Select>
              <Select.Option value="general-member">{formatMessage(commonMessages.term.generalMember)}</Select.Option>
              <Select.Option value="content-creator">{formatMessage(commonMessages.term.contentCreator)}</Select.Option>
              <Select.Option value="app-owner">{formatMessage(commonMessages.term.appOwner)}</Select.Option>
            </Select>,
          )}
        </Form.Item>

        <Form.Item label="綁定 Zoom 帳號">
          {form.getFieldDecorator('zoomUserId', {
            initialValue: member.zoomUserId,
          })(<ZoomUserSelector />)}
        </Form.Item>

        <Divider />

        <StyledMetaBlock>
          <div className="mb-2">
            <span className="mr-3">{formatMessage(commonMessages.label.lastLogin)}</span>
            <span>{member.loginedAt ? moment(member.loginedAt).fromNow() : null}</span>
          </div>
          {/* <div className="mb-2">
            <span className="mr-3">{formatMessage(commonMessages.label.holdingPoints)}</span>
            <span>{formatMessage(commonMessages.label.points, { points: member.points })}</span>
          </div> */}
          <div className="mb-2">
            <span className="mr-3">{formatMessage(commonMessages.label.consumption)}</span>
            <span>{currencyFormatter(member.consumption)}</span>
          </div>
        </StyledMetaBlock>

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
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default Form.create<MemberAdminModalProps>()(MemberAdminModal)
