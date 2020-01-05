import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, Form, Input, message, Modal, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ModalProps } from 'antd/lib/modal'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { AvatarImage } from '../../components/common/Image'
import { AppContext } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { currencyFormatter, handleError } from '../../helpers'
import { UserRole } from '../../schemas/general'
import types from '../../types'

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
}

type MemberAdminModalProps = FormComponentProps &
  ModalProps & {
    member: MemberInfo | null
    onCancel?: () => void
    onSuccess?: () => void
  }

const MemberAdminModal: React.FC<MemberAdminModalProps> = ({ form, member, onCancel, onSuccess, ...modalProps }) => {
  const app = useContext(AppContext)
  const { authToken } = useAuth()
  const [updateMemberInfo] = useMutation<types.UPDATE_MEMBER_INFO, types.UPDATE_MEMBER_INFOVariables>(gql`
    mutation UPDATE_MEMBER_INFO($memberId: String!, $name: String, $email: String, $role: String) {
      update_member(where: { id: { _eq: $memberId } }, _set: { name: $name, email: $email, role: $role }) {
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
        },
      })
        .then(() => {
          message.success('儲存成功')
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
            href={`//${app.domain}/creators/${member.id}?token=${authToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-5 text-center"
          >
            <Button type="link">創作者主頁</Button>
          </a>
        )}
        {member.role === 'general-member' && (
          <a
            href={`//${app.domain}/members/${member.id}?token=${authToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-5 text-center"
          >
            <Button type="link">學員主頁</Button>
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
        <Form.Item label="姓名">
          {form.getFieldDecorator('name', {
            initialValue: member.name,
            rules: [{ required: true, message: '請輸入姓名' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="信箱">
          {form.getFieldDecorator('email', {
            initialValue: member.email,
            rules: [{ required: true, message: '請輸入信箱' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="設定身份">
          {form.getFieldDecorator('role', {
            initialValue: member.role,
          })(
            <Select>
              <Select.Option value="general-member">一般會員</Select.Option>
              <Select.Option value="content-creator">創作者</Select.Option>
              <Select.Option value="app-owner">管理者</Select.Option>
            </Select>,
          )}
        </Form.Item>

        <Divider />

        <StyledMetaBlock>
          <div className="mb-2">
            <span className="mr-3">上次登入</span>
            <span>{member.loginedAt ? moment(member.loginedAt).fromNow() : null}</span>
          </div>
          {/* <div className="mb-2">
            <span className="mr-3">持有點數</span>
            <span>{member.points} 點</span>
          </div> */}
          <div className="mb-2">
            <span className="mr-3">消費金額</span>
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
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            儲存
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default Form.create<MemberAdminModalProps>()(MemberAdminModal)
