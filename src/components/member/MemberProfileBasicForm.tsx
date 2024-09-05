import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, InputNumber, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { includes } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { MemberAdminProps } from '../../types/member'
import CategorySelector from '../form/CategorySelector'
import { InhibitInputMemberSelector } from '../form/MemberSelector'
import TagSelector from '../form/TagSelector'

const StyledCloseIcon = styled.div`
  position: absolute;
  right: -25px;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: 100%;
`

type FieldProps = {
  name: string
  username: string
  email: string
  star: number
  phones: string[]
  categoryIds: string[]
  specialities: string[]
  tags?: string[]
  managerId?: string
}

const MemberProfileBasicForm: React.FC<{
  memberAdmin: MemberAdminProps | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { currentUserRole, permissions } = useAuth()
  const { enabledModules, settings } = useApp()

  const [updateMemberProfileBasic] = useMutation<
    hasura.UPDATE_MEMBER_PROFILE_BASIC,
    hasura.UPDATE_MEMBER_PROFILE_BASICVariables
  >(UPDATE_MEMBER_PROFILE_BASIC)
  const [loading, setLoading] = useState(false)

  if (!memberAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      updateMemberProfileBasic({
        variables: {
          name: values?.name || memberAdmin.name,
          username: permissions['MEMBER_USERNAME_EDIT']
            ? values?.username || memberAdmin.username
            : memberAdmin.username,
          email: permissions['MEMBER_EMAIL_EDIT'] ? values?.email || memberAdmin.email : memberAdmin.email,
          star: permissions['MEMBER_STAR_ADMIN'] ? values?.star || memberAdmin.star : memberAdmin.star,
          memberId: memberAdmin.id,
          phones: permissions['MEMBER_PHONE_ADMIN']
            ? values.phones
                .filter((phone: string) => !!phone)
                .map((phone: string) => {
                  const findPhone = memberAdmin.phones.find(memberPhone => memberPhone.phoneNumber === phone)
                  return {
                    member_id: memberAdmin.id,
                    phone,
                    is_valid: findPhone?.isValid,
                  }
                })
            : memberAdmin.phones.map(phone => ({
                member_id: memberAdmin.id,
                phone: phone.phoneNumber,
              })),
          managerId:
            enabledModules.member_assignment && permissions['MEMBER_MANAGER_ADMIN']
              ? values.managerId || null
              : memberAdmin.manager?.id,
          assignedAt: values.managerId ? new Date() : null,
          tags: (values.tags || memberAdmin.tags).map(tag => ({
            name: tag,
            type: '',
          })),
          memberTags: (values.tags || memberAdmin.tags).map(tag => ({
            member_id: memberAdmin.id,
            tag_name: tag,
          })),
          memberCategories: values.categoryIds.map((categoryId: string, index: number) => ({
            member_id: memberAdmin.id,
            category_id: categoryId,
            position: index,
          })),
          memberSpecialities: values.specialities.map(speciality => ({
            member_id: memberAdmin.id,
            tag_name: speciality,
          })),
        },
      })
        .then(() => {
          message.success(formatMessage(commonMessages.event.successfullySaved))
          onRefetch?.()
        })
        .catch(handleError)
        .finally(() => setLoading(false))
    } catch {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      colon={false}
      hideRequiredMark
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 12 } }}
      initialValues={{
        managerId: memberAdmin.manager?.id,
        name: memberAdmin.name,
        username: memberAdmin.username,
        email: memberAdmin.email,
        star: memberAdmin.star,
        phones: memberAdmin.phones.length ? memberAdmin.phones.map(phone => phone.phoneNumber) : [],
        specialities: memberAdmin.specialities,
        categoryIds: memberAdmin.categories.map(category => category.id),
        tags: memberAdmin.tags,
      }}
    >
      {enabledModules.member_assignment && permissions['MEMBER_MANAGER_ADMIN'] && (
        <Form.Item
          label={formatMessage(commonMessages.label.assign)}
          name="managerId"
          extra={memberAdmin.assignedAt ? moment(memberAdmin.assignedAt).format('YYYY-MM-DD HH:mm:ss') : ''}
        >
          <InhibitInputMemberSelector allowedPermissions={['BACKSTAGE_ENTER']} />
        </Form.Item>
      )}

      <Form.Item label={formatMessage(commonMessages.label.name)} name="name">
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.account)} name="username">
        <Input disabled={!permissions['MEMBER_USERNAME_EDIT']} />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.email)} name="email">
        <Input disabled={!permissions['MEMBER_EMAIL_EDIT']} />
      </Form.Item>
      {permissions['MEMBER_PHONE_ADMIN'] && (
        <Form.Item label={formatMessage(commonMessages.label.phone)} name="phones">
          <PhoneCollectionInput />
        </Form.Item>
      )}
      {permissions['MEMBER_STAR_ADMIN'] && (
        <Form.Item label={formatMessage(commonMessages.label.star)} name="star">
          <InputNumber />
        </Form.Item>
      )}
      <Form.Item label={formatMessage(commonMessages.label.speciality)} name="specialities">
        <TagSelector />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.memberCategory)} name="categoryIds">
        <CategorySelector classType="member" />
      </Form.Item>
      {includes(currentUserRole, ['app-owner', 'content-creator']) && (
        <Form.Item label={formatMessage(commonMessages.label.tags)} name="tags">
          <TagSelector />
        </Form.Item>
      )}

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const PhoneCollectionInput: React.FC<{
  value?: string[]
  onChange?: (value: string[]) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()

  return (
    <>
      {value?.map((phone, index) => (
        <div className="mb-3 position-relative" key={index}>
          <Input
            className={'mr-3 mb-0'}
            value={phone}
            onChange={e => {
              const newValue = [...value]
              newValue.splice(index, 1, e.target.value.trim())
              onChange && onChange(newValue)
            }}
          />
          {(settings['member_profile_phone.check.ignore.enable'] === '1' || index !== 0) && (
            <StyledCloseIcon
              onClick={() => {
                const newValue = [...value]
                newValue.splice(index, 1)
                onChange && onChange(newValue)
              }}
            >
              <CloseOutlined />
            </StyledCloseIcon>
          )}
        </div>
      ))}
      <Button
        icon={<PlusOutlined />}
        type="link"
        onClick={() => {
          if (value) {
            const newValue = [...value]
            newValue.splice(newValue.length, 0, '')
            onChange && onChange(newValue)
          }
        }}
      >
        {formatMessage(commonMessages.label.addPhones)}
      </Button>
    </>
  )
}

