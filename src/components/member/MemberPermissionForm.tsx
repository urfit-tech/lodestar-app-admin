import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Form, message, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberAdminProps, UserRole } from '../../types/member'
import PermissionInput from '../form/PermissionInput'

const messages = defineMessages({
  roleSettings: { id: 'common.label.roleSettings', defaultMessage: '身份設定' },
  permissionSettings: { id: 'common.label.permissionSettings', defaultMessage: '權限設定' },
})

type FieldProps = {
  roleId: UserRole
  permissionIds?: string[]
}

const MemberPermissionForm: React.FC<{
  memberAdmin: MemberAdminProps | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useContext(AppContext)
  const [form] = useForm<FieldProps>()
  const [updateMemberRole] = useMutation<types.UPDATE_MEMBER_ROLE, types.UPDATE_MEMBER_ROLEVariables>(
    UPDATE_MEMBER_ROLE,
  )
  const { loadingPermissions, defaultRolePermissions } = useDefaultPermissions()
  const [selectedRole, setSelectedRole] = useState<UserRole>(memberAdmin?.role || 'general-member')
  const [loading, setLoading] = useState(false)

  if (!memberAdmin || loadingPermissions) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMemberRole({
      variables: {
        memberId: memberAdmin.id,
        role: values.roleId,
        permissions:
          values.permissionIds?.map((permissionId: string) => ({
            member_id: memberAdmin.id,
            permission_id: permissionId,
          })) || [],
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      colon={false}
      hideRequiredMark
      initialValues={{
        roleId: memberAdmin.role || 'general-member',
        permissionIds: [
          ...(defaultRolePermissions[memberAdmin.role || 'general-member'] || []),
          ...memberAdmin.permissionIds,
        ],
      }}
      onValuesChange={values => {
        if (values.roleId) {
          setSelectedRole(values.roleId)
          form.setFieldsValue({
            ...form.getFieldsValue(),
            permissionIds: [
              ...(defaultRolePermissions[values.roleId as UserRole] || []),
              ...form.getFieldValue('permissionIds'),
            ],
          })
        }
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(messages.roleSettings)} name="roleId">
        <Select>
          <Select.Option value="general-member">{formatMessage(commonMessages.term.generalMember)}</Select.Option>
          <Select.Option value="content-creator">{formatMessage(commonMessages.term.contentCreator)}</Select.Option>
          <Select.Option value="app-owner">{formatMessage(commonMessages.term.appOwner)}</Select.Option>
        </Select>
      </Form.Item>

      {enabledModules.permission && (
        <Form.Item
          label={formatMessage(messages.permissionSettings)}
          wrapperCol={{ md: { span: 20 } }}
          name="permissionIds"
        >
          <PermissionInput fixOptions={defaultRolePermissions[selectedRole]} />
        </Form.Item>
      )}

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_MEMBER_ROLE = gql`
  mutation UPDATE_MEMBER_ROLE(
    $memberId: String!
    $role: String
    $permissions: [member_permission_extra_insert_input!]!
  ) {
    update_member(where: { id: { _eq: $memberId } }, _set: { role: $role }) {
      affected_rows
    }
    delete_member_permission_extra(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_member_permission_extra(objects: $permissions) {
      affected_rows
    }
  }
`

const useDefaultPermissions = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_ROLE_PERMISSION>(gql`
    query GET_ROLE_PERMISSION {
      role_permission {
        id
        role_id
        permission_id
      }
    }
  `)

  const defaultRolePermissions: {
    [roleId in UserRole]?: string[]
  } =
    data?.role_permission.reduce(
      (accumulator: { [roleId in UserRole]?: string[] }, currentValue) => ({
        ...accumulator,
        [currentValue.role_id]: [...(accumulator[currentValue.role_id as UserRole] || []), currentValue.permission_id],
      }),
      {},
    ) || {}

  return {
    loadingPermissions: loading,
    errorPermissions: error,
    defaultRolePermissions,
    refetchPermissions: refetch,
  }
}

export default MemberPermissionForm
