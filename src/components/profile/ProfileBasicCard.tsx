import { Button, Form, Input, message, Select, Skeleton } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useTags } from '../../hooks/data'
import { useMember, useUpdateMemberBasic } from '../../hooks/member'
import { AdminBlockTitle } from '../admin'
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

const ProfileBasicCard: React.FC<
  CardProps & {
    memberId: string
    withTitle?: boolean
    withTags?: boolean
    withAbstract?: boolean
    withDescription?: boolean
  }
> = ({ memberId, withTitle, withTags, withAbstract, withDescription, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { id: appId } = useContext(AppContext)
  const { currentMemberId } = useAuth()
  const { member, refetchMember } = useMember(memberId)
  const { tags } = useTags()
  const updateMemberBasic = useUpdateMemberBasic()
  const [loading, setLoading] = useState(false)

  if (!member) {
    return (
      <AdminCard {...cardProps}>
        <AdminBlockTitle className="mb-4">{formatMessage(messages.profileBasic)}</AdminBlockTitle>
        <Skeleton active />
      </AdminCard>
    )
  }

  const handleSubmit = (values: any) => {
    if (!member.id) {
      return
    }
    setLoading(true)
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
        refetchMember()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminCard {...cardProps}>
      <AdminBlockTitle className="mb-4">{formatMessage(messages.profileBasic)}</AdminBlockTitle>

      <StyledForm
        form={form}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 12 } }}
        colon={false}
        hideRequiredMark
        initialValues={{
          name: member.name,
          title: member.title,
          tags: member.memberTags?.map(memberTag => memberTag.tagName) || [],
          abstract: member.abstract,
          description: BraftEditor.createEditorState(member.description),
        }}
        onFinish={handleSubmit}
      >
        <StyledAvatarFormItem label={formatMessage(commonMessages.term.avatar)} name="picture">
          <div className="mr-3">
            <AvatarImage src={(member && member.pictureUrl) || ''} size={128} />
          </div>
          <SingleUploader
            accept="image/*"
            listType="picture-card"
            showUploadList={false}
            path={`avatars/${appId}/${memberId}`}
            onSuccess={handleSubmit}
            isPublic={true}
          />
          ,
        </StyledAvatarFormItem>
        <Form.Item
          label={formatMessage(commonMessages.term.name)}
          name="name"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.name),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        {withTitle && (
          <Form.Item label={formatMessage(commonMessages.term.creatorTitle)} name="title">
            <Input />
          </Form.Item>
        )}
        {withTags && (
          <Form.Item label={formatMessage(commonMessages.term.speciality)} name="tags">
            <Select mode="tags">
              {tags.map(tag => (
                <Select.Option key={tag} value={tag}>
                  {tag}
                </Select.Option>
              ))}
            </Select>
            ,
          </Form.Item>
        )}
        {withAbstract && (
          <StyledFormItem
            label={formatMessage(commonMessages.term.shortDescription)}
            name="abstract"
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.shortDescription),
                }),
              },
            ]}
          >
            <StyledTextArea
              rows={3}
              maxLength={100}
              placeholder={formatMessage(commonMessages.text.shortDescriptionPlaceholder)}
            />
          </StyledFormItem>
        )}
        {withDescription && (
          <StyledFormItem
            label={formatMessage(commonMessages.term.introduction)}
            wrapperCol={{ md: { span: 20 } }}
            name="description"
          >
            <AdminBraftEditor />
          </StyledFormItem>
        )}

        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default ProfileBasicCard
