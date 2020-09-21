import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Select, Skeleton } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useTags } from '../../hooks/data'
import { useMember } from '../../hooks/member'
import DefaultAvatarImage from '../../images/default/avatar.svg'
import types from '../../types'
import { AdminBlockTitle } from '../admin'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import AdminCard from '../admin/AdminCard'
import ImageInput from '../admin/ImageInput'
import { StyledForm } from '../layout'

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
  const { member, refetchMember } = useMember(memberId)
  const { tags } = useTags()

  const [updateMemberAvatar] = useMutation<types.UPDATE_MEMBER_AVATAR, types.UPDATE_MEMBER_AVATARVariables>(
    UPDATE_MEMBER_AVATAR,
  )
  const [updateMemberBasic] = useMutation<types.UPDATE_MEMBER_BASIC, types.UPDATE_MEMBER_BASICVariables>(
    UPDATE_MEMBER_BASIC,
  )

  const [loading, setLoading] = useState(false)

  if (!member) {
    return (
      <AdminCard {...cardProps}>
        <AdminBlockTitle className="mb-4">{formatMessage(messages.profileBasic)}</AdminBlockTitle>
        <Skeleton active />
      </AdminCard>
    )
  }

  const handleUpdateAvatar = () => {
    setLoading(true)
    const uploadTime = Date.now()
    updateMemberAvatar({
      variables: {
        memberId,
        pictureUrl: `https://${process.env.REACT_APP_S3_BUCKET}/avatars/${appId}/${memberId}?t=${uploadTime}`,
      },
    })
      .then(() => {
        refetchMember()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: any) => {
    if (!member.id) {
      return
    }
    setLoading(true)
    updateMemberBasic({
      variables: {
        memberId,
        email: member.email,
        username: member.username,
        name: values.name,
        // pictureUrl: values.picture
        //   ? `https://${process.env.REACT_APP_S3_BUCKET}/avatars/${appId}/${memberId}`
        //   : member.pictureUrl,
        title: values.title,
        abstract: values.abstract,
        description: values.description ? values.description.toRAW() : null,
        tags:
          values.tags?.map((tag: string) => ({
            app_id: appId,
            name: tag,
            type: '',
          })) || [],
        memberTags:
          values.tags?.map((tag: string) => ({
            member_id: memberId,
            tag_name: tag,
          })) || [],
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
        <Form.Item label={formatMessage(commonMessages.term.avatar)}>
          <ImageInput
            path={`avatars/${appId}/${memberId}`}
            image={{
              width: '128px',
              ratio: 1,
              shape: 'circle',
            }}
            value={member.pictureUrl || DefaultAvatarImage}
            onChange={() => handleUpdateAvatar()}
          />
        </Form.Item>
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
          <Form.Item
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
            <Input.TextArea
              rows={3}
              maxLength={100}
              placeholder={formatMessage(commonMessages.text.shortDescriptionPlaceholder)}
            />
          </Form.Item>
        )}
        {withDescription && (
          <Form.Item
            label={formatMessage(commonMessages.term.introduction)}
            wrapperCol={{ md: { span: 20 } }}
            name="description"
          >
            <AdminBraftEditor />
          </Form.Item>
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

const UPDATE_MEMBER_AVATAR = gql`
  mutation UPDATE_MEMBER_AVATAR($memberId: String!, $pictureUrl: String!) {
    update_member(where: { id: { _eq: $memberId } }, _set: { picture_url: $pictureUrl }) {
      affected_rows
    }
  }
`
const UPDATE_MEMBER_BASIC = gql`
  mutation UPDATE_MEMBER_BASIC(
    $memberId: String!
    $name: String
    $description: String
    $username: String
    $email: String
    # $pictureUrl: String
    $title: String
    $abstract: String
    $tags: [tag_insert_input!]!
    $memberTags: [member_tag_insert_input!]!
  ) {
    update_member(
      where: { id: { _eq: $memberId } }
      _set: {
        name: $name
        description: $description
        username: $username
        email: $email
        # picture_url: $pictureUrl
        title: $title
        abstract: $abstract
      }
    ) {
      affected_rows
    }
    delete_member_tag(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
      affected_rows
    }
    insert_member_tag(objects: $memberTags) {
      affected_rows
    }
  }
`

export default ProfileBasicCard
