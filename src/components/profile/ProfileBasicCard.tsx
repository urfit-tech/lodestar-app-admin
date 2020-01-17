import { Button, Form, Input, message, Typography, Select } from 'antd'
import { CardProps } from 'antd/lib/card'
import { FormComponentProps } from 'antd/lib/form'
import React from 'react'
import styled from 'styled-components'
import { useMember, useUpdateMemberBasic } from '../../hooks/member'
import AdminCard from '../admin/AdminCard'
import { AvatarImage } from '../common/Image'
import SingleUploader from '../common/SingleUploader'
import { StyledForm } from '../layout'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import BraftEditor, { EditorState } from 'braft-editor'
import { useTags } from '../../hooks/data'
import { useAuth } from '../../contexts/AuthContext'

const StyledAvatarFormItem = styled(Form.Item)`
  .ant-form-item-children {
    display: flex;
    align-items: center;
  }

  .ant-upload.ant-upload-select-picture-card {
    border: none;
    background: none;
  }
`
const StyledFormItem = styled(Form.Item)`
  && {
    align-items: flex-start;
  }
`
const StyledTextArea = styled(Input.TextArea)`
  && {
    padding: 10px 12px;
  }
`
type ProfileBasicCardProps = CardProps &
  FormComponentProps & {
    memberId: string
    withTitle?: boolean
    withTags?: boolean
    withAbstract?: boolean
    withDescription?: boolean
  }
const ProfileBasicCard: React.FC<ProfileBasicCardProps> = ({
  form,
  memberId,
  withTitle,
  withTags,
  withAbstract,
  withDescription,
  ...cardProps
}) => {
  const { currentMemberId } = useAuth()
  const { member } = useMember(memberId)
  const { tags } = useTags()
  const updateMemberBasic = useUpdateMemberBasic()

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (!error && member) {
        updateMemberBasic({
          variables: {
            memberId: currentMemberId,
            email: member.email,
            username: member.username,
            name: values.name,
            pictureUrl: values.picture
              ? `https://${process.env.REACT_APP_S3_BUCKET}/avatars/${localStorage.getItem(
                  'kolable.app.id',
                )}/${memberId}`
              : member.pictureUrl,
            title: values.title,
            abstract: values.abstract,
            description: values.description ? values.description.toRAW() : null,
            tags: values.tags ? values.tags.map((tag: string) => ({
              app_id: localStorage.getItem('kolable.app.id'),
              name: tag,
              type: ""
            })) : [],
            memberTags: values.tags ? values.tags.map((tag: string) => ({
              member_id: currentMemberId,
              tag_name: tag,
            })) : []
          },
        })
          .then(() => {
            message.success('儲存成功')
            window.location.reload(true)
          })
          .catch(err => message.error(err.message))
      }
    })
  }

  return (
    <AdminCard {...cardProps}>
      <Typography.Title className="mb-4" level={4}>
        基本資料
      </Typography.Title>
      <StyledForm
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 12 } }}
      >
        <StyledAvatarFormItem label="頭像">
          <div className="mr-3">
            <AvatarImage src={(member && member.pictureUrl) || ''} size={128} />
          </div>
          {form.getFieldDecorator('picture')(
            <SingleUploader
              accept="image/*"
              listType="picture-card"
              showUploadList={false}
              path={`avatars/${localStorage.getItem('kolable.app.id')}/${memberId}`}
              onSuccess={handleSubmit}
              isPublic={true}
            />,
          )}
        </StyledAvatarFormItem>
        <Form.Item label="名稱">
          {form.getFieldDecorator('name', {
            initialValue: member && member.name,
            rules: [{ required: true, message: '請輸入名稱' }],
          })(<Input />)}
        </Form.Item>
        {withTitle && (
          <Form.Item label="稱號">
            {form.getFieldDecorator('title', {
              initialValue: member && member.title,
            })(<Input />)}
          </Form.Item>
        )}
        {withTags && (
          <Form.Item label="專長">
            {form.getFieldDecorator('tags', {
              initialValue: member && member.memberTags && member.memberTags.map(memberTag => memberTag.tagName),
            })(
              <Select mode="tags">
                {tags.map(tag => (
                  <Select.Option key={tag}>{tag}</Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
        )}
        {withAbstract && (
          <StyledFormItem label="簡述">
            {form.getFieldDecorator('abstract', {
              initialValue: member && member.abstract,
            })(<StyledTextArea rows={3} maxLength={50} placeholder="50字以內" />)}
          </StyledFormItem>
        )}
        {withDescription && (
          <StyledFormItem label="介紹" wrapperCol={{ span: 24, md: { span: 20 } }}>
            {form.getFieldDecorator('description', {
              initialValue: BraftEditor.createEditorState((member && member.description) || ''),
              validateTrigger: 'onSubmit',
              rules: [
                {
                  validator: (rule, value: EditorState, callback) => {
                    value.isEmpty() ? callback('請輸入方案簡介') : callback()
                  },
                },
              ],
            })(<AdminBraftEditor />)}
          </StyledFormItem>
        )}
        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            取消
          </Button>
          <Button type="primary" htmlType="submit">
            儲存
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default Form.create<ProfileBasicCardProps>()(ProfileBasicCard)
