import { DeleteOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { Button, message } from 'antd'
import { gql } from '@apollo/client'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, permissionGroupsAdminMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'

const PermissionGroupDeletionModal: React.VFC<{ id: string; onRefetch?: () => void }> = ({ id, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [deletePermissionGroup] = useMutation<hasura.DELETE_PERMISSION_GROUP, hasura.DELETE_PERMISSION_GROUPVariables>(
    DELETE_PERMISSION_GROUP,
  )

  const handleDeletion = (onSuccess: () => void) => {
    deletePermissionGroup({ variables: { id: id } })
      .then(() => {
        onSuccess()
        onRefetch?.()
      })
      .then(() => message.success(formatMessage(commonMessages.event.successfullyDeleted)))
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminModal
      footer={null}
      title={formatMessage(permissionGroupsAdminMessages.ui.deletePermissionGroup)}
      renderTrigger={({ setVisible }) => (
        <Button type="link" icon={<DeleteOutlined />} onClick={() => setVisible(true)} />
      )}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" danger loading={loading} onClick={() => handleDeletion(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.delete)}
          </Button>
        </>
      )}
    >
      <div>{formatMessage(permissionGroupsAdminMessages.text.deletePermissionGroupConfirmation)}</div>
    </AdminModal>
  )
}

const DELETE_PERMISSION_GROUP = gql`
  mutation DELETE_PERMISSION_GROUP($id: uuid!) {
    delete_member_permission_group(where: { permission_group_id: { _eq: $id } }) {
      affected_rows
    }
    delete_permission_group_permission(where: { permission_group_id: { _eq: $id } }) {
      affected_rows
    }
    delete_permission_group(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`

export default PermissionGroupDeletionModal
