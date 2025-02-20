import { DeleteOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/client'
import { Button, message } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import {
  GetPermissionGroupMembers,
  useMutationPermissionGroup,
  useMutationPermissionGroupAuditLog,
} from '../../hooks/permission'
import { PermissionGroup } from '../../types/general'
import AdminModal from '../admin/AdminModal'
import permissionMessages from './translation'
import hasura from '../../hasura'

const PermissionGroupDeletionModal: React.VFC<PermissionGroup & { onRefetch?: () => void }> = ({
  id,
  name,
  permissionGroupPermissions,
  onRefetch,
}) => {
  const client = useApolloClient()
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { currentMemberId } = useAuth()
  const [loading, setLoading] = useState(false)
  const { deletePermissionGroup } = useMutationPermissionGroup()
  const { insertPermissionGroupAuditLog } = useMutationPermissionGroupAuditLog()

  const handleDeletion = async (onSuccess: () => void) => {
    const { data: permissionGroupMembers } = await client.query<hasura.GetPermissionGroupMembers>({
      query: GetPermissionGroupMembers,
      variables: { permissionGroupId: id },
    })
    const oldPermissionGroupMembers = permissionGroupMembers.member_permission_group.map(v => v.member.id) || []

    insertPermissionGroupAuditLog({
      variables: {
        permissionGroupAuditLog: {
          app_id: appId,
          target: id,
          member_id: currentMemberId || '',
          action: 'DELETE',
          old: {
            name,
            permissionsGroupsPermission: permissionGroupPermissions || [],
            members: oldPermissionGroupMembers,
          },
        },
      },
    })
    deletePermissionGroup({ variables: { id: id } })
      .then(() => {
        onSuccess()
        onRefetch?.()
      })
      .then(() => message.success(formatMessage(permissionMessages.PermissionGroupDeletionModal.successfullyDeleted)))
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminModal
      footer={null}
      title={formatMessage(permissionMessages['*'].deletePermissionGroup)}
      renderTrigger={({ setVisible }) => (
        <Button type="link" icon={<DeleteOutlined />} onClick={() => setVisible(true)} />
      )}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(permissionMessages['*'].cancel)}
          </Button>
          <Button type="primary" danger loading={loading} onClick={() => handleDeletion(() => setVisible(false))}>
            {formatMessage(permissionMessages.PermissionGroupDeletionModal.delete)}
          </Button>
        </>
      )}
    >
      <div>{formatMessage(permissionMessages.PermissionGroupDeletionModal.deletePermissionGroupConfirmation)}</div>
    </AdminModal>
  )
}

export default PermissionGroupDeletionModal
