import { gql, useMutation } from '@apollo/client'
import { Button, Form, message, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, permissionGroupsAdminMessages } from '../../helpers/translation'
import { useDefaultPermissions } from '../../hooks/permission'
import { PermissionGroupProps } from '../../types/general'
import { MemberAdminProps, UserRole } from '../../types/member'
import PermissionGroupSelector from '../form/PermissionGroupSelector'
import PermissionInput from '../form/PermissionInput'

type FieldProps = {
  roleId: UserRole
  permissionGroupIds?: string[]
  permissionIds?: string[]
}

const MemberPermissionForm: React.FC<{
  memberAdmin: (MemberAdminProps & { permissionGroups: Pick<PermissionGroupProps, 'id' | 'name'>[] }) | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules, id: appId } = useApp()
  const { currentMemberId } = useAuth()
  const [form] = useForm<FieldProps>()
  const [updateMemberRole] = useMutation<hasura.UPDATE_MEMBER_ROLE, hasura.UPDATE_MEMBER_ROLEVariables>(
    UPDATE_MEMBER_ROLE,
  )
  const { loadingPermissions, defaultRolePermissions } = useDefaultPermissions()
  const [selectedRole, setSelectedRole] = useState<UserRole>(memberAdmin?.role || 'general-member')
  const [loading, setLoading] = useState(false)
  const [insertPermissionAuditLog] = useMutation<
    hasura.InsertPermissionAuditLog,
    hasura.InsertPermissionAuditLogVariables
  >(InsertPermissionAuditLog)

  if (!memberAdmin || loadingPermissions) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    const updateVariables = {
      memberId: memberAdmin.id,
      role: values.roleId,
      permissionGroups:
        values.permissionGroupIds?.map(permissionGroupId => ({
          member_id: memberAdmin.id,
          permission_group_id: permissionGroupId,
        })) || [],
      permissions:
        values.permissionIds?.map((permissionId: string) => ({
          member_id: memberAdmin.id,
          permission_id: permissionId,
        })) || [],
    }
    const permissionAuditLog = {
      app_id: appId,
      member_id: currentMemberId,
      target: memberAdmin.id,
      old: {
        role: memberAdmin.role,
        permissionGroups: memberAdmin.permissionGroups.map(group => group.id),
        permissions: memberAdmin.permissionIds,
      },
      new: { role: values.roleId, permissionGroups: values.permissionGroupIds, permissions: values.permissionIds },
    }

    setLoading(true)
    updateMemberRole({
      variables: updateVariables,
    })
      .then(() => {
        insertPermissionAuditLog({
          variables: {
            permissionAuditLog,
          },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullySaved))
            onRefetch?.()
          })
          .catch(handleError)
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
        roleId: memberAdmin.role,
        permissionIds: [...(defaultRolePermissions[memberAdmin.role] || []), ...memberAdmin.permissionIds],
        permissionGroupIds: [...(memberAdmin.permissionGroups?.map(v => v.id) || [])],
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
      <Form.Item label={formatMessage(commonMessages.label.roleSettings)} name="roleId">
        <Select>
          <Select.Option value="general-member">{formatMessage(commonMessages.label.generalMember)}</Select.Option>
          <Select.Option value="content-creator">{formatMessage(commonMessages.label.contentCreator)}</Select.Option>
          <Select.Option value="app-owner">{formatMessage(commonMessages.label.appOwner)}</Select.Option>
        </Select>
      </Form.Item>

      {enabledModules.permission_group && (
        <Form.Item label={formatMessage(permissionGroupsAdminMessages.label.permissionGroup)} name="permissionGroupIds">
          <PermissionGroupSelector />
        </Form.Item>
      )}

      {enabledModules.permission && (
        <Form.Item
          label={formatMessage(commonMessages.label.permissionSettings)}
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
    $permissionGroups: [member_permission_group_insert_input!]!
    $permissions: [member_permission_extra_insert_input!]!
  ) {
    update_member(where: { id: { _eq: $memberId } }, _set: { role: $role }) {
      affected_rows
    }
    delete_member_permission_group(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_member_permission_group(objects: $permissionGroups) {
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

const InsertPermissionAuditLog = gql`
  mutation InsertPermissionAuditLog($permissionAuditLog: permission_audit_log_insert_input!) {
    insert_permission_audit_log_one(object: $permissionAuditLog) {
      id
    }
  }
`

export default MemberPermissionForm
