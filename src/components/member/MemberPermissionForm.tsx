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
import { PermissionGroup } from '../../types/general'
import { MemberAdminProps, UserRole } from '../../types/member'
import PermissionGroupSelector from '../form/PermissionGroupSelector'
import PermissionInput from '../form/PermissionInput'

type FieldProps = {
  roleId: UserRole
  permissionGroupIds?: string[]
  permissionIds?: string[]
}

const MemberPermissionForm: React.FC<{
  memberAdmin: (MemberAdminProps & { permissionGroups: Pick<PermissionGroup, 'id' | 'name'>[] }) | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules, id: appId } = useApp()
  const { currentMemberId, currentUserRole, permissions: currentMemberPermissions } = useAuth()
  const [form] = useForm<FieldProps>()

  const [updateMemberPermission] = useMutation<
    hasura.UPDATE_MEMBER_PERMISSION,
    hasura.UPDATE_MEMBER_PERMISSIONVariables
  >(UPDATE_MEMBER_PERMISSION)

  const [updateMemberRole] = useMutation<hasura.UPDATE_MEMBER_ROLE, hasura.UPDATE_MEMBER_ROLEVariables>(
    UPDATE_MEMBER_ROLE,
  )

  const { loadingPermissions, defaultRolePermissions } = useDefaultPermissions()
  const [selectedRole, setSelectedRole] = useState<UserRole>(memberAdmin?.role || 'general-member')
  const [loading, setLoading] = useState(false)
  const [insertPermissionAuditLogs] = useMutation<
    hasura.InsertPermissionAuditLog,
    hasura.InsertPermissionAuditLogVariables
  >(InsertPermissionAuditLog)

  if (!memberAdmin || loadingPermissions) {
    return <Skeleton active />
  }

  const isPermittedToUpdateRole = currentUserRole === 'app-owner'
  const isPermittedToUpdatePermissionGroup =
    currentUserRole === 'app-owner' || currentMemberPermissions['MEMBER_PERMISSION_GROUP_SELECT']

  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)

    const oldGroupIds = memberAdmin.permissionGroups.map(g => g.id)
    const newGroupIds = values.permissionGroupIds || []
    const groupIdsToInsert = newGroupIds.filter(id => !oldGroupIds.includes(id))
    const groupIdsToDelete = oldGroupIds.filter(id => !newGroupIds.includes(id))

    const oldPermissionIds = memberAdmin.permissionIds || []
    const newPermissionIds = values.permissionIds || []
    const permissionIdsToInsert = newPermissionIds.filter(id => !oldPermissionIds.includes(id))
    const permissionIdsToDelete = oldPermissionIds.filter(id => !newPermissionIds.includes(id))

    const permissionAuditLogs = [
      {
        app_id: appId,
        member_id: currentMemberId,
        target: memberAdmin.id,
        old: {
          role: memberAdmin.role,
          permissionGroups: oldGroupIds,
          permissions: oldPermissionIds,
        },
        new: {
          role: values.roleId,
          permissionGroups: newGroupIds,
          permissions: newPermissionIds,
        },
      },
    ]

    try {
      await updateMemberPermission({
        variables: {
          memberId: memberAdmin.id,
          insertPermissionGroups: groupIdsToInsert.map(id => ({
            member_id: memberAdmin.id,
            permission_group_id: id,
          })),
          deletePermissionGroupIds: groupIdsToDelete,
          insertPermissions: permissionIdsToInsert.map(id => ({
            member_id: memberAdmin.id,
            permission_id: id,
          })),
          deletePermissionIds: permissionIdsToDelete,
        },
      })

      if (isPermittedToUpdateRole)
        updateMemberRole({
          variables: {
            memberId: memberAdmin.id,
            role: values.roleId,
          },
        })

      await insertPermissionAuditLogs({
        variables: { permissionAuditLogs },
      })

      message.success(formatMessage(commonMessages.event.successfullySaved))
      onRefetch?.()
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const isAppOwnerRole = selectedRole === 'app-owner'

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
      onValuesChange={(changedValues, allValues) => {
        if (changedValues.roleId) {
          const newRole = changedValues.roleId as UserRole
          setSelectedRole(newRole)

          let nextPermissions = [...(defaultRolePermissions[newRole] || []), ...(allValues.permissionIds || [])]

          nextPermissions = Array.from(new Set(nextPermissions))

          if (newRole !== 'app-owner') {
            nextPermissions = nextPermissions.filter(pid => pid !== 'MEMBER_ROLE_SELECT')
          }

          form.setFieldsValue({
            permissionIds: nextPermissions,
          })
        }

        // 2. 若直接變更了權限 (防止使用者手動勾選)
        if (changedValues.permissionIds && selectedRole !== 'app-owner') {
          const currentPermissions = changedValues.permissionIds as string[]
          if (currentPermissions.includes('MEMBER_ROLE_SELECT')) {
            form.setFieldsValue({
              permissionIds: currentPermissions.filter(pid => pid !== 'MEMBER_ROLE_SELECT'),
            })
          }
        }
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(commonMessages.label.roleSettings)} name="roleId">
        <Select disabled={!isPermittedToUpdateRole}>
          <Select.Option value="general-member">{formatMessage(commonMessages.label.generalMember)}</Select.Option>
          <Select.Option value="content-creator">{formatMessage(commonMessages.label.contentCreator)}</Select.Option>
          <Select.Option value="app-owner">{formatMessage(commonMessages.label.appOwner)}</Select.Option>
        </Select>
      </Form.Item>

      {enabledModules.permission_group && (
        <Form.Item label={formatMessage(permissionGroupsAdminMessages.label.permissionGroup)} name="permissionGroupIds">
          <PermissionGroupSelector disabled={!isPermittedToUpdatePermissionGroup} />
        </Form.Item>
      )}

      {enabledModules.permission && (
        <Form.Item
          label={formatMessage(commonMessages.label.permissionSettings)}
          wrapperCol={{ md: { span: 20 } }}
          name="permissionIds"
        >
          <PermissionInput
            fixOptions={defaultRolePermissions[selectedRole]?.concat(!isAppOwnerRole ? ['MEMBER_ROLE_SELECT'] : [])}
            uncheckedOptions={!isAppOwnerRole ? ['MEMBER_ROLE_SELECT'] : []}
          />
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

const UPDATE_MEMBER_PERMISSION = gql`
  mutation UPDATE_MEMBER_PERMISSION(
    $memberId: String!
    $insertPermissionGroups: [member_permission_group_insert_input!]!
    $deletePermissionGroupIds: [uuid!]!
    $insertPermissions: [member_permission_extra_insert_input!]!
    $deletePermissionIds: [String!]!
  ) {
    delete_member_permission_group(
      where: { member_id: { _eq: $memberId }, permission_group_id: { _in: $deletePermissionGroupIds } }
    ) {
      affected_rows
    }
    insert_member_permission_group(
      objects: $insertPermissionGroups
      on_conflict: { constraint: member_permission_group_pkey, update_columns: [] }
    ) {
      affected_rows
    }
    delete_member_permission_extra(
      where: { member_id: { _eq: $memberId }, permission_id: { _in: $deletePermissionIds } }
    ) {
      affected_rows
    }
    insert_member_permission_extra(
      objects: $insertPermissions
      on_conflict: { constraint: member_permission_pkey, update_columns: [] }
    ) {
      affected_rows
    }
  }
`

const UPDATE_MEMBER_ROLE = gql`
  mutation UPDATE_MEMBER_ROLE($memberId: String!, $role: String!) {
    update_member(where: { id: { _eq: $memberId } }, _set: { role: $role }) {
      affected_rows
    }
  }
`

const InsertPermissionAuditLog = gql`
  mutation InsertPermissionAuditLog($permissionAuditLogs: [permission_audit_log_insert_input!]!) {
    insert_permission_audit_log(objects: $permissionAuditLogs) {
      affected_rows
    }
  }
`

export default MemberPermissionForm
