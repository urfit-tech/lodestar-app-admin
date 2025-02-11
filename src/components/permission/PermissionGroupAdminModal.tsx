import { FileAddOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import {
  useDefaultPermissions,
  useMutationPermissionGroup,
  useMutationPermissionGroupAuditLog,
  useMutationPermissionGroupPermission,
} from '../../hooks/permission'
import { PermissionGroup } from '../../types/general'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import PermissionInput from '../form/PermissionInput'
import permissionMessages from './translation'

type FieldProps = {
  name: string
  permissionIds: string[]
}

const PermissionGroupAdminModal: React.FC<
  AdminModalProps &
    Partial<PermissionGroup> & {
      onRefetch?: () => void
    } & { existedPermissionGroupNames: string[] }
> = ({ id, name, permissionGroupPermissions, existedPermissionGroupNames, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { currentMemberId } = useAuth()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const { loadingPermissions, defaultRolePermissions } = useDefaultPermissions()
  const { insertPermissionGroup, updatePermissionGroup } = useMutationPermissionGroup()
  const { insertPermissionGroupPermission, updatePermissionGroupPermission } = useMutationPermissionGroupPermission()
  const { insertPermissionGroupAuditLog } = useMutationPermissionGroupAuditLog()

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()

        if (!id && existedPermissionGroupNames.includes(values.name.trim())) {
          return message.error(formatMessage(permissionMessages.PermissionGroupAdminModal.duplicateName))
        }
        const oldName = name
        const oldPermissionGroupPermissions =
          permissionGroupPermissions?.map(permissionGroupPermission => ({
            permission_group_id: id,
            permission_id: permissionGroupPermission.permissionId,
          })) || []
        const newPermissionGroupPermissions =
          values.permissionIds.map(permissionId => ({
            permission_group_id: id,
            permission_id: permissionId,
          })) || []
        const newName = values.name

        if (id) {
          updatePermissionGroup({ variables: { id: id, name: newName } })
          insertPermissionGroupAuditLog({
            variables: {
              permissionGroupAuditLog: {
                app_id: appId,
                target: id,
                member_id: currentMemberId || '',
                action: 'UPDATE',
                old: {
                  name: oldName,
                  permissionsGroupPermissions: oldPermissionGroupPermissions,
                },
                new: {
                  name: newName,
                  permissionsGroupPermissions: newPermissionGroupPermissions,
                },
              },
            },
          })
          updatePermissionGroupPermission({
            variables: {
              permissionGroupPermissionId: id,
              permissionsGroupPermissions: newPermissionGroupPermissions,
            },
          }).then(() => {
            message.success(formatMessage(permissionMessages.PermissionGroupAdminModal.successfullyEdited))
            onRefetch?.()
          })
        } else {
          insertPermissionGroup({ variables: { appId: appId, name: values.name } }).then(({ data }) => {
            const permissionGroupId = data?.insert_permission_group?.returning[0].id
            insertPermissionGroupAuditLog({
              variables: {
                permissionGroupAuditLog: {
                  app_id: appId,
                  target: permissionGroupId,
                  member_id: currentMemberId || '',
                  action: 'INSERT',
                  old: {
                    name: oldName,
                    permissionsGroupPermissions: oldPermissionGroupPermissions,
                  },
                  new: {
                    name: newName,
                    permissionsGroupPermissions: newPermissionGroupPermissions,
                  },
                },
              },
            })
            insertPermissionGroupPermission({
              variables: {
                permissionsGroupPermissions: values.permissionIds
                  ? values.permissionIds.map(permissionId => ({
                      permission_group_id: permissionGroupId,
                      permission_id: permissionId,
                    }))
                  : [],
              },
            }).then(() => {
              message.success(formatMessage(permissionMessages.PermissionGroupAdminModal.successfullyCreated))
              onRefetch?.()
            })
          })
        }
        form.resetFields()
        onSuccess()
      })
      .catch(error => {
        handleError(error)
      })
      .finally(() => setLoading(false))
  }

  if (loadingPermissions || !defaultRolePermissions) {
    return <Skeleton active />
  }

  return (
    <AdminModal
      width="60%"
      icon={<FileAddOutlined />}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(permissionMessages['*'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(permissionMessages.PermissionGroupAdminModal.save)}
          </Button>
        </>
      )}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          name,
          permissionIds: permissionGroupPermissions?.map(
            permissionGroupPermission => permissionGroupPermission.permissionId,
          ),
        }}
      >
        <Form.Item
          label={formatMessage(permissionMessages.PermissionGroupAdminModal.name)}
          name="name"
          rules={[
            {
              required: true,
              message: formatMessage(permissionMessages.PermissionGroupAdminModal.isRequired, {
                field: formatMessage(permissionMessages.PermissionGroupAdminModal.name),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage(permissionMessages.PermissionGroupAdminModal.permissionSettings)}
          name="permissionIds"
        >
          <PermissionInput />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default PermissionGroupAdminModal
