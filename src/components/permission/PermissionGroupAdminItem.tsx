import { EditOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { permissionGroupsAdminMessages } from '../../helpers/translation'
import { PermissionGroupProps } from '../../types/general'
import PermissionGroupAdminModal from './PermissionGroupAdminModal'
import PermissionGroupDeletionModal from './PermissionGroupDeletionModal'

const StyledAdminBlock = styled.div`
  margin-bottom: 1.25rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`

const PermissionGroupAdminItem: React.VFC<
  PermissionGroupProps & {
    onRefetch?: () => void
  }
> = ({ id, name, permissionGroupPermissions, onRefetch }) => {
  const { formatMessage } = useIntl()

  return (
    <StyledAdminBlock>
      <div className="d-flex justify-content-between align-items-center">
        <div>{name}</div>
        <div className="d-flex align-items-center">
          <PermissionGroupAdminModal
            title={formatMessage(permissionGroupsAdminMessages.ui.editPermissionGroup)}
            renderTrigger={({ setVisible }) => (
              <Button type="link" icon={<EditOutlined />} onClick={() => setVisible(true)} />
            )}
            id={id}
            name={name}
            permissionGroupPermissions={permissionGroupPermissions}
            onRefetch={onRefetch}
          />
          <PermissionGroupDeletionModal id={id || ''} onRefetch={onRefetch} />
        </div>
      </div>
    </StyledAdminBlock>
  )
}

export default PermissionGroupAdminItem
