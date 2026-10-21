import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Alert, Button, Descriptions, Form, Input, InputNumber, message, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CountryCode, getCountries, getCountryCallingCode } from 'libphonenumber-js'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { includes, uniq } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { normalizeMemberPhone } from '../../helpers/memberPhone'
import {
  assertMemberUpdated,
  canEditMemberIdentity,
  identityReadOnlyMessage,
  ownerReadOnlyMessage,
} from '../../helpers/memberWritePermissions'
import { commonMessages } from '../../helpers/translation'
import { MemberAdminProps } from '../../types/member'
import CategorySelector from '../form/CategorySelector'
import { AllMemberSelector } from '../form/MemberSelector'
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
  countryCodes: string[]
  categoryIds: string[]
  specialities: string[]
  tags?: string[]
  managerId?: string
}
const splitPhoneData = (phoneData: string[] = [], separator: string): { phones: string[]; countryCodes: string[] } => {
  const countryCodes: string[] = []
  const phones: string[] = []

  phoneData.forEach(data => {
    if (!data) data = `${separator}`
    const [countryCode, phone] = data.split(separator)
    countryCodes.push(countryCode ?? '')
    phones.push(phone ?? '')
  })

  return {
    phones,
    countryCodes,
  }
}

const MemberProfileBasicForm: React.FC<{
  memberAdmin: MemberAdminProps | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { currentUserRole, currentMemberId, permissions } = useAuth()
  const { enabledModules, settings } = useApp()

  const [updateMemberProfileBasic] = useMutation<
    hasura.UPDATE_MEMBER_PROFILE_BASIC,
    Omit<
      hasura.UPDATE_MEMBER_PROFILE_BASICVariables,
      'name' | 'username' | 'email' | 'star' | 'managerId' | 'assignedAt'
    > & { identity: hasura.member_set_input; updatePhones: boolean }
  >(UPDATE_MEMBER_PROFILE_BASIC)
  const [loading, setLoading] = useState(false)

  if (!memberAdmin) {
    return <Skeleton active />
  }

  const readOnly = memberAdmin.role === 'app-owner' && currentUserRole !== 'app-owner'
  const canEditIdentity = canEditMemberIdentity(currentUserRole, currentMemberId, memberAdmin)
  const canEditEmail =
    canEditIdentity &&
    (currentUserRole === 'app-owner' || currentMemberId === memberAdmin.id || permissions.MEMBER_EMAIL_EDIT)
  const canEditUsername =
    canEditIdentity &&
    (currentUserRole === 'app-owner' || currentMemberId === memberAdmin.id || permissions.MEMBER_USERNAME_EDIT)

  const initialPhones = memberAdmin.phones.map(phone => `${phone.countryCode},${phone.phoneNumber}`)
  const nonEmptyPhones = (values: string[] = []) => values.filter(value => splitPhoneData([value], ',').phones[0])
  const phonesChanged = (values: string[] = []) =>
    JSON.stringify(nonEmptyPhones(values)) !== JSON.stringify(initialPhones)

  const phoneInput = (value: string) => {
    const { phones, countryCodes } = splitPhoneData([value], ',')
    const original = memberAdmin.phones.find(
      phone => phone.phoneNumber === phones[0] && phone.countryCode === countryCodes[0],
    )
    // Preserve the existing opt-out for applications that intentionally accept unvalidated phone text.
    let normalized
    if (!original) {
      try {
        normalized = normalizeMemberPhone(phones[0], (countryCodes[0] || undefined) as CountryCode | undefined)
      } catch (error) {
        if (settings['member_profile_phone.check.ignore.enable'] !== '1') throw error
        normalized = { phone: phones[0], country_code: countryCodes[0] || null, international_phone: null }
      }
    }
    return original
      ? {
          phone: original.phoneNumber,
          country_code: original.countryCode || null,
          international_phone: original.internationalPhone ?? null,
          is_valid: original.isValid,
          is_primary: original.isPrimary ?? false,
        }
      : {
          ...normalized,
          is_valid: true,
        }
  }

  const handleSubmit = async () => {
    if (readOnly) return message.error(ownerReadOnlyMessage)
    try {
      setLoading(true)
      const values = await form.validateFields()
      const normalizedTags = uniq((values.tags || memberAdmin.tags).map(tag => tag.trim()).filter(Boolean))
      const normalizedSpecialities = uniq(
        (values.specialities || []).map(speciality => speciality.trim()).filter(Boolean),
      )
      const mergedTagNames = uniq([...normalizedTags, ...normalizedSpecialities])
      try {
        const result = await updateMemberProfileBasic({
          variables: {
            identity: {
              name: values.name || memberAdmin.name,
              star: permissions.MEMBER_STAR_ADMIN ? values.star ?? memberAdmin.star : memberAdmin.star,
              manager_id:
                enabledModules.member_assignment && permissions.MEMBER_MANAGER_ADMIN
                  ? values.managerId || null
                  : memberAdmin.manager?.id,
              assigned_at: values.managerId ? new Date() : null,
              ...(canEditUsername && values.username !== memberAdmin.username ? { username: values.username } : {}),
              ...(canEditEmail && values.email !== memberAdmin.email ? { email: values.email } : {}),
            },
            updatePhones: !!permissions.MEMBER_PHONE_ADMIN && phonesChanged(values.phones),

            memberId: memberAdmin.id,
            phones:
              permissions.MEMBER_PHONE_ADMIN && phonesChanged(values.phones)
                ? nonEmptyPhones(values.phones).map(value => ({ member_id: memberAdmin.id, ...phoneInput(value) }))
                : [],

            tags: mergedTagNames.map(tag => ({
              name: tag,
              type: '',
            })),
            memberTags: normalizedTags.map(tag => ({
              member_id: memberAdmin.id,
              tag_name: tag,
            })),
            memberCategories: values.categoryIds.map((categoryId: string, index: number) => ({
              member_id: memberAdmin.id,
              category_id: categoryId,
              position: index,
            })),
            memberSpecialities: normalizedSpecialities.map(speciality => ({
              member_id: memberAdmin.id,
              tag_name: speciality,
            })),
          },
        })

        assertMemberUpdated(result)
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      } catch (error) {
        handleError(error)
      }
    } catch (error) {
      process.env.NODE_ENV === 'development' ?? console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (readOnly)
    return (
      <>
        <Alert type="info" message={ownerReadOnlyMessage} className="mb-3" />
        <Descriptions column={1} bordered>
          <Descriptions.Item label="姓名">{memberAdmin.name}</Descriptions.Item>
          <Descriptions.Item label="帳號">{memberAdmin.username}</Descriptions.Item>
          <Descriptions.Item label="信箱">{memberAdmin.email}</Descriptions.Item>
          <Descriptions.Item label="電話">
            {memberAdmin.phones.map(phone => phone.phoneNumber).join(', ')}
          </Descriptions.Item>
          <Descriptions.Item label="星等">{memberAdmin.star}</Descriptions.Item>
          <Descriptions.Item label="負責人">{memberAdmin.manager?.name}</Descriptions.Item>
          <Descriptions.Item label="專長">{memberAdmin.specialities.join(', ')}</Descriptions.Item>
          <Descriptions.Item label="分類">
            {memberAdmin.categories.map(category => category.name).join(', ')}
          </Descriptions.Item>
          <Descriptions.Item label="標籤">{memberAdmin.tags.join(', ')}</Descriptions.Item>
        </Descriptions>
      </>
    )

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
        phones: memberAdmin.phones.length ? initialPhones : ['TW,'],
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
          <AllMemberSelector allowClear allowedPermissions={['BACKSTAGE_ENTER']} />
        </Form.Item>
      )}

      <Form.Item label={formatMessage(commonMessages.label.name)} name="name">
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage(commonMessages.label.account)}
        name="username"
        extra={!canEditIdentity ? identityReadOnlyMessage : undefined}
      >
        <Input disabled={!canEditUsername} />
      </Form.Item>
      <Form.Item
        label={formatMessage(commonMessages.label.email)}
        name="email"
        extra={!canEditIdentity ? identityReadOnlyMessage : undefined}
      >
        <Input disabled={!canEditEmail} />
      </Form.Item>
      {permissions['MEMBER_PHONE_ADMIN'] && (
        <Form.Item
          label={formatMessage(commonMessages.label.phone)}
          name="phones"
          extra="本地電話請選擇國家／地區；國際或非地域電話請輸入完整 +國碼。未修改的舊電話會保留原資料。"
          rules={[
            {
              validator: async (_: unknown, values: string[]) => {
                if (!phonesChanged(values)) return
                if (
                  settings['member_profile_phone.check.ignore.enable'] !== '1' &&
                  splitPhoneData(values, ',').phones.some(phone => !phone.trim())
                ) {
                  throw new Error('電話不可為空，請填寫電話或使用移除按鈕。')
                }
                nonEmptyPhones(values).forEach(phoneInput)
              },
            },
          ]}
        >
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
  const { countryCodes, phones } = splitPhoneData(value, ',')

  return (
    <>
      {value?.map((_, index) => (
        <div className="mb-2 position-relative" key={index}>
          <Input
            key={index}
            className={'mr-3 mb-0'}
            value={phones[index]}
            onChange={e => {
              const newValue = [...value]
              newValue.splice(index, 1, `${countryCodes[index]},${e.target.value.trim()}`)
              onChange && onChange(newValue)
            }}
            addonBefore={<CountryCodeSelect value={value} index={index} onChange={onChange} />}
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
            newValue.splice(newValue.length, 0, 'TW,')
            onChange && onChange(newValue)
          }
        }}
      >
        {formatMessage(commonMessages.label.addPhones)}
      </Button>
    </>
  )
}

const StyledSelect = styled.div`
  .ant-select-selection-search,
  .ant-select-selection-search-input,
  .ant-select-selection-item {
    color: #4a4a4a !important;
  }
`

const CountryCodeSelect: React.FC<{
  value: string[]
  index: number
  onChange?: (value: string[]) => void
}> = ({ value, index, onChange }) => {
  const { phones, countryCodes } = splitPhoneData(value, ',')
  const allCountryCodeData = getCountries().map(countryCode => ({
    countryCode,
    countryCallingCode: `+${getCountryCallingCode(countryCode)}`,
  }))

  return (
    <StyledSelect>
      <Select
        showSearch
        placeholder="國家／地區"
        style={{ minWidth: '120px' }}
        key={`${index}${countryCodes[index]}`}
        value={countryCodes[index]}
        onChange={e => {
          const newValue = [...value]
          newValue.splice(index, 1, `${e},${phones[index]}`)
          onChange?.(newValue)
        }}
        filterOption={(input, option) => option?.children.toLowerCase().includes(input.toLowerCase())}
      >
        {allCountryCodeData?.map(data => (
          <Select.Option
            key={`${data.countryCode}${data.countryCallingCode}`}
            value={data.countryCode}
          >{`${data.countryCode} (${data.countryCallingCode})`}</Select.Option>
        ))}
      </Select>
    </StyledSelect>
  )
}

const UPDATE_MEMBER_PROFILE_BASIC = gql`
  mutation UPDATE_MEMBER_PROFILE_BASIC(
    $identity: member_set_input!
    $updatePhones: Boolean!
    $memberId: String!
    $tags: [tag_insert_input!]!
    $memberTags: [member_tag_insert_input!]!
    $phones: [member_phone_insert_input!]!
    $memberCategories: [member_category_insert_input!]!
    $memberSpecialities: [member_speciality_insert_input!]!
  ) {
    update_member(where: { id: { _eq: $memberId } }, _set: $identity) {
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
    delete_member_phone(where: { member_id: { _eq: $memberId } }) @include(if: $updatePhones) {
      affected_rows
    }
    insert_member_phone(objects: $phones) @include(if: $updatePhones) {
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
