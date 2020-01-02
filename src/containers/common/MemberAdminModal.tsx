import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Divider, Form, Input, message, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ModalProps } from 'antd/lib/modal'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { AvatarImage } from '../../components/common/Image'
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
  roles: UserRole[]
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
  const [updateMemberInfor] = useMutation<types.UPDATE_MEMBER_INFOR, types.UPDATE_MEMBER_INFORVariables>(gql`
    mutation UPDATE_MEMBER_INFOR($memberId: String!, $name: String, $email: String, $roles: jsonb) {
      update_member(where: { id: { _eq: $memberId } }, _set: { name: $name, email: $email, roles: $roles }) {
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

      const roles: UserRole[] = ['general-member']
      values.isCreator && roles.push('content-creator')
      values.isOwner && roles.push('app-owner')

      updateMemberInfor({
        variables: {
          memberId: member.id,
          name: values.name,
          email: values.email,
          roles,
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
        <Link to={`/creators/${member.id}`} className="col-5 text-center">
          <Button type="link">創作者主頁</Button>
        </Link>
        <Divider type="vertical" />
        <Link to={`/members/${member.id}`} className="col-5 text-center">
          <Button type="link">學員主頁</Button>
        </Link>
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
        <Form.Item label="添加身份">
          {form.getFieldDecorator('isCreator', {
            valuePropName: 'checked',
            initialValue: member.roles.includes('content-creator'),
          })(<Checkbox>設為創作者</Checkbox>)}
          {form.getFieldDecorator('isOwner', {
            valuePropName: 'checked',
            initialValue: member.roles.includes('app-owner'),
          })(<Checkbox>設為管理者</Checkbox>)}
        </Form.Item>

        <Divider />

        <StyledMetaBlock>
          <div className="mb-2">
            <span className="mr-3">上次登入</span>
            <span>{member.loginedAt ? moment(member.loginedAt).fromNow() : null}</span>
          </div>
          <div className="mb-2">
            <span className="mr-3">持有點數</span>
            <span>{member.points} 點</span>
          </div>
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