const UPDATE_MEMBER_PROFILE_BASIC = gql`
  mutation UPDATE_MEMBER_PROFILE_BASIC(
    $name: String
    $username: String
    $email: String
    $memberId: String!
    $managerId: String
    $star: numeric
    $assignedAt: timestamptz
    $tags: [tag_insert_input!]!
    $memberTags: [member_tag_insert_input!]!
    $phones: [member_phone_insert_input!]!
    $memberCategories: [member_category_insert_input!]!
    $memberSpecialities: [member_speciality_insert_input!]!
  ) {
    update_member(
      where: { id: { _eq: $memberId } }
      _set: {
        name: $name
        username: $username
        email: $email
        star: $star
        manager_id: $managerId
        assigned_at: $assignedAt
      }
    ) {
      affected_rows
    }
    # update tags
    delete_member_tag(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
      affected_rows
    }
    insert_member_tag(objects: $memberTags) {
      affected_rows
    }

    # update phones
    delete_member_phone(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_member_phone(objects: $phones) {
      affected_rows
    }

    # update memberCategories
    delete_member_category(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_member_category(objects: $memberCategories) {
      affected_rows
    }

    # update specialities
    delete_member_speciality(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_member_speciality(objects: $memberSpecialities) {
      affected_rows
    }
  }
`

export default MemberProfileBasicForm
