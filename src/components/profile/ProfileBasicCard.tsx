import { Button, Form, Input, message, Select, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import React, { useContext } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useTags } from '../../hooks/data'
import { useMember, useUpdateMemberBasic } from '../../hooks/member'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import AdminCard from '../admin/AdminCard'
import { AvatarImage } from '../common/Image'
import SingleUploader from '../common/SingleUploader'
import { StyledForm } from '../layout'

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

const messages = defineMessages({
  profileBasic: { id: 'common.label.profileBasic', defaultMessage: '基本資料' },
})

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
  const { id: appId } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const app = useContext(AppContext)
  const { member, refetchMember } = useMember(memberId)
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
              ? `https://${process.env.REACT_APP_S3_BUCKET}/avatars/${appId}/${memberId}`
              : member.pictureUrl,
            title: values.title,
            abstract: values.abstract,
            description: values.description ? values.description.toRAW() : null,
            tags: values.tags
              ? values.tags.map((tag: string) => ({
                  app_id: appId,
                  name: tag,
                  type: '',
                }))
              : [],
            memberTags: values.tags
              ? values.tags.map((tag: string) => ({
                  member_id: currentMemberId,
                  tag_name: tag,
                }))
              : [],
          },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullySaved))
            refetchMember()
          })
          .catch(error => handleError(error))
      }
    })
  }

  return (
    <AdminCard {...cardProps}>
      <Typography.Title className="mb-4" level={4}>
        {formatMessage(messages.profileBasic)}
      </Typography.Title>
      <StyledForm
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 12 } }}
      >
        <StyledAvatarFormItem label={formatMessage(commonMessages.term.avatar)}>
          <div className="mr-3">
            <AvatarImage src={(member && member.pictureUrl) || ''} size={128} />
          </div>
          {form.getFieldDecorator('picture')(
            <SingleUploader
              accept="image/*"
              listType="picture-card"
              showUploadList={false}
              path={`avatars/${appId}/${memberId}`}
              onSuccess={handleSubmit}
              isPublic={true}
            />,
          )}
        </StyledAvatarFormItem>
        <Form.Item label={formatMessage(commonMessages.term.name)}>
          {form.getFieldDecorator('name', {
            initialValue: member && member.name,
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.name),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        {withTitle && (
          <Form.Item label={formatMessage(commonMessages.term.creatorTitle)}>
            {form.getFieldDecorator('title', {
              initialValue: member && member.title,
            })(<Input />)}
          </Form.Item>
        )}
        {withTags && (
          <Form.Item label={formatMessage(commonMessages.term.speciality)}>
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
          <StyledFormItem label={formatMessage(commonMessages.term.shortDescription)}>
            {form.getFieldDecorator('abstract', {
              initialValue: member && member.abstract,
              rules: [
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(commonMessages.term.shortDescription),
                  }),
                },
              ],
            })(
              <StyledTextArea
                rows={3}
                maxLength={100}
                placeholder={formatMessage(commonMessages.text.shortDescriptionPlaceholder)}
              />,
            )}
          </StyledFormItem>
        )}
        {withDescription && (
          <StyledFormItem
            label={formatMessage(commonMessages.term.introduction)}
            wrapperCol={{ span: 24, md: { span: 20 } }}
          >
            {form.getFieldDecorator('description', {
              initialValue: BraftEditor.createEditorState(member?.description || ''),
            })(<AdminBraftEditor />)}
          </StyledFormItem>
        )}
        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit">
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default Form.create<ProfileBasicCardProps>()(ProfileBasicCard)
